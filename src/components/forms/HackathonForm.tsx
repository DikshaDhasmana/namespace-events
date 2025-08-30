import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HackathonFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const HackathonForm: React.FC<HackathonFormProps> = ({ formData, onInputChange, onSelectChange }) => {
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
        <Label htmlFor="mode">Mode</Label>
        <Select value={formData.mode || ''} onValueChange={(value) => onSelectChange('mode', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.mode === 'offline' && (
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={onInputChange}
            placeholder="Physical location"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="team_size">Team Size</Label>
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
  );
};

export default HackathonForm;
