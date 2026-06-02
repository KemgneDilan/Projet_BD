/**
 * @file CoefficientsPage.jsx
 * @description Interface de gestion des coefficients par classe.
 * - Sélecteur de classe stylisé (card interactive)
 * - Tableau premium avec boutons +/- (pas à 0.5)
 * - Filtrage des matières par classe
 * - Accès : directeur et fondateur uniquement
 */
import React, { useState } from 'react';
import { useApp } from './AppContext';
import T from './src/i18n/translations';

export default function CoefficientsPage() {
  const {
    classes, matieres, coefficients,
    modifierCoefficient, peutAcceder, langue,
    getMatieresClasse,
  } = useApp();
  const t = T[langue] || T.fr;

  // ID de la classe sélectionnée
  const [selectedClasse, setSelectedClasse] = useState('');
  // Afficher ou non le dropdown de sélection de classe
  const [showClassePicker, setShowClassePicker] = useState(false);

  if (!peutAcceder('coefficients_ecriture')) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: 52 }}>🔒</span>
        <h3>{t.accesNonAutorise}</h3>
      </div>
    );
  }

  const classe = classes.find(c => c.id === selectedClasse);
  // Matières filtrées pour la classe sélectionnée, triées par ordre
  const matieresClasse = selectedClasse ? getMatieresClasse(selectedClasse) : [];

  /** Incrémente ou décrémente le coefficient d'une matière par pas de 0.5 */
  const handleStep = async (matiereId, delta) => {
    const coef = coefficients.find(c => c.classeId === selectedClasse && c.matiereId === matiereId);
    if (!coef) return;
    const next = Math.max(0.5, Math.round((coef.coefficient + delta) * 2) / 2);
    await modifierCoefficient(coef.id, next);
  };

  /** Saisie directe du coefficient */
  const handleInput = async (matiereId, val) => {
    const coef = coefficients.find(c => c.classeId === selectedClasse && c.matiereId === matiereId);
    if (!coef) return;
    const parsed = Math.max(0.5, parseFloat(val) || 0.5);
    await modifierCoefficient(coef.id, parsed);
  };

  const SECTION_COLORS = {
    francophone: '#1B4F72',
    anglophone:  '#27AE60',
    bilingue:    '#8E44AD',
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Titre ── */}
      <div>
        <div className="section-title">⚖️ {t.coefficientsClasse}</div>
        <div className="section-subtitle">
          {langue === 'fr'
            ? 'Modifiez les coefficients de pondération par matière et par classe.'
            : 'Edit the weighting coefficients per subject and class.'}
        </div>
      </div>

      {/* ── Sélecteur de classe stylisé ── */}
      <div style={{ position: 'relative' }}>
        <div
          className={`select-card ${selectedClasse ? 'active' : ''}`}
          onClick={() => setShowClassePicker(p => !p)}
          style={{ cursor: 'pointer', maxWidth: 420 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: classe ? (SECTION_COLORS[classe.section] + '20') : 'var(--gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>🏫</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {classe ? classe.nom : t.choisirClasseCoeff}
              </div>
              {classe && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {classe.section} · {classe.annee}
                </div>
              )}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', transform: showClassePicker ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
        </div>

        {/* Dropdown liste de classes */}
        {showClassePicker && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, maxWidth: 420, zIndex: 200,
            background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
            borderRadius: 14, boxShadow: 'var(--shadow-lg)', marginTop: 6, overflow: 'hidden',
          }}>
            {classes.map(c => {
              const color = SECTION_COLORS[c.section] || '#1B4F72';
              return (
                <div
                  key={c.id}
                  onClick={() => { setSelectedClasse(c.id); setShowClassePicker(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    cursor: 'pointer', transition: 'background .15s',
                    background: selectedClasse === c.id ? 'var(--gray-50)' : 'transparent',
                    borderLeft: selectedClasse === c.id ? `3px solid ${color}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = selectedClasse === c.id ? 'var(--gray-50)' : 'transparent'}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.section} · {c.niveau}</div>
                  </div>
                  {selectedClasse === c.id && <span style={{ color: '#27AE60', fontSize: 16 }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Tableau des coefficients ── */}
      {selectedClasse && (
        <div className="card animate-fade">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {t.coeffPour} <span style={{ color: 'var(--primary)' }}>{classe?.nom}</span>
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {langue === 'fr'
                  ? `${matieresClasse.length} matière(s) · Pas de modification : 0.5`
                  : `${matieresClasse.length} subject(s) · Step: 0.5`}
              </div>
            </div>
            <div style={{
              background: 'var(--primary)', color: 'white',
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600
            }}>
              {matieresClasse.length} {langue === 'fr' ? 'matières' : 'subjects'}
            </div>
          </div>

          {matieresClasse.length === 0 ? (
            <div className="card-body">
              <div className="empty-state" style={{ padding: 32 }}>
                <span style={{ fontSize: 36 }}>📚</span>
                <p>{t.aucuneMatiere}</p>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '60%' }}>{t.matiere}</th>
                    <th style={{ textAlign: 'center' }}>{t.coeff}</th>
                    <th style={{ textAlign: 'center' }}>
                      {langue === 'fr' ? 'Ajustement' : 'Adjust'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matieresClasse.map((mat, i) => {
                    const coef = coefficients.find(
                      c => c.classeId === selectedClasse && c.matiereId === mat.id
                    );
                    const val = coef?.coefficient ?? 1;
                    return (
                      <tr key={mat.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: `hsl(${(i * 47) % 360}, 55%, 92%)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 700,
                              color: `hsl(${(i * 47) % 360}, 55%, 35%)`,
                              flexShrink: 0,
                            }}>
                              {mat.ordre}
                            </div>
                            <strong style={{ color: 'var(--text-primary)' }}>{mat.nom}</strong>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {/* Input numérique centré */}
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={val}
                            onChange={e => handleInput(mat.id, e.target.value)}
                            style={{
                              width: 70, textAlign: 'center', fontWeight: 700, fontSize: 15,
                              border: '2px solid var(--border-color)', borderRadius: 10,
                              padding: '6px 8px', background: 'var(--bg-input)',
                              color: 'var(--text-primary)', outline: 'none',
                              transition: 'border-color .15s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {/* Boutons +/- par pas de 0.5 */}
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              onClick={() => handleStep(mat.id, -0.5)}
                              disabled={val <= 0.5}
                              style={{
                                width: 32, height: 32, borderRadius: 8, border: 'none',
                                background: val <= 0.5 ? 'var(--gray-100)' : 'var(--danger)',
                                color: val <= 0.5 ? 'var(--text-muted)' : 'white',
                                fontWeight: 700, fontSize: 18, cursor: val <= 0.5 ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .15s',
                              }}
                            >−</button>
                            <button
                              onClick={() => handleStep(mat.id, +0.5)}
                              style={{
                                width: 32, height: 32, borderRadius: 8, border: 'none',
                                background: 'var(--success)', color: 'white',
                                fontWeight: 700, fontSize: 18, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .15s',
                              }}
                            >+</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* État vide si aucune classe sélectionnée */}
      {!selectedClasse && (
        <div className="empty-state">
          <span style={{ fontSize: 52 }}>⚖️</span>
          <h3>{langue === 'fr' ? 'Sélectionnez une classe' : 'Select a class'}</h3>
          <p>{langue === 'fr'
            ? 'Choisissez une classe ci-dessus pour gérer ses coefficients.'
            : 'Choose a class above to manage its coefficients.'}</p>
        </div>
      )}
    </div>
  );
}