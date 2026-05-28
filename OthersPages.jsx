import React, { useState } from 'react';
import { useApp } from './AppContext';

// ── CLASSES ────────────────────────────────────────────────────────────────────
export function ClassesPage() {
  const { classes, eleves, utilisateurs, ajouterClasse, modifierClasse, utilisateurActif } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);
  const peutModifier = ['directeur', 'fondateur'].includes(utilisateurActif?.role);
  const enseignants = utilisateurs.filter(u => u.role === 'enseignant');

  const openAdd = () => { setForm({ section: 'francophone', niveau: 'SIL', annee: '2024-2025' }); setSelected(null); setModal(true); };
  const openEdit = (cl) => { setSelected(cl); setForm({ ...cl }); setModal(true); };
  const save = () => {
    if (selected) modifierClasse(selected.id, form);
    else ajouterClasse(form);
    setModal(false);
  };

  const NIVEAUX = ['PS', 'MS', 'GS', 'SIL', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  const SECTIONS = ['francophone', 'anglophone', 'bilingue'];
  const SECTION_COLORS = { francophone: '#1B4F72', anglophone: '#27AE60', bilingue: '#8E44AD' };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="section-title">Gestion des Classes</div>
          <div className="section-subtitle">{classes.length} classe(s) créée(s)</div>
        </div>
        {peutModifier && <button className="btn btn-primary" onClick={openAdd}>+ Nouvelle classe</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {classes.map(cl => {
          const effectif = eleves.filter(e => e.classeId === cl.id && e.statut === 'actif').length;
          const enseignant = enseignants.find(e => e.id === cl.enseignantId);
          const color = SECTION_COLORS[cl.section] || '#1B4F72';
          return (
            <div key={cl.id} className="card">
              <div style={{ height: 6, background: color, borderRadius: '12px 12px 0 0' }}/>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{cl.nom}</h3>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{cl.annee}</span>
                  </div>
                  <span className="badge" style={{ background: color + '18', color }}>{cl.section}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>
                  <span>📚 Niveau: <strong>{cl.niveau}</strong></span>
                  <span>👦 Élèves: <strong>{effectif}</strong></span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  👤 Maître: <strong>{enseignant ? `${enseignant.prenom} ${enseignant.nom}` : '— Non assigné'}</strong>
                </div>
                {peutModifier && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: '100%' }} onClick={() => openEdit(cl)}>
                    ✏️ Modifier
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700 }}>{selected ? 'Modifier la classe' : 'Nouvelle classe'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nom de la classe *</label><input className="form-control" value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Ex: SIL A"/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group"><label className="form-label">Niveau</label><select className="form-control" value={form.niveau || ''} onChange={e => setForm({...form, niveau: e.target.value})}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Section</label><select className="form-control" value={form.section || ''} onChange={e => setForm({...form, section: e.target.value})}>{SECTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-group"><label className="form-label">Enseignant(e)</label><select className="form-control" value={form.enseignantId || ''} onChange={e => setForm({...form, enseignantId: e.target.value})}><option value="">— Non assigné —</option>{enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Année scolaire</label><input className="form-control" value={form.annee || ''} onChange={e => setForm({...form, annee: e.target.value})} placeholder="2024-2025"/></div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save} disabled={!form.nom}>💾 Enregistrer</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TRANSPORT ──────────────────────────────────────────────────────────────────
export function TransportPage() {
  const { eleves, classes, utilisateurActif } = useApp();
  const busEleves = eleves.filter(e => e.bus && e.statut === 'actif');
  const lignes = [...new Set(busEleves.map(e => e.busLigne).filter(Boolean))];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="section-title">🚌 Transport Scolaire</div>
        <div className="section-subtitle">{busEleves.length} élève(s) inscrits au bus</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#FEF3C7' }}><span style={{ fontSize: 22 }}>🚌</span></div><div><div className="stat-value">{busEleves.length}</div><div className="stat-label">Élèves en bus</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#DCFCE7' }}><span style={{ fontSize: 22 }}>🛣️</span></div><div><div className="stat-value">{lignes.length}</div><div className="stat-label">Lignes actives</div></div></div>
      </div>

      {lignes.length === 0 && busEleves.length === 0 && (
        <div className="empty-state"><span style={{ fontSize: 52 }}>🚌</span><h3>Aucun élève inscrit au bus</h3><p>Inscrivez des élèves au bus depuis la gestion des élèves.</p></div>
      )}

      {lignes.map(ligne => {
        const elevesLigne = busEleves.filter(e => e.busLigne === ligne);
        return (
          <div key={ligne} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🚌</span>
                <div><h3 style={{ fontSize: 16, fontWeight: 700 }}>{ligne}</h3><span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{elevesLigne.length} élève(s)</span></div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Élève</th><th>Classe</th><th>Section</th><th>Parent</th><th>Tél. parent</th></tr></thead>
                <tbody>
                  {elevesLigne.map(e => {
                    const cl = classes.find(c => c.id === e.classeId);
                    return (
                      <tr key={e.id}>
                        <td><strong>{e.prenom} {e.nom}</strong><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{e.matricule}</div></td>
                        <td>{cl?.nom || '—'}</td>
                        <td><span className="badge badge-gray">{e.section}</span></td>
                        <td>{e.parentNom}</td>
                        <td>{e.parentTel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Élèves sans ligne */}
      {busEleves.filter(e => !e.busLigne).length > 0 && (
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>⚠️ Élèves sans ligne assignée</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Élève</th><th>Classe</th><th>Parent</th></tr></thead>
              <tbody>
                {busEleves.filter(e => !e.busLigne).map(e => {
                  const cl = classes.find(c => c.id === e.classeId);
                  return <tr key={e.id}><td>{e.prenom} {e.nom}</td><td>{cl?.nom || '—'}</td><td>{e.parentNom}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PERSONNEL ──────────────────────────────────────────────────────────────────
export function PersonnelPage() {
  const { utilisateurs, ajouterUtilisateur, modifierUtilisateur, classes, utilisateurActif } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const peutModifier = ['directeur', 'fondateur'].includes(utilisateurActif?.role);

  const personnel = utilisateurs.filter(u => ['directeur', 'fondateur', 'enseignant'].includes(u.role));

  const ROLES = [{ value: 'enseignant', label: 'Enseignant' }, { value: 'directeur', label: 'Directeur' }];
  const ROLE_COLORS = { fondateur: '#F39C12', directeur: '#27AE60', enseignant: '#2980B9' };

  const save = () => {
    ajouterUtilisateur({ ...form, motDePasse: form.motDePasse || '1234' });
    setModal(false);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><div className="section-title">Personnel</div><div className="section-subtitle">{personnel.length} membre(s)</div></div>
        {peutModifier && <button className="btn btn-primary" onClick={() => { setForm({ role: 'enseignant' }); setModal(true); }}>+ Ajouter</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {personnel.map(u => {
          const maClasse = classes.find(c => c.enseignantId === u.id);
          const color = ROLE_COLORS[u.role] || '#1B4F72';
          return (
            <div key={u.id} className="card">
              <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: color + '18', border: `2px solid ${color}30`, color, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{u.prenom} {u.nom}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '18', padding: '2px 8px', borderRadius: 20 }}>{u.role}</span>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>{u.email}</div>
                  {maClasse && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 3 }}>📚 {maClasse.nom}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700 }}>+ Ajouter un membre</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group"><label className="form-label">Nom *</label><input className="form-control" value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Prénom *</label><input className="form-control" value={form.prenom || ''} onChange={e => setForm({...form, prenom: e.target.value})}/></div>
              </div>
              <div className="form-group"><label className="form-label">Email (identifiant) *</label><input className="form-control" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Rôle</label><select className="form-control" value={form.role || 'enseignant'} onChange={e => setForm({...form, role: e.target.value})}>{ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
              {form.role === 'enseignant' && (
                <div className="form-group"><label className="form-label">Classe assignée</label><select className="form-control" value={form.classeId || ''} onChange={e => setForm({...form, classeId: e.target.value})}><option value="">— Non assignée —</option>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
              )}
              <div className="form-group"><label className="form-label">Mot de passe initial</label><input className="form-control" value={form.motDePasse || '1234'} onChange={e => setForm({...form, motDePasse: e.target.value})}/></div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save} disabled={!form.nom || !form.prenom || !form.email}>✅ Créer</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PARAMÈTRES ─────────────────────────────────────────────────────────────────
export function ParametresPage() {
  const { utilisateurActif, modifierUtilisateur, notify } = useApp();
  const [form, setForm] = useState({ ...utilisateurActif });
  const [mdp, setMdp] = useState({ ancien: '', nouveau: '', confirm: '' });

  const saveProfile = () => {
    modifierUtilisateur(utilisateurActif.id, form);
  };

  const changeMdp = () => {
    if (mdp.ancien !== utilisateurActif.motDePasse) { notify('Ancien mot de passe incorrect', 'error'); return; }
    if (mdp.nouveau !== mdp.confirm) { notify('Les mots de passe ne correspondent pas', 'error'); return; }
    modifierUtilisateur(utilisateurActif.id, { motDePasse: mdp.nouveau });
    setMdp({ ancien: '', nouveau: '', confirm: '' });
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      <div className="section-title">⚙️ Paramètres du compte</div>

      <div className="card">
        <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>👤 Informations personnelles</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group"><label className="form-label">Nom</label><input className="form-control" value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Prénom</label><input className="form-control" value={form.prenom || ''} onChange={e => setForm({...form, prenom: e.target.value})}/></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}/></div>
          <button className="btn btn-primary" onClick={saveProfile}>💾 Sauvegarder</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>🔐 Changer le mot de passe</h3></div>
        <div className="card-body">
          <div className="form-group"><label className="form-label">Ancien mot de passe</label><input className="form-control" type="password" value={mdp.ancien} onChange={e => setMdp({...mdp, ancien: e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Nouveau mot de passe</label><input className="form-control" type="password" value={mdp.nouveau} onChange={e => setMdp({...mdp, nouveau: e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Confirmer</label><input className="form-control" type="password" value={mdp.confirm} onChange={e => setMdp({...mdp, confirm: e.target.value})}/></div>
          <button className="btn btn-primary" onClick={changeMdp} disabled={!mdp.ancien || !mdp.nouveau}>🔐 Changer</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ background: '#F8FAFC' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>ℹ️ À propos</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.7 }}>
            <strong>École Les Étoiles</strong> — Système de gestion scolaire v1.0<br/>
            Douala, Cameroun · Année scolaire 2024-2025<br/>
            <span style={{ fontSize: 11 }}>© 2024 — Tous droits réservés</span>
          </p>
        </div>
      </div>
    </div>
  );
}