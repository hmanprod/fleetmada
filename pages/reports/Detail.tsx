import React from 'react';
import { ArrowLeft, Save, Share2, Download, Printer, Filter, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Report } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ReportDetailProps {
  report: Report | null;
  onBack: () => void;
}

const mockData = [
    { vehicle: 'HF109', service: 0, fuel: 108.0, other: 1845.6, total: 1953.6, costPerMeter: 65.2 },
    { vehicle: 'HV101', service: 0, fuel: 127.8, other: 2066.6, total: 2194.4, costPerMeter: 26.4 },
    { vehicle: 'HC101', service: 7053.6, fuel: 128.2, other: 16622.2, total: 23804.0, costPerMeter: 94.0 },
    { vehicle: 'BSA107TRNS', service: 1621.6, fuel: 2207.8, other: 4414.6, total: 8244.0, costPerMeter: 55.8 },
    { vehicle: 'BSA105TRNS', service: 1597.6, fuel: 1288.2, other: 3816.4, total: 6702.2, costPerMeter: 52.8 },
    { vehicle: 'MV105TRNS', service: 14972.6, fuel: 1927.8, other: 8841.4, total: 25741.8, costPerMeter: 202.6 },
    { vehicle: 'MV109TRNS', service: 4561.2, fuel: 1303.6, other: 8935.8, total: 14800.6, costPerMeter: 105.8 },
    { vehicle: 'BSA111TRNS', service: 0, fuel: 2109.6, other: 8076.4, total: 10186.0, costPerMeter: 79.6 },
    { vehicle: 'MV106TRNS', service: 14871.8, fuel: 1295.8, other: 5161.8, total: 21329.4, costPerMeter: 138.6 },
    { vehicle: 'MV112TRNS', service: 4517.8, fuel: 1656.6, other: 5278.6, total: 11453.0, costPerMeter: 76.4 },
];

const chartData = [
    { name: 'Mi', value: 25 },
    { name: 'Km', value: 0 },
    { name: 'Hr', value: 65 },
];

const pieData = [
    { name: 'Service Cost', value: 38.3, color: '#fbbf24' },
    { name: 'Fuel Cost', value: 7.6, color: '#34d399' },
    { name: 'Other Cost', value: 54.1, color: '#9ca3af' },
];

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack }) => {
  if (!report) return <div>Report not found</div>;

  const isOperatingCost = report.id === 'operating-costs';
  
  // A simplified placeholder for other reports to show flexibility, but we focus on Operating Cost Summary styling
  if (!isOperatingCost && report.id !== 'expense-summary') {
      return (
          <div className="p-8">
              <button onClick={onBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"><ArrowLeft size={16}/> Reports</button>
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <p className="mt-4 text-gray-500">Detailed view for {report.title} is under construction. Please check "Operating Cost Summary" for the full demo.</p>
          </div>
      )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
          <div>
             <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
               <button onClick={onBack} className="hover:underline">Reports</button> / {report.title}
             </div>
          </div>
          <div className="flex gap-2">
             <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Save size={16} /> Save
             </button>
             <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Share2 size={16} /> Share
             </button>
             <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Download size={16} /> Export CSV <ChevronDown size={14} />
             </button>
             <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Printer size={16} /> Print
             </button>
          </div>
       </div>

       {/* Main Content */}
       <div className="p-6 max-w-[1800px] w-full mx-auto space-y-6">
           
           {/* Summary Cards */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{report.title}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats */}
                    <div className="space-y-6">
                        <div>
                            <div className="text-sm text-gray-500">Total Cost (Filtered)</div>
                            <div className="text-3xl font-bold text-[#008751]">Ar517,708.00</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Service Costs (Filtered)</span>
                                <span className="font-medium text-[#008751]">Ar198,264.40</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Fuel Costs (Filtered)</span>
                                <span className="font-medium text-[#008751]">Ar39,499.40</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Other Costs (Filtered)</span>
                                <span className="font-medium text-[#008751]">Ar279,944.20</span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="h-48">
                        <div className="text-xs text-gray-500 text-center mb-2">Average Cost/Meter</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barCategoryGap="20%">
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
                                <RechartsTooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-48 relative">
                        <div className="text-xs text-gray-500 text-center mb-2">Cost Breakdown</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend 
                                    layout="horizontal" 
                                    verticalAlign="bottom" 
                                    align="center"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
           </div>

           {/* Filter Bar */}
           <div className="flex flex-wrap gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Group: Vehicle Group <ChevronDown size={14}/>
                </button>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Filter size={14} /> Filters
                </button>
                <div className="text-sm text-gray-600">1 filter applied</div>
                <button className="text-[#008751] text-sm font-medium hover:underline">Clear all</button>
                
                <div className="flex-1"></div>

                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Columns <ChevronDown size={14}/>
                </button>
                <div className="text-sm text-gray-500">1-47 of 47</div>
                <div className="flex gap-1">
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
                </div>
           </div>

           {/* Table */}
           <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Service Costs (Filtered)</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Fuel Costs (Filtered)</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Other Costs (Filtered)</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Total Cost (Filtered)</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Cost/Meter (Filtered)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Group Header Row Mockup */}
                        <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-2 font-bold text-gray-700 text-xs uppercase">Alabama</td>
                        </tr>
                        {mockData.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-[#008751] hover:underline cursor-pointer font-medium">{row.vehicle}</td>
                                <td className="px-6 py-3 text-right">Ar{row.service.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right">Ar{row.fuel.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right">Ar{row.other.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right font-medium">Ar{row.total.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right text-gray-500">Ar{row.costPerMeter} <span className="text-[10px]">/hr</span></td>
                            </tr>
                        ))}
                         <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-2 font-bold text-gray-700 text-xs uppercase">Tennessee</td>
                        </tr>
                        {mockData.slice(3, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-[#008751] hover:underline cursor-pointer font-medium">{row.vehicle}</td>
                                <td className="px-6 py-3 text-right">Ar{row.service.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right">Ar{row.fuel.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right">Ar{row.other.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right font-medium">Ar{row.total.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right text-gray-500">Ar{row.costPerMeter} <span className="text-[10px]">/mi</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
           </div>
       </div>
    </div>
  );
};

export default ReportDetail;