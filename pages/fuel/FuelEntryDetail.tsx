import React from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, Bell, MessageSquare, Watch } from 'lucide-react';
import { FuelEntry } from '../../types';

interface FuelEntryDetailProps {
  entry: FuelEntry | null;
  onBack: () => void;
}

const FuelEntryDetail: React.FC<FuelEntryDetailProps> = ({ entry, onBack }) => {
  // Mock data if entry is minimal
  const fullEntry = {
      ...entry,
      id: 195961220,
      vehicle: 'MV105TRNS',
      date: '12/13/2025 4:56pm',
      odometer: '160 mi',
      fuelType: '—',
      fuelCard: 'No',
      reference: '—',
      previousEntry: '11/30/2025 6:34pm',
      volume: '142.397 gallons (US)',
      price: 'MGA 3.7950 / gallon',
      total: 'MGA 540',
      usage: '96.0 miles',
      fuelEconomy: '0.67 mpg (US)',
      cost: 'MGA 0 / mile'
  }

  return (
    <div className="bg-gray-50 min-h-screen">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
             <button onClick={onBack} className="hover:text-gray-700"><ArrowLeft size={16}/></button>
             <span>Fuel History</span>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-start gap-3">
                 <h1 className="text-3xl font-bold text-gray-900">Fuel Entry #{fullEntry.id}</h1>
             </div>
             <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Bell size={16} /> Watch
                </button>
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <MoreHorizontal size={16} />
                </button>
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit2 size={16} /> Edit
                </button>
             </div>
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
                                <span className="text-sm text-gray-500">Vehicle</span>
                                <span className="col-span-2 text-sm text-[#008751] font-bold flex items-center gap-2">
                                     <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${fullEntry.id}`} className="w-6 h-6 rounded" alt=""/>
                                     {fullEntry.vehicle}
                                     <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">Sample</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Date</span>
                                <span className="col-span-2 text-sm text-gray-900 decoration-dotted underline underline-offset-4">{fullEntry.date}</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Odometer</span>
                                <span className="col-span-2 text-sm text-gray-900 decoration-dotted underline underline-offset-4">{fullEntry.odometer}</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Vendor</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Fuel Type</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Fuel Card</span>
                                <span className="col-span-2 text-sm text-gray-900">{fullEntry.fuelCard}</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Reference</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Previous Entry</span>
                                <span className="col-span-2 text-sm text-gray-900 decoration-dotted underline underline-offset-4">{fullEntry.previousEntry}</span>
                            </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 border-t border-gray-200">
                      <div className="p-6 border-r border-b border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Volume</div>
                          <div className="text-xl font-bold text-gray-900">{fullEntry.volume.split(' ')[0]} <span className="text-sm font-normal text-gray-500">gallons (US)</span></div>
                          <div className="text-xs text-red-500 mt-1">▲ 142.40 (Infinity%)</div>
                      </div>
                      <div className="p-6 border-b border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Fuel Price</div>
                          <div className="text-xl font-bold text-gray-900">MGA 3.7950 <span className="text-sm font-normal text-gray-500">/ gallon</span></div>
                          <div className="text-xs text-green-500 mt-1">▼ MGA 1 (18.1%)</div>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Usage</div>
                          <div className="text-xl font-bold text-gray-900">{fullEntry.usage.split(' ')[0]} <span className="text-sm font-normal text-gray-500">miles</span></div>
                          <div className="text-xs text-green-500 mt-1">▲ 81.45 (559.8%)</div>
                      </div>
                      <div className="p-6">
                          <div className="text-xs text-gray-500 mb-1">Fuel Economy</div>
                          <div className="text-xl font-bold text-gray-900">{fullEntry.fuelEconomy.split(' ')[0]} <span className="text-sm font-normal text-gray-500">mpg (US)</span></div>
                          <div className="text-xs text-green-500 mt-1">▲ 0.574 (574.0%)</div>
                      </div>
                       <div className="p-6 border-r border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Total</div>
                          <div className="text-xl font-bold text-gray-900">MGA 540</div>
                          <div className="text-xs text-red-500 mt-1">▲ MGA 540 (0.0%)</div>
                      </div>
                      <div className="p-6 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Cost</div>
                          <div className="text-xl font-bold text-gray-900">MGA 0 <span className="text-sm font-normal text-gray-500">/ mile</span></div>
                          <div className="text-xs text-green-500 mt-1">▼ MGA 46 (99.4%)</div>
                      </div>
                  </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                     <h2 className="text-lg font-bold text-gray-900">Location</h2>
                  </div>
                  <div className="h-64 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                      Location is unknown or not available
                  </div>
              </div>
              
              <div className="text-center text-xs text-gray-500">Created a day ago · Updated 18 hours ago</div>
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

export default FuelEntryDetail;