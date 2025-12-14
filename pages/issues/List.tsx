import React from 'react';
import { Search, Plus, Filter, AlertCircle, MoreHorizontal, MessageSquare, Image as ImageIcon, ChevronRight, Zap } from 'lucide-react';
import { Issue } from '../../types';

interface IssueListProps {
  onAdd: () => void;
  onSelect: (issue: Issue) => void;
}

const mockIssues: Issue[] = [
  { id: 1, priority: 'Critical', vehicle: 'AC101', summary: 'Dead battery', status: 'Open', reportedDate: '08/22/2025', watchers: 1, comments: 1, images: 1 },
  { id: 2, priority: 'Critical', vehicle: 'AM101', summary: 'Oil leak', status: 'Open', reportedDate: '11/16/2025', watchers: 1, comments: 0, images: 1 },
  { id: 3, priority: 'High', vehicle: 'AP101', summary: 'Flat tire', status: 'Open', reportedDate: '08/16/2025', watchers: 1, comments: 0, images: 1 },
  { id: 4, priority: 'Medium', vehicle: 'AS101', summary: 'Brake light', status: 'Open', reportedDate: '11/28/2025', watchers: 1, comments: 0, images: 1 },
  { id: 5, priority: 'Medium', vehicle: 'AT101', summary: 'Brake pads worn', status: 'Closed', reportedDate: '07/20/2025', watchers: 1, comments: 0, images: 1 },
  { id: 6, priority: 'Low', vehicle: 'AV101', summary: 'Bad Engine Air Filter', status: 'Resolved', reportedDate: '06/01/2025', watchers: 1, comments: 0, images: 1 },
  { id: 7, priority: 'Medium', vehicle: 'BF101', summary: 'Need Transfluid', status: 'Resolved', reportedDate: '05/13/2025', watchers: 0, comments: 0, images: 0 },
  { id: 8, priority: 'High', vehicle: 'BS102', summary: 'Recall #11V289000', status: 'Open', reportedDate: '12/13/2025', watchers: 0, comments: 0, images: 0 },
  { id: 9, priority: 'High', vehicle: 'BS101', summary: 'Recall #11V289000', status: 'Resolved', reportedDate: '12/03/2025', watchers: 0, comments: 0, images: 0 },
];

const IssueList: React.FC<IssueListProps> = ({ onAdd, onSelect }) => {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'Critical': return <AlertCircle size={16} className="text-red-600 fill-red-100" />;
      case 'High': return <div className="text-red-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></div>;
      case 'Medium': return <div className="text-orange-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></div>;
      default: return <div className="text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></div>;
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Open': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Open</span>;
      case 'Resolved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Resolved</span>;
      case 'Closed': return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">Closed</span>;
      default: return null;
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
           <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium">
             <Zap size={14} className="text-purple-600 fill-purple-600" /> Automations
           </button>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Issue
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {['All', 'Open', 'Overdue', 'Resolved', 'Closed'].map((tab, idx) => (
          <button 
             key={tab} 
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${idx === 0 ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab}
          </button>
        ))}
         <button className="px-4 py-2 text-sm font-medium text-[#008751] flex items-center gap-1">
           <Plus size={14} /> Add Tab
         </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <div className="flex gap-2">
             <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Issue Assigned To <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
             </button>
             <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Labels <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
             </button>
             <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               <Filter size={14} /> Filters
             </button>
         </div>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 9 of 9
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
           Save View
         </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchers</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockIssues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(issue)}>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className={`flex items-center gap-2 ${getPriorityColor(issue.priority)} text-sm font-medium`}>
                      {getPriorityIcon(issue.priority)}
                      {issue.priority}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                        <img src={`https://source.unsplash.com/random/100x100/?truck,car&sig=${issue.id}`} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">{issue.vehicle}</div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Vehicle
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{issue.id} <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-1">Sample</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {issue.summary}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(issue.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.reportedDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   <div className="flex items-center gap-1">
                      <span className="text-[#008751] hover:underline">{issue.watchers} watcher</span>
                   </div>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 text-gray-400">
                       {issue.comments > 0 && <span className="flex items-center text-xs"><MessageSquare size={14} className="mr-1"/> {issue.comments}</span>}
                       {issue.images > 0 && <span className="flex items-center text-xs"><ImageIcon size={14} className="mr-1"/> {issue.images}</span>}
                    </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueList;