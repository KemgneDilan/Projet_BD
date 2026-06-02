/**
 * @file ElevesPage.jsx
 * @description Gestion des élèves avec formulaire enrichi (père/mère/tuteur),
 * lieu de naissance via liste déroulante des villes camerounaises,
 * filtrage par rôle, dark mode et i18n.
 */
import React, { useState, useRef } from 'react';
import { useApp } from './AppContext';
import T from './src/i18n/translations';
import VILLES from './src/data/villesCameroun';
import { 
  Users, UserPlus, Bus, School, BookOpen, Star, FileEdit, Trash2, Camera, User, Phone, Mail,
  ShieldAlert, AlertTriangle, PlusCircle, GraduationCap
} from 'lucide-react';

const INCIDENT_TYPES = [
  { type: 'Absence', points: 1 },
  { type: 'Retard', points: 1 },
  { type: 'Injures', points: 5 },
  { type: 'Vandalisme', points: 8 },
  { type: 'Bagarre', points: 10 },
  { type: 'Vol', points: 20 },
];

const SECTIONS = ['francophone','anglophone','bilingue'];

export default function ElevesPage({ initialTab = null }) {
  const {
    eleves, classes, utilisateurActif,
    ajouterEleve, modifierEleve, supprimerEleve,
    getBulletins, getMoyenne, langue,
    peutInscrireEleve, peutEditerDiscipline,
  } = useApp();
  const t = T[langue] || T.fr;

  const [modal,       setModal]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState('');
  const [filtreClasse,setFiltreClasse]= useState('');
  const [filtreSection,setFiltreSection] = useState('');
  const [form,        setForm]        = useState({});
  const [photo,       setPhoto]       = useState(null);
  const [tabParent,   setTabParent]   = useState('pere'); // 'pere'|'mere'|'tuteur'
  const [viewTab,     setViewTab]     = useState('infos'); // 'infos'|'discipline'
  const [newIncident, setNewIncident] = useState({ type: 'Absence', date: new Date().toISOString().slice(0,10) });
  const [errMsg,      setErrMsg]      = useState('');
  const fileRef = useRef();

  const role       = utilisateurActif?.role;
  const isFondateur = role === 'fondateur';
  // Peut inscrire / modifier un élève (infos générales) — PAS le fondateur
  const peutModifier = peutInscrireEleve() && !isFondateur;
  // Peut accéder au dossier (lecture + discipline)
  const peutVoirDossier = ['directeur','fondateur','enseignant','admin','parent'].includes(role);

  /* ── Filtrage des élèves ─────────────────────────────── */
  const actifs = eleves.filter(e => e.statut === 'actif');
  const filtered = actifs.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q) || (e.matricule||'').toLowerCase().includes(q);
    const matchC = !filtreClasse  || e.classeId === filtreClasse;
    const matchS = !filtreSection || e.section === filtreSection;
    // Parent : uniquement ses enfants
    const matchP = role !== 'parent' || e.parentEmail === utilisateurActif?.email;
    // Enseignant : uniquement ses classes
    const mesClassesIds = utilisateurActif?.classesIds?.length
      ? utilisateurActif.classesIds : [utilisateurActif?.classeId].filter(Boolean);
    const matchE = role !== 'enseignant' || mesClassesIds.includes(e.classeId);
    return matchQ && matchC && matchS && matchP && matchE;
  });

  /* ── Ouverture des modals ───────────────────────────── */
  const openAdd = () => {
    setForm({ section:'francophone', sexe:'M', bus:false, statut:'actif' });
    setPhoto(null); setErrMsg(''); setTabParent('pere'); setModal('add');
  };
  const openView = (e, forceTab = null)  => {
    setSelected(e);
    // Si on arrive depuis la sidebar Discipline ou le bouton discipline → onglet discipline directement
    setViewTab(forceTab || (initialTab === 'discipline' ? 'discipline' : 'infos'));
    setModal('view');
  };
  const openEdit = (e)  => {
    setSelected(e); setForm({...e}); setPhoto(e.photo);
    setErrMsg(''); setTabParent('pere'); setModal('edit');
  };

  /* ── Photo ──────────────────────────────────────────── */
  const handlePhoto = ev => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev2 => setPhoto(ev2.target.result);
    reader.readAsDataURL(f);
  };

  /* ── Validation & soumission ─────────────────────────── */
  const handleSubmit = () => {
    const hasPere   = form.nomPere?.trim();
    const hasMere   = form.nomMere?.trim();
    const hasTuteur = form.nomTuteur?.trim();
    if (!hasPere && !hasMere && !hasTuteur) {
      setErrMsg(t.auMoinsUnParent);
      return;
    }
    // Email parent principal pour correspondance login parent
    const parentEmail = form.emailPere || form.emailMere || form.emailTuteur || '';
    const parentNom   = form.nomPere || form.nomMere || form.nomTuteur || '';
    const parentTel   = form.telephonePere || form.telephoneMere || form.telephoneTuteur || '';
    const data = { ...form, photo, parentEmail, parentNom, parentTel };

    if (modal === 'add') ajouterEleve(data);
    else modifierEleve(selected.id, data);
    setModal(null);
  };

  const handleAddIncident = () => {
    if (!newIncident.type || !newIncident.date) return;
    const pts = INCIDENT_TYPES.find(i => i.type === newIncident.type)?.points || 0;
    const incident = { ...newIncident, points: pts, id: Date.now().toString() };
    const updatedIncidents = [...(selected.incidents || []), incident];
    
    modifierEleve(selected.id, { incidents: updatedIncidents });
    setSelected({ ...selected, incidents: updatedIncidents });
  };

  const getClasse = id => classes.find(c => c.id === id);

  /* ════════════════════════════════════════════════════════ RENDU */
  return (
    <div style={S.container}>
      {/* Le bandeau discipline a été supprimé — navigation directe */}
      {/* Barre de recherche + filtres */}
      <div style={S.topBar}>
        <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
          <input className="form-control" placeholder={t.rechercherEleve}
            value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:240 }} />
          <select className="form-control" value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)} style={{ maxWidth:180 }}>
            <option value="">{t.toutesClasses}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select className="form-control" value={filtreSection} onChange={e => setFiltreSection(e.target.value)} style={{ maxWidth:160 }}>
            <option value="">{t.toutesSections}</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {peutModifier && (
          <button className="btn btn-primary" onClick={openAdd}><UserPlus size={16} /> {t.inscrire}</button>
        )}
      </div>

      <div style={S.counter}>{filtered.length} {t.eleveTrouve}</div>

      {/* Grille élèves */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={52} color="var(--text-muted)" />
          <h3>{t.aucunEleve}</h3>
          <p>{t.modifiezRecherche}</p>
          {peutModifier && <button className="btn btn-primary" onClick={openAdd}><UserPlus size={16} /> {t.inscrire}</button>}
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(eleve => {
            const cl = getClasse(eleve.classeId);
            const buls = getBulletins(eleve.id);
            const dernierBul = buls[buls.length - 1];
            return (
              <div key={eleve.id} className="card animate-fade" style={{ cursor:'pointer' }} onClick={() => openView(eleve)}>
                <div style={S.eleveHeader}>
                  <div style={S.elevePhotoWrap}>
                    {eleve.photo
                      ? <img src={eleve.photo} alt={eleve.prenom} style={S.elevePhoto} />
                      : <div style={S.eleveInitials}>{eleve.prenom[0]}{eleve.nom[0]}</div>}
                    {eleve.bus && <span style={S.busBadge}><Bus size={12} color="#F39C12" /></span>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={S.eleveName}>{eleve.prenom} {eleve.nom}</h3>
                    <span className="badge badge-gray">{eleve.matricule}</span>
                  </div>
                </div>
                <div style={S.eleveBody}>
                  <div style={S.eleveMeta}>
                    <span style={{display:'flex', gap:6, alignItems:'center'}}><School size={12}/> {cl?.nom || '—'}</span>
                    <span style={{display:'flex', gap:6, alignItems:'center'}}><BookOpen size={12}/> {eleve.section}</span>
                    {dernierBul && <span style={{display:'flex', gap:6, alignItems:'center'}}><Star size={12}/> Moy: <strong>{getMoyenne(dernierBul)}/20</strong></span>}
                  </div>
                </div>
                {(peutModifier || role === 'enseignant') && !isFondateur && (
                  <div style={S.eleveActions} onClick={e => e.stopPropagation()}>
                    {peutModifier && (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(eleve)}><FileEdit size={14} style={{marginRight:4}}/> {t.modifier?.replace('✏️ ','')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => supprimerEleve(eleve.id)}><Trash2 size={14}/></button>
                      </>
                    )}
                    {role === 'enseignant' && !peutModifier && (
                      <button className="btn btn-ghost btn-sm" onClick={() => openView(eleve, 'discipline')}><ShieldAlert size={14} style={{marginRight:4}}/> Discipline</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ MODAL AJOUT / EDIT ══ */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={S.modalTitle}>
                {modal === 'add' ? `+ ${t.inscrireAction?.replace('✅ ','')}` : t.modifier}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Photo */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
                <div className="photo-upload" onClick={() => fileRef.current?.click()}>
                  {photo
                    ? <img src={photo} alt="photo" />
                    : <div style={{ textAlign:'center' }}>
                        <Camera size={32} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{t.photo}</div>
                      </div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
              </div>

              {/* Infos élève */}
              <div style={S.sectionTitle}><GraduationCap size={14} style={{marginRight:6}}/>{langue === 'fr' ? 'Informations de l\'élève' : 'Student Information'}</div>
              <div style={S.formGrid}>
                <div className="form-group">
                  <label className="form-label">{t.nom} *</label>
                  <input className="form-control" value={form.nom||''} onChange={e => setForm({...form, nom:e.target.value})} placeholder="NOM" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.prenom} *</label>
                  <input className="form-control" value={form.prenom||''} onChange={e => setForm({...form, prenom:e.target.value})} placeholder="Prénom(s)" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.dateNaissance} *</label>
                  <input className="form-control" type="date" value={form.dateNaissance||''} onChange={e => setForm({...form, dateNaissance:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.lieuNaissance}</label>
                  <input className="form-control" list="villes-list" value={form.lieuNaissance||''} onChange={e => setForm({...form, lieuNaissance:e.target.value})} placeholder={t.choisir} />
                  <datalist id="villes-list">
                    {VILLES.map(v => <option key={v} value={v} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.sexe}</label>
                  <select className="form-control" value={form.sexe||'M'} onChange={e => setForm({...form, sexe:e.target.value})}>
                    <option value="M">{t.masculin}</option>
                    <option value="F">{t.feminin}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.section} *</label>
                  <select className="form-control" value={form.section||''} onChange={e => setForm({...form, section:e.target.value, classeId:''})}>
                    <option value="">{t.choisirSection}</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.classe} *</label>
                  <select className="form-control" value={form.classeId||''} onChange={e => setForm({...form, classeId:e.target.value})}>
                    <option value="">{t.choisirClasse}</option>
                    {classes.filter(c => !form.section || c.section === form.section).map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.section})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.adresse}</label>
                  <input className="form-control" value={form.adresse||''} onChange={e => setForm({...form, adresse:e.target.value})} placeholder="Quartier, Yaoundé" />
                </div>
              </div>

              {/* Parents / tuteurs */}
              <div style={S.sectionTitle}>{t.informationsParent}</div>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
                {langue === 'fr' ? 'Au moins un des trois contacts est requis.' : 'At least one contact is required.'}
              </p>

              {/* Onglets père/mère/tuteur */}
              <div className="pill-tabs" style={{ marginBottom:16 }}>
                {[['pere',t.pere],['mere',t.mere],['tuteur',t.tuteur]].map(([k,lbl]) => (
                  <button key={k} className={`pill-tab ${tabParent===k?'active':''}`} onClick={() => setTabParent(k)}>{lbl}</button>
                ))}
              </div>

              {tabParent === 'pere' && (
                <div style={S.formGrid}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.nomComplet}</label>
                    <input className="form-control" value={form.nomPere||''} onChange={e => setForm({...form, nomPere:e.target.value})} placeholder="Nom et prénoms du père" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 1</label>
                    <input className="form-control" value={form.telephonePere||''} onChange={e => setForm({...form, telephonePere:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 2 (Optionnel)</label>
                    <input className="form-control" value={form.telephonePere2||''} onChange={e => setForm({...form, telephonePere2:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.emailAcces}</label>
                    <input className="form-control" type="email" value={form.emailPere||''} onChange={e => setForm({...form, emailPere:e.target.value})} />
                  </div>
                </div>
              )}
              {tabParent === 'mere' && (
                <div style={S.formGrid}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.nomComplet}</label>
                    <input className="form-control" value={form.nomMere||''} onChange={e => setForm({...form, nomMere:e.target.value})} placeholder="Nom et prénoms de la mère" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 1</label>
                    <input className="form-control" value={form.telephoneMere||''} onChange={e => setForm({...form, telephoneMere:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 2 (Optionnel)</label>
                    <input className="form-control" value={form.telephoneMere2||''} onChange={e => setForm({...form, telephoneMere2:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.emailAcces}</label>
                    <input className="form-control" type="email" value={form.emailMere||''} onChange={e => setForm({...form, emailMere:e.target.value})} />
                  </div>
                </div>
              )}
              {tabParent === 'tuteur' && (
                <div style={S.formGrid}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.nomComplet}</label>
                    <input className="form-control" value={form.nomTuteur||''} onChange={e => setForm({...form, nomTuteur:e.target.value})} placeholder="Nom et prénoms du tuteur" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 1</label>
                    <input className="form-control" value={form.telephoneTuteur||''} onChange={e => setForm({...form, telephoneTuteur:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 2 (Optionnel)</label>
                    <input className="form-control" value={form.telephoneTuteur2||''} onChange={e => setForm({...form, telephoneTuteur2:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.emailAcces}</label>
                    <input className="form-control" type="email" value={form.emailTuteur||''} onChange={e => setForm({...form, emailTuteur:e.target.value})} />
                  </div>
                </div>
              )}

              {errMsg && <div style={S.errBox}>{errMsg}</div>}

              {/* Transport */}
              <div style={S.sectionTitle}><Bus size={14} style={{marginRight:6}}/>{t.transportScolaire}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <input type="checkbox" id="bus" checked={!!form.bus} onChange={e => setForm({...form, bus:e.target.checked})} style={{ width:18, height:18, accentColor:'var(--primary)' }} />
                <label htmlFor="bus" style={{ fontSize:14, cursor:'pointer', color:'var(--text-primary)' }}>{t.emprunterBus}</label>
              </div>
              {form.bus && (
                <div className="form-group">
                  <label className="form-label">{t.ligneDeBus}</label>
                  <input className="form-control" value={form.busLigne||''} onChange={e => setForm({...form, busLigne:e.target.value})} placeholder={t.exLigneA} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModal(null)}>{t.annuler}</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.nom||!form.prenom||!form.classeId}>
                {modal === 'add' ? t.inscrireAction : t.enregistrer}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL VUE DÉTAILLÉE ══ */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={S.modalTitle}>{t.dossierEleve}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
                <div style={S.viewPhoto}>
                  {selected.photo
                    ? <img src={selected.photo} alt={selected.prenom} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                    : <span style={{ fontSize:32, fontWeight:700, color:'white' }}>{selected.prenom[0]}{selected.nom[0]}</span>}
                </div>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>{selected.prenom} {selected.nom}</h2>
                  <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                    <span className="badge badge-primary">{selected.matricule}</span>
                    <span className="badge badge-gray">{selected.section}</span>
                    <span className="badge badge-success">{selected.statut}</span>
                    {selected.bus && <span className="badge badge-warning"><Bus size={12}/> Bus</span>}
                  </div>
                </div>
              </div>

              <div className="pill-tabs" style={{ marginBottom: 16 }}>
                <button className={`pill-tab ${viewTab==='infos'?'active':''}`} onClick={() => setViewTab('infos')}>Informations</button>
                {(peutEditerDiscipline(selected?.id) || ['directeur','fondateur','parent'].includes(role)) && (
                  <button className={`pill-tab ${viewTab==='discipline'?'active':''}`} onClick={() => setViewTab('discipline')}>Discipline</button>
                )}
                {/* Note : le parent peut voir l'onglet Discipline en lecture seule */}
              </div>

              {viewTab === 'infos' && (
                <>
                  <div style={S.detailGrid}>
                    {[
                      [t.classe,         getClasse(selected.classeId)?.nom],
                      [t.dateNaissance,  selected.dateNaissance],
                      [t.lieuNaissance,  selected.lieuNaissance],
                      [t.sexe,           selected.sexe === 'M' ? t.masculin : t.feminin],
                      [t.adresse,        selected.adresse],
                      [t.dateInscription,selected.dateInscription ? new Date(selected.dateInscription).toLocaleDateString('fr-FR') : null],
                      [t.anneeScolaire,  selected.anneeScolaire],
                    ].filter(([,v]) => v).map(([label,val]) => (
                      <div key={label} style={S.detailItem}>
                        <span style={S.detailLabel}>{label}</span>
                        <span style={S.detailVal}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contacts parents */}
                  {[
                    { titre: t.pere, nom: selected.nomPere, tel: selected.telephonePere, tel2: selected.telephonePere2, email: selected.emailPere },
                    { titre: t.mere, nom: selected.nomMere, tel: selected.telephoneMere, tel2: selected.telephoneMere2, email: selected.emailMere },
                    { titre: t.tuteur, nom: selected.nomTuteur, tel: selected.telephoneTuteur, tel2: selected.telephoneTuteur2, email: selected.emailTuteur },
                  ].filter(p => p.nom).map(p => (
                    <div key={p.titre} style={{ marginTop:12, background:'var(--gray-50)', borderRadius:10, padding:'12px 16px' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:6 }}>{p.titre}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{p.nom}</div>
                      {p.tel  && <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', gap:6, alignItems:'center', marginTop:4 }}><Phone size={14}/> {p.tel}</div>}
                      {p.tel2 && <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', gap:6, alignItems:'center', marginTop:2 }}><Phone size={14}/> {p.tel2}</div>}
                      {p.email && <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', gap:6, alignItems:'center', marginTop:2 }}><Mail size={14}/> {p.email}</div>}
                    </div>
                  ))}
                </>
              )}

              {viewTab === 'discipline' && (
                <div>
                  {(() => {
                    const incidents = selected.incidents || [];
                    const totalPoints = incidents.reduce((s, i) => s + i.points, 0);
                    
                    return (
                      <>
                        {totalPoints >= 50 && (
                          <div style={{ display:'flex', alignItems:'center', gap:14, background:'linear-gradient(135deg, #FEF2F2, #FEE2E2)', color:'#991B1B', border:'2px solid #F87171', borderRadius:12, padding:'16px 20px', marginBottom:12, animation:'pulse 2s infinite' }}>
                            <AlertTriangle size={28} color="#DC2626" />
                            <div>
                              <strong style={{ fontSize:15, display:'block', marginBottom:4 }}>Alerte Discipline — Convocation Parentale Requise</strong>
                              <span style={{ fontSize:13, lineHeight:1.5 }}>L'élève a accumulé <strong>{totalPoints} points</strong> de mauvaise conduite (seuil : 50). Veuillez <strong>convoquer le parent/tuteur</strong> de cet élève pour un entretien disciplinaire.</span>
                              {selected.parentTel && (
                                <div style={{ marginTop:8, fontSize:12, background:'white', padding:'6px 12px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:6 }}>
                                  <Phone size={13}/> Contact parent : <strong>{selected.parentTel}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div style={{ background:'var(--gray-50)', padding:16, borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                          <div>
                            <div style={{ fontSize:12, color:'var(--text-secondary)', textTransform:'uppercase', fontWeight:700 }}>Total Points</div>
                            <div style={{ fontSize:24, fontWeight:800, color: totalPoints >= 50 ? 'var(--danger)' : 'var(--primary)' }}>{totalPoints} pts</div>
                          </div>
                          <ShieldAlert size={32} color={totalPoints >= 50 ? 'var(--danger)' : 'var(--gray-400)'} />
                        </div>

                        <h4 style={{ fontSize:14, marginBottom:12, color:'var(--text-primary)' }}>Historique des incidents</h4>
                        {incidents.length === 0 ? (
                          <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)', fontSize:14, background:'var(--bg-app)', borderRadius:8 }}>
                            Aucun incident enregistré.
                          </div>
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {incidents.map(i => (
                              <div key={i.id} style={{ display:'flex', justifyContent:'space-between', background:'var(--bg-card)', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border-color)' }}>
                                <div>
                                  <div style={{ fontWeight:600, fontSize:14 }}>{i.type}</div>
                                  <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{new Date(i.date).toLocaleDateString('fr-FR')}</div>
                                </div>
                                <div className="badge badge-danger" style={{ height:'fit-content' }}>+{i.points} pts</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Formulaire d'ajout d'incident : uniquement pour l'enseignant de l'élève (ou admin), JAMAIS pour le fondateur ou le parent */}
                        {peutEditerDiscipline(selected?.id) && !isFondateur && role !== 'parent' && (
                          <div style={{ marginTop:24, padding:16, background:'var(--gray-100)', borderRadius:12, border:'1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize:13, textTransform:'uppercase', marginBottom:12, color:'var(--text-secondary)', fontWeight:700 }}>Signaler un comportement</h4>
                            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                              <div className="form-group" style={{ marginBottom:0, flex:1 }}>
                                <label className="form-label">Type d'incident</label>
                                <select className="form-control" value={newIncident.type} onChange={e => setNewIncident({...newIncident, type:e.target.value})}>
                                  {INCIDENT_TYPES.map(it => <option key={it.type} value={it.type}>{it.type} (+{it.points} pts)</option>)}
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom:0, flex:1 }}>
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" value={newIncident.date} onChange={e => setNewIncident({...newIncident, date:e.target.value})} />
                              </div>
                              <button className="btn btn-primary" onClick={handleAddIncident}><PlusCircle size={16} /> Ajouter</button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {peutModifier && !isFondateur && viewTab === 'infos' && (
                <button className="btn btn-primary" onClick={() => { setModal(null); setTimeout(() => openEdit(selected), 50); }}>
                  <FileEdit size={16} style={{marginRight:4}} /> {t.modifier}
                </button>
              )}
              {peutEditerDiscipline(selected?.id) && !isFondateur && viewTab === 'discipline' && (
                <span style={{ fontSize: 12, color: 'var(--success)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Vous pouvez modifier la discipline de cet élève.
                </span>
              )}
              {role === 'parent' && viewTab === 'discipline' && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Consultation uniquement — contactez l'enseignant pour toute question.
                </span>
              )}
              {!peutEditerDiscipline(selected?.id) && viewTab === 'discipline' && !['admin','parent'].includes(role) && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Seul l'enseignant de cet élève peut modifier la discipline.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  container:     { padding:28, display:'flex', flexDirection:'column', gap:20 },
  topBar:        { display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', justifyContent:'space-between' },
  counter:       { fontSize:13, color:'var(--text-secondary)', fontWeight:500 },
  grid:          { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 },
  eleveHeader:   { padding:'18px 18px 12px', display:'flex', gap:14, alignItems:'flex-start' },
  elevePhotoWrap:{ position:'relative', flexShrink:0 },
  elevePhoto:    { width:56, height:56, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--bg-card)', boxShadow:'0 2px 8px rgba(0,0,0,.12)' },
  eleveInitials: { width:56, height:56, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' },
  busBadge:      { position:'absolute', bottom:-2, right:-2, fontSize:12, background:'white', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.15)' },
  eleveName:     { fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:4 },
  eleveBody:     { padding:'0 18px 14px' },
  eleveMeta:     { display:'flex', flexDirection:'column', gap:4, fontSize:12, color:'var(--text-secondary)' },
  eleveActions:  { borderTop:'1px solid var(--border-color)', padding:'10px 18px', display:'flex', gap:8 },
  modalTitle:    { fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700, color:'var(--text-primary)' },
  sectionTitle:  { fontSize:13, fontWeight:700, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:.5, marginBottom:12, marginTop:8, paddingTop:12, borderTop:'1px solid var(--border-color)' },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' },
  errBox:        { background:'#FEE2E2', color:'#991B1B', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:12, border:'1px solid #FECACA' },
  viewPhoto:     { width:80, height:80, borderRadius:'50%', flexShrink:0, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  detailGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  detailItem:    { display:'flex', flexDirection:'column', gap:3, background:'var(--gray-50)', borderRadius:8, padding:'10px 12px' },
  detailLabel:   { fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 },
  detailVal:     { fontSize:14, color:'var(--text-primary)', fontWeight:500 },
};