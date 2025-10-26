import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ICONS } from '../constants';
import { useDashboard } from '../hooks/useDashboard';
import { Restaurant, User } from '../types';
import type { ChartJsData } from '../hooks/useDashboard';

// Type for chart.js which is loaded from a script tag
declare global {
  interface Window {
    Chart?: any;
  }
}

// A more detailed StatCard component
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    delta?: string | number;
    deltaText?: string;
    iconBgColor?: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, delta, deltaText = "mới hôm nay", iconBgColor = 'bg-red-100' }) => {
    return (
        <div className="bg-secondary p-5 rounded-lg shadow-sm border border-accent flex items-start justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
                {delta !== undefined && (
                    <p className="text-xs text-success mt-1">
                        +{delta} {deltaText}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-full text-highlight ${iconBgColor}`}>
                {icon}
            </div>
        </div>
    );
};

// A wrapper for charts
const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-sm border border-accent">
        <h3 className="text-lg font-heading font-bold mb-4">{title}</h3>
        <div className="relative" style={{ height: '300px' }}>
            {children}
        </div>
    </div>
);

// A generic table for recent activities
interface RecentActivityTableProps<T> {
  title: string;
  items: T[];
  columns: { header: string; accessor: (item: T) => React.ReactNode }[];
}
const RecentActivityTable = <T extends { id: number }>({ title, items, columns }: RecentActivityTableProps<T>) => (
  <div className="bg-secondary p-6 rounded-lg shadow-sm border border-accent">
    <h3 className="text-lg font-heading font-bold mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-text-secondary uppercase bg-primary/50">
          <tr>
            {columns.map((col, index) => <th key={index} className="px-4 py-2">{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map(item => (
            <tr key={item.id} className="border-b border-accent last:border-b-0">
              {columns.map((col, index) => <td key={index} className="px-4 py-3 whitespace-nowrap">{col.accessor(item)}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} className="text-center py-6 text-text-secondary">Không có dữ liệu.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Chart.js Components ---

const LineChart: React.FC<{ data: ChartJsData }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (canvasRef.current && window.Chart) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new window.Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }
        }
        return () => chartRef.current?.destroy();
    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};

const PieChart: React.FC<{ data: ChartJsData }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (canvasRef.current && window.Chart) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new window.Chart(ctx, {
                    type: 'pie',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } }
                    }
                });
            }
        }
        return () => chartRef.current?.destroy();
    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};


const DashboardPage = () => {
    const location = useLocation();
    const [showLoginToast, setShowLoginToast] = useState(location.state?.fromLogin || false);
    const { stats, chartData, recentActivity, isLoading, refreshData } = useDashboard();
    
    // State to track if Chart.js library is loaded
    const [isChartJsReady, setIsChartJsReady] = useState(!!window.Chart);

    useEffect(() => {
        if (!isChartJsReady) {
            const intervalId = setInterval(() => {
                if (window.Chart) {
                    setIsChartJsReady(true);
                    clearInterval(intervalId);
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, [isChartJsReady]);

    useEffect(() => {
        if (showLoginToast) {
            const timer = setTimeout(() => setShowLoginToast(false), 4000);
            window.history.replaceState({}, '');
            return () => clearTimeout(timer);
        }
    }, [showLoginToast]);
    
    const renderChartLoader = () => (
        <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-secondary">
                <div className="w-8 h-8 border-2 border-accent border-t-highlight rounded-full animate-spin mx-auto mb-2"></div>
                <p>Loading Chart...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {showLoginToast && (
                <div role="alert" aria-live="assertive" className="fixed top-20 right-8 bg-success text-white py-3 px-6 rounded-lg shadow-lg animate-fade-in-out z-50 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="font-semibold">Đăng nhập thành công!</p>
                </div>
            )}
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold">Dashboard Overview</h1>
                <button 
                    onClick={refreshData} 
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary border border-accent rounded-lg text-sm text-text-secondary hover:bg-primary disabled:opacity-50 disabled:cursor-wait"
                >
                    <span className={isLoading ? 'animate-spin' : ''}>{ICONS.refresh}</span>
                    {isLoading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Tổng số người dùng" value={stats.totalUsers} delta={stats.newUsersToday} icon={ICONS.users} />
                <StatCard title="Nhà hàng chờ duyệt" value={stats.pendingRestaurants} delta={stats.newPendingToday} icon={ICONS.restaurants} iconBgColor="bg-orange-100" />
                <StatCard title="Tổng số tâm trạng" value={stats.totalMoods} icon={ICONS.moods} iconBgColor="bg-blue-100" />
                <StatCard title="Bài viết cần xem xét" value={stats.pendingPosts} icon={ICONS.posts} iconBgColor="bg-purple-100"/>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <ChartCard title="Tăng trưởng người dùng (6 tháng qua)">
                       {isChartJsReady ? <LineChart data={chartData.userGrowth} /> : renderChartLoader()}
                    </ChartCard>
                </div>
                <div className="lg:col-span-2">
                    <ChartCard title="Trạng thái nhà hàng">
                        {isChartJsReady ? <PieChart data={chartData.restaurantStatus} /> : renderChartLoader()}
                    </ChartCard>
                </div>
            </div>
            
            {/* Recent Activity Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivityTable<User>
                    title="Người dùng mới đăng ký"
                    items={recentActivity.users}
                    columns={[
                        { header: 'Tên', accessor: item => <span className="font-medium text-text-primary">{item.fullname}</span> },
                        { header: 'Email', accessor: item => item.email },
                        { header: 'Ngày tạo', accessor: item => new Date(item.createdAt).toLocaleDateString() }
                    ]}
                />
                 <RecentActivityTable<Restaurant>
                    title="Nhà hàng mới được duyệt"
                    items={recentActivity.restaurants}
                    columns={[
                        { header: 'Tên', accessor: item => <span className="font-medium text-text-primary">{item.name}</span> },
                        { header: 'Đối tác', accessor: item => item.partner?.fullname || `ID: ${item.partnerId}` },
                        { header: 'Ngày duyệt', accessor: item => new Date(item.createdAt).toLocaleDateString() }
                    ]}
                />
            </div>

        </div>
    );
};

export default DashboardPage;