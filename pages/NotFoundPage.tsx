
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-center">
      <h1 className="text-9xl font-extrabold text-highlight">404</h1>
      <h2 className="text-3xl font-bold mt-4">Page Not Found</h2>
      <p className="text-text-secondary mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link 
        to="/dashboard" 
        className="mt-8 px-6 py-3 bg-highlight hover:bg-teal-500 rounded-lg text-white font-semibold"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
