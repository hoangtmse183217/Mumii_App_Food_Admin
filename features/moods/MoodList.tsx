import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { Mood } from '../../types';
import { api } from '../../services/mockApi';
import Modal from '../../components/common/Modal';
import { useLoading } from '../../context/LoadingContext';

const MoodList = () => {
    const [moods, setMoods] = useState<Mood[]>([]);
    const { showLoader, hideLoader } = useLoading();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMood, setCurrentMood] = useState<Partial<Mood>>({});
    const [isEditing, setIsEditing] = useState(false);

    const fetchMoods = useCallback(async () => {
        showLoader();
        try {
            const data = await api.getMoods();
            setMoods(data);
        } catch (error) {
            console.error("Failed to fetch moods", error);
        } finally {
            hideLoader();
        }
    }, [showLoader, hideLoader]);

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

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this mood?")) {
            showLoader();
            try {
                await api.deleteMood(id);
                await fetchMoods();
            } catch (error) {
                console.error("Failed to delete mood", error);
            } finally {
                hideLoader();
            }
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
                await api.updateMood(currentMood as Mood);
            } else {
                await api.addMood({ name: currentMood.name, description: currentMood.description });
            }
            setIsModalOpen(false);
            await fetchMoods();
        } catch (error) {
            console.error("Failed to save mood", error);
        } finally {
            hideLoader();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Mood Management</h1>
                <button onClick={handleOpenModalForAdd} className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded-lg">Add New Mood</button>
            </div>
            <div className="bg-secondary shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                    <thead className="text-xs text-text-secondary uppercase bg-primary">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moods.map((mood, index) => (
                            <tr key={mood.id} className={`border-b border-accent transition-colors duration-200 ${index % 2 !== 0 ? 'bg-primary' : ''} hover:bg-accent`}>
                                <td className="px-4 py-3 text-text-secondary">{mood.id}</td>
                                <td className="px-4 py-3 font-medium text-text-primary">{mood.name}</td>
                                <td className="px-4 py-3">{mood.description}</td>
                                <td className="px-4 py-3 text-center space-x-2">
                                    <button 
                                        onClick={() => handleOpenModalForEdit(mood)} 
                                        className="px-2.5 py-1 rounded text-xs font-medium bg-accent-orange/80 text-text-primary hover:bg-accent-orange transition-colors"
                                        title="Edit Mood"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(mood.id)} 
                                        className="px-2.5 py-1 rounded text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                                        title="Delete Mood"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-highlight text-white hover:opacity-90 rounded">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MoodList;