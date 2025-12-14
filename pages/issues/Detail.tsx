import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit2, Check, BellOff, AlertTriangle, User, MessageSquare } from 'lucide-react';
import { Issue } from '../../types';

interface IssueDetailProps {
  issue: Issue | null;
  onBack: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issue, onBack }) => {
  // Fallback if no issue provided (e.g., direct link)
  if (!issue) return <div>Issue not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
             <button onClick={onBack} className="hover:text-gray-700"><ArrowLeft size={16}/></button>
             <span>Issues</span>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-start gap-3">
                 <h1 className="text-3xl font-bold text-gray-900">{issue.summary}</h1>
                 <button className="text-xs font-medium border border-gray-300 rounded-full px-3 py-0.5 mt-2 hover:bg-gray-50 flex items-center gap-1">
                   <Edit2 size={10} /> Edit Labels
                 </button>
             </div>
             <div className="flex gap-2">
                <span className="bg-purple-100 text-purple-800 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold">HR</span>
                <span className="bg-gray-100 text-gray-500 h-8 w-8 rounded-full flex items-center justify-center"><User size={14}/></span>
                <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <BellOff size={16} /> Unwatch
                </button>
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <MoreHorizontal size={16} />
                </button>
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit2 size={16} /> Edit
                </button>
                 <button className="px-3 py-1.5 bg-[#008751] text-white rounded text-sm font-medium hover:bg-[#007043] flex items-center gap-2 shadow-sm">
                    <Check size={16} /> Resolve
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
                                <span className="text-sm text-gray-500">Issue #</span>
                                <span className="col-span-2 text-sm text-gray-900 font-medium">{issue.id}</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="col-span-2">
                                   <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold uppercase">{issue.status}</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Summary</span>
                                <span className="col-span-2 text-sm text-gray-900">{issue.summary}</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Description</span>
                                <span className="col-span-2 text-sm text-gray-900">Had to jump-start the truck</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Priority</span>
                                <span className="col-span-2 text-sm text-red-600 font-medium flex items-center gap-1">
                                    <AlertTriangle size={16} /> {issue.priority}
                                    <div className="ml-2 text-xs text-gray-500 font-normal block">Out of service or safety issue</div>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Vehicle</span>
                                <span className="col-span-2 text-sm text-[#008751] font-bold flex items-center gap-2">
                                     <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.id}`} className="w-6 h-6 rounded" alt=""/>
                                     {issue.vehicle}
                                     <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">Sample</span>
                                </span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Reported Date</span>
                                <span className="col-span-2 text-sm text-gray-900 decoration-dotted underline underline-offset-4">{issue.reportedDate}</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Reported By</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Odometer</span>
                                <span className="col-span-2 text-sm text-gray-900">71,520 mi</span>
                            </div>
                            <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Source</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Assigned To</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                             <div className="grid grid-cols-3 py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Due Date</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                             <div className="grid grid-cols-3 py-2">
                                <span className="text-sm text-gray-500">Due Odometer</span>
                                <span className="col-span-2 text-sm text-gray-900">—</span>
                            </div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
                     Created 4 months ago · Updated 16 hours ago
                  </div>
              </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                 <div className="p-4 border-b border-gray-200">
                     <h2 className="text-lg font-bold text-gray-900">Timeline</h2>
                 </div>
                 <div className="p-4">
                     <div className="flex items-center gap-3 mb-4">
                         <div className="bg-orange-100 p-2 rounded-full">
                             <AlertTriangle size={16} className="text-orange-500" />
                         </div>
                         <div className="flex-1">
                             <div className="text-sm font-medium text-gray-900">Issue Opened</div>
                         </div>
                         <div className="text-xs text-gray-500">Aug 22</div>
                     </div>
                 </div>
             </div>

             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Comments</h2>
                 </div>
                 <div className="p-4 space-y-6">
                    <div className="flex gap-3">
                         <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">HR</div>
                         <div>
                             <div className="flex items-baseline gap-2 mb-1">
                                 <span className="text-sm font-bold text-[#008751]">Hery RABOTOVAO</span>
                                 <span className="text-xs text-gray-500">4 months ago</span>
                             </div>
                             <p className="text-sm text-gray-800">Scheduling for service this week. Battery is starting to look corroded.</p>
                         </div>
                    </div>
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

export default IssueDetail;