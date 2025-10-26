
import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { Post, PostUpdatePayload } from '../types';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { postService } from '../services/postService';

const ITEMS_PER_PAGE = 10;

export const usePosts = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();

    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<PostUpdatePayload>({
        title: '',
        content: '',
        imageUrl: '',
        restaurantId: 0,
    });

    const fetchPosts = useCallback(async (signal: AbortSignal) => {
        showLoader();
        try {
            const data = await postService.getAll({ page: currentPage, pageSize: ITEMS_PER_PAGE }, signal);
            setPosts(data.items || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Fetch posts aborted');
                return;
            }
            addToast(error instanceof Error ? error.message : 'Failed to fetch posts', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast, currentPage]);

    useEffect(() => {
        const controller = new AbortController();
        fetchPosts(controller.signal);
        return () => controller.abort();
    }, [fetchPosts, currentPage]);

    const handleViewDetails = useCallback(async (postId: number) => {
        const controller = new AbortController();
        showLoader();
        try {
            const postDetails = await postService.getById(postId, controller.signal);
            setSelectedPost(postDetails);
            setIsDetailModalOpen(true);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Fetch post details aborted');
                return;
            }
            addToast(error instanceof Error ? error.message : 'Failed to fetch post details', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    const handleOpenEditModal = (post: Post) => {
        setSelectedPost(post);
        setEditFormData({
            title: post.title || '',
            content: post.content || '',
            imageUrl: post.imageUrl || '',
            restaurantId: post.restaurantId || 0,
        });
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: name === 'restaurantId' ? Number(value) : value,
        }));
    };

    const handleUpdatePost = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;

        showLoader();
        try {
            await postService.update(selectedPost.id, editFormData);
            addToast(`Post "${editFormData.title}" updated successfully.`, 'success');
            setIsEditModalOpen(false);
            
            const controller = new AbortController();
            fetchPosts(controller.signal); // Refetch current page

        } catch (error) {
             addToast(error instanceof Error ? error.message : 'Failed to update post.', 'error');
        } finally {
            hideLoader();
        }
    };

    return {
        posts,
        isLoading,
        currentPage,
        totalPages,
        setCurrentPage,
        isDetailModalOpen,
        setIsDetailModalOpen,
        selectedPost,
        handleViewDetails,
        isEditModalOpen,
        setIsEditModalOpen,
        editFormData,
        handleOpenEditModal,
        handleEditFormChange,
        handleUpdatePost,
    };
};