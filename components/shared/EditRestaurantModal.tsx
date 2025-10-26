
import React, { ChangeEvent, FormEvent } from 'react';
import { RestaurantUpdatePayload } from '../../services/restaurantService';
import { ICONS } from '../../constants';

interface EditRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  formData: RestaurantUpdatePayload;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  restaurantName: string;
}

const EditRestaurantModal: React.FC<EditRestaurantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  restaurantName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[51] flex justify-center items-center p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={onSubmit}>
          <div className="flex justify-between items-center p-4 border-b border-accent">
            <h2 className="text-xl font-heading font-bold">Chỉnh sửa: {restaurantName}</h2>
            <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
                {ICONS.close}
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Tên Nhà hàng</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">Địa chỉ</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label htmlFor="avgPrice" className="block text-sm font-medium text-text-secondary mb-1">Giá Trung bình (VND)</label>
              <input
                type="number"
                id="avgPrice"
                name="avgPrice"
                value={formData.avgPrice || 0}
                onChange={onFormChange}
                required
                min="0"
                step="1000"
                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={onFormChange}
                required
                rows={5}
                className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-4 p-4 bg-primary rounded-b-lg border-t border-accent">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-secondary rounded-lg border border-accent hover:bg-accent"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight-hover"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRestaurantModal;
