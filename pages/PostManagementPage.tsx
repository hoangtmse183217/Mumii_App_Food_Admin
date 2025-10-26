
import React from 'react';
import { Post } from '../types';
import { usePosts } from '../hooks/usePosts';
import Pagination from '../components/shared/Pagination';
import SkeletonTable from '../components/shared/SkeletonTable';
import Modal from '../components/shared/Modal';

const PostTable: React.FC<{
    posts: Post[], 
    isLoading: boolean, 
    onViewDetails: (id: number) => void,
    onOpenEditModal: (post: Post) => void
}> = ({ posts, isLoading, onViewDetails, onOpenEditModal }) => (
    <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
        <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs text-text-secondary uppercase bg-primary">
                <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Created At</th>
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
                            <td className="px-4 py-3 font-medium text-text-primary">{post.title}</td>
                            <td className="px-4 py-3">{post.author}</td>
                            <td className="px-4 py-3 text-text-secondary">{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                                 <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                                    post.status === 'APPROVED' ? 'bg-success/20 text-success' : 
                                    post.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'bg-error/20 text-error'
                                 }`}>
                                  {post.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button
                                    onClick={() => onViewDetails(post.id)}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-highlight hover:bg-red-200"
                                    title="View Details"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => onOpenEditModal(post)}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium border border-accent text-text-secondary hover:bg-accent hover:text-text-primary"
                                    title="Edit Post"
                                >
                                    Edit
                                </button>
                                {post.status === 'PENDING' && (
                                    <>
                                        <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-success text-white hover:opacity-90 transition-colors" title="Approve Post">Approve</button>
                                        <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90 transition-colors" title="Remove Post">Remove</button>
                                    </>
                                )}
                                 {post.status === 'APPROVED' && (
                                    <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90 transition-colors" title="Remove Post">Remove</button>
                                 )}
                            </td>
                        </tr>
                    ))
                ) : (
                     <tr><td colSpan={6} className="text-center p-8 text-text-secondary">No posts found.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

const PostManagementPage = () => {
    const { 
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
    } = usePosts();

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-6">Post Management</h1>
            <p className="text-text-secondary mb-6">Review user-submitted posts. Approve them to make them public or remove inappropriate content.</p>
            <PostTable posts={posts} isLoading={isLoading} onViewDetails={handleViewDetails} onOpenEditModal={handleOpenEditModal} />
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedPost?.title || "Post Details"}>
                {selectedPost && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            {selectedPost.imageUrl && (
                                <img 
                                    src={selectedPost.imageUrl} 
                                    alt={selectedPost.title}
                                    className="w-full h-64 object-cover rounded-lg bg-accent"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <div>
                                <h3 className="font-bold text-lg mb-2">Content</h3>
                                <p className="text-text-secondary whitespace-pre-wrap">{selectedPost.content}</p>
                            </div>
                        </div>
                        <div className="md:w-1/3 space-y-4 pt-4 border-t md:border-t-0 md:border-l md:pl-6 border-accent">
                            <div>
                                <h4 className="font-bold text-md mb-2">Author</h4>
                                <p className="text-text-primary">{selectedPost.partner?.fullname}</p>
                                <p className="text-sm text-text-secondary">{selectedPost.partner?.email}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-md mb-2">Restaurant</h4>
                                <p className="text-text-primary">{selectedPost.restaurant?.name}</p>
                                <p className="text-sm text-text-secondary">{selectedPost.restaurant?.address}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-md mb-2">Moods</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPost.moods && selectedPost.moods.length > 0 ? selectedPost.moods?.map(mood => (
                                        <span key={mood.id} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 font-medium rounded-full">
                                            {mood.name}
                                        </span>
                                    )) : <p className="text-sm text-text-secondary">No moods associated.</p>}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-bold text-md mb-2">Details</h4>
                                 <p className="text-sm text-text-secondary">
                                    <strong>Posted on:</strong> {new Date(selectedPost.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    <strong>Status:</strong> {selectedPost.status}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Post: "${selectedPost?.title}"`}>
                {selectedPost && (
                    <form onSubmit={handleUpdatePost}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                                <input type="text" name="title" id="title" value={editFormData.title} onChange={handleEditFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                            </div>
                             <div>
                                <label htmlFor="restaurantId" className="block text-sm font-medium text-text-secondary mb-1">Restaurant ID</label>
                                <input type="number" name="restaurantId" id="restaurantId" value={editFormData.restaurantId} onChange={handleEditFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                            </div>
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary mb-1">Image URL</label>
                                <input type="text" name="imageUrl" id="imageUrl" value={editFormData.imageUrl} onChange={handleEditFormChange} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Content</label>
                                <textarea name="content" id="content" value={editFormData.content} onChange={handleEditFormChange} required rows={8} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-accent">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default PostManagementPage;
