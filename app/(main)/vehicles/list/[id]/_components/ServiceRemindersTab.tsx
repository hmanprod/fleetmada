import React from 'react';
import { type Vehicle } from '@/lib/services/vehicles-api';

interface ServiceRemindersTabProps {
    vehicle: Vehicle;
}

export const ServiceRemindersTab: React.FC<ServiceRemindersTabProps> = ({ vehicle }) => {
    return (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">No service reminders set.</p>
        </div>
    );
};
