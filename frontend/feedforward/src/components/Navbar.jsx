
import { useAuth } from './AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-[#1976D2] shadow-md h-16 fixed top-0 right-0 left-64 z-10">
      <div className="flex justify-end items-center h-full px-6">
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* User Menu */}
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;