import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Store } from 'lucide-react';
import { Vendor } from '../../types';

interface VendorListProps {
  onAdd: () => void;
  onSelect: (vendor: Vendor) => void;
}

const mockVendors: Vendor[] = [
  { id: 1, name: 'Chevron', address: '2751 N Monroe St, Tallahassee, FL', phone: '850-385-2974', contactName: 'Jamie McDonald', labels: ['Sample'] },
  { id: 2, name: 'Chevron', address: '4340 Fulton Industrial Blvd SW, Atlanta, GA', phone: '404-691-4875', contactName: 'Jose Valdespino', labels: ['Sample'] },
  { id: 3, name: 'Discount Tire', address: '3200 6th Ave S, Birmingham, AL', phone: '205-323-7282', website: 'http://www.mavistire.com', contactName: 'James Wolf', labels: ['Sample'] },
  { id: 4, name: 'Discount Tire', address: '6401 Midlothian Turnpike, Richmond, VA', phone: '804-716-2231', website: 'http://www.mavistire.com', contactName: 'LeAnn Peck', labels: ['Sample'] },
  { id: 5, name: 'Firestone Complete Auto Care', address: '4619 Hwy 280 S, Birmingham, AL', phone: '205-238-6327', website: 'https://www.firestonecompleteautocare.com', contactName: 'Micky Wilson', labels: ['Sample'] },
  { id: 6, name: 'Jiffy Lube', address: '3925 Western Blvd, Raleigh, NC', phone: '919-851-9767', website: 'https://www.jiffylube.com/', contactName: 'Dan Leibel', labels: ['Sample'] },
];

const VendorList: React.FC<VendorListProps> = ({ onAdd, onSelect }) => {
  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
           <button className="text-[#008751] font-medium text-sm flex items-center gap-1"><Store size={16}/> Find Shops <span className="bg-orange-100 text-orange-800 text-[10px] px-1 rounded">New</span></button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Vendor
           </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
         <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#008751] text-[#008751]">All</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Charging</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Fuel</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Service</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Tools</button>
         <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
           <Plus size={14} /> Add Tab
         </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Classification <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Contact Name <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Labels <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> Filters
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 15 of 15
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name ▲</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labels</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(vendor)}>
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                      {vendor.labels?.includes('Sample') && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>}
                   </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                   {vendor.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] hover:underline">
                   {vendor.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] hover:underline">
                   {vendor.website}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {vendor.contactName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   ...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorList;