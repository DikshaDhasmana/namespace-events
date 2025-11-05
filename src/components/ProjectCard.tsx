import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Video, FileText, Users } from 'lucide-react';

interface ProjectMember {
  role: 'owner' | 'contributor';
  profiles?: {
    full_name: string | null;
  };
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
  project_members?: ProjectMember[];
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const owners = project.project_members?.filter(m => m.role === 'owner') || [];
  const contributors = project.project_members?.filter(m => m.role === 'contributor') || [];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-sora text-lg mb-2 truncate">
              {project.project_name}
            </CardTitle>
            {project.event_id && (
              <Badge variant="secondary" className="mb-2">
                Hackathon Project
              </Badge>
            )}
          </div>
        </div>
        
        {project.description && (
          <CardDescription className="font-inter line-clamp-3">
            <div 
              dangerouslySetInnerHTML={{ __html: project.description }}
              className="prose prose-sm max-w-none"
            />
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs font-inter">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {(owners.length > 0 || contributors.length > 0) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
            <Users className="h-4 w-4" />
            <span>
              {owners.length} owner{owners.length !== 1 ? 's' : ''}
              {contributors.length > 0 && `, ${contributors.length} contributor${contributors.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {project.github_link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                Code
              </a>
            </Button>
          )}

          {project.live_link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={project.live_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Live
              </a>
            </Button>
          )}

          {project.demo_video_link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={project.demo_video_link} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4" />
                Demo
              </a>
            </Button>
          )}

          {project.ppt_link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={project.ppt_link} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
                Slides
              </a>
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-inter">
          Created {new Date(project.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
