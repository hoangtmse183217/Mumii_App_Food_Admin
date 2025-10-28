import React, { ChangeEvent, FormEvent } from 'react';
import { PostUpdatePayload, Restaurant } from '../../types';
import { ICONS } from '../../constants';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  formData: PostUpdatePayload;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  postTitle: string;
  partnerRestaurants: Restaurant[];
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  postTitle,
  partnerRestaurants,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[51] flex justify-center items-center p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={onSubmit}>
          <div className="flex justify-between items-center p-4 border-b border-accent">
            <h2 className="text-xl font-heading font-bold">Edit Post: "{postTitle}"</h2>
            <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
                {ICONS.close}
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={onFormChange} required className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
            </div>
            <div>
              <label htmlFor="restaurantId" className="block text-sm font-medium text-text-secondary mb-1">Restaurant</label>
              <select
                name="restaurantId"
                id="restaurantId"
                value={formData.restaurantId || ''}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight disabled:bg-accent disabled:cursor-not-allowed"
                disabled={partnerRestaurants.length === 0}
              >
                {partnerRestaurants.length > 0 ? (
                  <>
                    <option value="" disabled={formData.restaurantId !== 0}>-- Select a restaurant --</option>
                    {partnerRestaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </>
                ) : (
                  <option value="">No approved restaurants found for this partner</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Content</label>
              <textarea name="content" id="content" value={formData.content} onChange={onFormChange} required rows={8} className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 p-4 border-t border-accent bg-primary rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary border border-accent hover:bg-primary text-text-secondary rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-highlight text-white hover:bg-highlight-hover rounded-lg">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
