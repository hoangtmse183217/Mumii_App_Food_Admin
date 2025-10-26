
import { useState, useCallback, useEffect } from 'react';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { userService } from '../services/userService';
import { restaurantService } from '../services/restaurantService';
import { moodService } from '../services/moodService';
import { postService } from '../services/postService';
import { Restaurant, RestaurantStatus, User } from '../types';

interface DashboardStats {
    totalUsers: number;
    newUsersToday: number;
    pendingRestaurants: number;
    newPendingToday: number;
    totalMoods: number;
    pendingPosts: number;
}

export interface ChartJsData {
    labels: string[];
    datasets: {
        label?: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
        hoverOffset?: number;
    }[];
}

interface ChartData {
    userGrowth: ChartJsData;
    restaurantStatus: ChartJsData;
}

interface RecentActivity {
    users: User[];
    restaurants: Restaurant[];
}

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export const useDashboard = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();

    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        newUsersToday: 0,
        pendingRestaurants: 0,
        newPendingToday: 0,
        totalMoods: 0,
        pendingPosts: 0,
    });
    const [chartData, setChartData] = useState<ChartData>({
        userGrowth: { labels: [], datasets: [] },
        restaurantStatus: { labels: [], datasets: [] },
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity>({
        users: [],
        restaurants: [],
    });
    
    const fetchDashboardData = useCallback(async (signal: AbortSignal) => {
        showLoader();
        try {
            const [usersData, allRestaurantsData, moodsData, postsData] = await Promise.all([
                userService.getAll(signal),
                restaurantService.getAll({ page: 1, pageSize: 1000 }, signal), // Fetch ALL restaurants
                moodService.getMoods(),
                // FIX: Changed from non-existent `getPosts` to `getAll` to align with `postService`.
                postService.getAll({ page: 1, pageSize: 1000 }, signal),
            ]);

            const allUsers = usersData.items || (Array.isArray(usersData) ? usersData : []);
            const allRestaurants = allRestaurantsData.items || [];
            const allMoods = Array.isArray(moodsData) ? moodsData : [];
            // FIX: The response from `postService.getAll` is an object with an `items` array, not a direct array.
            const allPosts = postsData.items || [];
            
            // Filter restaurants by status on the frontend
            const pendingRestaurants = allRestaurants.filter(r => r.status === RestaurantStatus.Pending);
            const approvedRestaurants = allRestaurants.filter(r => r.status === RestaurantStatus.Approved);
            const declinedRestaurants = allRestaurants.filter(r => r.status === RestaurantStatus.Declined);

            // Process Stats
            const newUsersToday = allUsers.filter(u => isToday(new Date(u.createdAt))).length;
            const newPendingToday = pendingRestaurants.filter(r => isToday(new Date(r.createdAt))).length;
            const pendingPosts = allPosts.filter(p => p.status === 'PENDING').length;

            setStats({
                totalUsers: allUsers.length,
                newUsersToday,
                pendingRestaurants: pendingRestaurants.length,
                newPendingToday,
                totalMoods: allMoods.length,
                pendingPosts,
            });

            // Process Chart Data for Chart.js
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
            const simulatedUserCounts = months.map((_, i) => Math.floor(Math.random() * (150 + i * 20) + 50));
            const userGrowth: ChartJsData = {
                labels: months,
                datasets: [{
                    label: 'Người dùng mới',
                    data: simulatedUserCounts,
                    fill: true,
                    borderColor: '#E57373',
                    backgroundColor: 'rgba(229, 115, 115, 0.2)',
                    tension: 0.3,
                }]
            };
            
            const restaurantStatus: ChartJsData = {
                labels: ['Đang chờ', 'Đã duyệt', 'Đã từ chối'],
                datasets: [{
                    data: [
                        pendingRestaurants.length,
                        approvedRestaurants.length,
                        declinedRestaurants.length
                    ],
                    backgroundColor: ['#FFB74D', '#2E7D32', '#D32F2F'],
                    hoverOffset: 4,
                }],
            };

            setChartData({
                userGrowth,
                restaurantStatus,
            });

            // Process Recent Activity
            const recentUsers = [...allUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
            
            const recentRestaurants = [...approvedRestaurants].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
            
            setRecentActivity({
                users: recentUsers,
                restaurants: recentRestaurants,
            });

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Dashboard fetch aborted');
                return;
            }
            addToast(error instanceof Error ? error.message : 'Failed to load dashboard data', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    useEffect(() => {
        const controller = new AbortController();
        fetchDashboardData(controller.signal);
        return () => controller.abort();
    }, [fetchDashboardData]);

    const refreshData = useCallback(() => {
         const controller = new AbortController();
         fetchDashboardData(controller.signal);
    }, [fetchDashboardData]);

    return {
        stats,
        chartData,
        recentActivity,
        isLoading,
        refreshData,
    };
};
