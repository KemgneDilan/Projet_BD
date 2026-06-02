/**
 * @file App.jsx
 * @description Composant racine. Applique le dark mode, gère le routing
 * par page et injecte le contexte global.
 */
import React from 'react';
import { AppProvider, useApp } from './AppContext';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ElevesPage from './ElevesPage';
import BulletinsPage from './BulletinsPage';
import PaiementsPage from './PaiementsPage';
import EvaluationsPage from './EvaluationsPage';
import CoefficientsPage from './CoefficientsPage';
import MessageriePage from './MessageriePage';
import SaisieNotesPage from './SaisieNotesPage';
import AdminPage from './AdminPage';
import { ClassesPage, TransportPage, PersonnelPage, ParametresPage } from './OthersPages';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ErrorBoundary from './ErrorBoundary';
import './global.css';

function AppInner() {
  const { utilisateurActif, currentPage, darkMode } = useApp();

  // Appliquer le thème sur l'élément racine
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (!utilisateurActif) return <LoginPage />;

  const PAGES = {
    dashboard:   <Dashboard />,
    eleves:      <ElevesPage />,
    discipline:  <ElevesPage initialTab="discipline" />,
    classes:     <ClassesPage />,
    bulletins:   <BulletinsPage />,
    paiements:   <PaiementsPage />,
    transport:   <TransportPage />,
    personnel:   <PersonnelPage />,
    parametres:  <ParametresPage />,
    evaluations: <EvaluationsPage />,
    saisie_notes:<SaisieNotesPage />,
    coefficients:<CoefficientsPage />,
    messagerie:  <MessageriePage />,
    adminRoot:   <AdminPage />,
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar />
        <main
          style={{ flex:1, overflowY:'auto', background:'var(--bg-app)' }}
          className="animate-fade"
        >
          {PAGES[currentPage] || PAGES.dashboard}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </ErrorBoundary>
  );
}