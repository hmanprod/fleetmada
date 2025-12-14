import React from 'react';
import { ArrowLeft, Search, HelpCircle, Building2, User, Users, Grid, Settings as SettingsIcon, LayoutDashboard, Car, ClipboardCheck, AlertTriangle, Clock, Hammer, Box, Fuel, BarChart3, ExternalLink } from 'lucide-react';
import { ViewState } from '../../types';

interface SettingsLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onBackToApp: () => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, currentView, onChangeView, onBackToApp }) => {
  
  const MenuItem = ({ label, view, icon: Icon }: { label: string, view: ViewState | null, icon?: React.ElementType }) => (
    <button
      onClick={() => view && onChangeView(view)}
      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors mb-0.5 ${
        view === currentView 
          ? 'bg-[#e6f4ea] text-[#008751] font-semibold' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-gray-400" />}
        {label}
      </div>
    </button>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon?: React.ElementType, title: string }) => (
    <div className="flex items-center gap-2 px-3 py-2 mt-4 mb-1 text-xs font-bold text-gray-900 uppercase tracking-wider">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {title}
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Settings Sidebar */}
      <div className="w-64 bg-[#f9fafb] border-r border-gray-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="p-4 sticky top-0 bg-[#f9fafb] z-10">
          <button 
            onClick={onBackToApp}
            className="flex items-center gap-1 text-[#008751] text-sm font-medium hover:underline mb-4"
          >
            <ArrowLeft size={16} /> Retour à FleetMada
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher" 
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] bg-white" 
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs border border-gray-300 rounded px-1">/</div>
          </div>
        </div>

        <div className="px-2 pb-8">
          <SectionHeader icon={User} title="Hery RABOTOVAO" />
          <button className="w-full text-left px-3 py-1 text-xs text-red-600 hover:underline mb-2 pl-8">Se déconnecter</button>
          <MenuItem label="Profil utilisateur" view={ViewState.SETTINGS_USER_PROFILE} />
          <MenuItem label="Paramètres de notification" view={null} />
          <MenuItem label="Tableaux de bord personnalisés" view={null} />
          <MenuItem label="Mes vues enregistrées" view={null} />
          <MenuItem label="Identifiant & Mot de passe" view={ViewState.SETTINGS_LOGIN} />
          <MenuItem label="Apparence & Thème" view={null} />
          <MenuItem label="Gérer les clés API" view={null} />

          <SectionHeader icon={Building2} title="ONNO" />
          <MenuItem label="Paramètres généraux" view={ViewState.SETTINGS_GENERAL} />
          <MenuItem label="Facturation & Abonnements" view={null} />
          <MenuItem label="Exporter les données du compte" view={null} />

          <SectionHeader icon={Users} title="Accès utilisateur" />
          <div className="flex items-center justify-between pr-2">
             <MenuItem label="Gérer les utilisateurs" view={null} />
             <ExternalLink size={12} className="text-gray-400" />
          </div>
          <MenuItem label="Sécurité" view={null} />
          <MenuItem label="Rôles" view={null} />
          <MenuItem label="Jeux d'enregistrements" view={null} />

          <SectionHeader icon={Grid} title="Intégrations" />
          <div className="flex items-center justify-between pr-2">
             <MenuItem label="Répertoire d'intégrations" view={null} />
             <ExternalLink size={12} className="text-gray-400" />
          </div>
          <MenuItem label="Liens d'intégration" view={null} />
          <MenuItem label="Webhooks" view={null} />
          <MenuItem label="Connexions externes" view={null} />
          <MenuItem label="Connecteurs SAML" view={null} />

          <SectionHeader icon={SettingsIcon} title="Organisation" />
          <MenuItem label="Groupes & Sous-groupes" view={null} />
          <MenuItem label="Champs personnalisés" view={null} />
          <MenuItem label="Vues enregistrées" view={null} />
          <MenuItem label="Étiquettes" view={null} />

          <SectionHeader icon={LayoutDashboard} title="Tableau de bord" />
          <MenuItem label="Widgets personnalisés" view={null} />

          <SectionHeader icon={Car} title="Véhicules" />
          <MenuItem label="Statuts de véhicule" view={null} />
          <MenuItem label="Types de véhicule" view={null} />
          <MenuItem label="Types de dépenses" view={null} />
          <MenuItem label="Paramètres de dépenses" view={null} />
          <MenuItem label="Paramètres pneus" view={null} />

          <SectionHeader icon={ClipboardCheck} title="Inspections" />
          <MenuItem label="Paramètres d'inspection" view={null} />

          <SectionHeader icon={AlertTriangle} title="Problèmes" />
          <MenuItem label="Priorités de problème" view={null} />
          <MenuItem label="Règles de défaut" view={null} />

          <SectionHeader icon={Clock} title="Rappels" />
          <MenuItem label="Paramètres rappels d'entretien" view={null} />
          <MenuItem label="Types de renouvellement véhicule" view={null} />
          <MenuItem label="Types de renouvellement contact" view={null} />

          <SectionHeader icon={Hammer} title="Entretien" />
          <MenuItem label="Paramètres de maintenance" view={null} />
          <MenuItem label="Statuts d'ordre de travail" view={null} />
          <MenuItem label="Codes de raison de réparation" view={null} />
          <MenuItem label="Codes de priorité de réparation" view={null} />
          <MenuItem label="Codes Système/Assemblage/Composant" view={null} />

          <SectionHeader icon={Box} title="Pièces & Inventaire" />
          <MenuItem label="Emplacements de pièces" view={null} />
          <MenuItem label="Catégories de pièces" view={null} />
          <MenuItem label="Fabricants de pièces" view={null} />
          <MenuItem label="Unités de mesure" view={null} />

          <SectionHeader icon={Fuel} title="Carburant & Énergie" />
          <MenuItem label="Paramètres carburant & énergie" view={null} />
          <MenuItem label="Types de carburant" view={null} />

          <SectionHeader icon={BarChart3} title="Rapports" />
          <MenuItem label="Rapports enregistrés" view={null} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-10">
        <div className="max-w-4xl mx-auto">
           {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;