import React, { useState } from 'react';
import { useApp } from './AppContext';

export default function CoefficientsPage() {
  const { classes, matieres, coefficients, modifierCoefficient, peutAcceder } = useApp();
  const [selectedClasse, setSelectedClasse] = useState('');

  if (!peutAcceder('coefficients_ecriture')) {
    return <div>Accès non autorisé</div>;
  }

  const classe = classes.find(c => c.id === selectedClasse);

  const handleCoefficientChange = async (matiereId, value) => {
    const coef = coefficients.find(c => c.classeId === selectedClasse && c.matiereId === matiereId);
    if (coef) {
      await modifierCoefficient(coef.id, parseFloat(value));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Définir les Coefficients par Classe</h2>
      <div style={{ marginBottom: 20 }}>
        <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)}>
          <option value="">Sélectionner une classe</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>
      {selectedClasse && (
        <div>
          <h3>Coefficients pour {classe?.nom}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Matière</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Coefficient</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map(m => {
                const coef = coefficients.find(c => c.classeId === selectedClasse && c.matiereId === m.id);
                return (
                  <tr key={m.id}>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{m.nom}</td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      <input
                        type="number"
                        step="0.1"
                        value={coef?.coefficient || 1}
                        onChange={(e) => handleCoefficientChange(m.id, e.target.value)}
                        style={{ width: 60 }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}