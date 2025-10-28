import { useState, useEffect, useCallback, ChangeEvent, FormEvent, useMemo } from 'react';
import { Post, PostUpdatePayload, User, Restaurant, RestaurantStatus } from '../types';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { restaurantService } from '../services/restaurantService';
import { notificationService } from '../services/notificationService';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;
export type PostStatusTab = 'PENDING' | 'APPROVED' | 'DECLINED';

export const usePosts = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();

    const [masterPostList, setMasterPostList] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<PostStatusTab>('PENDING');
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<{ column: keyof Post; direction: 'asc' | 'desc' }>({ column: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<PostUpdatePayload>({ title: '', content: '', imageUrl: '', restaurantId: 0 });
    const [partnerRestaurants, setPartnerRestaurants] = useState<Restaurant[]>([]);
    
    const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; message: string; title: string } | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchData = useCallback(async (signal: AbortSignal) => {
        showLoader();
        try {
            const [postsData, partnersData] = await Promise.all([
                postService.getAll({ page: 1, pageSize: 1000 }, signal),
                userService.getAll(signal)
            ]);

            const partnersMap = new Map<number, User>();
            (partnersData.items || []).forEach(user => partnersMap.set(user.id, user));

            const combinedPosts = (postsData.items || []).map(p => ({
                ...p,
                status: (p.status as string).toUpperCase() as PostStatusTab,
                partner: partnersMap.get(p.partnerId!),
                author: partnersMap.get(p.partnerId!)?.fullname || p.author,
            }));
            setMasterPostList(combinedPosts);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            addToast(error instanceof Error ? error.message : 'Failed to fetch posts', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData, refetchTrigger]);

    const refetch = () => setRefetchTrigger(c => c + 1);

    const processedPosts = useMemo(() => {
        let filtered = masterPostList.filter(p => p.status === activeTab);
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(term) || (p.partner?.fullname || p.author).toLowerCase().includes(term));
        }
        filtered.sort((a, b) => {
            const valA = a[sorting.column];
            const valB = b[sorting.column];
            if (valA === undefined || valB === undefined) return 0;
            const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sorting.direction === 'asc' ? comparison : -comparison;
        });
        return filtered;
    }, [masterPostList, activeTab, debouncedSearchTerm, sorting]);
    
    const totalPages = Math.ceil(processedPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = useMemo(() => processedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [processedPosts, currentPage]);

    useEffect(() => { setCurrentPage(1) }, [debouncedSearchTerm, activeTab, sorting]);
    useEffect(() => { if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages) }, [currentPage, totalPages]);
    
    const handleTabChange = (tab: PostStatusTab) => { setActiveTab(tab); setSearchTerm(''); };
    const handleSort = (column: keyof Post) => setSorting(p => ({ column, direction: p.column === column && p.direction === 'asc' ? 'desc' : 'asc' }));
    
    const handleViewDetails = useCallback(async (postId: number) => {
        showLoader();
        try {
            const postDetails = await postService.getById(postId);
            setSelectedPost(postDetails);
            setIsDetailModalOpen(true);
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Failed to fetch post details', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    const handleOpenEditModal = async (post: Post) => {
        if (!post.partnerId) {
            addToast("This post has no associated partner.", 'error');
            return;
        }
        showLoader();
        try {
            const restaurantData = await restaurantService.getAll({ page: 1, pageSize: 1000, status: RestaurantStatus.Approved });
            const approvedRestaurants = restaurantData.items || [];
            
            const restaurantsForPartner = approvedRestaurants.filter(r => r.partnerId === post.partnerId);
            setPartnerRestaurants(restaurantsForPartner);

            setSelectedPost(post);
            setEditFormData({ 
                title: post.title || '', 
                content: post.content || '', 
                imageUrl: post.imageUrl || '', 
                restaurantId: post.restaurantId || 0 
            });
            setIsEditModalOpen(true);
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Could not load partner restaurants.', 'error');
        } finally {
            hideLoader();
        }
    };

    const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: name === 'restaurantId' ? Number(value) : value }));
    };

    const handleUpdatePost = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;
        showLoader();
        try {
            await postService.update(selectedPost.id, editFormData);
            addToast(`Post "${editFormData.title}" updated successfully.`, 'success');
            setIsEditModalOpen(false);
            refetch();
        } catch (error) {
             addToast(error instanceof Error ? error.message : 'Failed to update post.', 'error');
        } finally {
            hideLoader();
        }
    };
    
    const handleApprovePost = (post: Post) => setConfirmAction({
        action: async () => {
            await postService.approve(post.id);
            addToast(`Post "${post.title}" has been approved.`, 'success');
            if (post.partnerId) {
                try {
                    await notificationService.sendToUser({
                        userId: post.partnerId,
                        title: 'Bài viết của bạn đã được duyệt',
                        content: `Chúc mừng! Bài viết "${post.title}" của bạn đã được đăng công khai.`
                    });
                } catch (notificationError) {
                    console.warn("Failed to send approval notification:", notificationError);
                }
            }
        },
        title: 'Confirm Approval',
        message: `Are you sure you want to approve the post "${post.title}"?`
    });

    const handleDeclinePost = (post: Post) => setConfirmAction({
        action: async () => {
            await postService.decline(post.id);
            addToast(`Post "${post.title}" has been declined.`, 'success');
             if (post.partnerId) {
                try {
                    await notificationService.sendToUser({
                        userId: post.partnerId,
                        title: 'Cập nhật về bài viết của bạn',
                        content: `Chúng tôi đã xem xét bài viết "${post.title}". Rất tiếc, bài viết chưa đáp ứng tiêu chuẩn cộng đồng của chúng tôi và đã bị từ chối.`
                    });
                } catch (notificationError) {
                    console.warn("Failed to send decline notification:", notificationError);
                }
            }
        },
        title: 'Confirm Decline',
        message: `Are you sure you want to decline the post "${post.title}"?`
    });

    const handleDeletePost = (post: Post) => setConfirmAction({ action: async () => { await postService.delete(post.id); addToast(`Post "${post.title}" has been permanently deleted.`, 'success'); }, title: 'Confirm Deletion', message: `Are you sure you want to permanently delete "${post.title}"? This action cannot be undone.` });

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

    return {
        posts: paginatedPosts, isLoading, currentPage, totalPages, totalItems: processedPosts.length, setCurrentPage, activeTab, handleTabChange,
        searchTerm, setSearchTerm, sorting, handleSort,
        isDetailModalOpen, setIsDetailModalOpen, selectedPost, handleViewDetails,
        isEditModalOpen, setIsEditModalOpen, editFormData, partnerRestaurants, handleOpenEditModal, handleEditFormChange, handleUpdatePost,
        confirmAction, handleApprovePost, handleDeclinePost, handleDeletePost, executeConfirmAction, cancelAction,
    };
};