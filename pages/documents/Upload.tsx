import React from 'react';
import { X, Search, Camera, Link, Image as ImageIcon, Github, Facebook, Instagram, Box, Monitor } from 'lucide-react';

interface DocumentUploadProps {
  onCancel: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
       <div className="bg-white w-full max-w-4xl h-[600px] rounded-lg shadow-2xl overflow-hidden flex">
           {/* Sidebar */}
           <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
               <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 text-[#008751] font-medium">
                   <Monitor size={20} /> My Device
               </div>
               <div className="overflow-y-auto flex-1">
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"><Facebook size={16}/></div> Facebook
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white"><Github size={16}/></div> Github
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600"><Search size={16}/></div> Web Search
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600"><Link size={16}/></div> Link (URL)
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600"><Camera size={16}/></div> Take Photo
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600"><img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-5 h-5"/></div> Google Drive
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center text-white"><Instagram size={16}/></div> Instagram
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_Photos_icon.svg" className="w-5 h-5"/></div> Google Photos
                   </button>
                   <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
                       <div className="w-8 h-8 bg-[#0061d5] rounded-full flex items-center justify-center text-white"><Box size={16}/></div> Box
                   </button>
               </div>
           </div>

           {/* Main Area */}
           <div className="flex-1 flex flex-col bg-[#f5f5f5] relative">
               <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                   <X size={24} />
               </button>
               
               <div className="flex items-center justify-center flex-1">
                   <div className="w-[80%] h-[80%] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-8 bg-[#f5f5f5] hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-20 h-24 bg-gray-300 rounded-lg mb-6 flex items-center justify-center relative">
                            <div className="absolute -top-2 -right-2 bg-gray-100 w-6 h-6 transform rotate-45"></div>
                            <span className="text-white text-4xl font-light">+</span>
                        </div>
                        <h2 className="text-2xl text-gray-700 font-normal mb-2">Select Files to Upload</h2>
                        <p className="text-gray-400">or Drag and Drop, Copy and Paste Files</p>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default DocumentUpload;