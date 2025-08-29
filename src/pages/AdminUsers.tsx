import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Phone, Calendar, GraduationCap, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SquaresBackground from '@/components/SquaresBackground';
import { format } from 'date-fns';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  academic_info: string;
  tech_stack: string[];
  skills: string[];
  profile_completed: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [isAdminAuthenticated, navigate]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <SquaresBackground />
      <header className="border-b bg-card relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Platform Users</h1>
          <Badge variant="secondary" className="ml-auto">
            {users.length} total users
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">Users will appear here when they register</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{user.full_name || 'No name provided'}</CardTitle>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.profile_completed ? "default" : "destructive"}>
                        {user.profile_completed ? "Profile Complete" : "Incomplete Profile"}
                      </Badge>
                      <Badge variant="outline">
                        Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4" />
                        Personal Info
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {user.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {user.phone_number}
                          </div>
                        )}
                        {user.date_of_birth && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(user.date_of_birth), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4" />
                        Academic Info
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.academic_info || 'Not provided'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Code className="h-4 w-4" />
                        Tech & Skills
                      </div>
                      <div className="space-y-2">
                        {user.tech_stack && user.tech_stack.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Tech Stack:</div>
                            <div className="flex flex-wrap gap-1">
                              {user.tech_stack.map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {user.skills && user.skills.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {user.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;