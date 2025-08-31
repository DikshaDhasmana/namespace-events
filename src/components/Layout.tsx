import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  const location = useLocation();

  // Show sidebar on dashboard and profile pages
  const showSidebar = location.pathname === '/dashboard' || location.pathname === '/profile';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-grow">
        {showSidebar && <Sidebar />}
        <main className="flex-grow">
          {children}
        </main>
      </div>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
