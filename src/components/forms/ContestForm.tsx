import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContestFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ContestForm: React.FC<ContestFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Contest Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter contest name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Contest Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe the contest format, rules, and objectives"
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
            placeholder="e.g., 100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contest_type">Contest Type</Label>
          <Input
            id="contest_type"
            name="contest_type"
            value={formData.contest_type || ''}
            onChange={onInputChange}
            placeholder="e.g., Coding, Design, Quiz, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue/Platform</Label>
        <Input
          id="venue"
          name="venue"
          value={formData.venue}
          onChange={onInputChange}
          placeholder="Contest platform or physical location"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prizes">Prize Structure</Label>
        <Textarea
          id="prizes"
          name="prizes"
          value={formData.prizes || ''}
          onChange={onInputChange}
          placeholder="Prize details for winners (cash, certificates, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules">Contest Rules</Label>
        <Textarea
          id="rules"
          name="rules"
          value={formData.rules || ''}
          onChange={onInputChange}
          placeholder="Important rules and guidelines participants must follow"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eligibility">Eligibility Criteria</Label>
        <Textarea
          id="eligibility"
          name="eligibility"
          value={formData.eligibility || ''}
          onChange={onInputChange}
          placeholder="Who can participate (age, skill level, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="submission_format">Submission Format</Label>
        <Textarea
          id="submission_format"
          name="submission_format"
          value={formData.submission_format || ''}
          onChange={onInputChange}
          placeholder="How participants should submit their entries"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ContestForm;