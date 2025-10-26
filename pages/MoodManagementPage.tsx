
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { Mood } from '../types';
import { moodService } from '../services/moodService';
import Modal from '../components/shared/Modal';
import { useLoading } from '../hooks/useLoading';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import { useToast } from '../hooks/useToast';

const MoodManagementPage = () => {
    const [moods, setMoods] = useState<Mood[]>([]);
    const { showLoader, hideLoader } = useLoading();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMood, setCurrentMood] = useState<Partial<Mood>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDeleteState, setConfirmDeleteState] = useState({ isOpen: false, idToDelete: null as number | null });

    const fetchMoods = useCallback(async () => {
        showLoader();
        try {
            const data = await moodService.getMoods();
            setMoods(data || []);
        } catch (error) {
            console.error("Failed to fetch moods", error);
            addToast(error instanceof Error ? error.message : 'Failed to fetch moods.', 'error');
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader, addToast]);

    useEffect(() => {
        fetchMoods();
    }, [fetchMoods]);

    const handleOpenModalForAdd = () => {
        setIsEditing(false);
        setCurrentMood({});
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (mood: Mood) => {
        setIsEditing(true);
        setCurrentMood(mood);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setConfirmDeleteState({ isOpen: true, idToDelete: id });
    };
    
    const handleConfirmDelete = async () => {
        if (confirmDeleteState.idToDelete === null) return;
        const idToDelete = confirmDeleteState.idToDelete;

        showLoader();
        try {
            await moodService.deleteMood(idToDelete);
            addToast('Mood deleted successfully.', 'success');
            await fetchMoods();
        } catch (error) {
            console.error("Failed to delete mood", error);
            addToast(error instanceof Error ? error.message : 'Failed to delete mood.', 'error');
        } finally {
            hideLoader();
            setConfirmDeleteState({ isOpen: false, idToDelete: null });
        }
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentMood({ ...currentMood, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!currentMood.name || !currentMood.description) return;
        
        showLoader();
        try {
            if (isEditing) {
                await moodService.updateMood(currentMood as Mood);
            } else {
                await moodService.addMood({ name: currentMood.name, description: currentMood.description });
            }
            addToast(`Mood ${isEditing ? 'updated' : 'added'} successfully.`, 'success');
            setIsModalOpen(false);
            await fetchMoods();
        } catch (error) {
            console.error("Failed to save mood", error);
            addToast(error instanceof Error ? error.message : 'Failed to save mood.', 'error');
        } finally {
            hideLoader();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-heading font-bold">Mood Management</h1>
                <button onClick={handleOpenModalForAdd} className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Add New Mood</button>
            </div>
            <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
                <table className="w-full min-w-max text-left text-sm">
                    <thead className="text-xs text-text-secondary uppercase bg-primary">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Created At</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moods.length > 0 ? (
                            moods.map((mood) => (
                                <tr key={mood.id} className="border-b border-accent last:border-b-0 hover:bg-primary">
                                    <td className="px-4 py-3 text-text-secondary">{mood.id}</td>
                                    <td className="px-4 py-3 font-medium text-text-primary">{mood.name}</td>
                                    <td className="px-4 py-3">{mood.description}</td>
                                    <td className="px-4 py-3 text-text-secondary">{new Date(mood.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                        <button 
                                            onClick={() => handleOpenModalForEdit(mood)} 
                                            className="px-2.5 py-1 rounded-md text-xs font-medium border border-accent text-text-secondary hover:bg-accent hover:text-text-primary transition-colors"
                                            title="Edit Mood"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(mood.id)} 
                                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                                            title="Delete Mood"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-text-secondary">
                                    No moods found. Click 'Add New Mood' to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Mood' : 'Add Mood'}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                        <input type="text" name="name" id="name" value={currentMood.name || ''} onChange={handleFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                        <textarea name="description" id="description" value={currentMood.description || ''} onChange={handleFormChange} required rows={4} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Save</button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={confirmDeleteState.isOpen}
                onClose={() => setConfirmDeleteState({ isOpen: false, idToDelete: null })}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this mood? This action cannot be undone."
            />
        </div>
    );
};

export default MoodManagementPage;
