import { useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'My Profile',
      path: '/profile',
      icon: User,
    },
    {
      label: 'My Registrations',
      path: '/dashboard',
      icon: Calendar,
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
