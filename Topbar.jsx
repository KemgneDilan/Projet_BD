import React from 'react';
import { useApp } from './AppContext';

const PAGE_TITLES = {
  dashboard: { title: 'Tableau de bord', icon: '📊' },
  eleves: { title: 'Gestion des Élèves', icon: '👦' },
  classes: { title: 'Gestion des Classes', icon: '🏫' },
  bulletins: { title: 'Bulletins & Évaluations', icon: '📋' },
  paiements: { title: 'Gestion des Paiements', icon: '💰' },
  transport: { title: 'Transport Scolaire', icon: '🚌' },
  personnel: { title: 'Personnel', icon: '👥' },
  parametres: { title: 'Paramètres', icon: '⚙️' },
};

export default function Topbar({ page }) {
  const { utilisateurActif, notification } = useApp();
  const info = PAGE_TITLES[page] || { title: page, icon: '📄' };
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      {/* Notification toast */}
      {notification && (
        <div style={{
          ...styles.toast,
          background: notification.type === 'success' ? '#27AE60' : notification.type === 'warning' ? '#F39C12' : '#E74C3C',
        }}>
          {notification.type === 'success' ? '✅' : notification.type === 'warning' ? '⚠️' : '❌'}
          {' '}{notification.message}
        </div>
      )}

      <header style={styles.topbar}>
        <div style={styles.left}>
          <span style={styles.pageIcon}>{info.icon}</span>
          <div>
            <h1 style={styles.pageTitle}>{info.title}</h1>
            <p style={styles.date}>{dateStr}</p>
          </div>
        </div>
        <div style={styles.right}>
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
    position: 'fixed', top: 20, right: 20, zIndex: 9999,
    color: 'white', padding: '12px 20px', borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,.2)',
    fontSize: 14, fontWeight: 500,
    animation: 'fadeIn .3s ease',
  },
  topbar: {
    background: 'white', borderBottom: '1px solid var(--gray-100)',
    padding: '0 28px', height: 68,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
    boxShadow: '0 1px 8px rgba(0,0,0,.06)',
  },
  left: { display: 'flex', alignItems: 'center', gap: 14 },
  pageIcon: { fontSize: 26 },
  pageTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: 20, fontWeight: 700, color: 'var(--gray-900)',
  },
  date: { fontSize: 12, color: 'var(--gray-400)', marginTop: 1, textTransform: 'capitalize' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatarInitials: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'var(--primary)', color: 'white',
    fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' },
  userRole: { fontSize: 11, color: 'var(--gray-400)' },
};