import React from 'react';

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  restaurantName: string;
}

const SUGGESTED_REASONS = [
  'Thông tin không chính xác',
  'Thiếu giấy phép kinh doanh',
  'Hình ảnh không phù hợp',
  'Địa chỉ không thể xác minh',
  'Trùng lặp với nhà hàng đã có',
];

const DeclineReasonModal: React.FC<DeclineReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reason,
  setReason,
  restaurantName,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setReason(prev => prev ? `${prev}. ${suggestion}` : suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[51] flex justify-center items-center p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-heading font-bold text-text-primary mb-2">Từ chối Nhà hàng</h3>
            <p className="text-text-secondary mb-4">
              Vui lòng cung cấp lý do từ chối "<strong>{restaurantName}</strong>". Nội dung này sẽ được gửi đến đối tác.
            </p>
            
            <div className="mb-3">
              <p className="text-sm font-medium text-text-secondary mb-2">Gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_REASONS.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-2.5 py-1 text-xs font-medium bg-primary border border-accent rounded-full text-text-secondary hover:bg-accent hover:text-text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Thiếu giấy phép kinh doanh, địa chỉ không chính xác..."
              required
              rows={4}
              className="w-full px-3 py-2 bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4 p-4 bg-primary rounded-b-lg border-t border-accent">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-secondary rounded-lg border border-accent hover:bg-accent focus:ring-4 focus:outline-none focus:ring-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-center text-white bg-error rounded-lg hover:opacity-90 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:bg-gray-400"
              disabled={!reason.trim()}
            >
              Xác nhận Từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeclineReasonModal;