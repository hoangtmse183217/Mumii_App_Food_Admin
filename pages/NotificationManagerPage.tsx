
import React, { ChangeEvent } from 'react';
import { Notification } from '../types';
import Modal from '../components/shared/Modal';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import Pagination from '../components/shared/Pagination';
import SkeletonTable from '../components/shared/SkeletonTable';
import { useNotifications } from '../hooks/useNotifications';

// Predefined constants
const PREDEFINED_TITLES = ["Tài khoản của bạn đã được kích hoạt", "Thông báo bảo trì hệ thống", "Cập nhật chính sách mới", "Cảnh báo bảo mật tài khoản"];
const PREDEFINED_CONTENTS: { [key: string]: string } = {
    "Tài khoản của bạn đã được kích hoạt": "Chào mừng bạn! Tài khoản của bạn đã được kích hoạt thành công. Bây giờ bạn có thể đăng nhập và bắt đầu khám phá.",
    "Thông báo bảo trì hệ thống": "Chúng tôi sẽ tiến hành bảo trì hệ thống vào lúc [Thời gian]. Dịch vụ có thể bị gián đoạn. Xin cảm ơn sự thông cảm của bạn.",
    "Cập nhật chính sách mới": "Chúng tôi đã cập nhật chính sách và điều khoản sử dụng. Vui lòng xem lại để biết thêm chi tiết.",
    "Cảnh báo bảo mật tài khoản": "Chúng tôi phát hiện hoạt động đăng nhập bất thường từ tài khoản của bạn. Vui lòng kiểm tra và thay đổi mật khẩu nếu cần thiết.",
};

// SortableHeader Component
interface SortableHeaderProps {
  label: string;
  column: keyof Notification;
  sorting: { column: keyof Notification; direction: 'asc' | 'desc' };
  onSort: (column: keyof Notification) => void;
}
const SortableHeader: React.FC<SortableHeaderProps> = ({ label, column, sorting, onSort }) => (
  <th className="px-4 py-3 cursor-pointer select-none" onClick={() => onSort(column)}>
    <div className="flex items-center">
      {label}
      <span className="ml-2 w-4">
        {sorting.column === column ? (
          <span className="text-text-primary">{sorting.direction === 'asc' ? '▲' : '▼'}</span>
        ) : (
          <span className="text-text-secondary/30">▲▼</span>
        )}
      </span>
    </div>
  </th>
);

// NotificationFilter Component
const NotificationFilter: React.FC<Pick<ReturnType<typeof useNotifications>, 'filters' | 'handleFilterChange' | 'handleFilterSubmit' | 'handleClearFilters'>> = 
({ filters, handleFilterChange, handleFilterSubmit, handleClearFilters }) => (
    <div className="mb-4 bg-secondary p-4 rounded-lg border border-accent">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
            <div className="flex-grow min-w-[150px]"><label htmlFor="userId" className="block text-sm font-medium text-text-secondary mb-1">User ID</label><input type="text" id="userId" name="userId" placeholder="e.g., 123" value={filters.userId} onChange={handleFilterChange} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>
            <div className="flex-grow min-w-[150px]"><label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">Status</label><select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"><option value="">All</option><option value="false">Unread</option><option value="true">Read</option></select></div>
            <div className="flex-grow min-w-[150px]"><label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label><input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>
            <div className="flex-grow min-w-[150px]"><label htmlFor="endDate" className="block text-sm font-medium text-text-secondary mb-1">End Date</label><input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>
            <div className="flex items-center gap-2"><button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Filter</button><button type="button" onClick={handleClearFilters} className="px-4 py-2 bg-secondary border border-accent text-text-secondary hover:bg-primary rounded-lg">Clear</button></div>
        </form>
    </div>
);

