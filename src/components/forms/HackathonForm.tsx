import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HackathonFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const HackathonForm: React.FC<HackathonFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Hackathon Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter hackathon name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Theme & Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe the hackathon theme, challenges, and objectives"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Start Date & Time</Label>
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
          <Label htmlFor="end_date">End Date & Time</Label>
          <Input
            id="end_date"
            name="end_date"
            type="datetime-local"
            value={formData.end_date || ''}
            onChange={onInputChange}
            required
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
            placeholder="e.g., 200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team_size">Max Team Size</Label>
          <Input
            id="team_size"
            name="team_size"
            type="number"
            value={formData.team_size || ''}
            onChange={onInputChange}
            placeholder="e.g., 4"
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
          placeholder="Physical location or Online platform"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prizes">Prizes</Label>
        <Textarea
          id="prizes"
          name="prizes"
          value={formData.prizes || ''}
          onChange={onInputChange}
          placeholder="Prize details for winners (1st, 2nd, 3rd place, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tech_stack">Allowed Technologies</Label>
        <Textarea
          id="tech_stack"
          name="tech_stack"
          value={formData.tech_stack || ''}
          onChange={onInputChange}
          placeholder="List of allowed programming languages, frameworks, tools"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="judging_criteria">Judging Criteria</Label>
        <Textarea
          id="judging_criteria"
          name="judging_criteria"
          value={formData.judging_criteria || ''}
          onChange={onInputChange}
          placeholder="How projects will be evaluated (innovation, execution, design, etc.)"
          rows={3}
        />
      </div>
    </div>
  );
};

export default HackathonForm;