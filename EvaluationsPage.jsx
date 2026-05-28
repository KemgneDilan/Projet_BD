import React, { useState } from 'react';
import { useApp } from './AppContext';

export default function EvaluationsPage() {
  const { utilisateurActif, classes, matieres, evaluations, definirEvaluations, peutAcceder } = useApp();
  const [selectedClasse, setSelectedClasse] = useState(utilisateurActif?.classeId || '');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [evalList, setEvalList] = useState([]);

  if (!peutAcceder('evaluations_ecriture')) {
    return <div>Accès non autorisé</div>;
  }

  const classe = classes.find(c => c.id === selectedClasse);
  const matiere = matieres.find(m => m.id === selectedMatiere);
  const existingEval = evaluations.find(e => e.classeId === selectedClasse && e.matiereId === selectedMatiere);

  const handleAddEval = () => {
    setEvalList([...evalList, { name: '', percentage: 0 }]);
  };

  const handleEvalChange = (index, field, value) => {
    const newList = [...evalList];
    newList[index][field] = value;
    setEvalList(newList);
  };

  const handleRemoveEval = (index) => {
    setEvalList(evalList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedClasse || !selectedMatiere) return;
    const total = evalList.reduce((sum, e) => sum + parseFloat(e.percentage || 0), 0);
    if (total !== 100) {
      alert('Le total des pourcentages doit être 100%');
      return;
    }
    await definirEvaluations(selectedClasse, selectedMatiere, evalList);
    setEvalList([]);
  };

  const loadExisting = () => {
    if (existingEval) {
      setEvalList(existingEval.evaluations);
    } else {
      setEvalList([]);
    }
  };

  React.useEffect(() => {
    loadExisting();
  }, [selectedClasse, selectedMatiere]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Définir les Évaluations</h2>
      <div style={{ marginBottom: 20 }}>
        <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} style={{ marginRight: 10 }}>
          <option value="">Sélectionner une classe</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={selectedMatiere} onChange={(e) => setSelectedMatiere(e.target.value)}>
          <option value="">Sélectionner une matière</option>
          {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
      </div>
      {selectedClasse && selectedMatiere && (
        <div>
          <h3>Évaluations pour {matiere?.nom} en {classe?.nom}</h3>
          {evalList.map((evalItem, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Nom de l'évaluation"
                value={evalItem.name}
                onChange={(e) => handleEvalChange(index, 'name', e.target.value)}
                style={{ marginRight: 10, flex: 1 }}
              />
              <input
                type="number"
                placeholder="Pourcentage"
                value={evalItem.percentage}
                onChange={(e) => handleEvalChange(index, 'percentage', parseFloat(e.target.value))}
                style={{ marginRight: 10, width: 100 }}
              />
              <button onClick={() => handleRemoveEval(index)}>Supprimer</button>
            </div>
          ))}
          <button onClick={handleAddEval} style={{ marginRight: 10 }}>Ajouter Évaluation</button>
          <button onClick={handleSave}>Enregistrer</button>
          <div style={{ marginTop: 10 }}>
            Total: {evalList.reduce((sum, e) => sum + parseFloat(e.percentage || 0), 0)}%
          </div>
        </div>
      )}
    </div>
  );
}