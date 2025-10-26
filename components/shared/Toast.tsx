
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ToastMessage } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastMessage;
  removeToast: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, removeToast }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true);
        }, 4500); // Start fading out before removing

        const removeTimer = setTimeout(() => {
            removeToast(toast.id);
        }, 5000); // Total lifespan of 5 seconds

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, removeToast]);
    
    const bgColor = toast.type === 'success' ? 'bg-success' : 'bg-error';
    const icon = toast.type === 'success' 
        ? <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        : <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

    const animationClass = isFadingOut ? 'animate-toast-out' : 'animate-toast-in';

    return (
        <div 
            role="alert"
            aria-live="assertive"
            className={`${animationClass} ${bgColor} text-white py-3 px-6 rounded-lg shadow-lg flex items-center mb-4 max-w-sm w-full`}
        >
            {icon}
            <p className="font-semibold flex-1">{toast.message}</p>
            <button onClick={() => setIsFadingOut(true)} className="ml-4 p-1 rounded-full hover:bg-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};


interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    const portalRoot = document.getElementById('toast-portal');
    if (!portalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed top-8 right-8 z-[9999] space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>,
        portalRoot
    );
};

export default ToastContainer;
