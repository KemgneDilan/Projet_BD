/**
 * @file Topbar.jsx
 * @description Barre supérieure avec titre de page, date, boutons dark mode,
 * changement de langue, retour arrière, et notification toast.
 */
import React from 'react';
import { useApp } from './AppContext';
import T from './src/i18n/translations';
import { 
  LayoutDashboard, Users, School, FileText, 
  CreditCard, Bus, UsersRound, Settings, 
  FileEdit, Calculator, MessageSquare, ShieldAlert,
  Sun, Moon, CheckCircle, AlertTriangle, XCircle, ArrowLeft
} from 'lucide-react';

const PAGE_TITLES = {
  fr: {
    dashboard:'Tableau de bord', eleves:'Gestion des Élèves',
    discipline:'Discipline & Conduite',
    classes:'Gestion des Classes', bulletins:'Bulletins & Évaluations',
    paiements:'Gestion des Paiements', transport:'Transport Scolaire',
    personnel:'Personnel', parametres:'Paramètres',
    evaluations:'Évaluations', coefficients:'Coefficients',
    messagerie:'Messagerie',
  },
  en: {
    dashboard:'Dashboard', eleves:'Student Management',
    discipline:'Discipline & Conduct',
    classes:'Class Management', bulletins:'Report Cards & Evaluations',
    paiements:'Payment Management', transport:'School Transport',
    personnel:'Staff', parametres:'Settings',
    evaluations:'Evaluations', coefficients:'Coefficients',
    messagerie:'Messaging',
  }
};

const PAGE_ICONS = {
  dashboard: <LayoutDashboard size={24} />, 
  eleves: <Users size={24} />, 
  discipline: <ShieldAlert size={24} />,
  classes: <School size={24} />, 
  bulletins: <FileText size={24} />,
  paiements: <CreditCard size={24} />, 
  transport: <Bus size={24} />, 
  personnel: <UsersRound size={24} />, 
  parametres: <Settings size={24} />,
  evaluations: <FileEdit size={24} />, 
  coefficients: <Calculator size={24} />, 
  messagerie: <MessageSquare size={24} />,
};

export default function Topbar() {
  const { utilisateurActif, notification, darkMode, toggleDarkMode, langue, toggleLangue, currentPage, pageHistory, goBack } = useApp();

  const titles = PAGE_TITLES[langue] || PAGE_TITLES.fr;
  const t = T[langue] || T.fr;

  const title  = titles[currentPage] || currentPage;
  const icon   = PAGE_ICONS[currentPage] || <FileText size={24} />;
  const canGoBack = pageHistory.length > 1;

  const now = new Date();
  const dateStr = now.toLocaleDateString(langue === 'fr' ? 'fr-FR' : 'en-US', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  });

  return (
    <>
      {/* Notification toast */}
      {notification && (
        <div style={{
          ...styles.toast,
          background: notification.type === 'success' ? '#27AE60'
            : notification.type === 'warning' ? '#F39C12' : '#E74C3C',
        }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : notification.type === 'warning' ? <AlertTriangle size={18} /> : <XCircle size={18} />}
          {' '}{notification.message}
        </div>
      )}

      <header style={styles.topbar}>
        <div style={styles.left}>
          {/* Bouton retour */}
          {canGoBack && (
            <button
              onClick={goBack}
              style={styles.backBtn}
              title={t.retour}
            >
              <ArrowLeft size={16} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {langue === 'fr' ? 'Retour' : 'Back'}
              </span>
            </button>
          )}
          <span style={styles.pageIcon}>{icon}</span>
          <div>
            <h1 style={styles.pageTitle}>{title}</h1>
            <p style={styles.date}>{dateStr}</p>
          </div>
        </div>

        <div style={styles.right}>
          {/* Toggle langue */}
          <button
            className="topbar-action-btn"
            onClick={toggleLangue}
            title={langue === 'fr' ? 'Switch to English' : 'Passer en Français'}
          >
            <span className="lang-badge">{langue.toUpperCase()}</span>
          </button>

          {/* Toggle dark mode */}
          <button
            className="topbar-action-btn"
            onClick={toggleDarkMode}
            title={darkMode ? (t.modeClairLabel) : (t.modeSombre)}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Profil utilisateur */}
          <div style={styles.userInfo}>
            <div style={styles.avatarInitials}>
              {utilisateurActif?.prenom?.[0]}{utilisateurActif?.nom?.[0]}
            </div>
            <div>
              <div style={styles.userName}>{utilisateurActif?.prenom} {utilisateurActif?.nom}</div>
              <div style={styles.userRole}>{utilisateurActif?.email}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

const styles = {
  toast: {
    position:'fixed', top:20, right:20, zIndex:9999,
    color:'white', padding:'12px 20px', borderRadius:12,
    boxShadow:'0 8px 32px rgba(0,0,0,.2)',
    fontSize:14, fontWeight:500,
    animation:'fadeIn .3s ease',
    display:'flex', alignItems:'center', gap:8,
  },
  topbar: {
    background:'var(--bg-card)',
    borderBottom:'1px solid var(--border-color)',
    padding:'0 24px', height:68,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    position:'sticky', top:0, zIndex:50,
    boxShadow:'0 1px 8px rgba(0,0,0,.06)',
    gap: 16,
  },
  left: { display:'flex', alignItems:'center', gap:12, minWidth:0 },
  backBtn: {
    display:'flex', alignItems:'center', gap:6,
    padding:'7px 14px', borderRadius:10,
    border:'1.5px solid var(--border-color)',
    background:'var(--bg-card)', color:'var(--text-secondary)',
    cursor:'pointer', fontSize:13, fontWeight:500,
    transition:'all .18s', flexShrink:0,
    whiteSpace:'nowrap',
  },
  pageIcon:  { flexShrink:0, display:'flex', alignItems:'center', color:'var(--text-primary)' },
  pageTitle: {
    fontFamily:'Playfair Display, serif',
    fontSize:18, fontWeight:700, color:'var(--text-primary)',
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
  },
  date:  { fontSize:11, color:'var(--text-muted)', marginTop:1, textTransform:'capitalize' },
  right: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  userInfo: { display:'flex', alignItems:'center', gap:10 },
  avatarInitials: {
    width:36, height:36, borderRadius:'50%',
    background:'var(--primary)', color:'white',
    fontWeight:700, fontSize:13,
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0,
  },
  userName: { fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' },
  userRole: { fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' },
};