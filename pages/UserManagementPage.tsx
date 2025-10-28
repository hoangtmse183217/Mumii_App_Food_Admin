
import React from 'react';
import { ICONS } from '../constants';
import Modal from '../components/shared/Modal';
import Pagination from '../components/shared/Pagination';
import SkeletonTable from '../components/shared/SkeletonTable';
import { useUsers } from '../hooks/useUsers';
import { User } from '../types';

// SortableHeader Component
interface SortableHeaderProps {
  label: string;
  column: keyof User;
  sorting: { column: keyof User; direction: 'asc' | 'desc' };
  onSort: (column: keyof User) => void;
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

// UserFilter Component
const UserFilter: React.FC<Pick<ReturnType<typeof useUsers>, 'searchTerm' | 'setSearchTerm' | 'filters' | 'handleFilterChange'>> = 
({ searchTerm, setSearchTerm, filters, handleFilterChange }) => (
    <div className="mb-4 bg-secondary p-4 rounded-lg flex flex-wrap items-center gap-4 border border-accent">
        <div className="relative flex-grow min-w-[250px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">{ICONS.search}</span>
            <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
            />
            {searchTerm && (
                <button 
                    type="button" 
                    onClick={() => setSearchTerm('')} 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
                    aria-label="Clear search"
                >
                    <span className="w-5 h-5">{ICONS.close}</span>
                </button>
            )}
        </div>
        <select name="role" value={filters.role} onChange={handleFilterChange} className="bg-primary border border-accent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight">
            <option value="">All Roles</option>
            <option value="User">User</option>
            <option value="Partner">Partner</option>
            <option value="Admin">Admin</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-primary border border-accent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight">
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Locked</option>
        </select>
    </div>
);

// UserTable Component
const UserTable: React.FC<Pick<ReturnType<typeof useUsers>, 'isLoading' | 'paginatedUsers' | 'sorting' | 'handleSort' | 'handleOpenEditModal' | 'handleViewDetails' | 'handleStatusChange'>> = 
({ isLoading, paginatedUsers, sorting, handleSort, handleOpenEditModal, handleViewDetails, handleStatusChange }) => (
    <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
        <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs text-text-secondary uppercase bg-primary">
                <tr>
                    <SortableHeader label="ID" column="id" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Email" column="email" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Full Name" column="fullname" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3">Role</th>
                    <SortableHeader label="Created At" column="createdAt" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={7}><SkeletonTable rows={5} cols={7} /></td></tr>
                ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                        <tr key={u.id} className="border-b border-accent last:border-b-0 hover:bg-primary">
                            <td className="px-4 py-3 text-text-secondary">{u.id}</td>
                            <td className="px-4 py-3 font-medium text-text-primary">{u.email}</td>
                            <td className="px-4 py-3">{u.fullname}</td>
                            <td className="px-4 py-3 text-text-secondary">{u.role}</td>
                            <td className="px-4 py-3 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${u.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                    {u.isActive ? 'Active' : 'Locked'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button onClick={() => handleOpenEditModal(u)} className="px-2.5 py-1 rounded-md text-xs font-medium border border-accent text-text-secondary hover:bg-accent hover:text-text-primary transition-colors" title="Edit User">Edit</button>
                                <button onClick={() => handleViewDetails(u.id)} disabled={!u.profile} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-highlight hover:bg-red-200 transition-colors disabled:bg-accent disabled:text-text-secondary disabled:cursor-not-allowed" title="View Details">Details</button>
                                <button onClick={() => handleStatusChange(u)} className={`px-2.5 py-1 rounded-md text-xs font-medium text-white transition-colors ${u.isActive ? 'bg-error hover:opacity-90' : 'bg-success hover:opacity-90'}`} title={u.isActive ? 'Lock User' : 'Activate User'}>{u.isActive ? 'Lock' : 'Activate'}</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={7} className="text-center p-8 text-text-secondary">No users found.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

// UserModals Component
const UserModals: React.FC<Pick<ReturnType<typeof useUsers>, 'isDetailModalOpen' | 'setIsDetailModalOpen' | 'isEditModalOpen' | 'setIsEditModalOpen' | 'selectedUser' | 'editFormData' | 'handleEditFormChange' | 'handleUpdateUser'>> = 
({ isDetailModalOpen, setIsDetailModalOpen, isEditModalOpen, setIsEditModalOpen, selectedUser, editFormData, handleEditFormChange, handleUpdateUser }) => (
    <>
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="User Details">
            {selectedUser && (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 text-center w-full md:w-auto">
                        <img src={selectedUser.profile?.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'} alt={`${selectedUser.fullname}'s avatar`} className="w-32 h-32 rounded-full object-cover shadow-md mx-auto bg-accent" onError={(e) => { e.currentTarget.src = 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'; }}/>
                        <h3 className="text-xl font-heading font-bold mt-4">{selectedUser.fullname}</h3><p className="text-text-secondary">{selectedUser.email}</p>
                    </div>
                    <div className="flex-grow space-y-3 pt-4 border-t md:border-t-0 md:border-l md:pl-6 border-accent w-full">
                        <h4 className="text-lg font-heading font-semibold mb-2">Account Information</h4>
                        <p><strong>Role:</strong> {selectedUser.role}</p>
                        <p><strong>Status:</strong> <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>{selectedUser.isActive ? 'Active' : 'Locked'}</span></p>
                        <p><strong>Login Method:</strong> {selectedUser.loginMethod || 'N/A'}</p>
                        <p><strong>Member Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p><hr className="my-4 border-accent" />
                        <h4 className="text-lg font-heading font-semibold mb-2">Profile Information</h4>
                        <p><strong>Phone Number:</strong> {selectedUser.profile?.phoneNumber || 'N/A'}</p>
                        <p><strong>Gender:</strong> {selectedUser.profile?.gender || 'N/A'}</p>
                        <p><strong>Address:</strong> {selectedUser.profile?.address || 'N/A'}</p>
                    </div>
                </div>
            )}
        </Modal>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
            {selectedUser && (
                <form onSubmit={handleUpdateUser}>
                    <div className="mb-4">
                        <label htmlFor="fullname" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input type="text" name="fullname" id="fullname" value={editFormData.fullname} onChange={handleEditFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                        <select name="role" id="role" value={editFormData.role} onChange={handleEditFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight">
                            <option value="User">User</option><option value="Partner">Partner</option><option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="isActive" className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                        <select name="isActive" id="isActive" value={String(editFormData.isActive)} onChange={handleEditFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight">
                            <option value="true">Active</option><option value="false">Locked</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Save Changes</button>
                    </div>
                </form>
            )}
        </Modal>
    </>
);

// Main Page Component
const UserManagementPage = () => {
    const userHookData = useUsers();

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-6">User Management</h1>
            <UserFilter {...userHookData} />
            <UserTable {...userHookData} />
            <Pagination 
                currentPage={userHookData.currentPage} 
                totalPages={userHookData.totalPages} 
                onPageChange={userHookData.setCurrentPage}
                totalItems={userHookData.totalItems} 
            />
            <UserModals {...userHookData} />
        </div>
    );
};

export default UserManagementPage;