// NotificationTable Component
const NotificationTable: React.FC<Pick<ReturnType<typeof useNotifications>, 'isLoading' | 'paginatedNotifications' | 'sorting' | 'handleSort' | 'handleOpenModal' | 'handleDeleteNotification'>> =
({ isLoading, paginatedNotifications, sorting, handleSort, handleOpenModal, handleDeleteNotification }) => (
    <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
        <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs text-text-secondary uppercase bg-primary">
                <tr>
                    <SortableHeader label="ID" column="id" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="User ID" column="userId" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Title" column="title" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3">Content</th>
                    <SortableHeader label="Status" column="isRead" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Sent At" column="createdAt" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={7}><SkeletonTable rows={5} cols={7} /></td></tr>
                ) : paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((n) => (
                        <tr key={n.id} className="border-b border-accent last:border-b-0 hover:bg-primary">
                            <td className="px-4 py-3 text-text-secondary">{n.id}</td>
                            <td className="px-4 py-3 text-text-primary font-medium">{n.userId}</td>
                            <td className="px-4 py-3 text-text-primary">{n.title}</td>
                            <td className="px-4 py-3 max-w-xs truncate" title={n.content}>{n.content}</td>
                            <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${n.isRead ? 'bg-accent text-text-secondary' : 'bg-success/20 text-success'}`}>{n.isRead ? 'Read' : 'Unread'}</span></td>
                            <td className="px-4 py-3 text-text-secondary">{new Date(n.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button onClick={() => handleOpenModal('isEditOpen', n)} className="px-2.5 py-1 rounded-md text-xs font-medium border border-accent text-text-secondary hover:bg-accent hover:text-text-primary transition-colors" title="Edit">Edit</button>
                                <button onClick={() => handleDeleteNotification(n.id)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90" title="Delete">Delete</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={7} className="text-center p-8 text-text-secondary">No notifications found.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

// NotificationModals Component
const NotificationModals: React.FC<Pick<ReturnType<typeof useNotifications>, 'modalState' | 'handleCloseModals' | 'isCustomTitle' | 'setIsCustomTitle' | 'notificationData' | 'setNotificationData' | 'handleSendNotification' | 'broadcastData' | 'setBroadcastData' | 'handleSendBroadcast' | 'editingNotification' | 'editData' | 'setEditData' | 'handleUpdateNotification' | 'confirmDeleteState' | 'setConfirmDeleteState' | 'handleConfirmDelete' | 'formError'>> =
({ modalState, handleCloseModals, isCustomTitle, setIsCustomTitle, notificationData, setNotificationData, handleSendNotification, broadcastData, setBroadcastData, handleSendBroadcast, editingNotification, editData, setEditData, handleUpdateNotification, confirmDeleteState, setConfirmDeleteState, handleConfirmDelete, formError }) => {
    
    const handleFormChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'title-select') {
            if (value === 'custom') {
                setIsCustomTitle(true);
                setter((prev: any) => ({ ...prev, title: '', content: '' }));
            } else {
                setIsCustomTitle(false);
                setter((prev: any) => ({ ...prev, title: value, content: PREDEFINED_CONTENTS[value] || '' }));
            }
        } else {
            setter((prev: any) => ({ ...prev, [name]: value }));
        }
    };
    
    return (
    <>
        <Modal isOpen={modalState.isSendOpen} onClose={handleCloseModals} title="Send New Notification">
            <form onSubmit={handleSendNotification}>
                <div className="mb-4"><label htmlFor="userId-modal" className="block text-sm font-medium text-text-secondary mb-1">User ID</label><input type="number" name="userId" id="userId-modal" value={notificationData.userId} onChange={handleFormChange(setNotificationData)} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>
                <div className="mb-4"><label htmlFor="title-select" className="block text-sm font-medium text-text-secondary mb-1">Title</label><select name="title-select" id="title-select" value={isCustomTitle ? 'custom' : notificationData.title} onChange={handleFormChange(setNotificationData)} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"><option value="" disabled>-- Select a title --</option>{PREDEFINED_TITLES.map(t => <option key={t} value={t}>{t}</option>)}<option value="custom">Custom...</option></select></div>
                {isCustomTitle && <div className="mb-4"><input type="text" name="title" value={notificationData.title} onChange={handleFormChange(setNotificationData)} required placeholder="Enter custom title" className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>}
                <div className="mb-6"><label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Content</label><textarea name="content" id="content" value={notificationData.content} onChange={handleFormChange(setNotificationData)} required rows={5} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea></div>
                {formError && <p className="text-error text-sm text-center mb-4">{formError}</p>}
                <div className="flex justify-end space-x-3"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Send</button></div>
            </form>
        </Modal>

        <Modal isOpen={modalState.isBroadcastOpen} onClose={handleCloseModals} title="Send Broadcast Notification">
             <form onSubmit={handleSendBroadcast}>
                <div className="mb-4"><label htmlFor="title-select-broadcast" className="block text-sm font-medium text-text-secondary mb-1">Title</label><select name="title-select" id="title-select-broadcast" value={isCustomTitle ? 'custom' : broadcastData.title} onChange={handleFormChange(setBroadcastData)} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"><option value="" disabled>-- Select a title --</option>{PREDEFINED_TITLES.map(t => <option key={t} value={t}>{t}</option>)}<option value="custom">Custom...</option></select></div>
                {isCustomTitle && <div className="mb-4"><input type="text" name="title" value={broadcastData.title} onChange={handleFormChange(setBroadcastData)} required placeholder="Enter custom title" className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>}
                <div className="mb-6"><label htmlFor="content-broadcast" className="block text-sm font-medium text-text-secondary mb-1">Content</label><textarea name="content" id="content-broadcast" value={broadcastData.content} onChange={handleFormChange(setBroadcastData)} required rows={5} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea></div>
                {formError && <p className="text-error text-sm text-center mb-4">{formError}</p>}
                <div className="flex justify-end space-x-3"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Send Broadcast</button></div>
            </form>
        </Modal>

        <Modal isOpen={modalState.isEditOpen} onClose={handleCloseModals} title="Edit Notification">
            {editingNotification && (
                <form onSubmit={handleUpdateNotification}>
                    <div className="mb-4"><label className="block text-sm font-medium text-text-secondary mb-1">User ID</label><p className="w-full px-3 py-2 bg-primary border border-accent rounded-lg text-text-secondary">{editingNotification.userId}</p></div>
                    <div className="mb-4"><label htmlFor="edit-title" className="block text-sm font-medium text-text-secondary mb-1">Title</label><input type="text" name="title" id="edit-title" value={editData.title} onChange={(e) => setEditData(p => ({...p, title: e.target.value}))} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/></div>
                    <div className="mb-6"><label htmlFor="edit-content" className="block text-sm font-medium text-text-secondary mb-1">Content</label><textarea name="content" id="edit-content" value={editData.content} onChange={(e) => setEditData(p => ({...p, content: e.target.value}))} required rows={5} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea></div>
                    {formError && <p className="text-error text-sm text-center mb-4">{formError}</p>}
                    <div className="flex justify-end space-x-3"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Save Changes</button></div>
                </form>
            )}
        </Modal>

        <ConfirmationModal isOpen={confirmDeleteState.isOpen} onClose={() => setConfirmDeleteState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Confirm Deletion" message="Are you sure? This action cannot be undone." />
    </>
    )
};

// Main Page Component
const NotificationManagerPage = () => {
    const notificationHookData = useNotifications();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-heading font-bold">Notifications History</h1>
                 <div className="flex space-x-2">
                    <button onClick={() => notificationHookData.handleOpenModal('isSendOpen')} className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Send Notification</button>
                    <button onClick={() => notificationHookData.handleOpenModal('isBroadcastOpen')} className="px-4 py-2 border border-highlight text-highlight hover:bg-red-50 rounded-lg">Broadcast to All</button>
                 </div>
            </div>
            
            <NotificationFilter {...notificationHookData} />
            <NotificationTable {...notificationHookData} />
            <Pagination currentPage={notificationHookData.currentPage} totalPages={notificationHookData.totalPages} onPageChange={notificationHookData.setCurrentPage} />
            <NotificationModals {...notificationHookData} />
        </div>
    );
};

export default NotificationManagerPage;
