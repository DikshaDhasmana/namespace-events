import { useLocation, useNavigate } from 'react-router-dom';
import { User, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const mainMenuItems = [
    {
      label: 'My Events',
      path: '/dashboard',
      icon: Home,
      description: 'Overview & registrations'
    },
    {
      label: 'My Profile',
      path: '/dashboard#profile',
      icon: User,
      description: 'Manage your profile'
    },
    {
      label: 'Sign Out',
      path: '/signout',
      icon: LogOut,
      description: 'Log out of your account',
      action: 'signout'
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-xs text-muted-foreground">Event Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Main Menu */}
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Main
            </h3>
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-auto p-3",
                    isActive && "bg-secondary border-l-2 border-primary"
                  )}
                  onClick={() => {
                    if (item.action === 'signout') {
                      handleSignOut();
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>


        </div>
      </div>


    </div>
  );
};

export default Sidebar;
