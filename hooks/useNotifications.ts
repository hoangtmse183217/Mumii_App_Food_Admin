import { useState, useEffect, useCallback, ChangeEvent, FormEvent, useMemo } from 'react';
import { Notification } from '../types';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { notificationService } from '../services/notificationService';

const ITEMS_PER_PAGE = 10;
const initialFilters = { userId: '', status: '', startDate: '', endDate: '' };

export const useNotifications = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();

    // State
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [filters, setFilters] = useState(initialFilters);
    const [sorting, setSorting] = useState<{ column: keyof Notification; direction: 'asc' | 'desc' }>({ column: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);

    // Modal & Form State
    const [modalState, setModalState] = useState({ isSendOpen: false, isBroadcastOpen: false, isEditOpen: false });
    const [isCustomTitle, setIsCustomTitle] = useState(false);
    const [notificationData, setNotificationData] = useState({ userId: '', title: '', content: '' });
    const [broadcastData, setBroadcastData] = useState({ title: '', content: '' });
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [editData, setEditData] = useState({ title: '', content: '' });
    const [confirmDeleteState, setConfirmDeleteState] = useState({ isOpen: false, idToDelete: null as number | null });
    const [formError, setFormError] = useState('');
    
    // Fetching Data (Client-side)
    const fetchAllNotifications = useCallback(async (signal: AbortSignal) => {
        showLoader();
        try {
            const data = await notificationService.getAll(signal);
            setAllNotifications(data.items || []);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            addToast(error instanceof Error ? error.message : 'Failed to fetch notifications', 'error');
            setAllNotifications([]);
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    useEffect(() => {
        const controller = new AbortController();
        fetchAllNotifications(controller.signal);
        return () => controller.abort();
    }, [fetchAllNotifications]);

    // Data Processing (Client-side Filtering, Sorting)
    const processedNotifications = useMemo(() => {
        let filtered = [...allNotifications];

        if (filters.userId) {
            filtered = filtered.filter(n => String(n.userId).includes(filters.userId));
        }
        if (filters.status) {
            const isRead = filters.status === 'true';
            filtered = filtered.filter(n => n.isRead === isRead);
        }
        if (filters.startDate) {
            filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(n => new Date(n.createdAt) <= endDate);
        }

        filtered.sort((a, b) => {
            const valA = a[sorting.column];
            const valB = b[sorting.column];
            if (valA === undefined || valB === undefined) return 0;
            const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sorting.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [allNotifications, filters, sorting]);

    // Pagination
    const totalPages = Math.ceil(processedNotifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedNotifications, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sorting]);
    
    // Handlers
    const handleSort = (column: keyof Notification) => setSorting(prev => ({ column, direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc' }));
    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFilterSubmit = (e: FormEvent) => { e.preventDefault(); /* Filters are applied live via useMemo */ };
    const handleClearFilters = () => { setFilters(initialFilters); };
    
    const handleOpenModal = (modalName: 'isSendOpen' | 'isBroadcastOpen' | 'isEditOpen', notification?: Notification) => {
        setFormError('');
        if (notification) {
            setEditingNotification(notification);
            setEditData({ title: notification.title, content: notification.content });
        } else {
            setNotificationData({ userId: '', title: '', content: '' });
            setBroadcastData({ title: '', content: '' });
            setIsCustomTitle(false);
        }
        setModalState(prev => ({ ...prev, [modalName]: true }));
    };
    const handleCloseModals = () => setModalState({ isSendOpen: false, isBroadcastOpen: false, isEditOpen: false });
    
    const refetch = useCallback(() => {
        const controller = new AbortController();
        fetchAllNotifications(controller.signal);
    }, [fetchAllNotifications]);

    // CRUD Handlers
    const handleSendNotification = async (e: FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!notificationData.userId || !notificationData.title || !notificationData.content) {
            setFormError("All fields are required."); return;
        }
        showLoader();
        try {
            await notificationService.sendToUser({ ...notificationData, userId: Number(notificationData.userId) });
            addToast(`Notification sent to user ${notificationData.userId}.`, 'success');
            handleCloseModals();
            refetch();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'An unknown error occurred.');
            hideLoader();
        }
    };
    
    const handleSendBroadcast = async (e: FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!broadcastData.title || !broadcastData.content) {
            setFormError("Title and content are required."); return;
        }
        showLoader();
        try {
            await notificationService.broadcast(broadcastData);
            addToast('Broadcast notification sent to all users.', 'success');
            handleCloseModals();
            refetch();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'An unknown error occurred.');
            hideLoader();
        }
    };

    const handleUpdateNotification = async (e: FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!editingNotification || !editData.title || !editData.content) {
            setFormError("Title and content are required."); return;
        }
        showLoader();
        try {
            await notificationService.update(editingNotification.id, editData);
            addToast(`Notification #${editingNotification.id} updated.`, 'success');
            handleCloseModals();
            refetch();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'An unknown error occurred.');
            hideLoader();
        }
    };
    
    const handleDeleteNotification = (id: number) => setConfirmDeleteState({ isOpen: true, idToDelete: id });

    const handleConfirmDelete = async () => {
        if (confirmDeleteState.idToDelete === null) return;
        showLoader();
        try {
            await notificationService.delete(confirmDeleteState.idToDelete);
            addToast(`Notification #${confirmDeleteState.idToDelete} deleted.`, 'success');
            refetch();
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Failed to delete notification.', 'error');
        } finally {
            hideLoader();
            setConfirmDeleteState({ isOpen: false, idToDelete: null });
        }
    };

    return {
        isLoading,
        paginatedNotifications,
        filters,
        sorting,
        currentPage,
        totalPages,
        totalItems: processedNotifications.length,
        modalState,
        isCustomTitle,
        notificationData,
        broadcastData,
        editingNotification,
        editData,
        confirmDeleteState,
        formError,
        setCurrentPage,
        handleSort,
        handleFilterChange,
        handleFilterSubmit,
        handleClearFilters,
        handleOpenModal,
        handleCloseModals,
        setIsCustomTitle,
        setNotificationData,
        setBroadcastData,
        setEditData,
        handleSendNotification,
        handleSendBroadcast,
        handleUpdateNotification,
        handleDeleteNotification,
        handleConfirmDelete,
        setConfirmDeleteState,
    };
};