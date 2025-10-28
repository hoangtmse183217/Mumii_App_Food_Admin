import { useState, useEffect, useMemo, useCallback, ChangeEvent, FormEvent } from 'react';
import { Restaurant, RestaurantStatus, User } from '../types';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { restaurantService, RestaurantUpdatePayload } from '../services/restaurantService';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;

/**
 * A robust hook for managing all restaurant-related logic.
 * It fetches all restaurant and partner data once, then performs
 * all filtering (by tab status, search) and sorting on the client-side.
 * This approach is more resilient and performant.
 */
export const useRestaurants = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();

    // State for master data list
    const [masterRestaurantList, setMasterRestaurantList] = useState<Restaurant[]>([]);
    
    // State for UI controls
    const [activeTab, setActiveTab] = useState<RestaurantStatus>(RestaurantStatus.Pending);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<{ column: keyof Restaurant; direction: 'asc' | 'desc' }>({ column: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);

    // State for modals and actions
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [declineReason, setDeclineReason] = useState('');
    const [editFormData, setEditFormData] = useState<RestaurantUpdatePayload>({});
    const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; message: string; title: string } | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Main data fetching effect. Fetches ALL data and runs only on mount or manual refetch.
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            console.log(`[useRestaurants] Starting to fetch all master data...`);
            showLoader();
            try {
                // Fetch ALL restaurants (no status filter) and ALL partners simultaneously.
                const [restaurantData, partnerData] = await Promise.all([
                    restaurantService.getAll({ page: 1, pageSize: 1000 }, controller.signal),
                    userService.getAll(controller.signal)
                ]);
                
                console.log('[useRestaurants] Raw ALL restaurant data from API:', restaurantData);
                console.log('[useRestaurants] Raw ALL partner data from API:', partnerData);

                const partnersMap = new Map<number, User>();
                (partnerData.items || []).forEach(user => {
                    if (user.role === 'Partner') {
                        partnersMap.set(user.id, user);
                    }
                });
                
                // Combine restaurant data with partner data.
                const combinedRestaurants = (restaurantData.items || []).map(r => ({
                    ...r,
                    partner: partnersMap.get(r.partnerId)
                }));
                
                console.log('[useRestaurants] Final combined master list before setting state:', combinedRestaurants);
                setMasterRestaurantList(combinedRestaurants);

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Master data fetch aborted.');
                    return;
                }
                console.error(`[useRestaurants] Error fetching master data:`, error);
                addToast(error instanceof Error ? error.message : `Failed to load restaurant data.`, 'error');
                setMasterRestaurantList([]); // Clear data on error
            } finally {
                hideLoader();
            }
        };

        fetchData();
        return () => controller.abort();
    }, [refetchTrigger, addToast, showLoader, hideLoader]);
    
    // A simple function to trigger the main data fetching effect.
    const refetch = () => setRefetchTrigger(c => c + 1);

    // Client-side filtering and sorting logic, derived from the master list
    const processedRestaurants = useMemo(() => {
        // 1. Filter by active tab status
        let filtered = masterRestaurantList.filter(r => r.status === activeTab);
        console.log(`[useRestaurants] Filtered by tab '${activeTab}':`, filtered.length, 'items');

        // 2. Filter by search term
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(r => 
                r.name.toLowerCase().includes(term) ||
                (r.partner?.fullname || '').toLowerCase().includes(term)
            );
        }

        // 3. Apply sorting
        filtered.sort((a, b) => {
            const valA = a[sorting.column];
            const valB = b[sorting.column];
            if (valA === undefined || valB === undefined) return 0;
            const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sorting.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [masterRestaurantList, activeTab, debouncedSearchTerm, sorting]);
    
    // Pagination logic
    const totalPages = Math.ceil(processedRestaurants.length / ITEMS_PER_PAGE);
    const paginatedRestaurants = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedRestaurants, currentPage]);

    // Reset page to 1 when filters or tabs change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, activeTab, sorting]);
     // Effect to handle page reset when total pages decreases
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    // All event handlers for the UI
    const handleTabChange = (newTab: RestaurantStatus) => {
        setActiveTab(newTab);
        setSearchTerm('');
    };
    
    const handleSort = (column: keyof Restaurant) => {
        setSorting(p => ({ column, direction: p.column === column && p.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleStatusUpdate = (restaurant: Restaurant, newStatus: RestaurantStatus.Approved | RestaurantStatus.Declined) => {
        setSelectedRestaurant(restaurant);
        if (newStatus === RestaurantStatus.Declined) {
            setDeclineReason('');
            setIsDeclineModalOpen(true);
        } else {
            setConfirmAction({
                action: async () => {
                    await restaurantService.approve(restaurant.id);
                    addToast(`Restaurant "${restaurant.name}" has been approved.`, 'success');
                    await notificationService.sendToUser({
                        userId: restaurant.partnerId,
                        title: 'Restaurant Approved',
                        content: `Congratulations! Your restaurant "${restaurant.name}" has been approved.`
                    });
                },
                title: 'Confirm Approval',
                message: `Are you sure you want to approve "${restaurant.name}"? A notification will be sent to the partner.`,
            });
        }
    };
    
    const confirmDecline = async () => {
        if (!selectedRestaurant || !declineReason) {
            addToast('A reason for declining is required.', 'error');
            return;
        }
        showLoader();
        try {
            await restaurantService.decline(selectedRestaurant.id, declineReason);
            addToast(`Restaurant "${selectedRestaurant.name}" has been declined.`, 'success');
            await notificationService.sendToUser({
                userId: selectedRestaurant.partnerId,
                title: 'Restaurant Declined',
                content: `Regarding your restaurant "${selectedRestaurant.name}", we were unable to approve it at this time. Reason: ${declineReason}`
            });
            refetch();
        } catch (error) {
             addToast(error instanceof Error ? error.message : 'Failed to decline restaurant.', 'error');
        } finally {
            hideLoader();
            setIsDeclineModalOpen(false);
        }
    };

    const handleUpdateRestaurant = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedRestaurant) return;
        showLoader();
        try {
            await restaurantService.update(selectedRestaurant.id, editFormData);
            addToast(`Restaurant "${selectedRestaurant.name}" has been updated.`, 'success');
            setIsEditModalOpen(false);
            refetch();
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Failed to update restaurant.', 'error');
        } finally {
            hideLoader();
        }
    };

    const handleDeleteRestaurant = (restaurant: Restaurant) => {
        setConfirmAction({
            action: async () => {
                await restaurantService.delete(restaurant.id);
                addToast(`Restaurant "${restaurant.name}" has been permanently deleted.`, 'success');
            },
            title: 'Confirm Deletion',
            message: `Are you sure you want to permanently delete "${restaurant.name}"? This action cannot be undone.`,
        });
    };
    
    const executeConfirmAction = async () => {
        if (!confirmAction) return;
        showLoader();
        try {
            await confirmAction.action();
            refetch();
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'An unexpected error occurred.', 'error');
        } finally {
            hideLoader();
            setConfirmAction(null);
        }
    };
    
    const cancelAction = () => setConfirmAction(null);

    const openDetailsModal = (restaurant: Restaurant) => { setSelectedRestaurant(restaurant); setIsDetailModalOpen(true); };
    const closeDetailsModal = () => setIsDetailModalOpen(false);

    const handleOpenEditModal = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setEditFormData({
            name: restaurant.name,
            address: restaurant.address,
            description: restaurant.description,
            avgPrice: restaurant.avgPrice,
        });
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData(p => ({ ...p, [name]: name === 'avgPrice' ? parseFloat(value) || 0 : value }));
    };

    return {
        // Data and loading state
        isLoading,
        restaurants: paginatedRestaurants,
        totalPages,
        totalItems: processedRestaurants.length,
        currentPage,
        activeTab,
        
        // UI state and handlers
        searchTerm,
        setSearchTerm,
        sorting,
        handleSort,
        setCurrentPage,
        handleTabChange,

        // Modal states and data
        isDetailModalOpen,
        isDeclineModalOpen,
        isEditModalOpen,
        selectedRestaurant,
        declineReason,
        editFormData,
        confirmAction,

        // Modal action handlers
        openDetailsModal,
        closeDetailsModal,
        setIsDeclineModalOpen,
        setDeclineReason,
        confirmDecline,
        handleOpenEditModal,
        setIsEditModalOpen,
        handleEditFormChange,
        handleUpdateRestaurant,
        handleStatusUpdate,
        handleDeleteRestaurant,
        executeConfirmAction,
        cancelAction,
    };
};
