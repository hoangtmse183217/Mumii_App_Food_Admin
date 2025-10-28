
import React from 'react';
import { Restaurant, RestaurantStatus } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';

// Shared Components
import Modal from '../components/shared/Modal';
import Pagination from '../components/shared/Pagination';
import SkeletonTable from '../components/shared/SkeletonTable';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import DeclineReasonModal from '../components/shared/DeclineReasonModal';
import EditRestaurantModal from '../components/shared/EditRestaurantModal';
import { ICONS } from '../constants';

// --- Sub-components specific to this page for better organization ---

// 1. Tabs for navigating between restaurant statuses
const RestaurantTabs: React.FC<Pick<ReturnType<typeof useRestaurants>, 'activeTab' | 'handleTabChange'>> = ({ activeTab, handleTabChange }) => (
    <div className="flex border-b border-accent mb-4">
        {Object.values(RestaurantStatus).map(status => (
            <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === status ? 'border-b-2 border-highlight text-highlight' : 'text-text-secondary hover:text-text-primary'}`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </button>
        ))}
    </div>
);

// 2. Search and Filter bar
const RestaurantFilter: React.FC<Pick<ReturnType<typeof useRestaurants>, 'searchTerm' | 'setSearchTerm'>> = 
({ searchTerm, setSearchTerm }) => (
    <div className="mb-4 bg-secondary p-4 rounded-lg flex items-center gap-4 border border-accent">
        <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">{ICONS.search}</span>
            <input
                type="text"
                placeholder="Search by restaurant or partner name..."
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
    </div>
);

// 3. Main data table with sortable headers
const SortableHeader: React.FC<{ label: string; column: keyof Restaurant; sorting: ReturnType<typeof useRestaurants>['sorting']; onSort: ReturnType<typeof useRestaurants>['handleSort'] }> = 
({ label, column, sorting, onSort }) => (
  <th className="px-4 py-3 cursor-pointer select-none" onClick={() => onSort(column)}>
    <div className="flex items-center">
      {label}
      <span className="ml-2 w-4">
        {sorting.column === column ? <span className="text-text-primary">{sorting.direction === 'asc' ? '▲' : '▼'}</span> : <span className="text-text-secondary/30">▲▼</span>}
      </span>
    </div>
  </th>
);

const RestaurantTable: React.FC<Pick<ReturnType<typeof useRestaurants>, 'isLoading' | 'restaurants' | 'openDetailsModal' | 'handleStatusUpdate' | 'activeTab' | 'sorting' | 'handleSort' | 'handleOpenEditModal' | 'handleDeleteRestaurant'>> =
({ isLoading, restaurants, openDetailsModal, handleStatusUpdate, activeTab, sorting, handleSort, handleOpenEditModal, handleDeleteRestaurant }) => {
    console.log('[RestaurantManagementPage] Data received by table component:', restaurants);
    return (
     <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
        <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs text-text-secondary uppercase bg-primary">
                <tr>
                    <SortableHeader label="ID" column="id" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Name" column="name" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3">Address</th>
                    <SortableHeader label="Rating" column="rating" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Submitted At" column="createdAt" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={7}><SkeletonTable rows={10} cols={7} /></td></tr>
                ) : restaurants.length > 0 ? (
                    restaurants.map((resto) => (
                        <tr key={resto.id} className="border-b border-accent last:border-b-0 hover:bg-primary">
                            <td className="px-4 py-3 text-text-secondary">{resto.id}</td>
                            <td className="px-4 py-3 font-medium text-text-primary">{resto.name}</td>
                            <td className="px-4 py-3">{resto.partner?.fullname || `ID: ${resto.partnerId}`}</td>
                            <td className="px-4 py-3 text-text-secondary max-w-xs truncate" title={resto.address}>{resto.address}</td>
                            <td className="px-4 py-3 text-text-secondary">{resto.rating.toFixed(1)} ⭐</td>
                            <td className="px-4 py-3 text-text-secondary">{new Date(resto.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button onClick={() => openDetailsModal(resto)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-highlight hover:bg-red-200">Details</button>
                                <button onClick={() => handleOpenEditModal(resto)} className="px-2.5 py-1 rounded-md text-xs font-medium border border-accent text-text-secondary hover:bg-accent hover:text-text-primary">Edit</button>
                                {activeTab === RestaurantStatus.Pending && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(resto, RestaurantStatus.Approved)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-success text-white hover:opacity-90">Approve</button>
                                        <button onClick={() => handleStatusUpdate(resto, RestaurantStatus.Declined)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90">Decline</button>
                                    </>
                                )}
                                {(activeTab === RestaurantStatus.Approved || activeTab === RestaurantStatus.Declined) && (
                                    <button onClick={() => handleDeleteRestaurant(resto)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90">Delete</button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={7} className="text-center p-8 text-text-secondary">No restaurants in this category.</td></tr>
                )}
            </tbody>
        </table>
    </div>
    );
};

// 4. Modal for showing detailed restaurant info
const RestaurantDetailModal: React.FC<Pick<ReturnType<typeof useRestaurants>, 'isDetailModalOpen' | 'closeDetailsModal' | 'selectedRestaurant'>> =
({ isDetailModalOpen, closeDetailsModal, selectedRestaurant }) => (
    <Modal isOpen={isDetailModalOpen} onClose={closeDetailsModal} title={selectedRestaurant?.name || 'Restaurant Details'}>
        {selectedRestaurant && (
            <div className="space-y-4">
                <img 
                    src={selectedRestaurant.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x200.png?text=No+Image'} 
                    alt={selectedRestaurant.name} 
                    className="w-full h-48 object-cover rounded-lg bg-accent"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x200.png?text=No+Image'; }}
                />
                <div><span className="font-semibold">Partner:</span> {selectedRestaurant.partner?.fullname || `ID: ${selectedRestaurant.partnerId}`}</div>
                <div><span className="font-semibold">Address:</span> {selectedRestaurant.address}</div>
                <div><span className="font-semibold">Submitted:</span> {new Date(selectedRestaurant.createdAt).toLocaleString()}</div>
                <div><span className="font-semibold">Average Price:</span> ~${selectedRestaurant.avgPrice.toFixed(2)}</div>
                <div><span className="font-semibold">Rating:</span> {selectedRestaurant.rating.toFixed(1)} / 5.0</div>
                <div className="pt-2 border-t border-accent mt-4">
                    <h4 className="font-semibold mb-2">Description:</h4>
                    <p className="text-text-secondary">{selectedRestaurant.description}</p>
                </div>
            </div>
        )}
    </Modal>
);


// --- Main Page Component ---
const RestaurantManagementPage = () => {
  // The hook provides all state and logic
  const hookData = useRestaurants();

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Restaurant Management</h1>
      
      <RestaurantTabs {...hookData} />
      <RestaurantFilter {...hookData} />
      <RestaurantTable {...hookData} />

      <Pagination
        currentPage={hookData.currentPage}
        totalPages={hookData.totalPages}
        onPageChange={hookData.setCurrentPage}
        totalItems={hookData.totalItems}
      />

      {/* All modals are rendered here, driven by state from the hook */}
      <RestaurantDetailModal {...hookData} />

      <ConfirmationModal
        isOpen={!!hookData.confirmAction}
        onClose={hookData.cancelAction}
        onConfirm={hookData.executeConfirmAction}
        title={hookData.confirmAction?.title || "Confirm"}
        message={hookData.confirmAction?.message || "Are you sure?"}
      />

      <DeclineReasonModal
        isOpen={hookData.isDeclineModalOpen}
        onClose={() => hookData.setIsDeclineModalOpen(false)}
        onConfirm={hookData.confirmDecline}
        reason={hookData.declineReason}
        setReason={hookData.setDeclineReason}
        restaurantName={hookData.selectedRestaurant?.name || ''}
      />

       <EditRestaurantModal
        isOpen={hookData.isEditModalOpen}
        onClose={() => hookData.setIsEditModalOpen(false)}
        onSubmit={hookData.handleUpdateRestaurant}
        formData={hookData.editFormData}
        onFormChange={hookData.handleEditFormChange}
        restaurantName={hookData.selectedRestaurant?.name || ''}
      />
    </div>
  );
};

export default RestaurantManagementPage;
