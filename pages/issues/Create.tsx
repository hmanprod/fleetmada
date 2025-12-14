import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';

interface IssueCreateProps {
  onCancel: () => void;
  onSave: () => void;
}

const IssueCreate: React.FC<IssueCreateProps> = ({ onCancel, onSave }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Issues
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Issue</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Issue</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>
             
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset <span className="text-red-500">*</span></label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                        <option>AC101 - 2018 Ford F-150</option>
                        <option>BT50 - 2009 Mazda BT50</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>No Priority</option>
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date <span className="text-red-500">*</span></label>
                        <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                         <input type="time" defaultValue="14:07" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Summary <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    <p className="mt-1 text-xs text-gray-500">Brief overview of the issue</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={4} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                        <option>Electrical</option>
                        <option>Mechanical</option>
                        <option>Body</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Use labels to categorize, group and more. (e.g. Electrical)</p>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                    <input type="text" defaultValue="Hery RABOTOVAO" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-gray-50" />
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                        <option>Hery RABOTOVAO</option>
                    </select>
                </div>
             </div>
          </div>

          {/* Overdue Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Overdue Settings</h2>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                <p className="mt-1 text-xs text-gray-500">(optional) Considered overdue after this date</p>
            </div>
          </div>

          {/* Photos & Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-4">Photos</h2>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                         <Upload size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                    <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                 </div>
             </div>

             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                         <Upload size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                    <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                 </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Issue</button>
         </div>

       </div>
    </div>
  );
};

export default IssueCreate;