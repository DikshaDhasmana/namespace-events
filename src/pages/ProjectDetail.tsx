import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Github, ExternalLink, Video, FileText, ArrowLeft, Users, Calendar, Trophy, Trash2 } from 'lucide-react';

interface ProjectMember {
  id: string;
  role: 'owner' | 'contributor';
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface Project {
  id: string;
  project_name: string;
  description: string | null;
  github_link: string | null;
  live_link: string | null;
  demo_video_link: string | null;
  ppt_link: string | null;
  tags: string[] | null;
  created_at: string;
  event_id: string | null;
  team_id: string | null;
  events?: {
    name: string;
    event_type: string;
  } | null;
  teams?: {
    name: string;
  } | null;
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchMembers();
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        events (name, event_type),
        teams (name)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load project',
      });
      navigate('/dashboard#projects');
    } else {
      setProject(data);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    if (!projectId) return;

    // First get project members
    const { data: memberData, error: memberError } = await supabase
      .from('project_members')
      .select('id, role, user_id')
      .eq('project_id', projectId)
      .order('role', { ascending: true });

    if (memberError) {
      console.error('Error fetching members:', memberError);
      return;
    }

    if (!memberData || memberData.length === 0) {
      setMembers([]);
      return;
    }

    // Then fetch profiles for those users
    const userIds = memberData.map(m => m.user_id);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      setMembers(memberData.map(m => ({ ...m, profiles: null })));
      return;
    }

    // Combine member data with profile data
    const membersWithProfiles = memberData.map(member => ({
      ...member,
      profiles: profileData.find(p => p.id === member.user_id) || null
    }));

    setMembers(membersWithProfiles);
  };

  const handleDelete = async () => {
    if (!projectId) return;

    setDeleting(true);
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project',
      });
    } else {
      toast({
        title: 'Project deleted',
        description: 'Your project has been deleted successfully',
      });
      navigate('/dashboard#projects');
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const owners = members.filter(m => m.role === 'owner');
  const contributors = members.filter(m => m.role === 'contributor');
  const isOwner = user && owners.some(o => o.user_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard#projects')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>

          {isOwner && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="font-sora text-3xl mb-4">
                    {project.project_name}
                  </CardTitle>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.event_id && project.events && (
                      <>
                        <Badge variant="secondary" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {project.events.name}
                        </Badge>
                        {project.teams && (
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            Team: {project.teams.name}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
                    <Calendar className="h-4 w-4" />
                    Created on {new Date(project.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>

            {project.description && (
              <CardContent>
                <h3 className="font-semibold text-lg mb-3 font-sora">Description</h3>
                <div 
                  dangerouslySetInnerHTML={{ __html: project.description }}
                  className="prose prose-sm max-w-none dark:prose-invert font-inter"
                />
              </CardContent>
            )}
          </Card>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-sora">Technologies & Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm font-inter">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(project.github_link || project.live_link || project.demo_video_link || project.ppt_link) && (
            <Card>
              <CardHeader>
                <CardTitle className="font-sora">Project Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.github_link && (
                    <Button
                      variant="outline"
                      asChild
                      className="gap-2 justify-start h-auto py-3"
                    >
                      <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Source Code</div>
                          <div className="text-xs text-muted-foreground">View on GitHub</div>
                        </div>
                      </a>
                    </Button>
                  )}

                  {project.live_link && (
                    <Button
                      variant="outline"
                      asChild
                      className="gap-2 justify-start h-auto py-3"
                    >
                      <a href={project.live_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Live Demo</div>
                          <div className="text-xs text-muted-foreground">Visit website</div>
                        </div>
                      </a>
                    </Button>
                  )}

                  {project.demo_video_link && (
                    <Button
                      variant="outline"
                      asChild
                      className="gap-2 justify-start h-auto py-3"
                    >
                      <a href={project.demo_video_link} target="_blank" rel="noopener noreferrer">
                        <Video className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Demo Video</div>
                          <div className="text-xs text-muted-foreground">Watch presentation</div>
                        </div>
                      </a>
                    </Button>
                  )}

                  {project.ppt_link && (
                    <Button
                      variant="outline"
                      asChild
                      className="gap-2 justify-start h-auto py-3"
                    >
                      <a href={project.ppt_link} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Presentation</div>
                          <div className="text-xs text-muted-foreground">View slides</div>
                        </div>
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sora flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription className="font-inter">
                {owners.length} owner{owners.length !== 1 ? 's' : ''}{contributors.length > 0 && ` · ${contributors.length} contributor${contributors.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {owners.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-semibold text-muted-foreground font-sora">Owners</h4>
                  <div className="grid gap-3">
                    {owners.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                      >
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {member.profiles?.full_name?.[0]?.toUpperCase() || member.profiles?.email[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium font-inter truncate">
                            {member.profiles?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground font-inter truncate">
                            {member.profiles?.email}
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-inter">Owner</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contributors.length > 0 && (
                <div className="space-y-3">
                  <Separator className="my-4" />
                  <h4 className="text-sm font-semibold text-muted-foreground font-sora">Contributors</h4>
                  <div className="grid gap-3">
                    {contributors.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                      >
                        <Avatar>
                          <AvatarFallback className="bg-secondary">
                            {member.profiles?.full_name?.[0]?.toUpperCase() || member.profiles?.email[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium font-inter truncate">
                            {member.profiles?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground font-inter truncate">
                            {member.profiles?.email}
                          </div>
                        </div>
                        <Badge variant="outline" className="font-inter">Contributor</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project?.project_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
