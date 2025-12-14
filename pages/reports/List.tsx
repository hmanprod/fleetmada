import React from 'react';
import { Search, FileText, Star, Save, Share2, LayoutGrid, List as ListIcon, ChevronDown, Car, Wrench, AlertTriangle, Users, Box, Fuel, ClipboardCheck, ArrowUpDown } from 'lucide-react';
import { Report } from '../../types';

interface ReportListProps {
  onSelect: (report: Report) => void;
}

const mockReports: Report[] = [
  { id: 'contact-renewal', title: 'Contact Renewal Reminders', description: 'Lists all date based reminders for contacts.', category: 'Contacts' },
  { id: 'contacts-list', title: 'Contacts List', description: 'List of all basic contacts information.', category: 'Contacts' },
  { id: 'cost-comparison', title: 'Cost Comparison by Year in Service', description: 'Analysis of total vehicle costs per meter (mile/kilometer/hour) based on when in the vehicle\'s life costs occurred.', category: 'Vehicles' },
  { id: 'cost-meter-trend', title: 'Cost/Meter Trend', description: 'Analysis of total vehicle costs per meter (mile/kilometer/hour) over time.', category: 'Vehicles' },
  { id: 'expense-summary', title: 'Expense Summary', description: 'Aggregate expense costs grouped by expense type or vehicle group.', category: 'Vehicles' },
  { id: 'expenses-vehicle', title: 'Expenses by Vehicle', description: 'Listing of all expense entries by vehicle.', category: 'Vehicles' },
  { id: 'faults-summary', title: 'Faults Summary', description: 'Listing of summarized fault metrics for particular fault codes and vehicles.', category: 'Issues' },
  { id: 'fuel-entries-vehicle', title: 'Fuel Entries by Vehicle', description: 'Listing of fuel entries by vehicle.', category: 'Fuel' },
  { id: 'fuel-summary', title: 'Fuel Summary', description: 'Listing of summarized fuel metrics by vehicles.', category: 'Fuel' },
  { id: 'fuel-summary-location', title: 'Fuel Summary by Location', description: 'Aggregate fuel volume and price data grouped by location and fuel type.', category: 'Fuel' },
  { id: 'group-changes', title: 'Group Changes', description: 'List updates to every vehicle\'s group.', category: 'Vehicles' },
  { id: 'inspection-failures', title: 'Inspection Failures List', description: 'Listing of all failed inspection items.', category: 'Inspections' },
  { id: 'inspection-schedules', title: 'Inspection Schedules', description: 'Listing of all inspection schedules.', category: 'Inspections' },
  { id: 'inspection-submission', title: 'Inspection Submission List', description: 'Listing of all inspection submissions.', category: 'Inspections' },
  { id: 'issues-list', title: 'Issues List', description: 'Lists basic details of all vehicle-related issues.', category: 'Issues' },
  { id: 'maintenance-cat', title: 'Maintenance Categorization Summary', description: 'Aggregate service data grouped by VMRS Category, System, or Reason for Repair Codes.', category: 'Service' },
  { id: 'operating-costs', title: 'Operating Costs Summary', description: 'Summary of costs associated with vehicles.', category: 'Vehicles' },
  { id: 'parts-vehicle', title: 'Parts by Vehicle', description: 'Listing of all parts used on each vehicle.', category: 'Parts' },
  { id: 'repair-priority', title: 'Repair Priority Class Summary', description: 'Aggregate Service Data breakdown of Scheduled, Non-Scheduled, and Emergency Repairs.', category: 'Service' },
  { id: 'service-entries', title: 'Service Entries Summary', description: 'Listing of summarized service history for vehicles.', category: 'Service' },
  { id: 'service-history', title: 'Service History by Vehicle', description: 'Listing of all service by vehicle grouped by entry or task.', category: 'Service' },
  { id: 'service-compliance', title: 'Service Reminder Compliance', description: 'Shows history of completed Service Reminders as On Time/Late.', category: 'Service' },
  { id: 'service-reminders', title: 'Service Reminders', description: 'Lists all service reminders.', category: 'Service' },
  { id: 'service-task', title: 'Service Task Summary', description: 'Aggregate service data grouped by Service Task.', category: 'Service' },
  { id: 'status-changes', title: 'Status Changes', description: 'List updates to every vehicle\'s status.', category: 'Vehicles' },
];

const ReportList: React.FC<ReportListProps> = ({ onSelect }) => {
  return (
    <div className="flex h-full bg-[#f9fafb]">
       {/* Left Sidebar for Reports */}
       <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto hidden md:block">
           <div className="p-4">
               <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                   <input type="text" placeholder="Search for a Report" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
               </div>
           </div>
           
           <nav className="space-y-1">
               <button className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-[#008751] font-medium text-sm border-l-4 border-[#008751]">
                   <span className="flex items-center gap-3"><FileText size={18}/> Standard Reports</span>
               </button>
               <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium text-sm border-l-4 border-transparent">
                   <span className="flex items-center gap-3"><Star size={18}/> Favorites</span>
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">0</span>
               </button>
               <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium text-sm border-l-4 border-transparent">
                   <span className="flex items-center gap-3"><Save size={18}/> Saved</span>
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">0</span>
               </button>
               <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium text-sm border-l-4 border-transparent">
                   <span className="flex items-center gap-3"><Share2 size={18}/> Shared</span>
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">0</span>
               </button>
           </nav>

           <div className="mt-6 px-4">
               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Report Types</h3>
               <div className="space-y-1">
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><Car size={16}/> Vehicles</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">13</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><ClipboardCheck size={16}/> Vehicle Assignments</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">2</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><ClipboardCheck size={16}/> Inspections</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">4</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><AlertTriangle size={16}/> Issues</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">2</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><Wrench size={16}/> Service</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">8</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><Wrench size={16}/> Work Orders</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">4</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><Users size={16}/> Contacts</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">2</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><Box size={16}/> Parts</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">1</span>
                   </button>
                   <button className="w-full flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900">
                       <span className="flex items-center gap-2"><Fuel size={16}/> Fuel</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">3</span>
                   </button>
               </div>
           </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 p-8 overflow-y-auto">
           <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
               <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
                       <ArrowUpDown size={14} /> Name <ChevronDown size={14} />
                   </button>
                   <div className="flex border border-gray-300 rounded overflow-hidden">
                       <button className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200"><LayoutGrid size={18} /></button>
                       <button className="p-2 bg-white text-gray-500 hover:bg-gray-50 border-l border-gray-300"><ListIcon size={18} /></button>
                   </div>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {mockReports.map(report => (
                   <div 
                    key={report.id} 
                    onClick={() => onSelect(report)}
                    className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-[#008751] hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
                   >
                       <h3 className="font-bold text-gray-900 mb-2">{report.title}</h3>
                       <p className="text-sm text-gray-500 mb-4 flex-1">{report.description}</p>
                       <div className="flex justify-end">
                           <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">{report.category}</span>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

export default ReportList;