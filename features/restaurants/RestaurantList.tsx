import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Restaurant, RestaurantStatus } from '../../types';
import { api } from '../../services/mockApi';
import Modal from '../../components/common/Modal';
import { useLoading } from '../../context/LoadingContext';

// FIX: Changed RestaurantStatus.REJECTED to RestaurantStatus.DECLINED to match the enum in types.ts.
// FIX: Corrected enum usage to PascalCase to match the type definition.
type StatusTab = RestaurantStatus.Pending | RestaurantStatus.Approved | RestaurantStatus.Declined;

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const { showLoader, hideLoader } = useLoading();
  // FIX: Corrected enum usage to PascalCase to match the type definition.
  const [activeTab, setActiveTab] = useState<StatusTab>(RestaurantStatus.Pending);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const fetchRestaurants = useCallback(async () => {
    showLoader();
    try {
      const data = await api.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to fetch restaurants", error);
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);
  
  const handleStatusUpdate = async (id: number, status: RestaurantStatus) => {
    const originalRestaurants = [...restaurants];
    // Optimistically update UI
    setRestaurants(prev => prev.filter(r => r.id !== id));

    try {
        await api.updateRestaurantStatus(id, status);
        // On success, state is already correct. Optionally refetch all.
    } catch (error) {
        console.error("Failed to update status", error);
        setRestaurants(originalRestaurants); // Revert on error
    }
  };

  const openDetailsModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const filteredRestaurants = useMemo(() =>
    restaurants.filter(r => r.status === activeTab),
  [restaurants, activeTab]);

  const renderTabs = () => (
    <div className="flex border-b border-accent mb-4">
      {(Object.keys(RestaurantStatus) as Array<StatusTab>).map(status => (
        <button
          key={status}
          onClick={() => setActiveTab(status)}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === status
              ? 'border-b-2 border-highlight text-highlight'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Restaurant Approval</h1>
      {renderTabs()}
      <div className="bg-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="text-xs text-text-secondary uppercase bg-primary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Submitted At</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((resto, index) => (
                <tr key={resto.id} className={`border-b border-accent transition-colors duration-200 ${index % 2 !== 0 ? 'bg-primary' : ''} hover:bg-accent`}>
                  <td className="px-4 py-3 font-medium text-text-primary">{resto.name}</td>
                  {/* FIX: Changed resto.partnerName to resto.partnerId as partnerName does not exist on the Restaurant type. */}
                  <td className="px-4 py-3">{`Partner ID: ${resto.partnerId}`}</td>
                  <td className="px-4 py-3 text-text-secondary">{resto.address}</td>
                  <td className="px-4 py-3 text-text-secondary">{resto.createdAt}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button 
                        onClick={() => openDetailsModal(resto)} 
                        className="px-2.5 py-1 rounded text-xs font-medium bg-accent-orange/80 text-text-primary hover:bg-accent-orange transition-colors"
                        title="View Details"
                    >
                        Details
                    </button>
                    {/* FIX: Corrected enum usage to PascalCase to match the type definition. */}
                    {activeTab === RestaurantStatus.Pending && (
                      <>
                        <button 
                            // FIX: Corrected enum usage to PascalCase to match the type definition.
                            onClick={() => handleStatusUpdate(resto.id, RestaurantStatus.Approved)} 
                            className="px-2.5 py-1 rounded text-xs font-medium bg-success text-white hover:opacity-90 transition-colors"
                            title="Approve Restaurant"
                        >
                            Approve
                        </button>
                        <button 
                            // FIX: Changed RestaurantStatus.REJECTED to RestaurantStatus.DECLINED to match the enum in types.ts.
                            // FIX: Corrected enum usage to PascalCase to match the type definition.
                            onClick={() => handleStatusUpdate(resto.id, RestaurantStatus.Declined)} 
                            className="px-2.5 py-1 rounded text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                            title="Reject Restaurant"
                        >
                            Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={5} className="text-center p-8 text-text-secondary">No restaurants in this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedRestaurant?.name || 'Restaurant Details'}>
        {selectedRestaurant && (
            <div>
                {/* FIX: Changed selectedRestaurant.partnerName to selectedRestaurant.partnerId. */}
                <p><strong>Partner ID:</strong> {selectedRestaurant.partnerId}</p>
                <p><strong>Address:</strong> {selectedRestaurant.address}</p>
                <p><strong>Submitted:</strong> {selectedRestaurant.createdAt}</p>
                <p className="mt-4"><strong>Details:</strong></p>
                {/* FIX: Changed selectedRestaurant.details to selectedRestaurant.description. */}
                <p>{selectedRestaurant.description}</p>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantList;