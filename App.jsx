import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ElevesPage from './ElevesPage';
import BulletinsPage from './BulletinsPage';
import PaiementsPage from './PaiementsPage';
import EvaluationsPage from './EvaluationsPage';
import CoefficientsPage from './CoefficientsPage';
import { ClassesPage, TransportPage, PersonnelPage, ParametresPage } from './OthersPages';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ErrorBoundary from './ErrorBoundary';
import './global.css';

function AppInner() {
  const { utilisateurActif } = useApp();
  const [page, setPage] = useState('dashboard');

  if (!utilisateurActif) return <LoginPage/>;

  const PAGES = {
    dashboard: <Dashboard setPage={setPage}/>,
    eleves: <ElevesPage/>,
    classes: <ClassesPage/>,
    bulletins: <BulletinsPage/>,
    paiements: <PaiementsPage/>,
    transport: <TransportPage/>,
    personnel: <PersonnelPage/>,
    parametres: <ParametresPage/>,
    evaluations: <EvaluationsPage/>,
    coefficients: <CoefficientsPage/>,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar page={page} setPage={setPage}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar page={page}/>
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--gray-50)' }} className="animate-fade">
          {PAGES[page] || PAGES.dashboard}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppInner/>
      </AppProvider>
    </ErrorBoundary>
  );
}