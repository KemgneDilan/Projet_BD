import React, { useState, useRef } from 'react';
import { useApp } from './AppContext';

const SECTIONS = ['francophone', 'anglophone', 'bilingue'];
const NIVEAUX_MATERNELLE = ['PS', 'MS', 'GS'];
const NIVEAUX_PRIMAIRE = ['SIL', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];

export default function ElevesPage() {
  const { eleves, classes, ajouterEleve, modifierEleve, supprimerEleve, utilisateurActif, paiements, getBulletins, getMoyenne } = useApp();
  const [modal, setModal] = useState(null); // null | 'add' | 'view' | 'edit'
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [filtreSection, setFiltreSection] = useState('');
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const role = utilisateurActif?.role;
  const peutModifier = ['directeur', 'fondateur'].includes(role);

  const actifs = eleves.filter(e => e.statut === 'actif');
  const filtered = actifs.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q);
    const matchC = !filtreClasse || e.classeId === filtreClasse;
    const matchS = !filtreSection || e.section === filtreSection;
    // Parent voit seulement ses enfants
    const matchP = role !== 'parent' || e.parentEmail === utilisateurActif?.email;
    // Enseignant voit seulement sa classe
    const matchE = role !== 'enseignant' || e.classeId === utilisateurActif?.classeId;
    return matchQ && matchC && matchS && matchP && matchE;
  });

  const openAdd = () => {
    setForm({ section: 'francophone', sexe: 'M', anneeScolaire: '2024-2025', bus: false, statut: 'actif' });
    setPhoto(null);
    setModal('add');
  };
  const openView = (eleve) => { setSelected(eleve); setModal('view'); };
  const openEdit = (eleve) => { setSelected(eleve); setForm({ ...eleve }); setPhoto(eleve.photo); setModal('edit'); };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const data = { ...form, photo };
    if (modal === 'add') {
      ajouterEleve(data);
    } else {
      modifierEleve(selected.id, data);
    }
    setModal(null);
  };

  const getClasse = (id) => classes.find(c => c.id === id);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <input className="form-control" placeholder="🔍 Rechercher un élève..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }}/>
          <select className="form-control" value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select className="form-control" value={filtreSection} onChange={e => setFiltreSection(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">Toutes sections</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {peutModifier && (
          <button className="btn btn-primary" onClick={openAdd}>+ Inscrire un élève</button>
        )}
      </div>

      {/* Compteur */}
      <div style={styles.counter}>{filtered.length} élève(s) trouvé(s)</div>

      {/* Grille élèves */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: 52 }}>👦</span>
          <h3>Aucun élève trouvé</h3>
          <p>Modifiez votre recherche ou inscrivez un nouveau élève.</p>
          {peutModifier && <button className="btn btn-primary" onClick={openAdd}>+ Inscrire</button>}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(eleve => {
            const cl = getClasse(eleve.classeId);
            const buls = getBulletins(eleve.id);
            const dernierBul = buls[buls.length - 1];
            return (
              <div key={eleve.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openView(eleve)}>
                <div style={styles.eleveHeader}>
                  <div style={styles.elevePhotoWrap}>
                    {eleve.photo
                      ? <img src={eleve.photo} alt={eleve.prenom} style={styles.elevePhoto}/>
                      : <div style={styles.eleveInitials}>{eleve.prenom[0]}{eleve.nom[0]}</div>
                    }
                    {eleve.bus && <span style={styles.busBadge}>🚌</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={styles.eleveName}>{eleve.prenom} {eleve.nom}</h3>
                    <span className="badge badge-gray">{eleve.matricule}</span>
                  </div>
                </div>
                <div style={styles.eleveBody}>
                  <div style={styles.eleveMeta}>
                    <span>🏫 {cl?.nom || '—'}</span>
                    <span>📚 {eleve.section}</span>
                    {dernierBul && <span>⭐ Moy: <strong>{getMoyenne(dernierBul)}/20</strong></span>}
                  </div>
                </div>
                {peutModifier && (
                  <div style={styles.eleveActions} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(eleve)}>✏️ Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => supprimerEleve(eleve.id)}>🗑️</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL AJOUT / EDIT */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={styles.modalTitle}>{modal === 'add' ? '+ Inscrire un Élève' : '✏️ Modifier l\'Élève'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Photo */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div className="photo-upload" onClick={() => fileRef.current?.click()}>
                  {photo ? <img src={photo} alt="photo"/> : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 28 }}>📷</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Photo de l'élève</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto}/>
              </div>

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-control" value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})} placeholder="NOM de famille"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input className="form-control" value={form.prenom || ''} onChange={e => setForm({...form, prenom: e.target.value})} placeholder="Prénom(s)"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Date de naissance *</label>
                  <input className="form-control" type="date" value={form.dateNaissance || ''} onChange={e => setForm({...form, dateNaissance: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Lieu de naissance</label>
                  <input className="form-control" value={form.lieuNaissance || ''} onChange={e => setForm({...form, lieuNaissance: e.target.value})} placeholder="Ville"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Sexe</label>
                  <select className="form-control" value={form.sexe || 'M'} onChange={e => setForm({...form, sexe: e.target.value})}>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section *</label>
                  <select className="form-control" value={form.section || ''} onChange={e => setForm({...form, section: e.target.value, classeId: ''})}>
                    <option value="">— Choisir —</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Classe *</label>
                  <select className="form-control" value={form.classeId || ''} onChange={e => setForm({...form, classeId: e.target.value})}>
                    <option value="">— Choisir une classe —</option>
                    {classes.filter(c => !form.section || c.section === form.section).map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.section})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input className="form-control" value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})} placeholder="Quartier, Ville"/>
                </div>
              </div>

              <div style={styles.sectionTitle}>👨‍👩‍👧 Informations du parent / tuteur</div>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Nom complet parent</label>
                  <input className="form-control" value={form.parentNom || ''} onChange={e => setForm({...form, parentNom: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-control" value={form.parentTel || ''} onChange={e => setForm({...form, parentTel: e.target.value})} placeholder="6XX XXX XXX"/>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Email (accès espace parents)</label>
                  <input className="form-control" type="email" value={form.parentEmail || ''} onChange={e => setForm({...form, parentEmail: e.target.value})}/>
                </div>
              </div>

              <div style={styles.sectionTitle}>🚌 Transport scolaire</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <input type="checkbox" id="bus" checked={!!form.bus} onChange={e => setForm({...form, bus: e.target.checked})} style={{ width: 18, height: 18 }}/>
                <label htmlFor="bus" style={{ fontSize: 14, cursor: 'pointer' }}>Cet élève emprunte le bus scolaire</label>
              </div>
              {form.bus && (
                <div className="form-group">
                  <label className="form-label">Ligne de bus</label>
                  <input className="form-control" value={form.busLigne || ''} onChange={e => setForm({...form, busLigne: e.target.value})} placeholder="ex: Ligne A — Bonanjo"/>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.nom || !form.prenom || !form.classeId}>
                {modal === 'add' ? '✅ Inscrire' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VUE DÉTAILLÉE */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={styles.modalTitle}>Dossier de l'élève</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={styles.viewPhoto}>
                  {selected.photo
                    ? <img src={selected.photo} alt={selected.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/>
                    : <span style={{ fontSize: 32, fontWeight: 700 }}>{selected.prenom[0]}{selected.nom[0]}</span>
                  }
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>{selected.prenom} {selected.nom}</h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{selected.matricule}</span>
                    <span className="badge badge-gray">{selected.section}</span>
                    <span className="badge badge-success">{selected.statut}</span>
                    {selected.bus && <span className="badge badge-warning">🚌 Bus</span>}
                  </div>
                </div>
              </div>

              <div style={styles.detailGrid}>
                {[
                  ['Classe', getClasse(selected.classeId)?.nom],
                  ['Date de naissance', selected.dateNaissance],
                  ['Lieu de naissance', selected.lieuNaissance],
                  ['Sexe', selected.sexe === 'M' ? 'Masculin' : 'Féminin'],
                  ['Adresse', selected.adresse],
                  ['Date d\'inscription', selected.dateInscription],
                  ['Parent / Tuteur', selected.parentNom],
                  ['Téléphone', selected.parentTel],
                  ['Email parent', selected.parentEmail],
                  ['Ligne de bus', selected.bus ? selected.busLigne : 'Non inscrit'],
                ].map(([label, val]) => val && (
                  <div key={label} style={styles.detailItem}>
                    <span style={styles.detailLabel}>{label}</span>
                    <span style={styles.detailVal}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              {peutModifier && <button className="btn btn-primary" onClick={() => { setModal(null); setTimeout(() => openEdit(selected), 50); }}>✏️ Modifier</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  topBar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' },
  counter: { fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  eleveHeader: { padding: '18px 18px 12px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  elevePhotoWrap: { position: 'relative', flexShrink: 0 },
  elevePhoto: { width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,.12)' },
  eleveInitials: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'var(--primary)', color: 'white',
    fontWeight: 700, fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  busBadge: { position: 'absolute', bottom: -2, right: -2, fontSize: 14, background: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.15)' },
  eleveName: { fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 },
  eleveBody: { padding: '0 18px 14px' },
  eleveMeta: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--gray-500)' },
  eleveActions: { borderTop: '1px solid var(--gray-100)', padding: '10px 18px', display: 'flex', gap: 8 },
  modalTitle: { fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 700 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--gray-100)' },
  viewPhoto: {
    width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
    background: 'var(--primary)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 3, background: 'var(--gray-50)', borderRadius: 8, padding: '10px 12px' },
  detailLabel: { fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: .5 },
  detailVal: { fontSize: 14, color: 'var(--gray-800)', fontWeight: 500 },
};