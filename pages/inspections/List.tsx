import React from 'react';
import { LayoutList, Search, Filter, Plus } from 'lucide-react';

interface InspectionListProps {
  onAdd: () => void;
}

const InspectionList: React.FC<InspectionListProps> = ({ onAdd }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-gray-900">Inspection Forms</h1>
         <button 
          onClick={onAdd}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
         >
           <Plus size={20} /> Add Inspection Form
         </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
         <div className="p-4 border-b border-gray-200 flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded" />
             </div>
             <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
               <Filter size={18} /> Filters
             </button>
         </div>
         <div className="p-12 text-center text-gray-500">
            <LayoutList size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No items found. Create your first one!</p>
         </div>
      </div>
    </div>
  );
};

export default InspectionList;