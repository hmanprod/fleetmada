'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, X, Calendar, Clock, User, Car } from 'lucide-react';
import { MOCK_VEHICLES, MOCK_ASSIGNMENTS, Assignment, Vehicle } from '../types';

export default function VehicleAssignmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);

  // Modal Form State
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00'
  });

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 hours

  // Check if a vehicle is assigned at a specific hour on the current date
  const getAssignmentAtHour = (vehicleId: string, hour: number) => {
    const todayStr = currentDate.toISOString().split('T')[0];

    return assignments.find(a => {
      if (a.vehicleId !== vehicleId) return false;
      if (a.startDate !== todayStr) return false; // Simplified: only checking start date for now

      const startH = parseInt(a.startTime.split(':')[0]);
      const endH = a.endTime ? parseInt(a.endTime.split(':')[0]) : 24;

      return hour >= startH && hour < endH;
    });
  };

  const handleSaveAssignment = () => {
    if (!newAssignment.vehicleId || !newAssignment.operator) return;

    const assignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      vehicleId: newAssignment.vehicleId,
      operator: newAssignment.operator,
      startDate: newAssignment.startDate!,
      startTime: newAssignment.startTime!,
      endDate: newAssignment.endDate,
      endTime: newAssignment.endTime,
      comments: newAssignment.comments
    };

    setAssignments([...assignments, assignment]);
    setIsModalOpen(false);
    setNewAssignment({
      startDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '17:00'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
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
              <button className="px-3 py-1 rounded bg-white shadow-sm text-sm font-medium text-gray-900">Today</button>
              <button className="px-3 py-1 rounded text-sm font-medium text-gray-600 hover:text-gray-900">Day</button>
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
            {hours.map(hour => (
              <div key={hour} className="w-20 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="min-w-max">
            {MOCK_VEHICLES.map(vehicle => (
              <div key={vehicle.id} className="h-16 border-b border-gray-100 flex relative">
                {hours.map(hour => {
                  const assignment = getAssignmentAtHour(vehicle.id, hour);
                  const isStart = assignment && parseInt(assignment.startTime.split(':')[0]) === hour;

                  return (
                    <div key={hour} className="w-20 border-r border-gray-50 h-full relative group">
                      {isStart && (
                        <div className="absolute top-2 left-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded-r px-2 py-1 z-10 shadow-sm whitespace-nowrap overflow-hidden pointer-events-none"
                          style={{ width: 'calc(100% * 8)' /* Assuming 8 hours rough width for demo */ }}>
                          <div className="text-xs font-bold text-blue-900">{assignment?.operator}</div>
                          <div className="text-[10px] text-blue-700">{assignment?.startTime} - {assignment?.endTime}</div>
                        </div>
                      )}
                      {/* Current time indicator line if today */}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Current Time Line (Mocked at 4:30pm) */}
            <div className="absolute top-0 bottom-0 left-[calc(80px*16.5)] border-l-2 border-red-400 z-0 pointer-events-none">
              <div className="w-2 h-2 bg-red-400 rounded-full -ml-[5px] mt-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add Assignment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                    value={newAssignment.vehicleId || ''}
                    onChange={(e) => setNewAssignment({ ...newAssignment, vehicleId: e.target.value })}
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
                    value={newAssignment.operator || ''}
                    onChange={(e) => setNewAssignment({ ...newAssignment, operator: e.target.value })}
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
                        value={newAssignment.startDate}
                        onChange={(e) => setNewAssignment({ ...newAssignment, startDate: e.target.value })} />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="time" className="w-full pl-7 pr-1 py-2 border border-gray-300 rounded text-sm"
                        value={newAssignment.startTime}
                        onChange={(e) => setNewAssignment({ ...newAssignment, startTime: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="date" className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm"
                        value={newAssignment.endDate}
                        onChange={(e) => setNewAssignment({ ...newAssignment, endDate: e.target.value })} />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="time" className="w-full pl-7 pr-1 py-2 border border-gray-300 rounded text-sm"
                        value={newAssignment.endTime}
                        onChange={(e) => setNewAssignment({ ...newAssignment, endTime: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Add an optional comment"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                  rows={3}
                  value={newAssignment.comments || ''}
                  onChange={(e) => setNewAssignment({ ...newAssignment, comments: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}