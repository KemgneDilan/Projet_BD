import React, { createContext, useContext, useState, useEffect } from 'react';
import mockData from './src/data/mockData';

const AppContext = createContext();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export function AppProvider({ children }) {
  const [utilisateurs, setUtilisateurs] = useState(mockData.users);
  const [classes, setClasses] = useState(mockData.classes);
  const [eleves, setEleves] = useState(mockData.eleves);
  const [matieres, setMatieres] = useState(mockData.matieres);
  const [frais, setFrais] = useState(mockData.frais);
  const [paiements, setPaiements] = useState(mockData.paiements);
  const [notes, setNotes] = useState(mockData.notes);
  const [coefficients, setCoefficients] = useState(mockData.coefficients);
  const [evaluations, setEvaluations] = useState(mockData.evaluations);
  const [utilisateurActif, setUtilisateurActif] = useState(null);
  const [notification, setNotification] = useState(null);
  const [ready, setReady] = useState(false);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const loadData = async () => {
      await delay(100);
      setReady(true);
    };
    loadData();
  }, []);

  const login = async (email, mdp) => {
    await delay(200);
    const user = utilisateurs.find((u) => u.email === email && u.motDePasse === mdp && u.actif);
    if (!user) {
      return false;
    }
    setUtilisateurActif(user);
    return true;
  };

  const logout = () => {
    setUtilisateurActif(null);
  };

  const ajouterEleve = async (data) => {
    await delay(100);
    const nouveau = { id: randomId(), ...data };
    setEleves((prev) => [nouveau, ...prev]);
    notify('Élève inscrit avec succès');
  };

  const modifierEleve = async (id, data) => {
    await delay(100);
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, ...data } : el)));
    notify('Élève mis à jour');
  };

  const supprimerEleve = async (id) => {
    await delay(100);
    setEleves((prev) => prev.filter((el) => el.id !== id));
    notify('Élève supprimé', 'warning');
  };

  const ajouterClasse = async (data) => {
    await delay(100);
    const nouvelle = { id: randomId(), effectif: 0, ...data };
    setClasses((prev) => [nouvelle, ...prev]);
    notify('Classe créée');
  };

  const modifierClasse = async (id, data) => {
    await delay(100);
    setClasses((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
    notify('Classe mise à jour');
  };

  const enregistrerPaiement = async (data) => {
    await delay(100);
    const nouveau = { id: randomId(), datePaiement: new Date().toISOString().slice(0, 10), ...data };
    setPaiements((prev) => [nouveau, ...prev]);
    notify('Paiement enregistré');
    return nouveau;
  };

  const enregistrerBulletin = async (data) => {
    await delay(100);
    const existing = notes.find((note) => note.id === data.id);
    if (existing) {
      setNotes((prev) => prev.map((note) => (note.id === data.id ? { ...note, ...data } : note)));
    } else {
      setNotes((prev) => [{ id: randomId(), ...data }, ...prev]);
    }
    notify('Bulletin enregistré');
  };

  const ajouterUtilisateur = async (data) => {
    await delay(100);
    const nouveau = { id: randomId(), actif: true, ...data };
    setUtilisateurs((prev) => [nouveau, ...prev]);
    notify('Utilisateur créé');
  };

  const modifierUtilisateur = async (id, data) => {
    await delay(100);
    setUtilisateurs((prev) => prev.map((user) => (user.id === id ? { ...user, ...data } : user)));
    if (utilisateurActif?.id === id) {
      setUtilisateurActif((prev) => ({ ...prev, ...data }));
    }
    notify('Profil mis à jour');
  };

  const saveFrais = async (data) => {
    await delay(100);
    setFrais(data);
    notify('Frais mis à jour');
  };

  const modifierCoefficient = async (id, coefficient) => {
    await delay(100);
    setCoefficients((prev) => prev.map((c) => (c.id === id ? { ...c, coefficient } : c)));
    notify('Coefficient mis à jour');
  };

  const definirEvaluations = async (classeId, matiereId, evaluationsData) => {
    await delay(100);
    const existing = evaluations.find((e) => e.classeId === classeId && e.matiereId === matiereId);
    if (existing) {
      setEvaluations((prev) => prev.map((e) => 
        e.id === existing.id ? { ...e, evaluations: evaluationsData } : e
      ));
    } else {
      const nouveau = { id: randomId(), classeId, matiereId, evaluations: evaluationsData };
      setEvaluations((prev) => [nouveau, ...prev]);
    }
    notify('Évaluations définies');
  };

  const getEleve = (id) => eleves.find((e) => e.id === id);
  const getClasse = (id) => classes.find((c) => c.id === id);
  const getElevesClasse = (classeId) => eleves.filter((e) => e.classeId === classeId && e.statut === 'actif');
  const getPaiementsEleve = (eleveId) => paiements.filter((p) => p.eleveId === eleveId);
  const getBulletins = (eleveId) => notes.filter((n) => n.eleveId === eleveId);
  const getBulletin = (eleveId, seq) => notes.find((n) => n.eleveId === eleveId && n.sequence === seq);
  const calculateNoteFinale = (evaluations, percentages) => {
    if (!evaluations || !percentages || evaluations.length !== percentages.length) return 0;
    let total = 0;
    evaluations.forEach((evalNote, index) => {
      const percentage = percentages[index]?.percentage || 0;
      total += (evalNote.note || 0) * (percentage / 100);
    });
    return total.toFixed(2);
  };
  const getMoyenne = (bulletin) => {
    if (!bulletin) return 0;
    const eleve = getEleve(bulletin.eleveId);
    if (!eleve) return 0;
    let total = 0;
    let coeff = 0;
    bulletin.notes.forEach((n) => {
      const coef = coefficients.find((c) => c.classeId === eleve.classeId && c.matiereId === n.matiereId);
      if (coef) {
        total += parseFloat(n.noteFinale) * coef.coefficient;
        coeff += coef.coefficient;
      }
    });
    return coeff ? (total / coeff).toFixed(2) : '0.00';
  };

  const peutAcceder = (action) => {
    const role = utilisateurActif?.role;
    const niveaux = {
      fondateur: ['tout'],
      directeur: ['gestion', 'eleves', 'classes', 'paiements', 'bulletins', 'transport', 'rapports', 'enseignants', 'coefficients_ecriture'],
      enseignant: ['eleves_lecture', 'bulletins_ecriture', 'classes_lecture', 'evaluations_ecriture'],
      parent: ['enfant_lecture', 'paiements_lecture', 'bulletins_lecture'],
    };
    const droits = niveaux[role] || [];
    return droits.includes('tout') || droits.includes(action);
  };

  if (!ready) {
    return <div style={{ padding: 28, fontSize: 16 }}>Chargement des données...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        utilisateurs,
        classes,
        eleves,
        matieres,
        frais,
        paiements,
        notes,
        coefficients,
        evaluations,
        utilisateurActif,
        login,
        logout,
        ajouterEleve,
        modifierEleve,
        supprimerEleve,
        ajouterClasse,
        modifierClasse,
        enregistrerPaiement,
        enregistrerBulletin,
        ajouterUtilisateur,
        modifierUtilisateur,
        setFrais: saveFrais,
        modifierCoefficient,
        definirEvaluations,
        calculateNoteFinale,
        getEleve,
        getClasse,
        getElevesClasse,
        getPaiementsEleve,
        getBulletins,
        getBulletin,
        getMoyenne,
        peutAcceder,
        notify,
        notification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
