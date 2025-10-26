
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-secondary p-4 shadow-sm flex justify-between items-center sticky top-0 z-30 border-b border-accent" style={{ minHeight: '81px' }}>
      <div>
        <h1 className="text-xl font-heading font-semibold text-text-primary">Welcome, {user?.fullname || 'Admin'}!</h1>
        <p className="text-sm text-text-secondary">Here's what's happening today.</p>
      </div>
    </header>
  );
};

export default Header;