import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, X, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  // Calculate stats and categorize events
  const now = new Date();

  const liveEvents = registrations.filter(reg => {
    const eventDate = new Date(reg.events.date);
    const eventEndDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hours duration
    return eventDate <= now && eventEndDate >= now;
  });

  const upcomingEvents = registrations.filter(reg =>
    new Date(reg.events.date) > now
  );

  const pastEvents = registrations.filter(reg => {
    const eventDate = new Date(reg.events.date);
    const eventEndDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hours duration
    return eventEndDate < now;
  });

  const totalEvents = registrations.length;
  const liveCount = liveEvents.length;
  const upcomingCount = upcomingEvents.length;
  const pastCount = pastEvents.length;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
              <p className="text-muted-foreground text-lg">
                Here's what's happening with your events
              </p>
            </div>
            <Button onClick={() => navigate('/events')} className="gap-2">
              <Plus className="h-4 w-4" />
              Browse Events
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Events you've registered for
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground">
                Events in your future
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastCount}</div>
              <p className="text-xs text-muted-foreground">
                Events you've attended
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {registrations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">No Registrations Yet</CardTitle>
                <CardDescription className="text-lg">
                  You haven't registered for any events yet. Explore upcoming events to get started.
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/events')} size="lg" className="mt-4">
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Live Events Section */}
            {liveCount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Live Events
                  </h2>
                  <Badge variant="destructive" className="text-sm">
                    {liveCount} event{liveCount !== 1 ? 's' : ''} happening now
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {liveEvents.map((registration) => (
            <Card key={registration.id} className="relative group hover:shadow-lg transition-shadow border-red-200">
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>

              <CardHeader className="pt-12">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2 font-heading">
                    {registration.events.name}
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className={`w-fit ${eventTypeColors[registration.events.event_type as keyof typeof eventTypeColors]}`}
                >
                  {registration.events.event_type.charAt(0).toUpperCase() + registration.events.event_type.slice(1)}
                </Badge>
              </CardHeader>

              <CardContent className="flex flex-col justify-between">
                <div className="space-y-2 mb-4">
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
                </div>
                <button
                  onClick={() => navigate(`/events/${registration.events.id}`)}
                  className="w-full bg-primary hover:bg-primary/90 transition-colors button-hover button-hover-light dark:button-hover-dark"
                  style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
                >
                  View Details
                </button>
              </CardContent>
            </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events Section */}
            {upcomingCount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Upcoming Events</h2>
                  <Badge variant="secondary" className="text-sm">
                    {upcomingCount} event{upcomingCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {upcomingEvents.map((registration) => (
                    <Card key={registration.id} className="relative group hover:shadow-lg transition-shadow">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleUnregister(registration.id, registration.events.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <CardHeader>
                        <div className="flex justify-between items-start pr-8">
                          <CardTitle className="text-lg line-clamp-2 font-heading">
                            {registration.events.name}
                          </CardTitle>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`w-fit ${eventTypeColors[registration.events.event_type as keyof typeof eventTypeColors]}`}
                        >
                          {registration.events.event_type.charAt(0).toUpperCase() + registration.events.event_type.slice(1)}
                        </Badge>
                      </CardHeader>

                      <CardContent className="flex flex-col justify-between">
                        <div className="space-y-2 mb-4">
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
                        </div>
                        <button
                          onClick={() => navigate(`/events/${registration.events.id}`)}
                          className="w-full bg-primary hover:bg-primary/90 transition-colors button-hover button-hover-light dark:button-hover-dark"
                          style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
                        >
                          View Details
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events Section */}
            {pastCount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Past Events</h2>
                  <Badge variant="outline" className="text-sm">
                    {pastCount} event{pastCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((registration) => (
                    <Card key={registration.id} className="relative opacity-75">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2 font-heading">
                            {registration.events.name}
                          </CardTitle>
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        </div>
                        <Badge
                          variant="secondary"
                          className={`w-fit ${eventTypeColors[registration.events.event_type as keyof typeof eventTypeColors]}`}
                        >
                          {registration.events.event_type.charAt(0).toUpperCase() + registration.events.event_type.slice(1)}
                        </Badge>
                      </CardHeader>

                      <CardContent className="flex flex-col justify-between">
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formatDate(registration.events.date)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            {registration.events.venue}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Attended • Registered on {new Date(registration.registered_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/events/${registration.events.id}`)}
                          className="w-full bg-primary hover:bg-primary/90 transition-colors button-hover button-hover-light dark:button-hover-dark"
                          style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
                        >
                          View Details
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}