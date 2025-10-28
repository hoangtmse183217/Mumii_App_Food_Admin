
import { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import { useLoading } from './useLoading';
import { useToast } from './useToast';
import { userService } from '../services/userService';

export const usePartnerRequests = () => {
    const { showLoader, hideLoader, isLoading } = useLoading();
    const { addToast } = useToast();

    const [requests, setRequests] = useState<User[]>([]);
    const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; message: string; title: string } | null>(null);

    const fetchRequests = useCallback(async (signal: AbortSignal) => {
        showLoader();
        try {
            const data = await userService.getPartnerRequests(signal);
            const requestsArray = data?.items || (Array.isArray(data) ? data : []);
            setRequests(requestsArray);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Fetch partner requests aborted');
                return;
            }
            addToast(error instanceof Error ? error.message : 'Failed to fetch partner requests', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    useEffect(() => {
        const controller = new AbortController();
        fetchRequests(controller.signal);
        return () => controller.abort();
    }, [fetchRequests]);
    
    const refetch = useCallback(() => {
        const controller = new AbortController();
        fetchRequests(controller.signal);
    }, [fetchRequests]);

    const handleApprove = (user: User) => {
        setConfirmAction({
            action: async () => {
                await userService.approvePartner(user.id);
                addToast(`User "${user.fullname}" has been approved as a partner.`, 'success');
            },
            title: 'Confirm Approval',
            message: `Are you sure you want to approve "${user.fullname}" as a partner?`,
        });
    };

    const handleDecline = (user: User) => {
        setConfirmAction({
            action: async () => {
                await userService.declinePartner(user.id);
                addToast(`Partner request for "${user.fullname}" has been declined.`, 'success');
            },
            title: 'Confirm Decline',
            message: `Are you sure you want to decline the partner request for "${user.fullname}"?`,
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

    return {
        requests,
        isLoading,
        confirmAction,
        handleApprove,
        handleDecline,
        executeConfirmAction,
        cancelAction
    };
};
