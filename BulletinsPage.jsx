import React, { useState, useRef } from 'react';
import { useApp } from './AppContext';

const SEQUENCES = ['SEQ1', 'SEQ2', 'SEQ3', 'SEQ4', 'SEQ5', 'SEQ6'];
const APPRECIATIONS = { 20: 'Excellent', 18: 'Très Bien', 15: 'Bien', 12: 'Assez Bien', 10: 'Passable', 0: 'Insuffisant' };
const getAppreciation = (note) => {
  const keys = Object.keys(APPRECIATIONS).map(Number).sort((a, b) => b - a);
  for (const k of keys) if (note >= k) return APPRECIATIONS[k];
  return 'Insuffisant';
};

export default function BulletinsPage() {
  const { eleves, classes, matieres, notes, evaluations: evalDefinitions, coefficients, enregistrerBulletin, getMoyenne, getBulletin, utilisateurActif, calculateNoteFinale } = useApp();
  const [selectedEleve, setSelectedEleve] = useState('');
  const [selectedSeq, setSelectedSeq] = useState('SEQ1');
  const [mode, setMode] = useState('saisie'); // 'saisie' | 'apercu'
  const [form, setForm] = useState(null);
  const bulletinRef = useRef();

  const role = utilisateurActif?.role;

  const elevesDispos = role === 'parent'
    ? eleves.filter(e => e.parentEmail === utilisateurActif?.email && e.statut === 'actif')
    : role === 'enseignant'
    ? eleves.filter(e => e.classeId === utilisateurActif?.classeId && e.statut === 'actif')
    : eleves.filter(e => e.statut === 'actif');

  const eleve = eleves.find(e => e.id === selectedEleve);
  const classe = eleve ? classes.find(c => c.id === eleve.classeId) : null;
  const bulletinExistant = eleve ? getBulletin(eleve.id, selectedSeq) : null;

  const initForm = () => {
    const base = bulletinExistant || {
      notes: matieres.map(m => {
        const evalDef = evalDefinitions.find(e => e.classeId === eleve?.classeId && e.matiereId === m.id);
        return {
          matiereId: m.id,
          evaluations: evalDef ? evalDef.evaluations.map(ev => ({ name: ev.name, note: '' })) : [],
          noteFinale: ''
        };
      }),
      absences: 0, retards: 0,
      conduite: 'Bonne', soin: 'Soigné', ponctualite: 'Ponctuel',
      appreciationGenerale: '', rang: '', effectif: classe?.effectif || 0,
      dateConseil: new Date().toISOString().split('T')[0],
    };
    setForm({ ...base });
    setMode('saisie');
  };

  const setNote = (matiereId, evalIndex, val) => {
    setForm(prev => ({
      ...prev,
      notes: prev.notes.map(n => {
        if (n.matiereId === matiereId) {
          const newEvaluations = [...n.evaluations];
          newEvaluations[evalIndex] = { ...newEvaluations[evalIndex], note: val };
          const evalDef = evalDefinitions.find(e => e.classeId === eleve?.classeId && e.matiereId === matiereId);
          const noteFinale = calculateNoteFinale(newEvaluations, evalDef?.evaluations || []);
          return { ...n, evaluations: newEvaluations, noteFinale };
        }
        return n;
      })
    }));
  };

  const saveBulletin = () => {
    if (!eleve) return;
    enregistrerBulletin({
      ...form,
      eleveId: eleve.id, sequence: selectedSeq, anneeScolaire: '2024-2025',
    });
    setMode('apercu');
  };

  const calcMoyenneForm = () => {
    if (!form || !eleve) return '—';
    let total = 0, coeff = 0;
    form.notes.forEach(n => {
      const coef = coefficients.find(c => c.classeId === eleve.classeId && c.matiereId === n.matiereId);
      if (coef && n.noteFinale !== '') {
        total += Number(n.noteFinale) * coef.coefficient;
        coeff += coef.coefficient;
      }
    });
    return coeff ? (total / coeff).toFixed(2) : '—';
  };

  const printBulletin = () => window.print();

  const telecharger = () => {
    const content = bulletinRef.current;
    if (!content) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`<html><head><title>Bulletin ${eleve?.prenom} ${eleve?.nom}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; margin: 0; }
        .header p { margin: 4px 0; color: #555; }
        .section { margin: 16px 0 8px; font-weight: bold; font-size: 14px; border-bottom: 2px solid #1B4F72; color: #1B4F72; padding-bottom: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; }
        .info-item { background: #f9f9f9; padding: 6px 10px; border-radius: 4px; }
        .info-label { font-size: 10px; color: #888; font-weight: bold; text-transform: uppercase; }
        .moy-box { text-align: center; background: #1B4F72; color: white; padding: 12px; border-radius: 8px; margin-top: 16px; }
        .appreciation { background: #FEF3C7; padding: 10px; border-radius: 6px; margin-top: 12px; }
        @media print { body { margin: 0; } }
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    printWin.document.close();
    printWin.print();
  };

  const bulletinAffiche = mode === 'apercu' ? bulletinExistant : null;
  const moy = form ? calcMoyenneForm() : (bulletinExistant ? getMoyenne(bulletinExistant) : '—');

  return (
    <div style={styles.container}>
      {/* Sélecteurs */}
      <div className="card">
        <div className="card-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <label className="form-label">Élève</label>
            <select className="form-control" value={selectedEleve} onChange={e => { setSelectedEleve(e.target.value); setForm(null); setMode('saisie'); }}>
              <option value="">— Choisir un élève —</option>
              {classes.map(cl => (
                <optgroup key={cl.id} label={cl.nom}>
                  {elevesDispos.filter(e => e.classeId === cl.id).map(e => (
                    <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Séquence</label>
            <select className="form-control" value={selectedSeq} onChange={e => { setSelectedSeq(e.target.value); setForm(null); setMode('saisie'); }}>
              {SEQUENCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {eleve && !form && role !== 'parent' && (
            <button className="btn btn-primary" onClick={initForm}>
              {bulletinExistant ? '✏️ Modifier le bulletin' : '+ Saisir les notes'}
            </button>
          )}
          {eleve && bulletinExistant && !form && (
            <button className="btn btn-ghost" onClick={() => setMode('apercu')}>👁️ Voir le bulletin</button>
          )}
        </div>
      </div>

      {!eleve && (
        <div className="empty-state">
          <span style={{ fontSize: 52 }}>📋</span>
          <h3>Sélectionnez un élève</h3>
          <p>Choisissez un élève et une séquence pour accéder aux bulletins.</p>
        </div>
      )}

      {/* SAISIE DES NOTES */}
      {eleve && form && mode === 'saisie' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={styles.cardTitle}>Bulletin — {eleve.prenom} {eleve.nom}</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{classe?.nom} · {selectedSeq} · 2024-2025</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={styles.moyBadge}>Moy: {calcMoyenneForm()}/20</div>
            </div>
          </div>
          <div className="card-body">
            {/* Notes par matière */}
            <div style={styles.sectionLabel}>📚 Notes par matière</div>
            <div className="table-wrap" style={{ marginBottom: 24 }}>
              <table>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coeff.</th>
                    <th>Note /20</th>
                    <th>Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {matieres.map(mat => {
                    const n = form.notes.find(n => n.matiereId === mat.id);
                    const coef = coefficients.find(c => c.classeId === eleve?.classeId && c.matiereId === mat.id);
                    return (
                      <tr key={mat.id}>
                        <td><strong>{mat.nom}</strong></td>
                        <td>{coef?.coefficient || 1}</td>
                        <td>
                          {n?.evaluations?.length > 0 ? (
                            <div>
                              {n.evaluations.map((evalItem, idx) => (
                                <div key={idx} style={{ marginBottom: 4 }}>
                                  <small>{evalItem.name}:</small>
                                  <input type="number" min="0" max="20" step="0.5"
                                    style={{ ...styles.noteInput, width: 60, marginLeft: 8 }}
                                    value={evalItem.note}
                                    onChange={e => setNote(mat.id, idx, e.target.value)}
                                    placeholder="—"/>
                                </div>
                              ))}
                              <div style={{ marginTop: 8, fontWeight: 'bold' }}>
                                Finale: {n.noteFinale || '—'}
                              </div>
                            </div>
                          ) : (
                            <input type="number" min="0" max="20" step="0.5"
                              style={styles.noteInput}
                              value={n?.noteFinale ?? ''}
                              onChange={e => setNote(mat.id, 0, e.target.value)}
                              placeholder="—"/>
                          )}
                        </td>
                        <td>
                          <span style={{
                            ...styles.appBadge,
                            color: !n?.noteFinale ? 'var(--gray-400)'
                              : n.noteFinale >= 15 ? '#166534'
                              : n.noteFinale >= 10 ? '#92400E' : '#991B1B',
                          }}>{n?.noteFinale ? getAppreciation(Number(n.noteFinale)) : '—'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Éléments disciplinaires */}
            <div style={styles.sectionLabel}>🎖️ Éléments disciplinaires</div>
            <div style={styles.disciplineGrid}>
              <div className="form-group">
                <label className="form-label">Absences (heures)</label>
                <input className="form-control" type="number" min="0" value={form.absences}
                  onChange={e => setForm({...form, absences: Number(e.target.value)})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Retards</label>
                <input className="form-control" type="number" min="0" value={form.retards}
                  onChange={e => setForm({...form, retards: Number(e.target.value)})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Conduite</label>
                <select className="form-control" value={form.conduite}
                  onChange={e => setForm({...form, conduite: e.target.value})}>
                  {['Excellente','Très Bonne','Bonne','Passable','Mauvaise'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Soin du travail</label>
                <select className="form-control" value={form.soin}
                  onChange={e => setForm({...form, soin: e.target.value})}>
                  {['Très Soigné','Soigné','Peu Soigné','Négligé'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ponctualité</label>
                <select className="form-control" value={form.ponctualite}
                  onChange={e => setForm({...form, ponctualite: e.target.value})}>
                  {['Très Ponctuel','Ponctuel','Peu Ponctuel','Souvent en retard'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rang dans la classe</label>
                <input className="form-control" type="number" min="1" value={form.rang || ''}
                  onChange={e => setForm({...form, rang: e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Effectif de la classe</label>
                <input className="form-control" type="number" min="1" value={form.effectif || ''}
                  onChange={e => setForm({...form, effectif: e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Date du conseil de classe</label>
                <input className="form-control" type="date" value={form.dateConseil || ''}
                  onChange={e => setForm({...form, dateConseil: e.target.value})}/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Appréciation générale du maître</label>
              <textarea className="form-control" rows="3" value={form.appreciationGenerale}
                onChange={e => setForm({...form, appreciationGenerale: e.target.value})}
                placeholder="Ex: Élève sérieux et appliqué. Efforts remarquables en mathématiques..."/>
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid var(--gray-100)', padding: '16px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Annuler</button>
            <button className="btn btn-primary" onClick={saveBulletin}>💾 Enregistrer le bulletin</button>
          </div>
        </div>
      )}

      {/* APERÇU BULLETIN */}
      {eleve && (mode === 'apercu') && (bulletinExistant || bulletinAffiche) && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
            {role !== 'parent' && <button className="btn btn-ghost" onClick={initForm}>✏️ Modifier</button>}
            <button className="btn btn-primary" onClick={telecharger}>⬇️ Télécharger PDF</button>
          </div>

          <div ref={bulletinRef} style={styles.bulletin}>
            {/* En-tête bulletin */}
            <div style={styles.bulHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={styles.bulLogo}>🎓</div>
                <div>
                  <h1 style={styles.bulSchool}>ÉCOLE LES ÉTOILES</h1>
                  <p style={styles.bulSchoolSub}>École Primaire & Maternelle — Douala, Cameroun</p>
                  <p style={styles.bulSchoolSub}>BP 1234 — Tél: +237 677 000 000</p>
                </div>
              </div>
              <div style={styles.bulSeqBox}>
                <div style={styles.bulSeqLabel}>BULLETIN DE NOTES</div>
                <div style={styles.bulSeqValue}>{selectedSeq}</div>
                <div style={styles.bulSeqYear}>Année 2024-2025</div>
              </div>
            </div>

            {/* Infos élève */}
            <div style={styles.bulInfoGrid}>
              {[
                ['Nom & Prénom', `${eleve.prenom} ${eleve.nom}`],
                ['Matricule', eleve.matricule],
                ['Classe', classe?.nom],
                ['Section', eleve.section],
                ['Date naissance', eleve.dateNaissance],
                ['Rang', `${bulletinExistant?.rang || '—'} / ${bulletinExistant?.effectif || '—'}`],
              ].map(([l, v]) => (
                <div key={l} style={styles.bulInfoItem}>
                  <div style={styles.bulInfoLabel}>{l}</div>
                  <div style={styles.bulInfoVal}>{v}</div>
                </div>
              ))}
            </div>

            {/* Tableau notes */}
            <div style={styles.bulSectionTitle}>📚 RÉSULTATS PAR MATIÈRE</div>
            <table style={styles.bulTable}>
              <thead>
                <tr style={{ background: '#1B4F72' }}>
                  {['Matière', 'Coeff.', 'Note /20', 'Note Pondérée', 'Appréciation'].map(h => (
                    <th key={h} style={styles.bulTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matieres.map((mat, i) => {
                  const n = bulletinExistant?.notes.find(n => n.matiereId === mat.id);
                  const coef = coefficients.find(c => c.classeId === eleve?.classeId && c.matiereId === mat.id);
                  const ponderee = n?.noteFinale !== undefined ? (Number(n.noteFinale) * (coef?.coefficient || 1)).toFixed(1) : '—';
                  return (
                    <tr key={mat.id} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                      <td style={styles.bulTd}><strong>{mat.nom}</strong></td>
                      <td style={{ ...styles.bulTd, textAlign: 'center' }}>{coef?.coefficient || 1}</td>
                      <td style={{ ...styles.bulTd, textAlign: 'center', fontWeight: 700, color: n?.noteFinale >= 10 ? '#166534' : '#991B1B' }}>
                        {n?.noteFinale ?? '—'}
                        {n?.evaluations?.length > 0 && (
                          <div style={{ fontSize: 10, marginTop: 4, color: 'var(--gray-500)' }}>
                            {n.evaluations.map((ev, idx) => (
                              <div key={idx}>{ev.name}: {ev.note}/20</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ ...styles.bulTd, textAlign: 'center' }}>{ponderee}</td>
                      <td style={{ ...styles.bulTd, color: 'var(--gray-600)' }}>{n?.noteFinale ? getAppreciation(Number(n.noteFinale)) : '—'}</td>
                    </tr>
                  );
                })}
                {/* Moyenne */}
                <tr style={{ background: '#1B4F72', color: 'white' }}>
                  <td style={{ ...styles.bulTd, color: 'white', fontWeight: 700 }} colSpan={2}>MOYENNE GÉNÉRALE</td>
                  <td style={{ ...styles.bulTd, textAlign: 'center', color: 'white', fontWeight: 900, fontSize: 18 }} colSpan={3}>
                    {getMoyenne(bulletinExistant)}/20
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Discipline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
              <div>
                <div style={styles.bulSectionTitle}>🎖️ ÉLÉMENTS DISCIPLINAIRES</div>
                <table style={{ ...styles.bulTable, marginTop: 0 }}>
                  <tbody>
                    {[
                      ['Absences (heures)', bulletinExistant?.absences],
                      ['Retards', bulletinExistant?.retards],
                      ['Conduite', bulletinExistant?.conduite],
                      ['Soin du travail', bulletinExistant?.soin],
                      ['Ponctualité', bulletinExistant?.ponctualite],
                    ].map(([l, v]) => (
                      <tr key={l}>
                        <td style={styles.bulTd}>{l}</td>
                        <td style={{ ...styles.bulTd, fontWeight: 600 }}>{v ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div style={styles.bulSectionTitle}>✍️ APPRÉCIATION GÉNÉRALE</div>
                <div style={styles.bulAppreciation}>
                  {bulletinExistant?.appreciationGenerale || '—'}
                </div>
                <div style={styles.bulSignature}>
                  <div style={styles.bulSignLine}><div style={styles.sigLine}/><div style={styles.sigLabel}>Signature du Maître</div></div>
                  <div style={styles.bulSignLine}><div style={styles.sigLine}/><div style={styles.sigLabel}>Cachet & Signature Direction</div></div>
                </div>
              </div>
            </div>

            <div style={styles.bulFooter}>
              Bulletin généré le {new Date().toLocaleDateString('fr-FR')} — École Les Étoiles, Douala
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle: { fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700 },
  moyBadge: { background: 'var(--primary)', color: 'white', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 15 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12 },
  noteInput: { width: 80, padding: '6px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, textAlign: 'center', outline: 'none' },
  appBadge: { fontSize: 12, fontWeight: 600 },
  disciplineGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0 16px' },

  // BULLETIN IMPRIMABLE
  bulletin: { background: 'white', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)' },
  bulHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 20, borderBottom: '3px solid #1B4F72', marginBottom: 20 },
  bulLogo: { fontSize: 40, width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF6FF', borderRadius: '50%' },
  bulSchool: { fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 900, color: '#1B4F72', margin: 0 },
  bulSchoolSub: { fontSize: 12, color: '#64748B', margin: '2px 0' },
  bulSeqBox: { textAlign: 'center', background: '#1B4F72', color: 'white', padding: '12px 20px', borderRadius: 10 },
  bulSeqLabel: { fontSize: 10, letterSpacing: 1, opacity: .7 },
  bulSeqValue: { fontSize: 22, fontWeight: 900 },
  bulSeqYear: { fontSize: 11, opacity: .7 },
  bulInfoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 },
  bulInfoItem: { background: '#F8FAFC', borderRadius: 8, padding: '8px 12px', border: '1px solid #E2E8F0' },
  bulInfoLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 },
  bulInfoVal: { fontSize: 14, fontWeight: 700, color: '#1E293B', marginTop: 2 },
  bulSectionTitle: { fontSize: 11, fontWeight: 700, color: '#1B4F72', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  bulTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  bulTh: { padding: '9px 12px', textAlign: 'left', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: .3 },
  bulTd: { padding: '8px 12px', borderBottom: '1px solid #E2E8F0', fontSize: 13 },
  bulAppreciation: { background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400E', minHeight: 80, marginTop: 8 },
  bulSignature: { display: 'flex', gap: 20, marginTop: 20 },
  bulSignLine: { flex: 1, textAlign: 'center' },
  sigLine: { height: 1, background: '#CBD5E1', marginBottom: 6 },
  sigLabel: { fontSize: 10, color: '#94A3B8' },
  bulFooter: { marginTop: 24, paddingTop: 12, borderTop: '1px solid #E2E8F0', fontSize: 11, color: '#94A3B8', textAlign: 'center' },
};