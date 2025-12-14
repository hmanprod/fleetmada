import React from 'react';
import { Search, ChevronDown, Filter, ChevronRight, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

const ReplacementAnalysis: React.FC = () => {
  const chartData = [
    { year: 1, cost: 2500, minCost: 1500 },
    { year: 2, cost: 2300, minCost: 1500 },
    { year: 3, cost: 2100, minCost: 1500 },
    { year: 4, cost: 1900, minCost: 1500 },
    { year: 5, cost: 1800, minCost: 1500 },
    { year: 6, cost: 1750, minCost: 1500 },
    { year: 7, cost: 1700, minCost: 1500 }, // Optimal point
    { year: 8, cost: 1850, minCost: 1500 },
  ];

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analyse de remplacement</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-center items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Analyse de remplacement de véhicule</h2>
          </div>
          
          <div className="h-[400px] w-full relative">
              <div className="absolute -left-10 top-1/2 -rotate-90 transform text-sm font-bold text-gray-700">Coût annuel par kilomètre</div>
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4db6ac" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4db6ac" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" />
                      <YAxis 
                        tickFormatter={(value) => `Ar${(value / 1000).toFixed(2)}/km`} 
                        domain={[0, 3000]}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Area type="monotone" dataKey="cost" stroke="#009688" fillOpacity={1} fill="url(#colorCost)" />
                      {/* Minimum Cost Line */}
                      <ReferenceLine y={1500} stroke="teal" strokeDasharray="3 3">
                          <Label value="Coût minimum de possession" position="insideTopLeft" fill="teal" fontSize={12} />
                      </ReferenceLine>
                      {/* Optimal Replacement Line */}
                      <ReferenceLine x={7} stroke="orange" strokeDasharray="3 3" strokeWidth={2}>
                          <Label value="Remplacement optimal" position="insideTopRight" angle={-90} offset={20} fill="orange" fontSize={12} />
                          <Label value="Remplacement estimé" position="insideTopRight" angle={-90} offset={-10} fill="gray" fontSize={12} />
                      </ReferenceLine>
                  </AreaChart>
              </ResponsiveContainer>
              <div className="text-center text-sm font-bold text-gray-700 mt-2">Âge du véhicule</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Lifecycle Estimates & Acquisition & Disposal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
              <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Estimations du cycle de vie</h3>
                  <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 text-right">Durée de vie estimée</label>
                          <div className="col-span-2 relative">
                              <input type="number" defaultValue="96" className="w-full p-2 border border-gray-300 rounded-md pr-16 focus:ring-[#008751] focus:border-[#008751]" />
                              <span className="absolute right-3 top-2 text-gray-500 text-sm">mois</span>
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 text-right">Utilisation annuelle estimée</label>
                          <div className="col-span-2 relative">
                              <input type="number" defaultValue="20000" className="w-full p-2 border border-gray-300 rounded-md pr-20 focus:ring-[#008751] focus:border-[#008751]" />
                              <span className="absolute right-3 top-2 text-gray-500 text-sm">kilomètres</span>
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 text-right">Efficacité carburant estimée</label>
                          <div className="col-span-2 relative">
                              <input type="number" defaultValue="15" className="w-full p-2 border border-gray-300 rounded-md pr-16 focus:ring-[#008751] focus:border-[#008751]" />
                              <span className="absolute right-3 top-2 text-gray-500 text-sm">L/100km</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Acquisition</h3>
                  <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700 text-right">Prix d'achat</label>
                      <div className="col-span-2 relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">Ar</span>
                          <input type="number" defaultValue="50000" className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                      </div>
                  </div>
              </div>

              <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Cession</h3>
                  <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 text-right flex items-center justify-end gap-1">Coût de cession estimé <HelpCircle size={14} className="text-gray-400"/></label>
                          <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2 text-gray-500 text-sm">Ar</span>
                              <input type="number" defaultValue="1000" className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 text-right flex items-center justify-end gap-1">Valeur de récupération <HelpCircle size={14} className="text-gray-400"/></label>
                          <div className="col-span-2 relative">
                              <input type="number" defaultValue="20" className="w-full p-2 border border-gray-300 rounded-md pr-32 focus:ring-[#008751] focus:border-[#008751]" />
                              <span className="absolute right-3 top-2 text-gray-500 text-sm">% du prix d'achat</span>
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 text-right">Méthode d'amortissement</label>
                          <div className="col-span-2 flex gap-4">
                              <label className="flex items-center gap-2">
                                  <input type="radio" name="depreciation" defaultChecked className="text-[#008751] focus:ring-[#008751]"/>
                                  <span className="text-sm text-gray-700">Dégressif double</span>
                              </label>
                              <label className="flex items-center gap-2">
                                  <input type="radio" name="depreciation" className="text-[#008751] focus:ring-[#008751]"/>
                                  <span className="text-sm text-gray-700">Somme des années</span>
                              </label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Service & Fuel Cost Estimates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-8">
                  {/* Service Costs */}
                  <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Estimations coûts d'entretien</h3>
                      <div className="space-y-3">
                          {[
                              { y: 1, v: 1500 }, { y: 2, v: 1500 }, { y: 3, v: 1500 }, { y: 4, v: 300 },
                              { y: 5, v: 1350 }, { y: 6, v: 2500 }, { y: 7, v: 2000 }, { y: 8, v: 10000 }
                          ].map(item => (
                              <div key={item.y} className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 w-16">Année {item.y}</span>
                                  <div className="relative flex-1">
                                      <span className="absolute left-2 top-1.5 text-gray-500 text-sm">Ar</span>
                                      <input type="number" defaultValue={item.v} className="w-full p-1 pl-6 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Fuel Costs */}
                  <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Estimations coûts carburant</h3>
                      <div className="space-y-3">
                          {[
                              { y: 1, v: 1.5 }, { y: 2, v: 1.6 }, { y: 3, v: 1.75 }, { y: 4, v: 1.9 },
                              { y: 5, v: 2 }, { y: 6, v: 2.1 }, { y: 7, v: 2.3 }, { y: 8, v: 2.5 }
                          ].map(item => (
                              <div key={item.y} className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 w-16">Année {item.y}</span>
                                  <div className="relative flex-1">
                                      <span className="absolute left-2 top-1.5 text-gray-500 text-sm">Ar</span>
                                      <input type="number" defaultValue={item.v} className="w-full p-1 pl-6 pr-12 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
                                      <span className="absolute right-2 top-1.5 text-gray-500 text-sm">/ litre</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ReplacementAnalysis;