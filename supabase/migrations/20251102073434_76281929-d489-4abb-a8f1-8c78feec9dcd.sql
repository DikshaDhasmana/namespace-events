-- Add new event types to the event_type enum
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'seminar';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'workshop';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'conference';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'fellowship';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'cohort';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'hiring_challenge';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'ideathon';