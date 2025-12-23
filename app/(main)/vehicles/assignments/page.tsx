'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, X, Calendar, Clock, User, Car } from 'lucide-react';
import { MOCK_VEHICLES, MOCK_ASSIGNMENTS, Assignment, Vehicle } from '../types';

export default function VehicleAssignmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);

  // Modal Form State
  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00'
  });

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 hours
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => i);
  const daysInMonth = Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);

  // Check if a vehicle is assigned at a specific time/date
  const getAssignmentAtSlot = (vehicleId: string, slotIndex: number) => {
    if (viewMode === 'day') {
      const todayStr = currentDate.toISOString().split('T')[0];
      return assignments.find(a => {
        if (a.vehicleId !== vehicleId) return false;
        if (a.startDate !== todayStr) return false;
        const startH = parseInt(a.startTime.split(':')[0]);
        const endH = a.endTime ? parseInt(a.endTime.split(':')[0]) : 24;
        return slotIndex >= startH && slotIndex < endH;
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const slotDate = new Date(startOfWeek);
      slotDate.setDate(startOfWeek.getDate() + slotIndex);
      const slotDateStr = slotDate.toISOString().split('T')[0];
      return assignments.find(a => a.vehicleId === vehicleId && a.startDate === slotDateStr);
    } else {
      const slotDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), slotIndex);
      const slotDateStr = slotDate.toISOString().split('T')[0];
      return assignments.find(a => a.vehicleId === vehicleId && a.startDate === slotDateStr);
    }
  };

  const handleSaveAssignment = () => {
    if (!assignmentForm.vehicleId || !assignmentForm.operator) return;

    if (editingAssignmentId) {
      setAssignments(assignments.map(a =>
        a.id === editingAssignmentId
          ? { ...a, ...assignmentForm } as Assignment
          : a
      ));
    } else {
      const assignment: Assignment = {
        id: Math.random().toString(36).substr(2, 9),
        vehicleId: assignmentForm.vehicleId,
        operator: assignmentForm.operator,
        startDate: assignmentForm.startDate!,
        startTime: assignmentForm.startTime!,
        endDate: assignmentForm.endDate,
        endTime: assignmentForm.endTime,
        comments: assignmentForm.comments
      };
      setAssignments([...assignments, assignment]);
    }

    handleCloseModal();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignmentForm(assignment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAssignmentId(null);
    setAssignmentForm({
      startDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '17:00'
    });
  };

  const formatDate = (date: Date) => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Assignments</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Learn
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Assignment
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
            </div>
            <button className="border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Month
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
              <button onClick={() => navigateDate(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium w-32 text-center">{formatDate(currentDate)}</span>
              <button onClick={() => navigateDate(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduler Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Vehicles */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-white z-10">
          <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-gray-50 text-sm font-medium text-gray-500 sticky top-0">
            Vehicle
          </div>
          {MOCK_VEHICLES.map(vehicle => (
            <div key={vehicle.id} className="h-16 border-b border-gray-100 px-4 flex items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                  <Car size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{vehicle.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full 
                                   ${vehicle.status === 'Active' ? 'bg-green-500' :
                        vehicle.status === 'In Shop' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                    {vehicle.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative">
          {/* Time Header */}
          <div className="h-10 border-b border-gray-200 flex min-w-max sticky top-0 bg-white z-10">
            {viewMode === 'day' && hours.map(hour => (
              <div key={hour} className="w-20 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
              </div>
            ))}
            {viewMode === 'week' && daysOfWeek.map(day => {
              const d = new Date(currentDate);
              d.setDate(currentDate.getDate() - currentDate.getDay() + day);
              return (
                <div key={day} className="w-32 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                  {d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </div>
              );
            })}
            {viewMode === 'month' && daysInMonth.map(day => (
              <div key={day} className="w-12 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="min-w-max">
            {MOCK_VEHICLES.map(vehicle => (
              <div key={vehicle.id} className="h-16 border-b border-gray-100 flex relative">
                {viewMode === 'day' && hours.map(hour => {
                  const assignment = getAssignmentAtSlot(vehicle.id, hour);
                  const isStart = assignment && parseInt(assignment.startTime.split(':')[0]) === hour;

                  return (
                    <div key={hour} className="w-20 border-r border-gray-50 h-full relative group">
                      {isStart && (
                        <div
                          onClick={() => handleEditAssignment(assignment)}
                          className="absolute top-2 left-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded-r px-2 py-1 z-10 shadow-sm whitespace-nowrap overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors"
                          style={{ width: `calc(80px * ${parseInt(assignment.endTime?.split(':')[0] || '24') - parseInt(assignment.startTime.split(':')[0])})` }}>
                          <div className="text-xs font-bold text-blue-900">{assignment.operator}</div>
                          <div className="text-[10px] text-blue-700">{assignment.startTime} - {assignment.endTime}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {viewMode === 'week' && daysOfWeek.map(day => {
                  const assignment = getAssignmentAtSlot(vehicle.id, day);
                  return (
                    <div key={day} className="w-32 border-r border-gray-50 h-full relative group">
                      {assignment && (
                        <div
                          onClick={() => handleEditAssignment(assignment)}
                          className="absolute top-2 left-1 right-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded-r px-2 py-1 z-10 shadow-sm whitespace-nowrap overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors">
                          <div className="text-xs font-bold text-blue-900">{assignment.operator}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {viewMode === 'month' && daysInMonth.map(day => {
                  const assignment = getAssignmentAtSlot(vehicle.id, day);
                  return (
                    <div key={day} className="w-12 border-r border-gray-50 h-full relative group">
                      {assignment && (
                        <div
                          onClick={() => handleEditAssignment(assignment)}
                          className="absolute top-2 left-1 right-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded px-1 py-1 z-10 shadow-sm overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors">
                          <div className="w-full h-full bg-blue-500 rounded-sm"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Current Time Line (Only in Day view) */}
            {viewMode === 'day' && (
              <div className="absolute top-0 bottom-0 left-[calc(80px*16.5)] border-l-2 border-red-400 z-0 pointer-events-none">
                <div className="w-2 h-2 bg-red-400 rounded-full -ml-[5px] mt-10"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAssignmentId ? 'Edit Assignment' : 'Add Assignment'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vehicle <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-[#008751] focus:border-[#008751]"
                    value={assignmentForm.vehicleId || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, vehicleId: e.target.value })}
                  >
                    <option value="">Please select</option>
                    {MOCK_VEHICLES.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.vin})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-[#008751] focus:border-[#008751]"
                    value={assignmentForm.operator || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, operator: e.target.value })}
                  >
                    <option value="">Please select</option>
                    {/* In real app this would come from a users list */}
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="date" className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm"
                        value={assignmentForm.startDate}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })} />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="time" className="w-full pl-7 pr-1 py-2 border border-gray-300 rounded text-sm"
                        value={assignmentForm.startTime}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startTime: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="date" className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm"
                        value={assignmentForm.endDate}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })} />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="time" className="w-full pl-7 pr-1 py-2 border border-gray-300 rounded text-sm"
                        value={assignmentForm.endTime}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endTime: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Add an optional comment"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                  rows={3}
                  value={assignmentForm.comments || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, comments: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
              >
                {editingAssignmentId ? 'Update Assignment' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}