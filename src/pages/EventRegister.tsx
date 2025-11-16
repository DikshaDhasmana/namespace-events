import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import EventRegistrationModal from '@/components/EventRegistrationModal';

interface Event {
  id: string;
  name: string;
  approval_enabled: boolean | null;
  confirmation_email_enabled: boolean | null;
}

const EventRegister = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (user && event) {
      setShowForm(true);
    }
  }, [user, event]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, approval_enabled, confirmation_email_enabled')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event details",
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    toast({
      title: "Success!",
      description: event?.approval_enabled
        ? "Your registration request has been submitted. You will receive an email once reviewed."
        : "You have been registered for the event",
    });
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Event not found</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Register for {event.name}</h1>
          <p className="text-muted-foreground">You need to sign in to register for this event.</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/events/${eventId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Register for {event.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {showForm && (
              <EventRegistrationModal
                isOpen={true}
                onClose={() => navigate(`/events/${eventId}`)}
                eventId={event.id}
                eventName={event.name}
                approvalEnabled={event.approval_enabled || false}
                confirmationEmailEnabled={event.confirmation_email_enabled ?? true}
                onRegistrationSuccess={handleRegistrationSuccess}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventRegister;
