import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ViewState, Issue, ServiceProgram, Contact, Vendor, FuelEntry, Part, Report } from './types';

// Pages - Architecture Next.js App Router
// Les pages sont maintenant dans app/ directory
// Ce fichier App.tsx semble être un ancien composant qui doit être adapté

// Pour l'instant, nous créons des composants de placeholder pour éviter les erreurs de build
// avec les props appropriées pour maintenir la compatibilité
const Dashboard = ({ onChangeView }: { onChangeView: (view: ViewState) => void }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Dashboard - Architecture App Router</h1>
    <p className="text-gray-600">Cette page utilise maintenant l'architecture Next.js App Router.</p>
    <p className="text-sm text-gray-500 mt-2">Les pages sont dans app/ directory.</p>
  </div>
);

const Login = ({ onLogin, onNavigateToRegister }: { onLogin: () => void; onNavigateToRegister: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Connexion</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Page de login - Architecture App Router</p>
      </div>
    </div>
  </div>
);

const Register = ({ onRegister, onNavigateToLogin }: { onRegister: () => void; onNavigateToLogin: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Inscription</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Page d'inscription - Architecture App Router</p>
      </div>
    </div>
  </div>
);

const Onboarding = ({ onComplete }: { onComplete: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Onboarding</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Page d'onboarding - Architecture App Router</p>
      </div>
    </div>
  </div>
);

// Placeholder components avec les bonnes props pour éviter les erreurs d'import
const VehicleList = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Liste des véhicules</h2></div>;
const VehicleCreate = ({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) => <div className="p-6"><h2>Créer un véhicule</h2></div>;
const Assignments = () => <div className="p-6"><h2>Attributions</h2></div>;
const MeterHistory = () => <div className="p-6"><h2>Historique du kilométrage</h2></div>;
const ReplacementAnalysis = () => <div className="p-6"><h2>Analyse de remplacement</h2></div>;
const InspectionList = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Liste des inspections</h2></div>;
const InspectionCreate = ({ onBack }: { onBack: () => void }) => <div className="p-6"><h2>Créer une inspection</h2></div>;
const IssueList = ({ onAdd, onSelect }: { onAdd: () => void; onSelect: (issue: Issue) => void }) => <div className="p-6"><h2>Liste des problèmes</h2></div>;
const IssueCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer un problème</h2></div>;
const IssueDetail = ({ issue, onBack }: { issue: Issue | null; onBack: () => void }) => <div className="p-6"><h2>Détail du problème</h2></div>;
const ServiceHistory = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Historique des services</h2></div>;
const EntryCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer une entrée</h2></div>;
const WorkOrders = () => <div className="p-6"><h2>Ordres de travail</h2></div>;
const ServiceReminders = () => <div className="p-6"><h2>Rappels de service</h2></div>;
const VehicleRenewals = () => <div className="p-6"><h2>Renouvellements de véhicules</h2></div>;
const ServiceTasks = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Tâches de service</h2></div>;
const ServiceTaskCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer une tâche</h2></div>;
const ServicePrograms = ({ onAdd, onSelect }: { onAdd: () => void; onSelect: (program: ServiceProgram) => void }) => <div className="p-6"><h2>Programmes de service</h2></div>;
const ServiceProgramCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer un programme</h2></div>;
const ServiceProgramDetail = ({ onBack, onEdit }: { onBack: () => void; onEdit: () => void }) => <div className="p-6"><h2>Détail du programme</h2></div>;
const ContactList = ({ onAdd, onSelect }: { onAdd: () => void; onSelect: (contact: Contact) => void }) => <div className="p-6"><h2>Liste des contacts</h2></div>;
const ContactCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer un contact</h2></div>;
const ContactDetail = ({ contact, onBack, onEdit }: { contact: Contact | null; onBack: () => void; onEdit: () => void }) => <div className="p-6"><h2>Détail du contact</h2></div>;
const VendorList = ({ onAdd, onSelect }: { onAdd: () => void; onSelect: (vendor: Vendor) => void }) => <div className="p-6"><h2>Liste des fournisseurs</h2></div>;
const VendorCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer un fournisseur</h2></div>;
const VendorDetail = ({ vendor, onBack, onEdit }: { vendor: Vendor | null; onBack: () => void; onEdit: () => void }) => <div className="p-6"><h2>Détail du fournisseur</h2></div>;
const FuelHistory = ({ onAdd, onSelect }: { onAdd: () => void; onSelect: (entry: FuelEntry) => void }) => <div className="p-6"><h2>Historique du carburant</h2></div>;
const FuelEntryCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer une entrée de carburant</h2></div>;
const FuelEntryDetail = ({ entry, onBack }: { entry: FuelEntry | null; onBack: () => void }) => <div className="p-6"><h2>Détail de l'entrée</h2></div>;
const ChargingHistory = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Historique des recharges</h2></div>;
const ChargingEntryCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer une recharge</h2></div>;
const PartList = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Liste des pièces</h2></div>;
const PartCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer une pièce</h2></div>;
const DocumentList = ({ onUpload }: { onUpload: () => void }) => <div className="p-6"><h2>Liste des documents</h2></div>;
const DocumentUpload = ({ onCancel }: { onCancel: () => void }) => <div className="p-6"><h2>Télécharger un document</h2></div>;
const PlaceList = ({ onAdd }: { onAdd: () => void }) => <div className="p-6"><h2>Liste des lieux</h2></div>;
const PlaceCreate = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => <div className="p-6"><h2>Créer un lieu</h2></div>;
const ReportList = ({ onSelect }: { onSelect: (report: Report) => void }) => <div className="p-6"><h2>Liste des rapports</h2></div>;
const ReportDetail = ({ report, onBack }: { report: Report | null; onBack: () => void }) => <div className="p-6"><h2>Détail du rapport</h2></div>;

// Settings Pages
const SettingsLayout = ({ children, currentView, onChangeView, onBackToApp }: { children: React.ReactNode; currentView: ViewState; onChangeView: (view: ViewState) => void; onBackToApp: () => void }) => (
  <div className="p-6">
    <h2>Paramètres</h2>
    {children}
  </div>
);
const SettingsGeneral = () => <div><h3>Paramètres généraux</h3></div>;
const SettingsUserProfile = () => <div><h3>Profil utilisateur</h3></div>;
const SettingsLogin = () => <div><h3>Mot de passe et sécurité</h3></div>;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ServiceProgram | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedFuelEntry, setSelectedFuelEntry] = useState<FuelEntry | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentView(ViewState.ISSUE_DETAILS);
  };

  const handleSelectProgram = (program: ServiceProgram) => {
    setSelectedProgram(program);
    setCurrentView(ViewState.SERVICE_PROGRAM_DETAIL);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentView(ViewState.CONTACT_DETAILS);
  };

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView(ViewState.VENDOR_DETAILS);
  };

  const handleSelectFuelEntry = (entry: FuelEntry) => {
    setSelectedFuelEntry(entry);
    setCurrentView(ViewState.FUEL_ENTRY_DETAILS);
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setCurrentView(ViewState.REPORT_DETAIL);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.LOGIN:
        return <Login onLogin={() => setCurrentView(ViewState.DASHBOARD)} onNavigateToRegister={() => setCurrentView(ViewState.REGISTER)} />;
      
      case ViewState.REGISTER:
        return <Register onRegister={() => setCurrentView(ViewState.ONBOARDING)} onNavigateToLogin={() => setCurrentView(ViewState.LOGIN)} />;

      case ViewState.ONBOARDING:
        return <Onboarding onComplete={() => setCurrentView(ViewState.DASHBOARD)} />;

      case ViewState.ADD_VEHICLE:
        return <VehicleCreate onComplete={() => setCurrentView(ViewState.VEHICLES_LIST)} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />;
      
      case ViewState.INSPECTION_BUILDER:
        return <InspectionCreate onBack={() => setCurrentView(ViewState.INSPECTIONS_LIST)} />;
        
      case ViewState.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} />;
        
      case ViewState.VEHICLES_LIST:
        return <VehicleList onAdd={() => setCurrentView(ViewState.ADD_VEHICLE)} />;

      case ViewState.VEHICLE_ASSIGNMENTS:
        return <Assignments />;

      case ViewState.METER_HISTORY:
        return <MeterHistory />;

      case ViewState.REPLACEMENT_ANALYSIS:
        return <ReplacementAnalysis />;

      case ViewState.INSPECTIONS_LIST:
        return <InspectionList onAdd={() => setCurrentView(ViewState.INSPECTION_BUILDER)} />;

      case ViewState.ISSUES_LIST:
        return <IssueList onAdd={() => setCurrentView(ViewState.ADD_ISSUE)} onSelect={handleSelectIssue} />;

      case ViewState.ADD_ISSUE:
        return <IssueCreate onCancel={() => setCurrentView(ViewState.ISSUES_LIST)} onSave={() => setCurrentView(ViewState.ISSUES_LIST)} />;

      case ViewState.ISSUE_DETAILS:
        return <IssueDetail issue={selectedIssue} onBack={() => setCurrentView(ViewState.ISSUES_LIST)} />;

      case ViewState.SERVICE_HISTORY:
        return <ServiceHistory onAdd={() => setCurrentView(ViewState.ADD_SERVICE_ENTRY)} />;

      case ViewState.ADD_SERVICE_ENTRY:
        return <EntryCreate onCancel={() => setCurrentView(ViewState.SERVICE_HISTORY)} onSave={() => setCurrentView(ViewState.SERVICE_HISTORY)} />;

      case ViewState.WORK_ORDERS:
        return <WorkOrders />;

      case ViewState.SERVICE_REMINDERS:
        return <ServiceReminders />;

      case ViewState.VEHICLE_RENEWALS:
        return <VehicleRenewals />;

      case ViewState.SERVICE_TASKS:
        return <ServiceTasks onAdd={() => setCurrentView(ViewState.ADD_SERVICE_TASK)} />;

      case ViewState.ADD_SERVICE_TASK:
        return <ServiceTaskCreate onCancel={() => setCurrentView(ViewState.SERVICE_TASKS)} onSave={() => setCurrentView(ViewState.SERVICE_TASKS)} />;

      case ViewState.SERVICE_PROGRAMS:
        return <ServicePrograms onAdd={() => setCurrentView(ViewState.ADD_SERVICE_PROGRAM)} onSelect={handleSelectProgram} />;

      case ViewState.ADD_SERVICE_PROGRAM:
        return <ServiceProgramCreate onCancel={() => setCurrentView(ViewState.SERVICE_PROGRAMS)} onSave={() => setCurrentView(ViewState.SERVICE_PROGRAMS)} />;

      case ViewState.SERVICE_PROGRAM_DETAIL:
        return <ServiceProgramDetail onBack={() => setCurrentView(ViewState.SERVICE_PROGRAMS)} onEdit={() => setCurrentView(ViewState.ADD_SERVICE_PROGRAM)} />;

      case ViewState.CONTACTS_LIST:
        return <ContactList onAdd={() => setCurrentView(ViewState.ADD_CONTACT)} onSelect={handleSelectContact} />;

      case ViewState.ADD_CONTACT:
        return <ContactCreate onCancel={() => setCurrentView(ViewState.CONTACTS_LIST)} onSave={() => setCurrentView(ViewState.CONTACTS_LIST)} />;

      case ViewState.CONTACT_DETAILS:
        return <ContactDetail 
          contact={selectedContact} 
          onBack={() => setCurrentView(ViewState.CONTACTS_LIST)} 
          onEdit={() => {
             setCurrentView(ViewState.ADD_CONTACT); 
          }}
        />;

      case ViewState.VENDORS_LIST:
        return <VendorList onAdd={() => setCurrentView(ViewState.ADD_VENDOR)} onSelect={handleSelectVendor} />;

      case ViewState.ADD_VENDOR:
        return <VendorCreate onCancel={() => setCurrentView(ViewState.VENDORS_LIST)} onSave={() => setCurrentView(ViewState.VENDORS_LIST)} />;

      case ViewState.VENDOR_DETAILS:
        return <VendorDetail
          vendor={selectedVendor}
          onBack={() => setCurrentView(ViewState.VENDORS_LIST)}
          onEdit={() => setCurrentView(ViewState.ADD_VENDOR)}
        />;

      case ViewState.FUEL_HISTORY:
        return <FuelHistory onAdd={() => setCurrentView(ViewState.ADD_FUEL_ENTRY)} onSelect={handleSelectFuelEntry} />;

      case ViewState.ADD_FUEL_ENTRY:
        return <FuelEntryCreate onCancel={() => setCurrentView(ViewState.FUEL_HISTORY)} onSave={() => setCurrentView(ViewState.FUEL_HISTORY)} />;

      case ViewState.FUEL_ENTRY_DETAILS:
        return <FuelEntryDetail entry={selectedFuelEntry} onBack={() => setCurrentView(ViewState.FUEL_HISTORY)} />;

      case ViewState.CHARGING_HISTORY:
        return <ChargingHistory onAdd={() => setCurrentView(ViewState.ADD_CHARGING_ENTRY)} />;

      case ViewState.ADD_CHARGING_ENTRY:
        return <ChargingEntryCreate onCancel={() => setCurrentView(ViewState.CHARGING_HISTORY)} onSave={() => setCurrentView(ViewState.CHARGING_HISTORY)} />;

      case ViewState.PARTS_LIST:
        return <PartList onAdd={() => setCurrentView(ViewState.ADD_PART)} />;

      case ViewState.ADD_PART:
        return <PartCreate onCancel={() => setCurrentView(ViewState.PARTS_LIST)} onSave={() => setCurrentView(ViewState.PARTS_LIST)} />;

      case ViewState.DOCUMENTS_LIST:
        return <DocumentList onUpload={() => setCurrentView(ViewState.UPLOAD_DOCUMENT)} />;

      case ViewState.UPLOAD_DOCUMENT:
        return <DocumentUpload onCancel={() => setCurrentView(ViewState.DOCUMENTS_LIST)} />;

      case ViewState.PLACES_LIST:
        return <PlaceList onAdd={() => setCurrentView(ViewState.ADD_PLACE)} />;

      case ViewState.ADD_PLACE:
        return <PlaceCreate onCancel={() => setCurrentView(ViewState.PLACES_LIST)} onSave={() => setCurrentView(ViewState.PLACES_LIST)} />;

      case ViewState.REPORTS_LIST:
        return <ReportList onSelect={handleSelectReport} />;

      case ViewState.REPORT_DETAIL:
        return <ReportDetail report={selectedReport} onBack={() => setCurrentView(ViewState.REPORTS_LIST)} />;

      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  // Settings Views Logic
  const isSettingsView = [
    ViewState.SETTINGS_GENERAL,
    ViewState.SETTINGS_USER_PROFILE,
    ViewState.SETTINGS_LOGIN
  ].includes(currentView);

  if (isSettingsView) {
    return (
      <SettingsLayout 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onBackToApp={() => setCurrentView(ViewState.DASHBOARD)}
      >
        {currentView === ViewState.SETTINGS_GENERAL && <SettingsGeneral />}
        {currentView === ViewState.SETTINGS_USER_PROFILE && <SettingsUserProfile />}
        {currentView === ViewState.SETTINGS_LOGIN && <SettingsLogin />}
      </SettingsLayout>
    );
  }

  // Views that take up the full screen (no sidebar/topbar)
  const isFullScreen = [
    ViewState.LOGIN, 
    ViewState.REGISTER, 
    ViewState.ONBOARDING, 
    ViewState.ADD_VEHICLE, 
    ViewState.INSPECTION_BUILDER,
    ViewState.ADD_ISSUE,
    ViewState.ISSUE_DETAILS,
    ViewState.ADD_SERVICE_ENTRY,
    ViewState.ADD_SERVICE_TASK,
    ViewState.ADD_SERVICE_PROGRAM,
    ViewState.ADD_CONTACT,
    ViewState.CONTACT_DETAILS,
    ViewState.ADD_VENDOR,
    ViewState.VENDOR_DETAILS,
    ViewState.ADD_FUEL_ENTRY,
    ViewState.FUEL_ENTRY_DETAILS,
    ViewState.ADD_CHARGING_ENTRY,
    ViewState.ADD_PART,
    // ViewState.UPLOAD_DOCUMENT, 
    ViewState.ADD_PLACE,
    ViewState.REPORT_DETAIL
  ].includes(currentView);

  const isUploadModal = currentView === ViewState.UPLOAD_DOCUMENT;

  if (isFullScreen && !isUploadModal) {
      return (
         <div className="bg-gray-50 min-h-screen text-slate-800 font-sans">
            {renderContent()}
         </div>
      )
  }

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans text-slate-800">
      <Sidebar currentView={isUploadModal ? ViewState.DOCUMENTS_LIST : currentView} setView={setCurrentView} />
      
      <div className="flex-1 flex flex-col ml-64 min-w-0 relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {isUploadModal ? <DocumentList onUpload={() => {}} /> : renderContent()}
        </main>
        
        {isUploadModal && (
            <div className="fixed inset-0 z-50">
                <DocumentUpload onCancel={() => setCurrentView(ViewState.DOCUMENTS_LIST)} />
            </div>
        )}
      </div>
    </div>
  );
};

export default App;