import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { User } from '../../types';
import { ICONS } from '../../constants';
import { useLoading } from '../../context/LoadingContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Reusable SortableHeader component
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
      {sorting.column === column && (
        <span className="ml-2 text-xs">{sorting.direction === 'asc' ? '▲' : '▼'}</span>
      )}
    </div>
  </th>
);

const ITEMS_PER_PAGE = 10;

const UserList = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]); // Master list of all users
  const { showLoader, hideLoader } = useLoading();
  const { user } = useAuth();
  
  // State for searching, filtering, sorting and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [sorting, setSorting] = useState<{ column: keyof User; direction: 'asc' | 'desc' }>({ column: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullname: '',
    role: 'User' as 'User' | 'Partner' | 'Admin',
    isActive: true,
  });

  // Effect to fetch ALL users once on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!user?.accessToken) return;
      showLoader();
      try {
        const response = await fetch(`http://localhost:8081/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'accept': 'text/plain',
          },
        });
  
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
        const data = await response.json();
  
        if (data.success) {
           if (data.data && Array.isArray(data.data.items)) {
             setAllUsers(data.data.items);
           } else if (Array.isArray(data.data)) {
             setAllUsers(data.data);
           } else {
             console.error("API response for users is not in an expected format:", data);
             setAllUsers([]);
           }
        } else {
          console.error("API Error:", data.message || "Failed to fetch users");
          setAllUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setAllUsers([]);
      } finally {
        hideLoader();
      }
    };
    fetchAllUsers();
  }, [user?.accessToken, showLoader, hideLoader]);

  // Client-side processing: filtering, searching, and sorting
  const processedUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        // FIX: Corrected typo from lowcasedTerm to lowercasedTerm
        u.fullname.toLowerCase().includes(lowercasedTerm) ||
        // FIX: Corrected typo from lowcasedTerm to lowercasedTerm
        u.email.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(u => u.role === filters.role);
    }
    if (filters.status) {
      const isActive = filters.status === 'true';
      filtered = filtered.filter(u => u.isActive === isActive);
    }

    if (sorting.column) {
      filtered.sort((a, b) => {
        const valA = a[sorting.column];
        const valB = b[sorting.column];

        if (valA === undefined || valB === undefined) return 0;
        
        let comparison = 0;
        if (valA < valB) comparison = -1;
        else if (valA > valB) comparison = 1;
        
        return sorting.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [allUsers, debouncedSearchTerm, filters, sorting]);

  // Effect to update total pages and reset current page when data processing changes
  useEffect(() => {
    const newTotalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
    setTotalPages(newTotalPages);
    if (currentPage > newTotalPages) {
         setCurrentPage(newTotalPages || 1);
    }
  }, [processedUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters, sorting]);

  // Client-side pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedUsers, currentPage]);


  const handleStatusChange = async (userToUpdate: User) => {
    const { id, isActive, fullname, role } = userToUpdate;
    const originalAllUsers = [...allUsers];
    const newStatus = !isActive;

    setAllUsers(allUsers.map(u => u.id === id ? { ...u, isActive: newStatus } : u));

    try {
        let response;
        if (newStatus === true) {
            response = await fetch(`http://localhost:8081/api/admin/users/${id}/activate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.accessToken}` },
            });
        } else {
            response = await fetch(`http://localhost:8081/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${user?.accessToken}`,
                  'Content-Type': 'application/json',
                  'accept': 'text/plain',
                },
                body: JSON.stringify({ fullname, role, isActive: newStatus }),
            });
        }
        
        const responseText = await response.text();
        if (!response.ok) {
            let errorMessage = `Failed to ${newStatus ? 'activate' : 'lock'} user`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                if (responseText) errorMessage = responseText;
            }
            throw new Error(errorMessage);
        }

        if (newStatus === false) {
             try {
                const data = JSON.parse(responseText);
                if (data.success && data.data) {
                    setAllUsers(prev => prev.map(u => u.id === id ? data.data : u));
                }
            } catch (e) { console.warn("Could not parse JSON response after locking user."); }
        }
    } catch (error) {
        console.error("Failed to update user status", error);
        setAllUsers(originalAllUsers);
        alert(`Error updating user status: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  const handleViewDetails = async (id: number) => {
    showLoader();
    try {
      const response = await fetch(`http://localhost:8081/api/admin/users/${id}`, {
        headers: { 'Authorization': `Bearer ${user?.accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      if (data.success && data.data) {
        setSelectedUser(data.data);
        setIsDetailModalOpen(true);
      } else {
        console.error("API Error:", data.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
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
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value,
    }));
  };

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    showLoader();
    try {
      const response = await fetch(`http://localhost:8081/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
          'accept': 'text/plain',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAllUsers(prev => prev.map(u => u.id === selectedUser.id ? data.data : u));
        setIsEditModalOpen(false);
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      hideLoader();
    }
  };

  const handleSort = (column: keyof User) => {
    setSorting(prev => ({
        column,
        direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
  };
    
  const Pagination = () => (
    <div className="flex justify-between items-center p-4">
       <span className="text-sm text-text-secondary">
        Showing {paginatedUsers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
        {Math.min(currentPage * ITEMS_PER_PAGE, processedUsers.length)} of {processedUsers.length} users
      </span>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
        >
          Previous
        </button>
        <span className="px-2 text-sm">Page {currentPage} of {totalPages || 1}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
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
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="mb-4 bg-secondary p-4 rounded-lg flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[250px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
            {ICONS.search}
          </span>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
          />
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
      
      <div className="bg-secondary shadow-lg rounded-lg overflow-x-auto">
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
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u, index) => (
                <tr key={u.id} className={`border-b border-accent transition-colors duration-200 ${index % 2 !== 0 ? 'bg-primary' : ''} hover:bg-accent`}>
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
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-accent text-text-primary hover:brightness-95 transition-all"
                      title="Edit User"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewDetails(u.id)}
                      disabled={!u.profile}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-accent-orange/80 text-text-primary hover:bg-accent-orange transition-colors disabled:bg-accent disabled:text-text-secondary disabled:cursor-not-allowed"
                      title="View Details"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleStatusChange(u)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium text-white transition-colors ${u.isActive ? 'bg-error hover:opacity-90' : 'bg-success hover:opacity-90'}`}
                       title={u.isActive ? 'Lock User' : 'Activate User'}
                    >
                      {u.isActive ? 'Lock' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={7} className="text-center p-8 text-text-secondary">No users found.</td></tr>
            )}
          </tbody>
        </table>
        {totalPages > 0 && <Pagination />}
      </div>
      
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="User Details">
        {selectedUser && (
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 text-center w-full md:w-auto">
              <img 
                src={selectedUser.profile?.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'} 
                alt={`${selectedUser.fullname}'s avatar`}
                className="w-32 h-32 rounded-full object-cover shadow-md mx-auto bg-accent"
                onError={(e) => { e.currentTarget.src = 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'; }}
              />
              <h3 className="text-xl font-bold mt-4">{selectedUser.fullname}</h3>
              <p className="text-text-secondary">{selectedUser.email}</p>
            </div>
            <div className="flex-grow space-y-3 pt-4 border-t md:border-t-0 md:border-l md:pl-6 border-accent w-full">
                <h4 className="text-lg font-semibold mb-2">Account Information</h4>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                        {selectedUser.isActive ? 'Active' : 'Locked'}
                    </span>
                </p>
                <p><strong>Login Method:</strong> {selectedUser.loginMethod || 'N/A'}</p>
                <p><strong>Member Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                <hr className="my-4 border-accent" />
                <h4 className="text-lg font-semibold mb-2">Profile Information</h4>
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
                <option value="User">User</option>
                <option value="Partner">Partner</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="isActive" className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <select name="isActive" id="isActive" value={String(editFormData.isActive)} onChange={handleEditFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight">
                <option value="true">Active</option>
                <option value="false">Locked</option>
              </select>
            </div>
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

export default UserList;