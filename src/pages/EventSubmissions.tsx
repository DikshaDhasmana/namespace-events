import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Users, Mail, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Contributor {
  user_id: string;
  role: string;
  full_name: string | null;
  email: string;
}

interface Submission {
  id: string;
  project_name: string;
  team_id: string | null;
  team_name: string | null;
  team_leader_id: string | null;
  contributors: Contributor[];
  github_link: string | null;
  live_link: string | null;
  demo_video_link: string | null;
  ppt_link: string | null;
  description: string | null;
  tags: string[] | null;
}

const EventSubmissions = () => {
  const { eventId } = useParams();
  const [eventName, setEventName] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchSubmissions();
  }, [isAdminAuthenticated, navigate, eventId]);

  const fetchSubmissions = async () => {
    try {
      // Fetch event name
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('name')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEventName(eventData.name);

      // Fetch projects for this event
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, project_name, team_id, github_link, live_link, demo_video_link, ppt_link, description, tags')
        .eq('event_id', eventId);

      if (projectsError) throw projectsError;

      // For each project, fetch team info and contributors
      const submissionsData = await Promise.all((projects || []).map(async (project) => {
        let teamName = null;
        let teamLeaderId = null;

        // Get team info if project has a team
        if (project.team_id) {
          const { data: teamData } = await supabase
            .from('teams')
            .select('name, created_by')
            .eq('id', project.team_id)
            .single();
          
          teamName = teamData?.name || null;
          teamLeaderId = teamData?.created_by || null;
        }

        // Get all project members
        const { data: members } = await supabase
          .from('project_members')
          .select(`
            user_id,
            role,
            profiles!user_id (
              full_name,
              email
            )
          `)
          .eq('project_id', project.id);

        const contributors: Contributor[] = (members || []).map((member: any) => ({
          user_id: member.user_id,
          role: member.role,
          full_name: member.profiles?.full_name || null,
          email: member.profiles?.email || 'No email',
        }));

        return {
          id: project.id,
          project_name: project.project_name,
          team_id: project.team_id,
          team_name: teamName,
          team_leader_id: teamLeaderId,
          contributors,
          github_link: project.github_link,
          live_link: project.live_link,
          demo_video_link: project.demo_video_link,
          ppt_link: project.ppt_link,
          description: project.description,
          tags: project.tags,
        };
      }));

      setSubmissions(submissionsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-2xl font-bold">Submissions: {eventName}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground">Submissions will appear here once teams submit their projects</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{submission.project_name}</CardTitle>
                      {submission.team_name && (
                        <Badge variant="secondary" className="mb-2">
                          Team: {submission.team_name}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${submission.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submission.description && (
                    <p className="text-sm text-muted-foreground">{submission.description}</p>
                  )}
                  
                  {submission.tags && submission.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {submission.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex flex-wrap gap-2">
                    {submission.github_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.github_link} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      </Button>
                    )}
                    {submission.live_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.live_link} target="_blank" rel="noopener noreferrer">
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {submission.demo_video_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.demo_video_link} target="_blank" rel="noopener noreferrer">
                          Video
                        </a>
                      </Button>
                    )}
                    {submission.ppt_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.ppt_link} target="_blank" rel="noopener noreferrer">
                          Presentation
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Contributors Table */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contributors
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submission.contributors.map((contributor) => (
                          <TableRow key={contributor.user_id}>
                            <TableCell className="flex items-center gap-2">
                              {contributor.full_name || 'No name'}
                              {submission.team_leader_id === contributor.user_id && (
                                <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-600">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Team Leader
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {contributor.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant={contributor.role === 'owner' ? 'default' : 'secondary'}>
                                {contributor.role}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSubmissions;
