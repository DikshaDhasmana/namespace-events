import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Users, Mail, Crown, Download } from 'lucide-react';
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
  registration_data?: any;
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
          .select('user_id, role')
          .eq('project_id', project.id);

        // Fetch profiles for all members
        const userIds = (members || []).map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        // Fetch registrations for all members
        const { data: registrationsData } = await supabase
          .from('registrations')
          .select('user_id, form_submission_id, registered_at')
          .eq('event_id', eventId)
          .in('user_id', userIds);

        // Fetch form submissions
        const submissionIds = (registrationsData || [])
          .map(r => r.form_submission_id)
          .filter(Boolean);
        
        const { data: formSubmissionsData } = submissionIds.length > 0 
          ? await supabase
              .from('form_submissions')
              .select('id, submission_data')
              .in('id', submissionIds)
          : { data: [] };

        // Create maps
        const profilesMap = new Map(
          (profilesData || []).map(p => [p.id, p])
        );
        const registrationsMap = new Map(
          (registrationsData || []).map(r => [r.user_id, r])
        );
        const formSubmissionsMap = new Map(
          (formSubmissionsData || []).map(s => [s.id, s])
        );

        const contributors: Contributor[] = (members || []).map((member: any) => {
          const profile = profilesMap.get(member.user_id);
          const registration = registrationsMap.get(member.user_id);
          const formSubmission = registration?.form_submission_id 
            ? formSubmissionsMap.get(registration.form_submission_id)
            : null;

          return {
            user_id: member.user_id,
            role: member.role,
            full_name: profile?.full_name || null,
            email: profile?.email || 'No email',
            registration_data: {
              profile,
              registration,
              form_submission: formSubmission
            }
          };
        });

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
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    // Create CSV rows - one row per participant
    const rows: string[][] = [];
    
    // Headers
    const headers = [
      'Project Name',
      'Team Name',
      'Participant Name',
      'Participant Email',
      'Role in Project',
      'Is Team Leader',
      'Phone Number',
      'College',
      'Degree',
      'Branch',
      'Graduation Year',
      'Skills',
      'GitHub URL',
      'LinkedIn URL',
      'Portfolio URL',
      'Registered At',
      'Project GitHub Link',
      'Project Live Link',
      'Project Demo Video',
      'Project Presentation',
      'Project Description',
      'Project Tags'
    ];
    rows.push(headers);

    // Data rows
    submissions.forEach(submission => {
      submission.contributors.forEach(contributor => {
        const profile = contributor.registration_data?.profile;
        const registration = contributor.registration_data?.registration;
        
        const row = [
          submission.project_name || '',
          submission.team_name || 'Individual Project',
          contributor.full_name || '',
          contributor.email || '',
          contributor.role || '',
          contributor.user_id === submission.team_leader_id ? 'Yes' : 'No',
          profile?.phone_number || '',
          profile?.college || '',
          profile?.degree || '',
          profile?.branch || '',
          profile?.graduation_year?.toString() || '',
          profile?.skills?.join('; ') || '',
          profile?.github_url || '',
          profile?.linkedin_url || '',
          profile?.portfolio_url || '',
          registration?.registered_at || '',
          submission.github_link || '',
          submission.live_link || '',
          submission.demo_video_link || '',
          submission.ppt_link || '',
          submission.description || '',
          submission.tags?.join('; ') || ''
        ];
        rows.push(row);
      });
    });

    // Convert to CSV string
    const csvContent = rows.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${eventName.replace(/[^a-z0-9]/gi, '_')}_submissions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "CSV file downloaded successfully",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold">{eventName} - Submissions</h1>
        </div>
        <p className="text-muted-foreground">No submissions yet for this event.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold">{eventName} - Submissions</h1>
        </div>
        <Button
          onClick={downloadCSV}
          disabled={submissions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="space-y-6">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{submission.project_name}</CardTitle>
                  {submission.team_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Team: {submission.team_name}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projects/${submission.id}`)}
                >
                  View Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{submission.description}</p>
                </div>
              )}

              {submission.tags && submission.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {submission.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submission.github_link && (
                  <a
                    href={submission.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub Repository
                  </a>
                )}
                {submission.live_link && (
                  <a
                    href={submission.live_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                )}
                {submission.demo_video_link && (
                  <a
                    href={submission.demo_video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Demo Video
                  </a>
                )}
                {submission.ppt_link && (
                  <a
                    href={submission.ppt_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Presentation
                  </a>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contributors ({submission.contributors.length})
                </h3>
                <div className="border rounded-lg overflow-hidden">
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {contributor.full_name || 'N/A'}
                              {contributor.user_id === submission.team_leader_id && (
                                <span title="Team Leader">
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {contributor.email}
                            </div>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventSubmissions;
