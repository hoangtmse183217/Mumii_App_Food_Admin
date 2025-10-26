import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ICONS } from '../../constants';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => {
    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4 text-highlight">
                {icon}
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const location = useLocation();
    const [showToast, setShowToast] = useState(location.state?.fromLogin || false);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 4000); 

            // Clear history state to prevent toast on refresh or back navigation
            window.history.replaceState({}, '');

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    return (
        <div>
            {showToast && (
                <div 
                    role="alert"
                    aria-live="assertive"
                    className="fixed top-20 right-8 bg-success text-white py-3 px-6 rounded-lg shadow-lg animate-fade-in-out z-50 flex items-center"
                >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="font-semibold">Đăng nhập thành công!</p>
                </div>
            )}
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value="1,254" icon={ICONS.users} />
                <StatCard title="Pending Restaurants" value="12" icon={ICONS.restaurants} />
                <StatCard title="Total Moods" value="8" icon={ICONS.moods} />
                <StatCard title="Posts to Review" value="5" icon={ICONS.posts} />
            </div>
            <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <ul>
                    <li className="border-b border-accent py-3">User 'john.doe@example.com' signed up.</li>
                    <li className="border-b border-accent py-3">Restaurant 'The Grand Bistro' submitted for approval.</li>
                    <li className="border-b border-accent py-3">You approved 'Cafe Mocha'.</li>
                    <li className="py-3">New post 'My trip to the mountains' is pending review.</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;