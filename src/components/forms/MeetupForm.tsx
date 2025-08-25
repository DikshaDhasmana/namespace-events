import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MeetupFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const MeetupForm: React.FC<MeetupFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Meetup Title</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter meetup title"
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
          placeholder="Describe the meetup agenda and what participants can expect"
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
          <Label htmlFor="duration">Duration (hours)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            step="0.5"
            value={formData.duration || ''}
            onChange={onInputChange}
            placeholder="e.g., 2.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_participants">Max Participants</Label>
          <Input
            id="max_participants"
            name="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={onInputChange}
            placeholder="e.g., 50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="networking">Networking Session</Label>
          <Input
            id="networking"
            name="networking"
            value={formData.networking || ''}
            onChange={onInputChange}
            placeholder="Yes/No - Will there be networking time?"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          name="venue"
          value={formData.venue}
          onChange={onInputChange}
          placeholder="Meeting location address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speakers">Speakers/Hosts</Label>
        <Textarea
          id="speakers"
          name="speakers"
          value={formData.speakers || ''}
          onChange={onInputChange}
          placeholder="List of speakers or discussion leaders"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topics">Discussion Topics</Label>
        <Textarea
          id="topics"
          name="topics"
          value={formData.topics || ''}
          onChange={onInputChange}
          placeholder="Main topics or agenda items to be covered"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="refreshments">Refreshments</Label>
        <Input
          id="refreshments"
          name="refreshments"
          value={formData.refreshments || ''}
          onChange={onInputChange}
          placeholder="Will food/drinks be provided?"
        />
      </div>
    </div>
  );
};

export default MeetupForm;