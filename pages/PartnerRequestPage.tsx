
import React from 'react';
import { usePartnerRequests } from '../hooks/usePartnerRequests';
import SkeletonTable from '../components/shared/SkeletonTable';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import { User } from '../types';

const RequestTable: React.FC<{
    requests: User[];
    isLoading: boolean;
    onApprove: (user: User) => void;
    onDecline: (user: User) => void;
}> = ({ requests, isLoading, onApprove, onDecline }) => (
    <div className="bg-secondary shadow-sm rounded-lg overflow-x-auto border border-accent">
        <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs text-text-secondary uppercase bg-primary">
                <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Request Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={5}><SkeletonTable rows={5} cols={5} /></td></tr>
                ) : requests.length > 0 ? (
                    requests.map((user) => (
                        <tr key={user.id} className="border-b border-accent last:border-b-0 hover:bg-primary">
                            <td className="px-4 py-3 text-text-secondary">{user.id}</td>
                            <td className="px-4 py-3 font-medium text-text-primary">{user.fullname}</td>
                            <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                            <td className="px-4 py-3 text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button 
                                    onClick={() => onApprove(user)}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-success text-white hover:opacity-90 transition-colors"
                                    title="Approve Request"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => onDecline(user)}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-error text-white hover:opacity-90 transition-colors"
                                    title="Decline Request"
                                >
                                    Decline
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} className="text-center p-8 text-text-secondary">No pending partner requests.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

const PartnerRequestPage = () => {
    const {
        requests,
        isLoading,
        confirmAction,
        handleApprove,
        handleDecline,
        executeConfirmAction,
        cancelAction,
    } = usePartnerRequests();

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-6">Partner Registration Requests</h1>
            <p className="text-text-secondary mb-6">Review and approve or decline users who want to become partners.</p>
            
            <RequestTable 
                requests={requests}
                isLoading={isLoading}
                onApprove={handleApprove}
                onDecline={handleDecline}
            />

            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={cancelAction}
                onConfirm={executeConfirmAction}
                title={confirmAction?.title || "Confirm Action"}
                message={confirmAction?.message || "Are you sure?"}
            />
        </div>
    );
};

export default PartnerRequestPage;
