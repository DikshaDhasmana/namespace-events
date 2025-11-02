import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderKanban, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  date: string;
  end_date: string | null;
  venue: string;
  banner_url: string | null;
  team_size: number | null;
}

interface Team {
  id: string;
  name: string;
  referral_code: string;
  created_by: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export default function HackathonDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [joinTeamOpen, setJoinTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (eventId) {
      fetchEventAndVerifyRegistration();
    }
  }, [eventId, user]);

  useEffect(() => {
    if (eventId && user && isRegistered) {
      fetchTeamData();
      subscribeToTeamUpdates();
    }
  }, [eventId, user, isRegistered]);

  const fetchEventAndVerifyRegistration = async () => {
    if (!user) return;

    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event details",
      });
      navigate('/events');
      return;
    }

    // Verify event is a hackathon
    if (eventData.event_type !== 'hackathon') {
      toast({
        variant: "destructive",
        title: "Invalid Event Type",
        description: "This dashboard is only available for hackathon events",
      });
      navigate(`/events/${eventId}`);
      return;
    }

    setEvent(eventData);

    // Verify user is registered
    const { data: registrationData } = await supabase
      .from('registrations')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .eq('status', 'approved')
      .single();

    if (!registrationData) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be registered and approved for this hackathon",
      });
      navigate(`/events/${eventId}`);
      return;
    }

    setIsRegistered(true);
    setLoading(false);
  };

  const fetchTeamData = async () => {
    if (!user || !eventId) return;

    // Check if user is already in a team for this event
    const { data: memberData } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (memberData) {
      // Fetch team details
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', memberData.team_id)
        .eq('event_id', eventId)
        .single();

      if (teamData) {
        setTeam(teamData);
        await fetchTeamMembers(teamData.id);
      }
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    const { data: membersData, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
      return;
    }

    // Fetch profile data for each member
    const membersWithProfiles = await Promise.all(
      (membersData || []).map(async (member) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', member.user_id)
          .single();
        
        return {
          ...member,
          profiles: profile || { full_name: null, email: '' }
        };
      })
    );

    setTeamMembers(membersWithProfiles);
  };

  const subscribeToTeamUpdates = () => {
    const teamMembersChannel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => {
          if (team) {
            fetchTeamMembers(team.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamMembersChannel);
    };
  };

  const handleCreateTeam = async () => {
    if (!user || !eventId || !newTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a team name",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{
          event_id: eventId,
          name: newTeamName.trim(),
          created_by: user.id,
          referral_code: '', // Will be auto-generated by trigger
        }])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as first team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      setTeam(teamData);
      setCreateTeamOpen(false);
      setNewTeamName('');
      
      toast({
        title: "Success",
        description: "Team created successfully!",
      });

      await fetchTeamMembers(teamData.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user || !eventId || !referralCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a referral code",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Find team by referral code
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .eq('event_id', eventId)
        .single();

      if (teamError || !teamData) {
        throw new Error("Invalid referral code");
      }

      // Check team size limit
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamData.id);

      if (event?.team_size && count && count >= event.team_size) {
        throw new Error(`Team is full (max ${event.team_size} members)`);
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user.id,
        });

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error("You are already in this team");
        }
        throw memberError;
      }

      setTeam(teamData);
      setJoinTeamOpen(false);
      setReferralCode('');
      
      toast({
        title: "Success",
        description: `Joined team "${teamData.name}" successfully!`,
      });

      await fetchTeamMembers(teamData.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join team",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyReferralCode = () => {
    if (team?.referral_code) {
      navigator.clipboard.writeText(team.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (!event || !isRegistered) {
    return null;
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/events/${eventId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event Details
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Hackathon
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2 font-heading">{event.name}</h1>
        <p className="text-muted-foreground">
          {formatDate(event.date)} {event.end_date && `- ${formatDate(event.end_date)}`}
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Team Management</CardTitle>
            </div>
            <CardDescription>
              {team ? `Your team: ${team.name}` : 'Create a new team or join an existing team'}
              {event.team_size && ` (Max ${event.team_size} members per team)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!team ? (
              <>
                <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Create New Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Enter a name for your team. A unique referral code will be generated.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          placeholder="Enter team name"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      <Button 
                        onClick={handleCreateTeam} 
                        disabled={submitting || !newTeamName.trim()}
                        className="w-full"
                      >
                        {submitting ? "Creating..." : "Create Team"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={joinTeamOpen} onOpenChange={setJoinTeamOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Join Existing Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Existing Team</DialogTitle>
                      <DialogDescription>
                        Enter the referral code shared by your team leader.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code</Label>
                        <Input
                          id="referralCode"
                          placeholder="Enter referral code"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          disabled={submitting}
                        />
                      </div>
                      <Button 
                        onClick={handleJoinTeam} 
                        disabled={submitting || !referralCode.trim()}
                        className="w-full"
                      >
                        {submitting ? "Joining..." : "Join Team"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Referral Code:</span>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1 bg-background rounded text-sm font-mono">
                        {team.referral_code}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={copyReferralCode}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this code with others to invite them to your team
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Team Members ({teamMembers.length}{event.team_size ? `/${event.team_size}` : ''})</h4>
                  <div className="space-y-2">
                    {teamMembers.map((member, index) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">
                          {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                        </span>
                        {member.user_id === team.created_by && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Leader
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Project Management</CardTitle>
            </div>
            <CardDescription>
              Create and manage your hackathon project submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              disabled
            >
              Create New Project
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              View My Project
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Project management feature coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      {!team && (
        <Card className="mt-6 bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Start by creating a team or joining an existing one using a referral code. Project management will be available once you're part of a team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
