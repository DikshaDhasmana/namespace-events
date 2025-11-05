import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus } from 'lucide-react';

interface ProjectMember {
  id: string;
  role: 'owner' | 'contributor';
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface ProjectMemberManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  members: ProjectMember[];
  currentUserId: string;
  onMembersUpdated: () => void;
  teamId?: string | null;
}

export function ProjectMemberManager({
  open,
  onOpenChange,
  projectId,
  members,
  currentUserId,
  onMembersUpdated,
  teamId,
}: ProjectMemberManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'owner' | 'contributor'>('contributor');

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an email address',
      });
      return;
    }

    setLoading(true);

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newMemberEmail.trim())
        .single();

      if (userError || !userData) {
        toast({
          variant: 'destructive',
          title: 'User not found',
          description: 'No user found with this email address',
        });
        setLoading(false);
        return;
      }

      // Check if user is already a member
      if (members.some(m => m.user_id === userData.id)) {
        toast({
          variant: 'destructive',
          title: 'Already a member',
          description: 'This user is already a member of the project',
        });
        setLoading(false);
        return;
      }

      // If project has a team, verify user is a team member
      if (teamId) {
        const { data: teamMemberData } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamId)
          .eq('user_id', userData.id)
          .single();

        if (!teamMemberData) {
          toast({
            variant: 'destructive',
            title: 'Not a team member',
            description: 'This user must be a member of the project team first',
          });
          setLoading(false);
          return;
        }
      }

      // Add member
      const { error: addError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          role: newMemberRole,
          added_by: currentUserId,
        });

      if (addError) throw addError;

      toast({
        title: 'Member added',
        description: `Successfully added ${newMemberEmail} as ${newMemberRole}`,
      });

      setNewMemberEmail('');
      setNewMemberRole('contributor');
      onMembersUpdated();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add member. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: 'Successfully removed member from project',
      });

      onMembersUpdated();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove member. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'owner' | 'contributor') => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: `Successfully updated member role to ${newRole}`,
      });

      onMembersUpdated();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update role. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const owners = members.filter(m => m.role === 'owner');
  const contributors = members.filter(m => m.role === 'contributor');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
          <DialogDescription>
            Add or remove members and manage their roles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4" />
              <h3 className="font-semibold">Add New Member</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="memberEmail">Email Address</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  placeholder="member@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="memberRole">Role</Label>
                <Select
                  value={newMemberRole}
                  onValueChange={(value: 'owner' | 'contributor') => setNewMemberRole(value)}
                  disabled={loading}
                >
                  <SelectTrigger id="memberRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAddMember} disabled={loading} className="w-full">
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>

          {/* Current Members Section */}
          <div className="space-y-4">
            {/* Owners */}
            {owners.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Owners ({owners.length})</h4>
                <div className="space-y-2">
                  {owners.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.profiles?.full_name?.[0]?.toUpperCase() || member.profiles?.email[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {member.profiles?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {member.profiles?.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.user_id !== currentUserId && owners.length > 1 && (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(value: 'owner' | 'contributor') => handleUpdateRole(member.id, value)}
                              disabled={loading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="contributor">Contributor</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {member.user_id === currentUserId && (
                          <Badge variant="secondary">You</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contributors */}
            {contributors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Contributors ({contributors.length})</h4>
                <div className="space-y-2">
                  {contributors.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary">
                          {member.profiles?.full_name?.[0]?.toUpperCase() || member.profiles?.email[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {member.profiles?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {member.profiles?.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(value: 'owner' | 'contributor') => handleUpdateRole(member.id, value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contributor">Contributor</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
