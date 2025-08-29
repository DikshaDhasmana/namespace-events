import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Registration {
  id: string;
  registered_at: string;
  event_id: string;
  events: {
    id: string;
    name: string;
    description: string;
    event_type: string;
    date: string;
    venue: string;
    max_participants: number;
  };
}

const eventTypeColors = {
  webinar: 'bg-blue-100 text-blue-800',
  hackathon: 'bg-purple-100 text-purple-800',
  meetup: 'bg-green-100 text-green-800',
  contest: 'bg-orange-100 text-orange-800',
};

export default function Dashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRegistrations();
  }, [user, navigate]);

  const fetchRegistrations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your registrations",
      });
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const handleUnregister = async (registrationId: string, eventName: string) => {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', registrationId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unregister from event",
      });
    } else {
      toast({
        title: "Unregistered",
        description: `You have been unregistered from ${eventName}`,
      });
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your event registrations
        </p>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Registrations Yet</CardTitle>
            <CardDescription>
              You haven't registered for any events yet. Explore upcoming events to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/events')}>
              Browse Events
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((registration) => (
            <Card key={registration.id} className="relative card-subtle-hover">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleUnregister(registration.id, registration.events.name)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <CardHeader>
                <div className="flex justify-between items-start pr-8">
                  <CardTitle className="text-lg line-clamp-2">
                    {registration.events.name}
                  </CardTitle>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`w-fit ${eventTypeColors[registration.events.event_type as keyof typeof eventTypeColors]}`}
                >
                  {registration.events.event_type}
                </Badge>
                <CardDescription className="line-clamp-3">
                  {registration.events.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(registration.events.date)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {registration.events.venue}
                </div>
                {registration.events.max_participants && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    Max {registration.events.max_participants} participants
                  </div>
                )}
                <div className="pt-2 text-xs text-muted-foreground">
                  Registered on {new Date(registration.registered_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}