
import { useState, useEffect, useMemo, useCallback, ChangeEvent, FormEvent } from 'react';
import { User } from '../types';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { useDebounce } from './useDebounce';
import { userService } from '../services/userService';

const ITEMS_PER_PAGE = 10;

export const useUsers = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();
    
    // State
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: '', status: '' });
    const [sorting, setSorting] = useState<{ column: keyof User; direction: 'asc' | 'desc' }>({ column: 'id', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState({
        fullname: '',
        role: 'User' as 'User' | 'Partner' | 'Admin',
        isActive: true,
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetching Data
    const fetchAllUsers = useCallback(async (signal: AbortSignal) => {
        showLoader();
        try {
            const data = await userService.getAll(signal);
            const usersArray = data?.items || (Array.isArray(data) ? data : []);
            setAllUsers(usersArray);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              console.log('Fetch aborted');
              return;
            }
            console.error("Failed to fetch users", error);
            addToast(error instanceof Error ? error.message : 'Failed to fetch users', 'error');
            setAllUsers([]);
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    useEffect(() => {
        const controller = new AbortController();
        fetchAllUsers(controller.signal);
        return () => controller.abort();
    }, [fetchAllUsers]);

    // Data Processing (Filtering, Sorting)
    const processedUsers = useMemo(() => {
        let filtered = [...allUsers];
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(u => u.fullname.toLowerCase().includes(lowercasedTerm) || u.email.toLowerCase().includes(lowercasedTerm));
        }
        if (filters.role) filtered = filtered.filter(u => u.role === filters.role);
        if (filters.status) filtered = filtered.filter(u => u.isActive === (filters.status === 'true'));
        
        filtered.sort((a, b) => {
            const valA = a[sorting.column];
            const valB = b[sorting.column];
            if (valA === undefined || valB === undefined) return 0;
            const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sorting.direction === 'asc' ? comparison : -comparison;
        });
        return filtered;
    }, [allUsers, debouncedSearchTerm, filters, sorting]);

    // Pagination
    const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedUsers, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters]);

    // Handlers
    const handleSort = (column: keyof User) => {
        setSorting(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStatusChange = async (userToUpdate: User) => {
        const { id, isActive, fullname, role } = userToUpdate;
        const newStatus = !isActive;
        showLoader();
        try {
            if (newStatus === true) {
                await userService.activate(id);
            } else {
                await userService.update(id, { fullname, role, isActive: newStatus });
            }
            addToast(`User ${userToUpdate.fullname} has been ${newStatus ? 'activated' : 'locked'}.`, 'success');
            
            // Refetch all users to ensure data consistency
            const controller = new AbortController();
            fetchAllUsers(controller.signal);

        } catch (error) {
            console.error("Failed to update user status", error);
            addToast(error instanceof Error ? error.message : 'Failed to update status', 'error');
        } finally {
            hideLoader();
        }
    };

    const handleViewDetails = async (id: number) => {
        const controller = new AbortController();
        showLoader();
        try {
            const userDetails = await userService.getById(id, controller.signal);
            setSelectedUser(userDetails);
            setIsDetailModalOpen(true);
        } catch (error)
         {
            if (error instanceof Error && error.name === 'AbortError') {
              console.log('Fetch aborted');
              return;
            }
            console.error("Error fetching user details:", error);
            addToast(error instanceof Error ? error.message : 'Failed to fetch details', 'error');
        } finally {
            hideLoader();
        }
    };

    const handleOpenEditModal = (userToEdit: User) => {
        setSelectedUser(userToEdit);
        setEditFormData({
            fullname: userToEdit.fullname,
            role: userToEdit.role,
            isActive: userToEdit.isActive,
        });
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: name === 'isActive' ? value === 'true' : value }));
    };

    const handleUpdateUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        showLoader();
        try {
            await userService.update(selectedUser.id, editFormData);
            addToast(`User ${editFormData.fullname} updated successfully.`, 'success');
            setIsEditModalOpen(false);
            
            const controller = new AbortController();
            fetchAllUsers(controller.signal);
        } catch (error) {
            console.error("Failed to update user:", error);
            addToast(error instanceof Error ? error.message : 'Failed to update user', 'error');
        } finally {
            hideLoader();
        }
    };

    return {
        // State
        isLoading,
        paginatedUsers,
        filters,
        sorting,
        currentPage,
        totalPages,
        totalItems: processedUsers.length,
        isDetailModalOpen,
        isEditModalOpen,
        selectedUser,
        editFormData,
        searchTerm,
        
        // Handlers
        setSearchTerm,
        handleFilterChange,
        handleSort,
        setCurrentPage,
        handleStatusChange,
        handleViewDetails,
        handleOpenEditModal,
        setIsDetailModalOpen,
        setIsEditModalOpen,
        handleEditFormChange,
        handleUpdateUser
    };
};
