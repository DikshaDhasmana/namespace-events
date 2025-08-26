import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  date: string;
  venue: string;
  max_participants: number;
  banner_url: string | null;
  created_at: string;
}

const eventTypeColors = {
  webinar: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  hackathon: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  meetup: 'bg-green-100 text-green-800 hover:bg-green-200',
  contest: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
};

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      if (user) {
        checkRegistration();
      }
      fetchRegistrationCount();
    }
  }, [eventId, user]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event details",
      });
      navigate('/events');
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  const checkRegistration = async () => {
    if (!user || !eventId) return;

    const { data } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();

    setIsRegistered(!!data);
  };

  const fetchRegistrationCount = async () => {
    if (!eventId) return;

    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    setRegistrationCount(count || 0);
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has completed their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed')
      .eq('id', user.id)
      .single();

    if (!profile?.profile_completed) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Please complete your profile before registering for events",
      });
      navigate('/profile');
      return;
    }
    
    const { error } = await supabase
      .from('registrations')
      .insert([{ user_id: user.id, event_id: eventId }]);

    if (error) {
      if (error.code === '23505') {
        toast({
          variant: "destructive",
          title: "Already registered",
          description: "You are already registered for this event",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
      }
    } else {
      toast({
        title: "Success!",
        description: "You have been registered for the event",
      });
      setIsRegistered(true);
      setRegistrationCount(prev => prev + 1);
    }
  };

  const handleUnregister = async () => {
    if (!user || !eventId) return;

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unregister from event",
      });
    } else {
      toast({
        title: "Success!",
        description: "You have been unregistered from the event",
      });
      setIsRegistered(false);
      setRegistrationCount(prev => Math.max(0, prev - 1));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading event details...</div>
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Event Banner */}
          <div className="mb-6">
            <img
              src={event.banner_url || '/placeholder.svg'}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Event Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Badge 
                variant="secondary" 
                className={eventTypeColors[event.event_type as keyof typeof eventTypeColors]}
              >
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4 font-heading">{event.name}</h1>
          </div>

          {/* Event Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {event.description || 'No description available for this event.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg border border-green-200">
                    ✓ You are registered for this event
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleUnregister}
                    className="w-full"
                  >
                    Unregister
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleRegister}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {user ? 'Register Now' : 'Sign in to Register'}
                </Button>
              )}
              
              <div className="text-sm text-muted-foreground">
                {registrationCount} {registrationCount === 1 ? 'person registered' : 'people registered'}
                {event.max_participants && (
                  <span> • {event.max_participants - registrationCount} spots remaining</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{formatDate(event.date)}</div>
                  <div className="text-sm text-muted-foreground">{formatTime(event.date)}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Venue</div>
                  <div className="text-sm text-muted-foreground">{event.venue}</div>
                </div>
              </div>
              
              {event.max_participants && (
                <>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Capacity</div>
                      <div className="text-sm text-muted-foreground">
                        Maximum {event.max_participants} participants
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}