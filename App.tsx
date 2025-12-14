import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ViewState, Issue, ServiceProgram, Contact, Vendor, FuelEntry, Part, Report } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';
import VehicleList from './pages/vehicles/List';
import VehicleCreate from './pages/vehicles/Create';
import Assignments from './pages/vehicles/Assignments'; // New
import MeterHistory from './pages/vehicles/MeterHistory'; // New
import ReplacementAnalysis from './pages/vehicles/ReplacementAnalysis'; // New
import InspectionList from './pages/inspections/List';
import InspectionCreate from './pages/inspections/Create';
import IssueList from './pages/issues/List';
import IssueCreate from './pages/issues/Create';
import IssueDetail from './pages/issues/Detail';
import ServiceHistory from './pages/service/History';
import EntryCreate from './pages/service/EntryCreate';
import WorkOrders from './pages/service/WorkOrders';
import ServiceReminders from './pages/reminders/ServiceReminders';
import VehicleRenewals from './pages/reminders/VehicleRenewals';
import ServiceTasks from './pages/service/ServiceTasks';
import ServiceTaskCreate from './pages/service/ServiceTaskCreate';
import ServicePrograms from './pages/service/ServicePrograms';
import ServiceProgramCreate from './pages/service/ServiceProgramCreate';
import ServiceProgramDetail from './pages/service/ServiceProgramDetail';
import ContactList from './pages/contacts/List';
import ContactCreate from './pages/contacts/Create';
import ContactDetail from './pages/contacts/Detail';
import VendorList from './pages/vendors/List';
import VendorCreate from './pages/vendors/Create';
import VendorDetail from './pages/vendors/Detail';
import FuelHistory from './pages/fuel/FuelHistory';
import FuelEntryCreate from './pages/fuel/FuelEntryCreate';
import FuelEntryDetail from './pages/fuel/FuelEntryDetail';
import ChargingHistory from './pages/fuel/ChargingHistory';
import ChargingEntryCreate from './pages/fuel/ChargingEntryCreate';
import PartList from './pages/parts/List';
import PartCreate from './pages/parts/Create';
import DocumentList from './pages/documents/List';
import DocumentUpload from './pages/documents/Upload';
import PlaceList from './pages/places/List';
import PlaceCreate from './pages/places/Create';
import ReportList from './pages/reports/List';
import ReportDetail from './pages/reports/Detail';

// Settings Pages
import SettingsLayout from './pages/settings/Layout';
import SettingsGeneral from './pages/settings/General';
import SettingsUserProfile from './pages/settings/UserProfile';
import SettingsLogin from './pages/settings/LoginPassword';

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