import React, { useState } from 'react';
import { useApp } from './AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!login(email, mdp)) setErr('Email ou mot de passe incorrect');
    setLoading(false);
  };

  const comptes = [
    { label: 'Fondateur', email: 'fondateur@ecole.cm', color: '#F39C12' },
    { label: 'Directeur', email: 'directeur@ecole.cm', color: '#1B4F72' },
    { label: 'Enseignant', email: 'enseignant@ecole.cm', color: '#27AE60' },
    { label: 'Parent', email: 'parent@ecole.cm', color: '#8E44AD' },
  ];

  return (
    <div style={styles.page}>
      {/* Décor gauche */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
          </div>
          <h1 style={styles.schoolName}>École Les Étoiles</h1>
          <p style={styles.schoolSub}>Primaire & Maternelle — Douala, Cameroun</p>

          <div style={styles.features}>
            {['Gestion des élèves & classes', 'Bulletins & évaluations', 'Suivi des paiements', 'Transport scolaire', 'Espace parents'].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureDot}/>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div style={styles.demoLabel}>Comptes de démonstration</div>
          <div style={styles.demoGrid}>
            {comptes.map(c => (
              <button key={c.email} style={{ ...styles.demoBtn, borderColor: c.color }}
                onClick={() => { setEmail(c.email); setMdp('1234'); }}>
                <span style={{ color: c.color, fontWeight: 700, fontSize: 12 }}>{c.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire droit */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={styles.cardIcon}>🔐</div>
            <h2 style={styles.cardTitle}>Connexion</h2>
            <p style={styles.cardSub}>Bienvenue! Connectez-vous à votre espace.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input className="form-control" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="votre@email.cm" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-control" type="password" value={mdp}
                onChange={e => setMdp(e.target.value)} placeholder="••••••••" required/>
            </div>

            {err && (
              <div style={styles.errBox}>{err}</div>
            )}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}/> : '→ Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 24 }}>
            Mot de passe de démonstration: <strong>1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    background: 'linear-gradient(135deg, #0D2B40 0%, #1B4F72 60%, #2980B9 100%)',
  },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 40px',
  },
  leftInner: { maxWidth: 420, width: '100%' },
  logo: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'rgba(243,156,18,.15)', border: '2px solid rgba(243,156,18,.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, marginBottom: 20,
  },
  logoIcon: {},
  schoolName: {
    fontFamily: 'Playfair Display, serif',
    fontSize: 34, fontWeight: 900, color: 'white',
    lineHeight: 1.1, marginBottom: 8,
  },
  schoolSub: { fontSize: 14, color: 'rgba(255,255,255,.55)', marginBottom: 40 },
  features: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.8)', fontSize: 14 },
  featureDot: { width: 6, height: 6, borderRadius: '50%', background: '#F39C12', flexShrink: 0 },
  demoLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 12 },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  demoBtn: {
    background: 'rgba(255,255,255,.06)', border: '1px solid',
    borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left',
    transition: 'all .2s',
  },
  right: {
    width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40, background: 'rgba(255,255,255,.04)',
    backdropFilter: 'blur(20px)',
  },
  card: {
    background: 'white', borderRadius: 24, padding: '40px 36px',
    boxShadow: '0 25px 80px rgba(0,0,0,.3)', width: '100%', maxWidth: 380,
  },
  cardIcon: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#0D2B40' },
  cardSub: { fontSize: 14, color: '#64748B', marginTop: 6 },
  errBox: {
    background: '#FEE2E2', color: '#991B1B',
    padding: '10px 14px', borderRadius: 8,
    fontSize: 13, marginBottom: 12,
  },
};