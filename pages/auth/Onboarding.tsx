import React, { useState } from 'react';
import { Check, ChevronRight, Truck, Wrench, BarChart3, ShieldCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, title: 'Profil de la flotte' },
    { id: 2, title: 'Objectifs' },
    { id: 3, title: 'Confirmation' },
  ];

  const Step1Profile = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Parlez-nous de votre flotte</h2>
        <p className="text-gray-600 mt-2">Nous personnaliserons votre expérience en fonction de votre secteur et de votre taille.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Combien de véhicules gérez-vous ?</label>
        <div className="grid grid-cols-3 gap-3">
          {['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => (
             <button key={size} type="button" className="border border-gray-300 rounded-md py-3 px-4 text-sm font-medium hover:border-[#008751] hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-[#008751] focus:border-transparent transition-all">
                {size}
             </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quel est votre secteur principal ?</label>
        <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#008751] focus:border-[#008751] sm:text-sm rounded-md bg-white border">
          <option>Construction / BTP</option>
          <option>Paysagisme</option>
          <option>Logistique / Transport</option>
          <option>Gouvernement / Municipal</option>
          <option>Autre</option>
        </select>
      </div>

      <button 
        onClick={() => setStep(2)}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008751] hover:bg-[#007043] mt-8"
      >
        Continuer <ChevronRight size={16} />
      </button>
    </div>
  );

  const Step2Goals = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Quelles sont vos priorités ?</h2>
        <p className="text-gray-600 mt-2">Sélectionnez tout ce qui s'applique pour nous aider à vous guider.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
            { icon: Wrench, title: 'Suivi de l\'entretien', desc: 'Plannings, historique et coûts' },
            { icon: Truck, title: 'Gestion des actifs', desc: 'Affectations et historique de localisation' },
            { icon: ShieldCheck, title: 'Inspections & Conformité', desc: 'DVIR et conformité sécurité' },
            { icon: BarChart3, title: 'Réduire les coûts', desc: 'Analyse carburant et coût total de possession' }
        ].map((item, idx) => (
             <div key={idx} className="relative flex items-start p-4 border border-gray-200 rounded-lg hover:border-[#008751] hover:bg-green-50 cursor-pointer transition-all">
                <div className="flex items-center h-5">
                  <input id={`goal-${idx}`} type="checkbox" className="focus:ring-[#008751] h-4 w-4 text-[#008751] border-gray-300 rounded" />
                </div>
                <div className="ml-3 flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full border border-gray-200">
                      <item.icon className="h-5 w-5 text-[#008751]" />
                  </div>
                  <div>
                    <label htmlFor={`goal-${idx}`} className="font-medium text-gray-700">{item.title}</label>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
             </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
         <button 
          onClick={() => setStep(1)}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Retour
        </button>
        <button 
          onClick={() => setStep(3)}
          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008751] hover:bg-[#007043]"
        >
          Continuer <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const Step3Ready = () => (
    <div className="text-center space-y-6 animate-in fade-in duration-500 py-8">
       <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <Check className="h-10 w-10 text-[#008751]" />
       </div>
       
       <h2 className="text-2xl font-bold text-gray-900">Vous êtes prêt !</h2>
       <p className="text-gray-600 max-w-sm mx-auto">
         Nous avons configuré votre compte en fonction de vos préférences. Commençons par ajouter votre premier véhicule.
       </p>

       <button 
        onClick={onComplete}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008751] hover:bg-[#007043]"
      >
        Aller au tableau de bord
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 px-4">
       <div className="w-full max-w-lg">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-12 px-2">
            {steps.map((s, idx) => (
               <div key={s.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${step >= s.id ? 'bg-[#008751] text-white' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>
                    {step > s.id ? <Check size={16} /> : s.id}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step >= s.id ? 'text-[#008751]' : 'text-gray-500'}`}>{s.title}</span>
               </div>
            ))}
             {/* Progress Line Background */}
            <div className="absolute top-[84px] left-0 w-full h-[2px] bg-gray-200 -z-0 hidden md:block" style={{ width: 'calc(100% - 32px)', left: '16px', maxWidth: '30rem', margin: '0 auto', right: 0 }}></div> 
             {/* Simple Line Mockup for the specific width constraints */}
             <div className="absolute w-full max-w-md h-[2px] bg-gray-200 -z-10 top-[80px] left-1/2 transform -translate-x-1/2">
                <div 
                   className="h-full bg-[#008751] transition-all duration-300 ease-in-out" 
                   style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
             </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
             {step === 1 && <Step1Profile />}
             {step === 2 && <Step2Goals />}
             {step === 3 && <Step3Ready />}
          </div>
       </div>
    </div>
  );
};

export default Onboarding;