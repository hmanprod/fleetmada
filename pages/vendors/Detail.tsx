import React from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, Bell, MessageSquare } from 'lucide-react';
import { Vendor } from '../../types';

interface VendorDetailProps {
  vendor: Vendor | null;
  onBack: () => void;
  onEdit: () => void;
}

const VendorDetail: React.FC<VendorDetailProps> = ({ vendor, onBack, onEdit }) => {
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
             <button onClick={onBack} className="hover:text-gray-700"><ArrowLeft size={16}/></button>
             <span>Vendors</span>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-start gap-3">
                 <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                 <button className="text-xs font-medium border border-gray-300 rounded-full px-3 py-0.5 mt-2 hover:bg-gray-50 flex items-center gap-1">
                   <Edit2 size={10} /> Edit Labels
                 </button>
             </div>
             <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Bell size={16} /> Watch
                </button>
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <MoreHorizontal size={16} />
                </button>
                 <button onClick={onEdit} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit2 size={16} /> Edit
                </button>
             </div>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white border-b border-gray-200 px-8">
           <div className="flex gap-6 overflow-x-auto">
               {['Overview', 'Service Entries', 'Work Orders'].map((tab, idx) => (
                   <button 
                    key={tab}
                    className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${idx === 0 ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                       {tab}
                   </button>
               ))}
           </div>
       </div>

       <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                     <h2 className="text-xl font-bold text-gray-900">Details</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 gap-y-6">
                     <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4">All Fields</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Network Status</span>
                                <span className="col-span-2 text-sm text-[#008751] font-medium">Invite</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Phone</span>
                                <span className="col-span-2 text-sm text-[#008751]">{vendor.phone}</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Website</span>
                                <span className="col-span-2 text-sm text-[#008751]">{vendor.website}</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Contact Name</span>
                                <span className="col-span-2 text-sm text-gray-900">{vendor.contactName}</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Contact Phone</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Contact Email</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Notes</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Fuel Vendor</span>
                                <span className="col-span-2 text-sm text-gray-900">No</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Service Vendor</span>
                                <span className="col-span-2 text-sm text-gray-900">Yes</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Vehicle Vendor</span>
                                <span className="col-span-2 text-sm text-gray-900">No</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Charging Vendor</span>
                                <span className="col-span-2 text-sm text-gray-900">No</span>
                            </div>
                        </div>
                     </div>
                  </div>
                  {/* Map Placeholder */}
                  <div className="h-64 w-full bg-gray-100 relative border-t border-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                          <img src="https://static.mapquest.com/staticmap?key=G&center=35.77959,-78.638179&zoom=13&size=600,300&type=map&imagetype=png" alt="Map" className="w-full h-full object-cover opacity-80" />
                          <div className="absolute bottom-4 left-4 bg-white p-3 shadow-lg rounded max-w-sm">
                              <h4 className="font-bold text-sm">Raleigh, NC</h4>
                              <p className="text-xs text-gray-600">3925 Western Blvd, Raleigh, NC 27606, US</p>
                          </div>
                      </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
                     Created 17 hours ago
                  </div>
              </div>
          </div>

          {/* Right Column - Comments */}
          <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[400px] flex flex-col">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Comments</h2>
                 </div>
                 <div className="p-8 flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                     <MessageSquare size={48} className="text-gray-300 mb-4 stroke-1" />
                     <p className="text-sm">Start a conversation or @mention someone to ask a question in the comment box below.</p>
                 </div>
                 <div className="p-4 border-t border-gray-200 flex gap-3">
                     <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">HR</div>
                     <div className="flex-1">
                         <input 
                           type="text" 
                           placeholder="Add a Comment" 
                           className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                         />
                     </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default VendorDetail;