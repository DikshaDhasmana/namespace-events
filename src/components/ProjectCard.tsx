import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Video, FileText, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  } | null;
  teams?: {
    name: string;
  } | null;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-sora text-lg mb-2 truncate">
              {project.project_name}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {project.event_id && project.events && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Trophy className="h-3 w-3" />
                  {project.events.name}
                </Badge>
              )}
              {project.team_id && project.teams && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {project.teams.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {project.description && (
          <CardDescription className="font-inter line-clamp-2">
            <div 
              dangerouslySetInnerHTML={{ __html: project.description }}
              className="prose prose-sm max-w-none [&>*]:line-clamp-2"
            />
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs font-inter">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-inter">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {project.github_link && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 h-8 px-2"
            >
              <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          )}

          {project.live_link && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 h-8 px-2"
            >
              <a href={project.live_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          {project.demo_video_link && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 h-8 px-2"
            >
              <a href={project.demo_video_link} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4" />
              </a>
            </Button>
          )}

          {project.ppt_link && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 h-8 px-2"
            >
              <a href={project.ppt_link} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        <Button 
          onClick={() => navigate(`/projects/${project.id}`)}
          className="w-full"
        >
          View Project
        </Button>
      </CardContent>
    </Card>
  );
}
