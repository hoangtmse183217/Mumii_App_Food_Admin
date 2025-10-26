import React, { useState, useEffect } from 'react';
import type { Post } from '../../types';
import { api } from '../../services/mockApi';
import { useLoading } from '../../context/LoadingContext';

const PostList = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const { showLoader, hideLoader } = useLoading();

    useEffect(() => {
        const fetchPosts = async () => {
            showLoader();
            try {
                const data = await api.getPosts();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                hideLoader();
            }
        };
        fetchPosts();
    }, [showLoader, hideLoader]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Post Management</h1>
            <p className="text-text-secondary mb-6">Review user-submitted posts. Approve them to make them public or remove inappropriate content.</p>
            
            <div className="bg-secondary shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                    <thead className="text-xs text-text-secondary uppercase bg-primary">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Author</th>
                            <th className="px-4 py-3">Created At</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post, index) => (
                            <tr key={post.id} className={`border-b border-accent transition-colors duration-200 ${index % 2 !== 0 ? 'bg-primary' : ''} hover:bg-accent`}>
                                <td className="px-4 py-3 font-medium text-text-primary">{post.title}</td>
                                <td className="px-4 py-3">{post.author}</td>
                                <td className="px-4 py-3 text-text-secondary">{post.createdAt}</td>
                                <td className="px-4 py-3">
                                     <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                                        post.status === 'APPROVED' ? 'bg-success/20 text-success' : 
                                        post.status === 'PENDING' ? 'bg-accent-orange/20 text-accent-orange' : 'bg-error/20 text-error'
                                     }`}>
                                      {post.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center space-x-2">
                                    {post.status === 'PENDING' && (
                                        <>
                                            <button 
                                                className="px-2.5 py-1 rounded text-xs font-medium bg-success text-white hover:opacity-90 transition-colors"
                                                title="Approve Post"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                className="px-2.5 py-1 rounded text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                                                title="Remove Post"
                                            >
                                                Remove
                                            </button>
                                        </>
                                    )}
                                     {post.status === 'APPROVED' && (
                                        <button 
                                            className="px-2.5 py-1 rounded text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                                            title="Remove Post"
                                        >
                                            Remove
                                        </button>
                                     )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostList;