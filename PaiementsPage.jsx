import React, { useState } from 'react';
import { useApp } from './AppContext';

export default function PaiementsPage() {
  const { eleves, classes, paiements, frais, enregistrerPaiement, utilisateurActif, setFrais } = useApp();
  const [modal, setModal] = useState(null);
  const [selectedEleve, setSelectedEleve] = useState('');
  const [formPay, setFormPay] = useState({ type: 'scolarite', montant: '', statut: 'payé', trancheId: '' });
  const [search, setSearch] = useState('');
  const [onglet, setOnglet] = useState('liste'); // liste | eleve | parametres

  const role = utilisateurActif?.role;
  const peutModifier = ['directeur', 'fondateur'].includes(role);

  const actifs = eleves.filter(e => e.statut === 'actif');
  const elevesFiltered = actifs.filter(e => {
    if (role === 'parent') return e.parentEmail === utilisateurActif?.email;
    return true;
  });

  const totalEncaisse = paiements.filter(p => p.statut === 'payé').reduce((s, p) => s + p.montant, 0);
  const totalAttendu = actifs.length * (frais.inscription + frais.scolariteAnnuelle);
  const tauxRecouvrement = totalAttendu ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;

  const paiementsFiltered = paiements.filter(p => {
    if (role === 'parent') {
      const e = eleves.find(e => e.id === p.eleveId);
      return e?.parentEmail === utilisateurActif?.email;
    }
    if (!search) return true;
    const e = eleves.find(e => e.id === p.eleveId);
    return e && (e.nom.toLowerCase().includes(search.toLowerCase()) || e.prenom.toLowerCase().includes(search.toLowerCase()) || p.recu.toLowerCase().includes(search.toLowerCase()));
  });

  const getNomEleve = (id) => {
    const e = eleves.find(e => e.id === id);
    return e ? `${e.prenom} ${e.nom}` : '—';
  };

  const openPaiement = (eleveId) => {
    setSelectedEleve(eleveId || '');
    setFormPay({ type: 'scolarite', montant: frais.scolariteAnnuelle / frais.tranches.length, statut: 'payé', trancheId: frais.tranches[0]?.id });
    setModal('paiement');
  };

  const savePaiement = () => {
    enregistrerPaiement({ ...formPay, eleveId: selectedEleve, montant: Number(formPay.montant) });
    setModal(null);
  };

  const getPaiementsEleve = (eleveId) => paiements.filter(p => p.eleveId === eleveId);
  const estInscrit = (eleveId) => paiements.some(p => p.eleveId === eleveId && p.type === 'inscription' && p.statut === 'payé');
  const totalPaye = (eleveId) => paiements.filter(p => p.eleveId === eleveId && p.statut === 'payé').reduce((s, p) => s + p.montant, 0);

  const printRecu = (p) => {
    const e = eleves.find(el => el.id === p.eleveId);
    const cl = classes.find(c => c.id === e?.classeId);
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Reçu ${p.recu}</title><style>
      body{font-family:Arial,sans-serif;padding:40px;max-width:500px;margin:auto}
      .header{text-align:center;border-bottom:2px solid #1B4F72;padding-bottom:16px;margin-bottom:20px}
      h1{color:#1B4F72;margin:0;font-size:22px}.sub{color:#666;font-size:13px}
      .field{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px}
      .total{font-size:20px;font-weight:bold;color:#1B4F72;text-align:center;margin-top:20px;padding:16px;background:#EFF6FF;border-radius:8px}
      .footer{text-align:center;margin-top:24px;font-size:12px;color:#999}
      .stamp{border:2px solid #1B4F72;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;margin:20px auto;font-weight:bold;color:#1B4F72;font-size:11px;text-align:center}
    </style></head><body>
      <div class="header"><h1>🎓 ÉCOLE LES ÉTOILES</h1><p class="sub">Douala, Cameroun — Reçu de paiement</p></div>
      <div class="field"><span>N° Reçu</span><strong>${p.recu}</strong></div>
      <div class="field"><span>Date</span><span>${p.date}</span></div>
      <div class="field"><span>Élève</span><strong>${e?.prenom} ${e?.nom}</strong></div>
      <div class="field"><span>Matricule</span><span>${e?.matricule}</span></div>
      <div class="field"><span>Classe</span><span>${cl?.nom || '—'}</span></div>
      <div class="field"><span>Type de paiement</span><span style="text-transform:capitalize">${p.type}</span></div>
      <div class="field"><span>Statut</span><span>${p.statut}</span></div>
      <div class="total">Montant: ${p.montant.toLocaleString('fr')} FCFA</div>
      <div class="stamp">PAYÉ ✓</div>
      <div class="field"><span>Caissier</span><span>${p.caissier || '—'}</span></div>
      <div class="footer">École Les Étoiles · BP 1234 · Douala · Tél: +237 677 000 000<br>Ce reçu est valable comme preuve de paiement</div>
    </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div style={styles.container}>
      {/* Stats */}
      {peutModifier && (
        <div style={styles.statsRow}>
          {[
            { label: 'Total encaissé', value: totalEncaisse.toLocaleString('fr') + ' FCFA', icon: '💰', color: '#27AE60' },
            { label: 'Taux recouvrement', value: tauxRecouvrement + '%', icon: '📈', color: '#2980B9' },
            { label: 'Nbre de reçus', value: paiements.length, icon: '🧾', color: '#F39C12' },
            { label: 'Élèves actifs', value: actifs.length, icon: '👦', color: '#8E44AD' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1 }}>
              <div className="stat-icon" style={{ background: s.color + '18' }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
              <div><div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div className="pill-tabs">
        {[['liste', '📋 Tous les paiements'], ['eleve', '👦 Par élève'], ...(role === 'fondateur' ? [['parametres', '⚙️ Paramètres']] : [])].map(([k, l]) => (
          <button key={k} className={`pill-tab ${onglet === k ? 'active' : ''}`} onClick={() => setOnglet(k)}>{l}</button>
        ))}
      </div>

      {/* LISTE PAIEMENTS */}
      {onglet === 'liste' && (
        <div className="card">
          <div className="card-header">
            <input className="form-control" placeholder="🔍 Rechercher..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }}/>
            {peutModifier && (
              <button className="btn btn-primary" onClick={() => openPaiement('')}>+ Enregistrer un paiement</button>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Reçu</th><th>Élève</th><th>Type</th><th>Montant</th><th>Date</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paiementsFiltered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Aucun paiement trouvé</td></tr>
                )}
                {paiementsFiltered.slice().reverse().map(p => (
                  <tr key={p.id}>
                    <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{p.recu}</code></td>
                    <td><strong>{getNomEleve(p.eleveId)}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.type}{p.trancheId ? ` (${frais.tranches.find(t => t.id === p.trancheId)?.nom || ''})` : ''}</td>
                    <td><strong style={{ color: 'var(--success)' }}>{p.montant.toLocaleString('fr')} FCFA</strong></td>
                    <td>{p.date}</td>
                    <td><span className={`badge ${p.statut === 'payé' ? 'badge-success' : 'badge-warning'}`}>{p.statut}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => printRecu(p)}>🖨️ Reçu</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAR ÉLÈVE */}
      {onglet === 'eleve' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {elevesFiltered.map(eleve => {
            const cl = classes.find(c => c.id === eleve.classeId);
            const pays = getPaiementsEleve(eleve.id);
            const total = totalPaye(eleve.id);
            const inscrit = estInscrit(eleve.id);
            const totalDu = frais.inscription + frais.scolariteAnnuelle + (eleve.bus ? frais.bus : 0);
            const restant = Math.max(0, totalDu - total);
            return (
              <div key={eleve.id} className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={styles.avatarSmall}>{eleve.prenom[0]}{eleve.nom[0]}</div>
                    <div>
                      <strong>{eleve.prenom} {eleve.nom}</strong>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{cl?.nom} · {eleve.matricule}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${inscrit ? 'badge-success' : 'badge-danger'}`}>{inscrit ? 'Inscrit' : 'Non inscrit'}</span>
                    {peutModifier && <button className="btn btn-primary btn-sm" onClick={() => openPaiement(eleve.id)}>+ Paiement</button>}
                  </div>
                </div>
                <div className="card-body">
                  <div style={styles.payProgress}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span>Payé: <strong style={{ color: 'var(--success)' }}>{total.toLocaleString('fr')} FCFA</strong></span>
                      <span>Restant: <strong style={{ color: restant > 0 ? 'var(--danger)' : 'var(--success)' }}>{restant.toLocaleString('fr')} FCFA</strong></span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: Math.min(100, (total / totalDu) * 100) + '%' }}/>
                    </div>
                  </div>
                  {pays.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      {pays.map(p => (
                        <div key={p.id} style={styles.payItem}>
                          <span style={{ fontSize: 12 }}>{p.recu} — {p.type} — {p.date}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <strong style={{ color: 'var(--success)' }}>{p.montant.toLocaleString('fr')} FCFA</strong>
                            <span className="badge badge-success" style={{ fontSize: 10 }}>{p.statut}</span>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => printRecu(p)}>🖨️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PARAMÈTRES FRAIS */}
      {onglet === 'parametres' && role === 'fondateur' && (
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 700 }}>⚙️ Paramétrage des frais scolaires</h3></div>
          <div className="card-body">
            <div style={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Frais d'inscription (FCFA)</label>
                <input className="form-control" type="number" value={frais.inscription}
                  onChange={e => setFrais(prev => ({ ...prev, inscription: Number(e.target.value) }))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Scolarité annuelle (FCFA)</label>
                <input className="form-control" type="number" value={frais.scolariteAnnuelle}
                  onChange={e => setFrais(prev => ({ ...prev, scolariteAnnuelle: Number(e.target.value) }))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Frais de bus (FCFA/an)</label>
                <input className="form-control" type="number" value={frais.bus}
                  onChange={e => setFrais(prev => ({ ...prev, bus: Number(e.target.value) }))}/>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={styles.sectionLabel}>Tranches de paiement</div>
              {frais.tranches.map((t, i) => (
                <div key={t.id} style={styles.trancheRow}>
                  <input className="form-control" value={t.nom}
                    onChange={e => setFrais(prev => ({ ...prev, tranches: prev.tranches.map((tr, j) => j === i ? { ...tr, nom: e.target.value } : tr) }))}
                    style={{ flex: 1 }}/>
                  <input className="form-control" type="number" value={t.montant}
                    onChange={e => setFrais(prev => ({ ...prev, tranches: prev.tranches.map((tr, j) => j === i ? { ...tr, montant: Number(e.target.value) } : tr) }))}
                    style={{ width: 130 }} placeholder="Montant"/>
                  <input className="form-control" type="date" value={t.echeance}
                    onChange={e => setFrais(prev => ({ ...prev, tranches: prev.tranches.map((tr, j) => j === i ? { ...tr, echeance: e.target.value } : tr) }))}
                    style={{ width: 150 }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAIEMENT */}
      {modal === 'paiement' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700 }}>💰 Enregistrer un paiement</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {!selectedEleve && (
                <div className="form-group">
                  <label className="form-label">Élève *</label>
                  <select className="form-control" value={selectedEleve} onChange={e => setSelectedEleve(e.target.value)}>
                    <option value="">— Choisir un élève —</option>
                    {actifs.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {e.matricule}</option>)}
                  </select>
                </div>
              )}
              {selectedEleve && (
                <div style={styles.eleveSelected}>
                  <strong>{eleves.find(e => e.id === selectedEleve)?.prenom} {eleves.find(e => e.id === selectedEleve)?.nom}</strong>
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{eleves.find(e => e.id === selectedEleve)?.matricule}</span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Type de paiement</label>
                <select className="form-control" value={formPay.type} onChange={e => {
                  const type = e.target.value;
                  const montant = type === 'inscription' ? frais.inscription : type === 'bus' ? frais.bus : frais.tranches[0]?.montant;
                  setFormPay({ ...formPay, type, montant, trancheId: type === 'scolarite' ? frais.tranches[0]?.id : '' });
                }}>
                  <option value="inscription">Frais d'inscription</option>
                  <option value="scolarite">Scolarité (par tranche)</option>
                  <option value="bus">Frais de bus</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              {formPay.type === 'scolarite' && (
                <div className="form-group">
                  <label className="form-label">Tranche</label>
                  <select className="form-control" value={formPay.trancheId}
                    onChange={e => { const t = frais.tranches.find(t => t.id === e.target.value); setFormPay({ ...formPay, trancheId: e.target.value, montant: t?.montant }); }}>
                    {frais.tranches.map(t => <option key={t.id} value={t.id}>{t.nom} — {t.montant.toLocaleString('fr')} FCFA</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Montant (FCFA) *</label>
                <input className="form-control" type="number" value={formPay.montant}
                  onChange={e => setFormPay({ ...formPay, montant: e.target.value })}/>
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={formPay.statut} onChange={e => setFormPay({ ...formPay, statut: e.target.value })}>
                  <option value="payé">Payé</option>
                  <option value="en attente">En attente</option>
                  <option value="partiel">Partiel</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={savePaiement} disabled={!selectedEleve || !formPay.montant}>
                ✅ Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  statsRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  payProgress: { marginBottom: 4 },
  progressBar: { height: 8, background: 'var(--gray-100)', borderRadius: 99 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #27AE60, #2ECC71)', borderRadius: 99, transition: 'width .4s ease' },
  payItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: 'var(--gray-50)', borderRadius: 8, marginBottom: 6 },
  avatarSmall: { width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 },
  trancheRow: { display: 'flex', gap: 10, marginBottom: 10 },
  eleveSelected: { background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 14 },
};