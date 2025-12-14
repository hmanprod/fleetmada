import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Contact } from '../../types';

interface ContactListProps {
  onAdd: () => void;
  onSelect: (contact: Contact) => void;
}

const mockContacts: Contact[] = [
  { id: 1, firstName: 'Allison', lastName: 'Curtis', email: 'acurtis@example.com', status: 'No Access', classifications: ['Employee', 'Operator'], group: 'Atlanta', image: 'https://source.unsplash.com/random/100x100/?woman,face' },
  { id: 2, firstName: 'Amy', lastName: 'Alito', email: 'aalito@example.com', status: 'No Access', classifications: ['Employee'], group: 'Atlanta', image: 'https://source.unsplash.com/random/100x100/?woman,smile' },
  { id: 3, firstName: 'Andreas', lastName: 'Cassin', email: 'acassin@example.com', status: 'No Access', classifications: ['Employee', 'Operator'], group: 'Nashville' },
  { id: 4, firstName: 'Andy', lastName: 'Miller', email: '', status: 'No Access', classifications: ['Technician'], group: 'Birmingham', image: 'https://source.unsplash.com/random/100x100/?man,face' },
  { id: 5, firstName: 'Ashley', lastName: 'Atkins', email: 'aatkins@example.com', status: 'No Access', classifications: ['Employee'], group: 'Columbia', image: 'https://source.unsplash.com/random/100x100/?woman,glasses' },
  { id: 6, firstName: 'Ashley', lastName: 'Runolfsdottir', email: 'arunolfsdottir@example.com', status: 'No Access', classifications: ['Employee', 'Operator'], group: 'Tallahassee' },
  { id: 7, firstName: 'Aubrey', lastName: 'Boyer', email: 'aboyer@example.com', status: 'No Access', classifications: ['Employee', 'Operator'], group: 'Atlanta' },
  { id: 8, firstName: 'Ben', lastName: 'Birch', email: 'bbirch@example.com', status: 'No Access', classifications: ['Technician'], group: 'Nashville', image: 'https://source.unsplash.com/random/100x100/?man,beard' },
  { id: 9, firstName: 'Brianna', lastName: 'Kovacek', email: 'bkovacek@example.com', status: 'No Access', classifications: ['Employee', 'Operator'], group: 'Georgia' },
  { id: 10, firstName: 'Carlos', lastName: 'Garcia', email: 'cgarcia@example.com', status: 'No Access', classifications: ['Employee', 'Operator'], group: 'Nashville', image: 'https://source.unsplash.com/random/100x100/?man,hispanic' },
  { id: 11, firstName: 'Hery', lastName: 'RABOTOVAO', email: 'hmanprod@gmail.com', status: 'Active', classifications: [], userType: 'Account Owner' },
];

const ContactList: React.FC<ContactListProps> = ({ onAdd, onSelect }) => {
  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Contact
           </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
         <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#008751] text-[#008751]">All</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Users</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">No User Access</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Archived</button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               User Status <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               User Type <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Classification <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> Filters
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 47 of 47
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Count</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classifications</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Vehicles</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(contact)}>
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-3">
                      {contact.image ? (
                          <img src={contact.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                          <div className="h-8 w-8 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold">
                              {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                      )}
                      <div>
                          <span className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</span>
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] hover:underline">
                   {contact.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   {contact.status === 'Active' ? (
                       <span className="flex items-center gap-1.5 text-green-700 font-medium">
                           <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                       </span>
                   ) : (
                       <span className="flex items-center gap-1.5 text-gray-500">
                           <div className="w-2 h-2 rounded-full bg-gray-400"></div> No Access
                       </span>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {contact.userType || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {contact.status === 'Active' ? '0' : '—'}
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                       {contact.classifications.map(c => (
                           <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                               {c}
                           </span>
                       ))}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {contact.group || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;