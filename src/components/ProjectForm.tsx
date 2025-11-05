import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export function ProjectForm({ open, onOpenChange, onProjectCreated }: ProjectFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    github_link: '',
    live_link: '',
    demo_video_link: '',
    description: '',
    ppt_link: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const { data, error } = await supabase.rpc('create_project_with_owner', {
        p_project_name: formData.project_name,
        p_github_link: formData.github_link || null,
        p_live_link: formData.live_link || null,
        p_demo_video_link: formData.demo_video_link || null,
        p_description: formData.description || null,
        p_ppt_link: formData.ppt_link || null,
        p_tags: tagsArray.length > 0 ? tagsArray : null,
        p_event_id: null,
        p_team_id: null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });

      setFormData({
        project_name: '',
        github_link: '',
        live_link: '',
        demo_video_link: '',
        description: '',
        ppt_link: '',
        tags: '',
      });

      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create project. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-inter">
        <DialogHeader>
          <DialogTitle className="font-sora">Create New Project</DialogTitle>
          <DialogDescription className="font-inter">
            Add a new project to your portfolio. All fields except project name are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_name" className="font-inter">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              required
              className="font-inter"
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-inter">Description</Label>
            <div className="font-inter">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Describe your project..."
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_link" className="font-inter">GitHub Link</Label>
              <Input
                id="github_link"
                type="url"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                className="font-inter"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="live_link" className="font-inter">Live Link</Label>
              <Input
                id="live_link"
                type="url"
                value={formData.live_link}
                onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                className="font-inter"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo_video_link" className="font-inter">Demo Video Link</Label>
              <Input
                id="demo_video_link"
                type="url"
                value={formData.demo_video_link}
                onChange={(e) => setFormData({ ...formData, demo_video_link: e.target.value })}
                className="font-inter"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ppt_link" className="font-inter">Presentation Link</Label>
              <Input
                id="ppt_link"
                type="url"
                value={formData.ppt_link}
                onChange={(e) => setFormData({ ...formData, ppt_link: e.target.value })}
                className="font-inter"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="font-inter">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="font-inter"
              placeholder="React, Node.js, MongoDB (comma-separated)"
            />
            <p className="text-xs text-muted-foreground font-inter">
              Enter tags separated by commas
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
