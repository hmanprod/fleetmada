import React from 'react';
import { ChevronRight, Car, Clipboard, Users, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ViewState } from '../types';

interface DashboardProps {
    onChangeView: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const chartData = [
    { name: 'Mar', cost: 1200 },
    { name: 'Avr', cost: 1900 },
    { name: 'Mai', cost: 1400 },
    { name: 'Juin', cost: 2400 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenue sur FleetMada, Hery !</h1>
        <p className="text-gray-600 mt-2 text-lg">
           N'hésitez pas à explorer ou à aller directement à ce qui vous intéresse, mais la section "Premiers pas" est le meilleur endroit pour configurer un compte adapté à votre secteur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Getting Started Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
               <div className="flex items-center justify-between mb-2">
                 <h2 className="font-bold text-xl text-gray-800">Premiers pas</h2>
                 <span className="text-sm text-gray-500">10 min</span>
               </div>
               <p className="text-sm text-gray-500 mb-4">Gardez votre flotte en mouvement</p>
               
               <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Réduire les temps d'arrêt</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Inspections</span>
               </div>
            </div>

            <div className="p-0">
               <div 
                 className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
                 onClick={() => onChangeView(ViewState.ADD_VEHICLE)}
               >
                  <div className="mr-4 text-gray-400 group-hover:text-green-600">
                     <Car size={24} />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-sm font-medium text-gray-900">Ajouter votre premier véhicule</h3>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
               </div>

               <div 
                 className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
                 onClick={() => onChangeView(ViewState.INSPECTION_BUILDER)}
               >
                  <div className="mr-4 text-gray-400 group-hover:text-green-600">
                     <Clipboard size={24} />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-sm font-medium text-gray-900">En savoir plus sur les inspections</h3>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
               </div>

               <div className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
                  <div className="mr-4 text-gray-400 group-hover:text-green-600">
                     <Users size={24} />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-sm font-medium text-gray-900">Inviter votre équipe</h3>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
               </div>
            </div>
            
            <div className="p-6 border-t border-gray-100">
                <button className="w-full bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded transition-colors">
                    Continuer
                </button>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
               <span className="bg-gray-100 p-1 rounded"><Activity size={16}/></span> 
               Besoin d'aide ?
             </h3>
             <p className="text-sm text-gray-600 mb-4">
               Laissez-nous vous aider à configurer et à gérer efficacement votre flotte le plus rapidement possible.
             </p>
             <button className="border border-gray-300 rounded px-4 py-2 text-sm font-medium text-gray-700 w-full flex justify-between items-center hover:bg-gray-50">
                Options d'aide <ChevronRight size={16} className="rotate-90" />
             </button>
          </div>
        </div>

        {/* Analytics & Features Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Coûts Totaux</h3>
                    <DollarSign size={20} className="text-gray-400" />
                 </div>
                 <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
                       <Tooltip cursor={{fill: '#f3f4f6'}} />
                       <Bar dataKey="cost" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={30} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                    <div>
                        <span className="block w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-1"></span>
                        Carburant
                    </div>
                     <div>
                        <span className="block w-3 h-3 bg-green-400 rounded-full mx-auto mb-1"></span>
                        Entretien
                    </div>
                     <div>
                        <span className="block w-3 h-3 bg-blue-400 rounded-full mx-auto mb-1"></span>
                        Autres
                    </div>
                 </div>
              </div>

               {/* Service Reminders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-gray-900 mb-6">Rappels d'entretien</h3>
                 <div className="flex justify-around items-center h-40">
                    <div className="text-center">
                        <div className="text-5xl font-light text-yellow-500 mb-2">2</div>
                        <div className="text-sm text-gray-500 font-medium">Bientôt dû</div>
                    </div>
                     <div className="text-center">
                        <div className="text-5xl font-light text-red-500 mb-2">6</div>
                        <div className="text-sm text-gray-500 font-medium">En retard</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Feature Highlights */}
           <div className="bg-green-50 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 border border-green-100">
             <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Capturez le kilométrage et les diagnostics</h3>
                <p className="text-gray-700 mb-4">Temps réel avec les intégrations ELD & télématiques.</p>
                <button className="text-[#008751] font-bold hover:underline flex items-center gap-1">
                   Explorer les intégrations <ChevronRight size={16} />
                </button>
             </div>
             <div className="flex-shrink-0">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Activity size={40} className="text-[#008751]" />
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;