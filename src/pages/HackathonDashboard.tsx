import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderKanban, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  user_id: string;
  joined_at: string;
  profiles: {
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
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
    if (!user || !eventId || !isRegistered) return;

    fetchTeamData();

    // Set up realtime subscription for team updates
    const channel = supabase
      .channel('team-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
        },
        () => {
          fetchTeamData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, eventId, isRegistered]);

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
      .maybeSingle();

    if (memberData?.team_id) {
      // Fetch team details
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', memberData.team_id)
        .eq('event_id', eventId)
        .single();

      if (teamData) {
        setTeam(teamData);

        // Fetch team members with profiles
        const { data: membersData } = await supabase
          .from('team_members')
          .select('id, user_id, joined_at')
          .eq('team_id', teamData.id)
          .order('joined_at', { ascending: true });

        if (membersData) {
          // Fetch profiles for each member
          const membersWithProfiles = await Promise.all(
            membersData.map(async (member) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', member.user_id)
                .single();
              
              return {
                ...member,
                profiles: profile || { full_name: null, email: 'Unknown' }
              };
            })
          );

          setTeamMembers(membersWithProfiles);
        }
      }
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !eventId || !teamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a team name",
      });
      return;
    }

    setSubmitting(true);

    // Check if user is already in a team
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      toast({
        variant: "destructive",
        title: "Already in a team",
        description: "You are already part of a team for this hackathon",
      });
      setSubmitting(false);
      return;
    }

    // Create team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        event_id: eventId,
        name: teamName.trim(),
        created_by: user.id,
        referral_code: '', // Will be auto-generated by trigger
      })
      .select()
      .single();

    if (teamError || !teamData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team",
      });
      setSubmitting(false);
      return;
    }

    // Add creator as first team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamData.id,
        user_id: user.id,
      });

    if (memberError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join team",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Team created!",
      description: `Your team "${teamName}" has been created successfully`,
    });

    setCreateDialogOpen(false);
    setTeamName('');
    setSubmitting(false);
    fetchTeamData();
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

    // Check if user is already in a team
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      toast({
        variant: "destructive",
        title: "Already in a team",
        description: "You are already part of a team for this hackathon",
      });
      setSubmitting(false);
      return;
    }

    // Find team by referral code
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .eq('event_id', eventId)
      .maybeSingle();

    if (teamError || !teamData) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "No team found with this referral code",
      });
      setSubmitting(false);
      return;
    }

    // Check team size limit
    if (event?.team_size) {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamData.id);

      if (count && count >= event.team_size) {
        toast({
          variant: "destructive",
          title: "Team full",
          description: `This team has reached the maximum size of ${event.team_size} members`,
        });
        setSubmitting(false);
        return;
      }
    }

    // Join team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamData.id,
        user_id: user.id,
      });

    if (memberError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join team",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Joined team!",
      description: `You have successfully joined "${teamData.name}"`,
    });

    setJoinDialogOpen(false);
    setReferralCode('');
    setSubmitting(false);
    fetchTeamData();
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
              {team ? 'Your team for this hackathon' : 'Create a new team or join an existing team'}
              {event.team_size && ` (Max ${event.team_size} members per team)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {team ? (
              <>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{team.name}</h4>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                        {team.referral_code}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={copyReferralCode}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this code with others to join your team
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Team Members ({teamMembers.length}{event.team_size ? `/${event.team_size}` : ''})</h5>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {member.profiles.full_name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.profiles.email}
                            </p>
                          </div>
                          {member.user_id === team.created_by && (
                            <Badge variant="secondary" className="text-xs">Leader</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Create New Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Team</DialogTitle>
                      <DialogDescription>
                        Give your team a name. A unique referral code will be generated for others to join.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          placeholder="Enter team name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleCreateTeam}
                        disabled={submitting || !teamName.trim()}
                        className="w-full"
                      >
                        {submitting ? 'Creating...' : 'Create Team'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Join Existing Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a Team</DialogTitle>
                      <DialogDescription>
                        Enter the referral code shared by your team leader.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code</Label>
                        <Input
                          id="referralCode"
                          placeholder="Enter 8-character code"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          maxLength={8}
                        />
                      </div>
                      <Button
                        onClick={handleJoinTeam}
                        disabled={submitting || !referralCode.trim()}
                        className="w-full"
                      >
                        {submitting ? 'Joining...' : 'Join Team'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
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
              Welcome to your hackathon dashboard! Create or join a team to get started. Project management features coming soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
