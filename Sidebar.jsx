/**
 * @file Sidebar.jsx
 * @description Barre de navigation latérale avec menu par rôle,
 * support du dark mode et menu messagerie.
 */
import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import T from './src/i18n/translations';
import {
  LayoutDashboard, Users, School, FileText,
  CreditCard, Bus, UsersRound, MessageSquare,
  Settings, Calculator, FileEdit, UserCircle, LogOut, GraduationCap, ChevronLeft, ChevronRight,
  ShieldCheck, ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = {
  admin: [
    { id:'dashboard',    icon: <LayoutDashboard size={18} /> },
    { id:'adminRoot',    icon: <ShieldCheck size={18} /> },
    { id:'personnel',    icon: <UsersRound size={18} /> },
    { id:'messagerie',   icon: <MessageSquare size={18} /> },
    { id:'parametres',   icon: <Settings size={18} /> },
  ],
  fondateur: [
    { id:'dashboard',    icon: <LayoutDashboard size={18} /> },
    { id:'eleves',       icon: <Users size={18} /> },
    { id:'classes',      icon: <School size={18} /> },
    { id:'bulletins',    icon: <FileText size={18} /> },
    { id:'paiements',    icon: <CreditCard size={18} /> },
    { id:'transport',    icon: <Bus size={18} /> },
    { id:'personnel',    icon: <UsersRound size={18} /> },
    { id:'messagerie',   icon: <MessageSquare size={18} /> },
    { id:'parametres',   icon: <Settings size={18} /> },
  ],
  directeur: [
    { id:'dashboard',    icon: <LayoutDashboard size={18} /> },
    { id:'eleves',       icon: <Users size={18} /> },
    { id:'classes',      icon: <School size={18} /> },
    { id:'bulletins',    icon: <FileText size={18} /> },
    { id:'paiements',    icon: <CreditCard size={18} /> },
    { id:'transport',    icon: <Bus size={18} /> },
    { id:'personnel',    icon: <UsersRound size={18} /> },
    { id:'coefficients', icon: <Calculator size={18} /> },
    { id:'messagerie',   icon: <MessageSquare size={18} /> },
    { id:'parametres',   icon: <Settings size={18} /> },
  ],
  enseignant: [
    { id:'dashboard',    icon: <LayoutDashboard size={18} /> },
    { id:'eleves',       icon: <Users size={18} /> },
    { id:'discipline',   icon: <ShieldAlert size={18} /> },
    { id:'bulletins',    icon: <FileText size={18} /> },
    { id:'saisie_notes', icon: <FileEdit size={18} /> },
    { id:'evaluations',  icon: <FileEdit size={18} /> },
    { id:'messagerie',   icon: <MessageSquare size={18} /> },
    { id:'parametres',   icon: <Settings size={18} /> },
  ],
  parent: [
    { id:'dashboard',    icon: <UserCircle size={18} /> },
    { id:'eleves',       icon: <Users size={18} /> },
    { id:'bulletins',    icon: <FileText size={18} /> },
    { id:'paiements',    icon: <CreditCard size={18} /> },
    { id:'messagerie',   icon: <MessageSquare size={18} /> },
    { id:'parametres',   icon: <Settings size={18} /> },
  ],
};

const getLabel = (id, role, lang) => {
  const t = T[lang] || T.fr;
  const map = {
    admin: {
      dashboard:'Tableau de bord', adminRoot: t.adminRoot || 'Administration',
      personnel: t.personnel, parametres: t.parametres, messagerie: t.messagerie,
    },
    fondateur: {
      dashboard:'Tableau de bord', eleves: t.eleves, classes: t.classes,
      bulletins: t.bulletins, paiements: t.paiements, transport: t.transport,
      personnel: t.personnel, parametres: t.parametres, messagerie: t.messagerie,
    },
    directeur: {
      dashboard:'Tableau de bord', eleves: t.eleves, classes: t.classes,
      bulletins: t.bulletins, paiements: t.paiements, transport: t.transport,
      personnel: t.personnel, coefficients: t.coefficients, messagerie: t.messagerie,
      parametres: t.parametres,
    },
    enseignant: {
      dashboard: t.monTableauDeBord, eleves: t.mesEleves, discipline: 'Discipline',
      bulletins: t.mesBulletins, saisie_notes: 'Saisie de notes', evaluations: t.evaluations, messagerie: t.messagerie,
      parametres: t.parametres,
    },
    parent: {
      dashboard: t.mesEnfants, eleves: t.dossierScolaire,
      bulletins: t.bulletins, paiements: t.mesPaiements, messagerie: t.messagerie,
      parametres: t.parametres,
    },
  };
  return map[role]?.[id] || id;
};

const ROLE_LABELS = {
  admin:     { label:'Administrateur', color:'#E74C3C', bg:'rgba(231,76,60,.15)' },
  fondateur: { label:'Fondateur', color:'#F39C12', bg:'rgba(243,156,18,.15)' },
  directeur: { label:'Directeur', color:'#27AE60', bg:'rgba(39,174,96,.15)' },
  enseignant:{ label:'Enseignant', color:'#2980B9', bg:'rgba(41,128,185,.15)' },
  parent:    { label:'Parent',    color:'#8E44AD', bg:'rgba(142,68,173,.15)' },
};

export default function Sidebar() {
  const { utilisateurActif, logout, currentPage, naviguer, langue, messages, getMessagesRecus, schoolSettings } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const items    = NAV_ITEMS[utilisateurActif?.role] || [];
  const roleInfo = ROLE_LABELS[utilisateurActif?.role] || {};
  const t        = T[langue] || T.fr;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Nombre de messages non lus
  const unread = (getMessagesRecus?.() || []).filter(m => !m.lu).length;

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 72 : 260 }}>
      {/* Header logo */}
      <div style={styles.header}>
        {!collapsed && (
          <div style={styles.brand}>
            <span style={styles.brandIcon}><GraduationCap size={24} /></span>
            <div>
              <div style={styles.brandName}>{schoolSettings?.nom || 'Les Étoiles'}</div>
              <div style={styles.brandSub}>2025–2026</div>
            </div>
          </div>
        )}
        <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)} title="Réduire">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Carte utilisateur */}
      {!collapsed && (
        <div style={styles.userCard}>
          <div style={styles.avatarCircle}>
            {utilisateurActif?.prenom?.[0]}{utilisateurActif?.nom?.[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={styles.userName}>{utilisateurActif?.prenom} {utilisateurActif?.nom}</div>
            <span style={{ ...styles.roleBadge, color:roleInfo.color, background:roleInfo.bg }}>
              {roleInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={styles.nav}>
        {items.map(item => {
          const isActive = currentPage === item.id;
          const label = getLabel(item.id, utilisateurActif?.role, langue);
          const isMsg = item.id === 'messagerie';
          return (
            <button
              key={item.id}
              style={{ ...styles.navItem, ...(isActive ? styles.navActive : {}) }}
              onClick={() => naviguer(item.id)}
              title={collapsed ? label : undefined}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span style={styles.navLabel}>{label}</span>}
              {/* Badge messages non lus */}
              {isMsg && unread > 0 && (
                <span style={{
                  ...styles.unreadBadge,
                  marginLeft: collapsed ? 0 : 'auto',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
              {!collapsed && isActive && <span style={styles.navDot} />}
            </button>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div style={styles.footer}>
        <button style={styles.logoutBtn} onClick={logout} title={t.deconnexion}>
          <span><LogOut size={18} /></span>
          {!collapsed && <span>{t.deconnexion}</span>}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    background:'#0D2B40',
    height:'100vh', flexShrink:0,
    display:'flex', flexDirection:'column',
    position:'sticky', top:0,
    transition:'width 0.25s ease',
    overflow:'hidden',
    boxShadow:'4px 0 24px rgba(0,0,0,.2)',
    zIndex:100,
  },
  header: {
    padding:'20px 16px 16px',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    borderBottom:'1px solid rgba(255,255,255,.08)',
    flexShrink:0,
  },
  brand:     { display:'flex', alignItems:'center', gap:10 },
  brandIcon: { fontSize:24 },
  brandName: { fontFamily:'Playfair Display, serif', color:'white', fontSize:15, fontWeight:700 },
  brandSub:  { fontSize:10, color:'rgba(255,255,255,.4)', marginTop:1 },
  collapseBtn: {
    width:28, height:28, borderRadius:8,
    background:'rgba(255,255,255,.07)', border:'none',
    color:'rgba(255,255,255,.5)', cursor:'pointer', fontSize:13,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  userCard: {
    margin:'12px', padding:'12px',
    background:'rgba(255,255,255,.06)', borderRadius:12,
    display:'flex', alignItems:'center', gap:10,
    flexShrink:0,
  },
  avatarCircle: {
    width:38, height:38, borderRadius:'50%',
    background:'rgba(243,156,18,.2)', border:'1.5px solid rgba(243,156,18,.4)',
    color:'#F39C12', fontWeight:700, fontSize:13,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  userName:  { color:'white', fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  roleBadge: { fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, letterSpacing:.5 },
  nav: { flex:1, padding:'8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' },
  navItem: {
    width:'100%', display:'flex', alignItems:'center', gap:12,
    padding:'10px 12px', borderRadius:10, border:'none',
    background:'transparent', cursor:'pointer', color:'rgba(255,255,255,.55)',
    fontSize:14, textAlign:'left', transition:'all .18s', position:'relative',
  },
  navActive: { background:'rgba(243,156,18,.14)', color:'#F8C471' },
  navIcon:   { fontSize:17, flexShrink:0, width:22, textAlign:'center' },
  navLabel:  { flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  navDot:    { width:6, height:6, borderRadius:'50%', background:'#F39C12', flexShrink:0 },
  unreadBadge: {
    minWidth:18, height:18, borderRadius:9, background:'#E74C3C',
    color:'white', fontSize:10, fontWeight:700,
    display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px',
    flexShrink:0,
  },
  footer: { padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,.08)', flexShrink:0 },
  logoutBtn: {
    width:'100%', display:'flex', alignItems:'center', gap:12,
    padding:'10px 12px', borderRadius:10, border:'none',
    background:'transparent', cursor:'pointer', color:'rgba(255,100,100,.75)',
    fontSize:14, textAlign:'left', transition:'all .18s',
  },
};