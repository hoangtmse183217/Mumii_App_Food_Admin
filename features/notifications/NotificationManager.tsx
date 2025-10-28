import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, useMemo } from 'react';
import { Notification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { ICONS } from '../../constants';
import Modal from '../../components/common/Modal';

const ITEMS_PER_PAGE = 10;

const PREDEFINED_TITLES = [
    "Tài khoản của bạn đã được kích hoạt",
    "Thông báo bảo trì hệ thống",
    "Cập nhật chính sách mới",
    "Cảnh báo bảo mật tài khoản",
];

const PREDEFINED_CONTENTS: { [key: string]: string } = {
    "Tài khoản của bạn đã được kích hoạt": "Chào mừng bạn! Tài khoản của bạn đã được kích hoạt thành công. Bây giờ bạn có thể đăng nhập và bắt đầu khám phá.",
    "Thông báo bảo trì hệ thống": "Chúng tôi sẽ tiến hành bảo trì hệ thống vào lúc [Thời gian]. Dịch vụ có thể bị gián đoạn. Xin cảm ơn sự thông cảm của bạn.",
    "Cập nhật chính sách mới": "Chúng tôi đã cập nhật chính sách và điều khoản sử dụng. Vui lòng xem lại để biết thêm chi tiết.",
    "Cảnh báo bảo mật tài khoản": "Chúng tôi phát hiện hoạt động đăng nhập bất thường từ tài khoản của bạn. Vui lòng kiểm tra và thay đổi mật khẩu nếu cần thiết.",
};

const initialFilters = {
    userId: '',
    status: '', // '', 'true' for Read, 'false' for Unread
    startDate: '',
    endDate: '',
};

const NotificationManager = () => {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState(initialFilters);
    const [submittedFilters, setSubmittedFilters] = useState(initialFilters);

    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isCustomTitle, setIsCustomTitle] = useState(false);
    const [notificationData, setNotificationData] = useState({
        userId: '',
        title: '',
        content: '',
    });
    const [sendError, setSendError] = useState('');

    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [isCustomTitleBroadcast, setIsCustomTitleBroadcast] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: '',
        content: '',
    });
    const [broadcastError, setBroadcastError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [editData, setEditData] = useState({ title: '', content: '' });
    const [editError, setEditError] = useState('');

    const fetchAllNotifications = useCallback(async () => {
        if (!user?.accessToken) return;
        showLoader();
        try {
            const response = await fetch(`http://localhost:8081/api/admin/notifications`, {
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                if (data.data && Array.isArray(data.data.items)) {
                    setAllNotifications(data.data.items || []);
                } else if (Array.isArray(data.data)) {
                    setAllNotifications(data.data);
                } else {
                     console.error("API response for notifications is not in an expected format:", data);
                    setAllNotifications([]);
                }
            } else {
                console.error("API Error:", data.message || "Failed to fetch notifications");
                setAllNotifications([]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            setAllNotifications([]);
        } finally {
            hideLoader();
        }
    }, [user?.accessToken, showLoader, hideLoader]);

    useEffect(() => {
        fetchAllNotifications();
    }, [fetchAllNotifications]);

    const processedNotifications = useMemo(() => {
        let filtered = [...allNotifications];

        if (submittedFilters.userId) {
            filtered = filtered.filter(n => String(n.userId).includes(submittedFilters.userId));
        }
        if (submittedFilters.status) {
            const isRead = submittedFilters.status === 'true';
            filtered = filtered.filter(n => n.isRead === isRead);
        }
        if (submittedFilters.startDate) {
            filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(submittedFilters.startDate));
        }
        if (submittedFilters.endDate) {
            const endDate = new Date(submittedFilters.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the whole end day
            filtered = filtered.filter(n => new Date(n.createdAt) <= endDate);
        }
        
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filtered;
    }, [allNotifications, submittedFilters]);
    
    useEffect(() => {
        const newTotalPages = Math.ceil(processedNotifications.length / ITEMS_PER_PAGE);
        setTotalPages(newTotalPages);

        // If the current page is now out of bounds after filtering, reset it.
        // This uses a functional update to prevent an infinite loop caused by the previous implementation.
        setCurrentPage(current => {
            if (current > newTotalPages) {
                // If there are no results, go to page 1. Otherwise, go to the last valid page.
                return newTotalPages > 0 ? newTotalPages : 1;
            }
            // Otherwise, stay on the current page. Using the same value will prevent a re-render.
            return current;
        });
    }, [processedNotifications]);

    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedNotifications, currentPage]);
    
    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setSubmittedFilters(filters);
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        if (JSON.stringify(submittedFilters) !== JSON.stringify(initialFilters)) {
            setCurrentPage(1);
            setSubmittedFilters(initialFilters);
        }
    };
    
    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenSendModal = () => {
        setNotificationData({ userId: '', title: '', content: '' });
        setSendError('');
        setIsCustomTitle(false);
        setIsSendModalOpen(true);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'title-select') {
            if (value === 'custom') {
                setIsCustomTitle(true);
                setNotificationData(prev => ({ ...prev, title: '', content: '' }));
            } else {
                setIsCustomTitle(false);
                const contentTemplate = PREDEFINED_CONTENTS[value] || '';
                setNotificationData(prev => ({ ...prev, title: value, content: contentTemplate }));
            }
        } else {
            setNotificationData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSendNotification = async (e: FormEvent) => {
        e.preventDefault();
        setSendError('');
        if (!notificationData.userId || !notificationData.title || !notificationData.content) {
            setSendError("All fields are required.");
            return;
        }

        showLoader();
        try {
            const response = await fetch('http://localhost:8081/api/admin/notifications/send-to-user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                    'Content-Type': 'application/json',
                    'accept': 'text/plain',
                },
                body: JSON.stringify({
                    userId: Number(notificationData.userId),
                    title: notificationData.title,
                    content: notificationData.content
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsSendModalOpen(false);
                fetchAllNotifications();
            } else {
                throw new Error(data.message || "Failed to send notification.");
            }
        } catch (error) {
            console.error("Failed to send notification:", error);
            setSendError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoader();
        }
    };

    const handleOpenBroadcastModal = () => {
        setBroadcastData({ title: '', content: '' });
        setBroadcastError('');
        setIsCustomTitleBroadcast(false);
        setIsBroadcastModalOpen(true);
    };

    const handleBroadcastFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'title-select-broadcast') {
            if (value === 'custom') {
                setIsCustomTitleBroadcast(true);
                setBroadcastData({ title: '', content: '' });
            } else {
                setIsCustomTitleBroadcast(false);
                const contentTemplate = PREDEFINED_CONTENTS[value] || '';
                setBroadcastData({ title: value, content: contentTemplate });
            }
        } else {
             setBroadcastData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSendBroadcast = async (e: FormEvent) => {
        e.preventDefault();
        setBroadcastError('');
        if (!broadcastData.title || !broadcastData.content) {
            setBroadcastError("Title and content are required.");
            return;
        }

        showLoader();
        try {
            const response = await fetch('http://localhost:8081/api/admin/notifications/broadcast', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                    'Content-Type': 'application/json',
                    'accept': 'text/plain',
                },
                body: JSON.stringify({
                    title: broadcastData.title,
                    content: broadcastData.content
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsBroadcastModalOpen(false);
                fetchAllNotifications(); 
            } else {
                throw new Error(data.message || "Failed to send broadcast notification.");
            }
        } catch (error) {
            console.error("Failed to send broadcast:", error);
            setBroadcastError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoader();
        }
    };

    const handleOpenEditModal = (notification: Notification) => {
        setEditingNotification(notification);
        setEditData({ title: notification.title, content: notification.content });
        setEditError('');
        setIsEditModalOpen(true);
    };
    
    const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateNotification = async (e: FormEvent) => {
        e.preventDefault();
        setEditError('');
        if (!editingNotification || !editData.title || !editData.content) {
            setEditError("Title and content are required.");
            return;
        }

        showLoader();
        try {
            const response = await fetch(`http://localhost:8081/api/admin/notifications/${editingNotification.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                    'Content-Type': 'application/json',
                    'accept': 'text/plain',
                },
                body: JSON.stringify({
                    title: editData.title,
                    content: editData.content
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsEditModalOpen(false);
                fetchAllNotifications();
            } else {
                throw new Error(data.message || "Failed to update notification.");
            }
        } catch (error) {
            console.error("Failed to update notification:", error);
            setEditError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoader();
        }
    };
    
    const handleDeleteNotification = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) {
            return;
        }

        if (!user?.accessToken) return;
        showLoader();
        try {
            const response = await fetch(`http://localhost:8081/api/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`,
                },
            });

            if (response.ok) {
                fetchAllNotifications();
            } else {
                let errorMessage = "Failed to delete notification.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `Error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
            alert(error instanceof Error ? error.message : 'An unknown error occurred while deleting.');
        } finally {
            hideLoader();
        }
    };

    const Pagination = () => (
        <div className="flex justify-between items-center p-4">
           <span className="text-sm text-text-secondary">
            Showing {paginatedNotifications.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
            {Math.min(currentPage * ITEMS_PER_PAGE, processedNotifications.length)} of {processedNotifications.length} notifications
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            >
              Previous
            </button>
            <span className="px-2 text-sm">Page {currentPage} of {totalPages || 1}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            >
              Next
            </button>
          </div>
        </div>
      );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold">Notifications History</h1>
                 <div className="flex space-x-2">
                    <button onClick={handleOpenSendModal} className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded-lg">
                        Send Notification
                    </button>
                     <button onClick={handleOpenBroadcastModal} className="px-4 py-2 bg-accent-orange text-white hover:opacity-90 rounded-lg">
                        Broadcast to All
                    </button>
                 </div>
            </div>
            
            <div className="mb-4 bg-secondary p-4 rounded-lg">
                 <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
                    <div className="flex-grow min-w-[150px]">
                        <label htmlFor="userId" className="block text-sm font-medium text-text-secondary mb-1">User ID</label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            placeholder="e.g., 123"
                            value={filters.userId}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                    </div>
                    <div className="flex-grow min-w-[150px]">
                        <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                        <select
                            name="status"
                            id="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        >
                            <option value="">All Statuses</option>
                            <option value="false">Unread</option>
                            <option value="true">Read</option>
                        </select>
                    </div>
                    <div className="flex-grow min-w-[150px]">
                        <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                    </div>
                    <div className="flex-grow min-w-[150px]">
                        <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="submit" className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded-lg">Filter</button>
                        <button type="button" onClick={handleClearFilters} className="px-4 py-2 bg-secondary border border-accent text-text-secondary hover:bg-primary rounded-lg">Clear</button>
                    </div>
                </form>
            </div>

            <div className="bg-secondary shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                    <thead className="text-xs text-text-secondary uppercase bg-primary">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">User ID</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Content</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Sent At</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedNotifications.length > 0 ? (
                            paginatedNotifications.map((notification, index) => (
                                <tr key={notification.id} className={`border-b border-accent transition-colors duration-200 ${index % 2 !== 0 ? 'bg-primary' : ''} hover:bg-accent`}>
                                    <td className="px-4 py-3 text-text-secondary">{notification.id}</td>
                                    <td className="px-4 py-3 text-text-primary font-medium">{notification.userId}</td>
                                    <td className="px-4 py-3 text-text-primary">{notification.title}</td>
                                    <td className="px-4 py-3 max-w-xs truncate" title={notification.content}>{notification.content}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${notification.isRead ? 'bg-accent text-text-secondary' : 'bg-success/20 text-success'}`}>
                                            {notification.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary">{new Date(notification.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                        <button
                                            onClick={() => handleOpenEditModal(notification)}
                                            className="px-2.5 py-1 rounded text-xs font-medium bg-accent-orange/80 text-text-primary hover:bg-accent-orange transition-colors"
                                            title="Edit Notification"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNotification(notification.id)}
                                            className="px-2.5 py-1 rounded text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                                            title="Delete Notification"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className="text-center p-8 text-text-secondary">No notifications found.</td></tr>
                        )}
                    </tbody>
                </table>
                {totalPages > 0 && <Pagination />}
            </div>
            
            <Modal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title="Send New Notification">
                <form onSubmit={handleSendNotification}>
                    <div className="mb-4">
                        <label htmlFor="userId-modal" className="block text-sm font-medium text-text-secondary mb-1">User ID</label>
                        <input type="number" name="userId" id="userId-modal" value={notificationData.userId} onChange={handleFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                    </div>
                     <div className="mb-4">
                        <label htmlFor="title-select" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                        <select 
                            name="title-select" 
                            id="title-select" 
                            value={isCustomTitle ? 'custom' : notificationData.title}
                            onChange={handleFormChange} 
                            className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        >
                            <option value="" disabled>-- Select a title --</option>
                            {PREDEFINED_TITLES.map(title => (
                                <option key={title} value={title}>{title}</option>
                            ))}
                            <option value="custom">Khác (Nhập thủ công)...</option>
                        </select>
                    </div>

                    {isCustomTitle && (
                        <div className="mb-4 transition-all duration-300">
                            <label htmlFor="title" className="sr-only">Custom Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                value={notificationData.title} 
                                onChange={handleFormChange} 
                                required 
                                placeholder="Enter custom title"
                                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                            />
                        </div>
                    )}
                    <div className="mb-6">
                        <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Content</label>
                        <textarea name="content" id="content" value={notificationData.content} onChange={handleFormChange} required rows={5} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea>
                    </div>

                    {sendError && <p className="text-error text-sm text-center mb-4">{sendError}</p>}

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsSendModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded">Send</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="Send Broadcast Notification">
                <form onSubmit={handleSendBroadcast}>
                    <div className="mb-4">
                        <label htmlFor="title-select-broadcast" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                        <select 
                            name="title-select-broadcast" 
                            id="title-select-broadcast" 
                            value={isCustomTitleBroadcast ? 'custom' : broadcastData.title}
                            onChange={handleBroadcastFormChange} 
                            className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        >
                            <option value="" disabled>-- Select a title --</option>
                            {PREDEFINED_TITLES.map(title => (
                                <option key={title} value={title}>{title}</option>
                            ))}
                            <option value="custom">Khác (Nhập thủ công)...</option>
                        </select>
                    </div>

                    {isCustomTitleBroadcast && (
                        <div className="mb-4 transition-all duration-300">
                            <label htmlFor="title-broadcast" className="sr-only">Custom Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title-broadcast" 
                                value={broadcastData.title} 
                                onChange={handleBroadcastFormChange} 
                                required 
                                placeholder="Enter custom title"
                                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                            />
                        </div>
                    )}
                    <div className="mb-6">
                        <label htmlFor="content-broadcast" className="block text-sm font-medium text-text-secondary mb-1">Content</label>
                        <textarea name="content" id="content-broadcast" value={broadcastData.content} onChange={handleBroadcastFormChange} required rows={5} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea>
                    </div>

                    {broadcastError && <p className="text-error text-sm text-center mb-4">{broadcastError}</p>}

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded">Send Broadcast</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Notification">
                {editingNotification && (
                    <form onSubmit={handleUpdateNotification}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary mb-1">User ID</label>
                            <p className="w-full px-3 py-2 bg-primary border border-accent rounded-lg text-text-secondary">{editingNotification.userId}</p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-title" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                id="edit-title" 
                                value={editData.title} 
                                onChange={handleEditFormChange} 
                                required
                                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="edit-content" className="block text-sm font-medium text-text-secondary mb-1">Content</label>
                            <textarea 
                                name="content" 
                                id="edit-content" 
                                value={editData.content} 
                                onChange={handleEditFormChange}
                                required 
                                rows={5} 
                                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                            ></textarea>
                        </div>

                        {editError && <p className="text-error text-sm text-center mb-4">{editError}</p>}

                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded">Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default NotificationManager;