// src/components/Dashboard.tsx
import React from 'react';
import Profile from './Profile';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Profile />
      {/* You can later add job applications, saved jobs, etc. here */}
    </div>
  );
};

export default Dashboard;