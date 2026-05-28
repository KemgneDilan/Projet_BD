import React, { useState } from 'react';
import { useApp } from './AppContext';

const NAV_ITEMS = {
  fondateur: [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'eleves', label: 'Élèves', icon: '👦' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'bulletins', label: 'Bulletins', icon: '📋' },
    { id: 'paiements', label: 'Paiements', icon: '💰' },
    { id: 'transport', label: 'Transport', icon: '🚌' },
    { id: 'personnel', label: 'Personnel', icon: '👥' },
    { id: 'parametres', label: 'Paramètres', icon: '⚙️' },
  ],
  directeur: [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'eleves', label: 'Élèves', icon: '👦' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'bulletins', label: 'Bulletins', icon: '📋' },
    { id: 'paiements', label: 'Paiements', icon: '💰' },
    { id: 'transport', label: 'Transport', icon: '🚌' },
    { id: 'personnel', label: 'Personnel', icon: '👥' },
    { id: 'coefficients', label: 'Coefficients', icon: '⚖️' },
  ],
  enseignant: [
    { id: 'dashboard', label: 'Mon Tableau de bord', icon: '📊' },
    { id: 'eleves', label: 'Mes Élèves', icon: '👦' },
    { id: 'bulletins', label: 'Bulletins & Notes', icon: '📋' },
    { id: 'evaluations', label: 'Évaluations', icon: '📝' },
  ],
  parent: [
    { id: 'dashboard', label: 'Mes Enfants', icon: '👨‍👩‍👧' },
    { id: 'eleves', label: 'Dossier Scolaire', icon: '📁' },
    { id: 'bulletins', label: 'Bulletins', icon: '📋' },
    { id: 'paiements', label: 'Mes Paiements', icon: '💳' },
  ],
};

const ROLE_LABELS = {
  fondateur: { label: 'Fondateur', color: '#F39C12', bg: 'rgba(243,156,18,.15)' },
  directeur: { label: 'Directeur', color: '#27AE60', bg: 'rgba(39,174,96,.15)' },
  enseignant: { label: 'Enseignant', color: '#2980B9', bg: 'rgba(41,128,185,.15)' },
  parent: { label: 'Parent', color: '#8E44AD', bg: 'rgba(142,68,173,.15)' },
};

export default function Sidebar({ page, setPage }) {
  const { utilisateurActif, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV_ITEMS[utilisateurActif?.role] || [];
  const roleInfo = ROLE_LABELS[utilisateurActif?.role] || {};

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 72 : 260 }}>
      {/* Header */}
      <div style={styles.header}>
        {!collapsed && (
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🎓</span>
            <div>
              <div style={styles.brandName}>Les Étoiles</div>
              <div style={styles.brandSub}>2024–2025</div>
            </div>
          </div>
        )}
        <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div style={styles.userCard}>
          <div style={styles.avatarCircle}>
            {utilisateurActif?.prenom?.[0]}{utilisateurActif?.nom?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>{utilisateurActif?.prenom} {utilisateurActif?.nom}</div>
            <span style={{ ...styles.roleBadge, color: roleInfo.color, background: roleInfo.bg }}>
              {roleInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={styles.nav}>
        {items.map(item => (
          <button key={item.id}
            style={{ ...styles.navItem, ...(page === item.id ? styles.navActive : {}) }}
            onClick={() => setPage(item.id)}
            title={collapsed ? item.label : undefined}>
            <span style={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
            {!collapsed && page === item.id && <span style={styles.navDot}/>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={styles.footer}>
        <button style={styles.logoutBtn} onClick={logout}>
          <span>🚪</span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    background: '#0D2B40',
    height: '100vh', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0,
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    boxShadow: '4px 0 24px rgba(0,0,0,.2)',
    zIndex: 100,
  },
  header: {
    padding: '20px 16px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandIcon: { fontSize: 24 },
  brandName: { fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 16, fontWeight: 700 },
  brandSub: { fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 },
  collapseBtn: {
    width: 28, height: 28, borderRadius: 8,
    background: 'rgba(255,255,255,.07)', border: 'none',
    color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  userCard: {
    margin: '12px', padding: '12px',
    background: 'rgba(255,255,255,.06)', borderRadius: 12,
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'rgba(243,156,18,.2)', border: '1.5px solid rgba(243,156,18,.4)',
    color: '#F39C12', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { color: 'white', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: .5 },
  nav: { flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' },
  navItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 10, border: 'none',
    background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,.55)',
    fontSize: 14, textAlign: 'left', transition: 'all .18s', position: 'relative',
  },
  navActive: {
    background: 'rgba(243,156,18,.12)', color: '#F8C471',
  },
  navIcon: { fontSize: 17, flexShrink: 0, width: 22, textAlign: 'center' },
  navLabel: { flex: 1, whiteSpace: 'nowrap' },
  navDot: {
    width: 6, height: 6, borderRadius: '50%', background: '#F39C12', flexShrink: 0,
  },
  footer: {
    padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,.08)',
  },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 10, border: 'none',
    background: 'transparent', cursor: 'pointer', color: 'rgba(255,100,100,.7)',
    fontSize: 14, textAlign: 'left', transition: 'all .18s',
  },
};