import React from 'react';
import { Post } from '../types';
import { usePosts, PostStatusTab } from '../hooks/usePosts';
import Pagination from '../components/shared/Pagination';
import SkeletonTable from '../components/shared/SkeletonTable';
import Modal from '../components/shared/Modal';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import { ICONS } from '../constants';
import EditPostModal from '../components/shared/EditPostModal';

const TABS: PostStatusTab[] = ['PENDING', 'APPROVED', 'DECLINED'];

// --- Sub-components for better organization ---

const PostTabs: React.FC<Pick<ReturnType<typeof usePosts>, 'activeTab' | 'handleTabChange'>> = ({ activeTab, handleTabChange }) => (
    <div className="flex border-b border-accent mb-4">
        {TABS.map(status => (
            <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === status ? 'border-b-2 border-highlight text-highlight' : 'text-text-secondary hover:text-text-primary'}`}
            >
                {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
        ))}
    </div>
);

const PostFilter: React.FC<Pick<ReturnType<typeof usePosts>, 'searchTerm' | 'setSearchTerm'>> = ({ searchTerm, setSearchTerm }) => (
    <div className="mb-4 bg-secondary p-4 rounded-lg flex items-center gap-4 border border-accent">
        <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">{ICONS.search}</span>
            <input
                type="text"
                placeholder="Search by post title or author name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
            />
            {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary" aria-label="Clear search">
                    <span className="w-5 h-5">{ICONS.close}</span>
                </button>
            )}
        </div>
    </div>
);

const SortableHeader: React.FC<{ label: string; column: keyof Post; sorting: ReturnType<typeof usePosts>['sorting']; onSort: ReturnType<typeof usePosts>['handleSort'] }> = 
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

const PostTable: React.FC<Pick<ReturnType<typeof usePosts>, 'posts' | 'isLoading' | 'handleViewDetails' | 'handleOpenEditModal' | 'handleApprovePost' | 'handleDeclinePost' | 'handleDeletePost' | 'activeTab' | 'sorting' | 'handleSort'>> = 
({ posts, isLoading, handleViewDetails, handleOpenEditModal, handleApprovePost, handleDeclinePost, handleDeletePost, activeTab, sorting, handleSort }) => (
    <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
        <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs text-text-secondary uppercase bg-primary">
                <tr>
                    <SortableHeader label="ID" column="id" sorting={sorting} onSort={handleSort} />
                    <SortableHeader label="Title" column="title" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3">Author</th>
                    <SortableHeader label="Created At" column="createdAt" sorting={sorting} onSort={handleSort} />
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={6}><SkeletonTable rows={10} cols={6} /></td></tr>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <tr key={post.id} className="border-b border-accent last:border-b-0 hover:bg-primary">
                            <td className="px-4 py-3 text-text-secondary">{post.id}</td>
                            <td className="px-4 py-3 font-medium text-text-primary max-w-sm truncate" title={post.title}>{post.title}</td>
                            <td className="px-4 py-3">{post.author}</td>
                            <td className="px-4 py-3 text-text-secondary">{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${post.status === 'APPROVED' ? 'bg-success/20 text-success' : post.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'bg-error/20 text-error'}`}>{post.status}</span></td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button onClick={() => handleViewDetails(post.id)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-highlight hover:bg-red-200">Details</button>
                                <button onClick={() => handleOpenEditModal(post)} className="px-2.5 py-1 rounded-md text-xs font-medium border border-accent text-text-secondary hover:bg-accent hover:text-text-primary">Edit</button>
                                {activeTab === 'PENDING' && (<><button onClick={() => handleApprovePost(post)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-success text-white hover:opacity-90">Approve</button><button onClick={() => handleDeclinePost(post)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-accent-orange/90 text-white hover:bg-accent-orange">Decline</button></>)}
                                {(activeTab === 'APPROVED' || activeTab === 'DECLINED') && (<button onClick={() => handleDeletePost(post)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90">Delete</button>)}
                            </td>
                        </tr>
                    ))
                ) : (
                     <tr><td colSpan={6} className="text-center p-8 text-text-secondary">No posts found for this category.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

const PostDetailModal: React.FC<Pick<ReturnType<typeof usePosts>, 'isDetailModalOpen' | 'setIsDetailModalOpen' | 'selectedPost'>> = ({ isDetailModalOpen, setIsDetailModalOpen, selectedPost }) => (
    <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedPost?.title || "Post Details"}>
        {selectedPost && (
            <div className="flex flex-col md:flex-row gap-6"><div className="flex-1 space-y-4">{selectedPost.imageUrl && (<img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-64 object-cover rounded-lg bg-accent" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />)}<div><h3 className="font-bold text-lg mb-2">Content</h3><p className="text-text-secondary whitespace-pre-wrap">{selectedPost.content}</p></div></div><div className="md:w-1/3 space-y-4 pt-4 border-t md:border-t-0 md:border-l md:pl-6 border-accent"><div><h4 className="font-bold text-md mb-2">Author</h4><p className="text-text-primary">{selectedPost.partner?.fullname}</p><p className="text-sm text-text-secondary">{selectedPost.partner?.email}</p></div><div><h4 className="font-bold text-md mb-2">Restaurant</h4><p className="text-text-primary">{selectedPost.restaurant?.name}</p><p className="text-sm text-text-secondary">{selectedPost.restaurant?.address}</p></div><div><h4 className="font-bold text-md mb-2">Moods</h4><div className="flex flex-wrap gap-2">{selectedPost.moods?.length ? selectedPost.moods.map(mood => (<span key={mood.id} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 font-medium rounded-full">{mood.name}</span>)) : <p className="text-sm text-text-secondary">No moods.</p>}</div></div><div><h4 className="font-bold text-md mb-2">Details</h4><p className="text-sm text-text-secondary"><strong>Posted on:</strong> {new Date(selectedPost.createdAt).toLocaleString()}</p><p className="text-sm text-text-secondary"><strong>Status:</strong> {selectedPost.status}</p></div></div></div>
        )}
    </Modal>
);

const PostManagementPage = () => {
    const hookData = usePosts();

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-6">Post Management</h1>
            <PostTabs {...hookData} />
            <PostFilter {...hookData} />
            <PostTable {...hookData} />
            <Pagination 
                currentPage={hookData.currentPage}
                totalPages={hookData.totalPages}
                onPageChange={hookData.setCurrentPage}
                totalItems={hookData.totalItems}
            />

            <PostDetailModal {...hookData} />
            
            <EditPostModal
                isOpen={hookData.isEditModalOpen}
                onClose={() => hookData.setIsEditModalOpen(false)}
                onSubmit={hookData.handleUpdatePost}
                formData={hookData.editFormData}
                onFormChange={hookData.handleEditFormChange}
                postTitle={hookData.selectedPost?.title || ''}
                partnerRestaurants={hookData.partnerRestaurants}
            />

            <ConfirmationModal
                isOpen={!!hookData.confirmAction}
                onClose={hookData.cancelAction}
                onConfirm={hookData.executeConfirmAction}
                title={hookData.confirmAction?.title || "Confirm"}
                message={hookData.confirmAction?.message || "Are you sure?"}
            />
        </div>
    );
};

export default PostManagementPage;