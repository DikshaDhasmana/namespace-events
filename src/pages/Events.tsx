import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';


interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  date: string;
  venue: string;
  max_participants: number;
  banner_url: string | null;
}

const eventTypeColors = {
  webinar: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  hackathon: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  meetup: 'bg-green-100 text-green-800 hover:bg-green-200',
  contest: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const fetchRegistrations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('user_id', user.id);

    if (data) {
      setRegisteredEvents(new Set(data.map(r => r.event_id)));
    }
  };

  const handleRegister = async (eventId: string) => {
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
      setRegisteredEvents(prev => new Set([...prev, eventId]));
    }
  };

  const filterEvents = (type?: string) => {
    if (!type || type === 'all') return events;
    return events.filter(event => event.event_type === type);
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

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="h-full flex flex-col rounded-xl shadow-medium hover:shadow-lg transition-shadow">
      {/* Event Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        <img
          src={event.banner_url || '/placeholder.svg'}
          alt={event.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={`${eventTypeColors[event.event_type as keyof typeof eventTypeColors]} shadow-sm`}
          >
            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2 font-heading">{event.name}</CardTitle>
        <CardDescription className="line-clamp-3 text-muted-foreground">
          {event.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {event.venue}
          </div>
          {event.max_participants && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              Max {event.max_participants} participants
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => navigate(`/events/${event.id}`)}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
          >
            View Details
          </Button>
          {registeredEvents.has(event.id) && (
            <div className="text-xs text-center text-muted-foreground bg-green-50 py-1 px-2 rounded border border-green-200">
              ✓ Registered
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-heading">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Discover and register for exciting tech events
        </p>
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedType === 'all' ? 'All Events' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => setSelectedType('all')}>
              All Events
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedType('webinar')}>
              Webinars
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedType('hackathon')}>
              Hackathons
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedType('meetup')}>
              Meetups
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedType('contest')}>
              Contests
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="webinar">Webinars</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathons</TabsTrigger>
            <TabsTrigger value="meetup">Meetups</TabsTrigger>
            <TabsTrigger value="contest">Contests</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filterEvents(selectedType === 'all' ? undefined : selectedType).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
