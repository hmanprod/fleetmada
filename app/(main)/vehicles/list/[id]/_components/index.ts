import React from 'react';
import { type Vehicle } from '@/lib/services/vehicles-api';

export const IssuesTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No issues found.</div>;
export const MeterHistoryTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No meter history records found.</div>;
export const LocationHistoryTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No location history records found.</div>;
export const AssignmentHistoryTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No assignment history records found.</div>;
export const ExpenseHistoryTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No expense history records found.</div>;
export const RenewalRemindersTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No renewal reminders set.</div>;
export const PartsHistoryTab: React.FC<{ vehicle: Vehicle }> = () => <div className="p-12 text-center text-gray-500" > No parts history records found.</div>;
