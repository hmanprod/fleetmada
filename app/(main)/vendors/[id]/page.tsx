'use client';

import React from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, MapPin, Phone, Globe, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Vendor } from '@/types';

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Mock vendor data - in real app, this would come from API/database
  const vendor: Vendor = {
    id: params.id,
    name: 'Chevron',
    address: '2751 N Monroe St, Tallahassee, FL',
    phone: '850-385-2974',
    website: 'https://www.chevron.com',
    contactName: 'Jamie McDonald',
    labels: ['Sample', 'Fuel'],
    classification: ['Fuel Station'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleBack = () => {
    router.push('/dashboard/vendors');
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page
    console.log('Edit vendor:', vendor.id);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
       
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
             <button onClick={handleBack} className="hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={16}/> Vendors</button>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-6">
                 <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600 border-4 border-white shadow-sm">
                     {vendor.name.charAt(0)}
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{vendor.name}</h1>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div>
                            <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Classification</span>
                            <span className="font-medium text-gray-900">Fuel Station</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Contact</span>
                            <span className="font-medium text-gray-900">{vendor.contactName || '—'}</span>
                        </div>
                    </div>
                 </div>
             </div>
             <div className="flex gap-2">
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <MoreHorizontal size={16} />
                </button>
                 <button onClick={handleEdit} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit2 size={16} /> Edit
                </button>
             </div>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white border-b border-gray-200 px-8">
           <div className="flex gap-6 overflow-x-auto">
               {['Overview', 'Transactions', 'Service History', 'Locations', 'Notes'].map((tab, idx) => (
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                     <h2 className="text-lg font-bold text-gray-900">Vendor Information</h2>
                  </div>
                  <div className="p-6">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Details</h3>
                      <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Vendor Name</span>
                              <span className="col-span-2 font-medium text-gray-900">{vendor.name}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Phone</span>
                              <span className="col-span-2 text-[#008751] flex items-center gap-2">
                                <Phone size={14} />
                                {vendor.phone}
                              </span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Website</span>
                              <span className="col-span-2 text-[#008751] flex items-center gap-2">
                                <Globe size={14} />
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {vendor.website}
                                </a>
                              </span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Contact Person</span>
                              <span className="col-span-2 text-gray-900">{vendor.contactName || '—'}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Address</span>
                              <span className="col-span-2 text-gray-900 flex items-center gap-2">
                                <MapPin size={14} />
                                {vendor.address}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Service History */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Recent Service History</h2>
                     <button className="text-[#008751] text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="text-gray-300 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No service history found</p>
                  </div>
              </div>

              {/* Fuel Transactions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Recent Fuel Transactions</h2>
                     <button className="text-[#008751] text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="text-gray-300 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16M9 8h6" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No fuel transactions found</p>
                  </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 py-4">
                  Created recently · Updated recently
              </div>

          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[400px] flex flex-col">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Labels</h2>
                 </div>
                 <div className="p-6 flex-1">
                     <div className="flex flex-wrap gap-2">
                         {vendor.labels?.map(label => (
                             <span key={label} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                 {label}
                             </span>
                         ))}
                     </div>
                 </div>
             </div>

             {/* Notes */}
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[400px] flex flex-col">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Notes</h2>
                 </div>
                 <div className="p-6 flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                     <svg className="mx-auto h-8 w-8 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                     </svg>
                     <p className="text-sm">Add notes about this vendor</p>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}