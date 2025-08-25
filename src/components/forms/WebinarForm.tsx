import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WebinarFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const WebinarForm: React.FC<WebinarFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Webinar Title</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter webinar title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe what participants will learn"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date & Time</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            value={formData.date}
            onChange={onInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_participants">Max Participants</Label>
          <Input
            id="max_participants"
            name="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={onInputChange}
            placeholder="e.g., 100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Platform/Venue</Label>
        <Input
          id="venue"
          name="venue"
          value={formData.venue}
          onChange={onInputChange}
          placeholder="e.g., Zoom, Google Meet, or Physical Location"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speaker">Speaker Name</Label>
        <Input
          id="speaker"
          name="speaker"
          value={formData.speaker || ''}
          onChange={onInputChange}
          placeholder="Main speaker/presenter name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prerequisites">Prerequisites</Label>
        <Textarea
          id="prerequisites"
          name="prerequisites"
          value={formData.prerequisites || ''}
          onChange={onInputChange}
          placeholder="Any prerequisites or required knowledge"
          rows={3}
        />
      </div>
    </div>
  );
};

export default WebinarForm;