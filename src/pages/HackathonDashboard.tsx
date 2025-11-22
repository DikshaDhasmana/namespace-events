import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderKanban, Copy, Check, Plus, ExternalLink, UserMinus, LogOut } from 'lucide-react';
import { ProjectForm } from '@/components/ProjectForm';
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
  registration_start: string | null;
  registration_end: string | null;
  submission_start: string | null;
  submission_end: string | null;
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
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [teamProject, setTeamProject] = useState<any>(null);
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
    fetchTeamProject();

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

  useEffect(() => {
    if (team?.id) {
      fetchTeamProject();
    }
  }, [team?.id]);

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

  const fetchTeamProject = async () => {
    if (!team?.id) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('team_id', team.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (!error && data) {
      setTeamProject(data);
    } else {
      setTeamProject(null);
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

  const handleCreateProject = async () => {
    if (!team) {
      toast({
        variant: 'destructive',
        title: 'No team',
        description: 'You must be part of a team to submit a project',
      });
      return;
    }

    // Check if within submission window
    if (event?.submission_start && event?.submission_end) {
      const now = new Date();
      const submissionStart = new Date(event.submission_start);
      const submissionEnd = new Date(event.submission_end);

      if (now < submissionStart) {
        toast({
          variant: 'destructive',
          title: 'Submission not open',
          description: `Project submission opens on ${submissionStart.toLocaleString()}`,
        });
        return;
      }

      if (now > submissionEnd) {
        toast({
          variant: 'destructive',
          title: 'Submission closed',
          description: 'Project submission period has ended',
        });
        return;
      }
    }

    setShowProjectForm(true);
  };

  const handleLeaveTeam = async () => {
    if (!user || !team) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('user_id', user.id)
      .eq('team_id', team.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to leave team",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Left team",
      description: "You have successfully left the team",
    });

    setSubmitting(false);
    setTeam(null);
    setTeamMembers([]);
    setTeamProject(null);
  };

  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!user || !team) return;

    // Verify user is team leader
    if (team.created_by !== user.id) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "Only the team leader can remove members",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Member removed",
      description: `${memberName} has been removed from the team`,
    });

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
                              {member.user_id === user?.id && (
                                <span className="text-muted-foreground ml-1">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.profiles.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.user_id === team.created_by && (
                              <Badge variant="secondary" className="text-xs">Leader</Badge>
                            )}
                            {team.created_by === user?.id && member.user_id !== user?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleKickMember(member.id, member.profiles.full_name || 'Anonymous')}
                                disabled={submitting}
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {(() => {
                    const now = new Date();
                    const registrationStart = event?.registration_start ? new Date(event.registration_start) : null;
                    const registrationEnd = event?.registration_end ? new Date(event.registration_end) : null;
                    const isBeforeRegistration = registrationStart && now < registrationStart;
                    const isAfterRegistration = registrationEnd && now > registrationEnd;
                    const canLeaveTeam = !isBeforeRegistration && !isAfterRegistration;

                    return (
                      <>
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-destructive hover:text-destructive"
                          onClick={handleLeaveTeam}
                          disabled={submitting || !canLeaveTeam}
                        >
                          <LogOut className="h-4 w-4" />
                          Leave Team
                        </Button>
                        {!canLeaveTeam && (
                          <p className="text-xs text-muted-foreground text-center">
                            {isBeforeRegistration 
                              ? `You can leave the team starting ${registrationStart?.toLocaleString()}`
                              : `Team leaving closed on ${registrationEnd?.toLocaleString()}`
                            }
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              <>
                {(() => {
                  const now = new Date();
                  const registrationStart = event?.registration_start ? new Date(event.registration_start) : null;
                  const registrationEnd = event?.registration_end ? new Date(event.registration_end) : null;
                  const isBeforeRegistration = registrationStart && now < registrationStart;
                  const isAfterRegistration = registrationEnd && now > registrationEnd;
                  const canManageTeam = !isBeforeRegistration && !isAfterRegistration;

                  return (
                    <>
                      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full" disabled={!canManageTeam}>Create New Team</Button>
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
                          <Button variant="outline" className="w-full" disabled={!canManageTeam}>Join Existing Team</Button>
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
                      
                      {isBeforeRegistration && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Team creation/joining opens on {registrationStart?.toLocaleString()}
                        </p>
                      )}
                      {isAfterRegistration && (
                        <p className="text-xs text-destructive text-center mt-2">
                          Team creation/joining closed on {registrationEnd?.toLocaleString()}
                        </p>
                      )}
                    </>
                  );
                })()}
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
              <CardTitle>Project Submission</CardTitle>
            </div>
            <CardDescription>
              {teamProject 
                ? 'Manage your hackathon project submission' 
                : 'Submit your project for this hackathon'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamProject ? (
              <>
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold">{teamProject.project_name}</h4>
                  {teamProject.description && (
                    <div 
                      className="text-sm text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: teamProject.description }}
                    />
                  )}
                  {teamProject.tags && teamProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teamProject.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {teamProject.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{teamProject.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={() => navigate(`/projects/${teamProject.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Project Details
                </Button>
              </>
            ) : (
              <>
                {team ? (
                  <>
                    {(() => {
                      const now = new Date();
                      const submissionStart = event?.submission_start ? new Date(event.submission_start) : null;
                      const submissionEnd = event?.submission_end ? new Date(event.submission_end) : null;
                      const isBeforeSubmission = submissionStart && now < submissionStart;
                      const isAfterSubmission = submissionEnd && now > submissionEnd;
                      const canSubmit = !isBeforeSubmission && !isAfterSubmission;

                      return (
                        <>
                          <Button 
                            className="w-full gap-2"
                            onClick={handleCreateProject}
                            disabled={!canSubmit}
                          >
                            <Plus className="h-4 w-4" />
                            Submit Project
                          </Button>
                          {isBeforeSubmission && (
                            <p className="text-xs text-muted-foreground text-center">
                              Submission opens on {submissionStart?.toLocaleString()}
                            </p>
                          )}
                          {isAfterSubmission && (
                            <p className="text-xs text-destructive text-center">
                              Submission closed on {submissionEnd?.toLocaleString()}
                            </p>
                          )}
                          {canSubmit && (
                            <p className="text-xs text-muted-foreground text-center">
                              All team members will be added as project owners
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-center text-muted-foreground">
                      Create or join a team to submit a project
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      {!team && (
        <Card className="mt-6 bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Welcome to your hackathon dashboard! Create or join a team to get started and submit your project.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Project Form Dialog */}
      {team && (
        <ProjectForm
          open={showProjectForm}
          onOpenChange={setShowProjectForm}
          onProjectCreated={() => {
            fetchTeamProject();
            setShowProjectForm(false);
          }}
          teamId={team.id}
          eventId={eventId}
        />
      )}
    </div>
  );
}
