/**
 * @file AppContext.jsx
 * @description Contexte global de l'application.
 * Gère l'état partagé : utilisateurs, élèves, classes, matières (par classe),
 * bulletins, paiements, évaluations, coefficients, messages, dark mode, langue,
 * et navigation avec historique.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import mockData from './src/data/mockData';

const AppContext = createContext();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

/** Calcule l'année scolaire à partir d'une date donnée */
const calcAnneeScolaire = (date = new Date()) => {
  const d = new Date(date);
  const month = d.getMonth(); // 0=jan … 11=dec
  return month >= 8
    ? `${d.getFullYear()}-${d.getFullYear() + 1}`
    : `${d.getFullYear() - 1}-${d.getFullYear()}`;
};

export function AppProvider({ children }) {
  /* ── État principal ─────────────────────────────────────────── */
  const [utilisateurs, setUtilisateurs] = useState(mockData.users);
  const [classes,      setClasses]      = useState(mockData.classes);
  const [eleves,       setEleves]       = useState(mockData.eleves);
  const [matieres,     setMatieres]     = useState(mockData.matieres);
  const [frais,        setFraisState]   = useState(mockData.frais);
  const [paiements,    setPaiements]    = useState(mockData.paiements);
  const [notes,        setNotes]        = useState(mockData.notes);
  const [coefficients, setCoefficients] = useState(mockData.coefficients);
  const [evaluations,  setEvaluations]  = useState(mockData.evaluations);
  const [messages,     setMessages]     = useState(mockData.messages);
  const [schoolSettings, setSchoolSettings] = useState({
    nom: 'École Les Étoiles',
    sousTitreFR: 'Primaire & Maternelle — Yaoundé, Cameroun',
    sousTitreEN: 'Primary & Nursery School — Yaoundé, Cameroon',
    ville: 'Douala',
    email: 'contact@lesetoiles.cm',
    telephone: '+237 677 000 000'
  });

  /* ── UI globale ─────────────────────────────────────────────── */
  const [utilisateurActif, setUtilisateurActif] = useState(null);
  const [notification,     setNotification]     = useState(null);
  const [darkMode,         setDarkMode]         = useState(false);
  const [langue,           setLangue]           = useState('fr'); // 'fr' | 'en'
  const [ready,            setReady]            = useState(false);

  /* ── Navigation avec historique ─────────────────────────────── */
  const [pageHistory, setPageHistory] = useState(['dashboard']);
  const currentPage = pageHistory[pageHistory.length - 1];

  /** Navigue vers une nouvelle page en empilant dans l'historique */
  const naviguer = useCallback((page) => {
    setPageHistory(prev => {
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  }, []);

  /** Retourne à la page précédente */
  const goBack = useCallback(() => {
    setPageHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  /* ── Thème dark mode ────────────────────────────────────────── */
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  /* ── Langue ─────────────────────────────────────────────────── */
  const toggleLangue = () => setLangue(prev => prev === 'fr' ? 'en' : 'fr');

  /* ── Notification toast ─────────────────────────────────────── */
  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  /* ── Chargement initial ─────────────────────────────────────── */
  useEffect(() => {
    delay(100).then(() => setReady(true));
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     AUTH
  ═══════════════════════════════════════════════════════════════ */
  const login = async (email, mdp) => {
    await delay(200);
    const user = utilisateurs.find(u => u.email === email && u.motDePasse === mdp && u.actif);
    if (!user) return false;
    setUtilisateurActif(user);
    setPageHistory(['dashboard']);
    return true;
  };

  const logout = () => {
    setUtilisateurActif(null);
    setPageHistory(['dashboard']);
  };

  /* ═══════════════════════════════════════════════════════════════
     ÉLÈVES
  ═══════════════════════════════════════════════════════════════ */
  const ajouterEleve = async (data) => {
    await delay(100);
    const dateInscription = new Date().toISOString();
    const anneeScolaire = calcAnneeScolaire(dateInscription);
    const matricule = `MAT-${new Date().getFullYear()}-${String(eleves.length + 1).padStart(3, '0')}`;
    const nouveau = { id: randomId(), matricule, dateInscription, anneeScolaire, statut: 'actif', ...data };
    setEleves(prev => [nouveau, ...prev]);
    notify('Élève inscrit avec succès');
    return nouveau;
  };

  const modifierEleve = async (id, data) => {
    await delay(100);
    setEleves(prev => prev.map(el => el.id === id ? { ...el, ...data } : el));
    notify('Élève mis à jour');
  };

  const supprimerEleve = async (id) => {
    await delay(100);
    setEleves(prev => prev.filter(el => el.id !== id));
    notify('Élève supprimé', 'warning');
  };

  /* ═══════════════════════════════════════════════════════════════
     CLASSES
  ═══════════════════════════════════════════════════════════════ */
  const ajouterClasse = async (data) => {
    await delay(100);
    const nouvelle = { id: randomId(), effectif: 0, annee: '2025-2026', ...data };
    setClasses(prev => [nouvelle, ...prev]);
    notify('Classe créée');
    return nouvelle;
  };

  const modifierClasse = async (id, data) => {
    await delay(100);
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    notify('Classe mise à jour');
  };

  const supprimerClasse = async (id) => {
    await delay(100);
    setClasses(prev => prev.filter(c => c.id !== id));
    setMatieres(prev => prev.filter(m => m.classeId !== id));
    setCoefficients(prev => prev.filter(c => c.classeId !== id));
    setEvaluations(prev => prev.filter(e => e.classeId !== id));
    notify('Classe supprimée', 'warning');
  };

  /* ═══════════════════════════════════════════════════════════════
     MATIÈRES (par classe)
  ═══════════════════════════════════════════════════════════════ */
  const ajouterMatiere = async (classeId, nom) => {
    await delay(100);
    const id = randomId();
    const ordre = matieres.filter(m => m.classeId === classeId).length + 1;
    const nouvelle = { id, classeId, nom, ordre };
    setMatieres(prev => [...prev, nouvelle]);
    // Créer automatiquement un coefficient par défaut (1)
    const coefId = randomId();
    setCoefficients(prev => [...prev, { id: coefId, classeId, matiereId: id, coefficient: 1 }]);
    notify('Matière ajoutée');
    return nouvelle;
  };

  const modifierMatiere = async (id, data) => {
    await delay(100);
    setMatieres(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    notify('Matière mise à jour');
  };

  const supprimerMatiere = async (id) => {
    await delay(100);
    setMatieres(prev => prev.filter(m => m.id !== id));
    setCoefficients(prev => prev.filter(c => c.matiereId !== id));
    setEvaluations(prev => prev.filter(e => e.matiereId !== id));
    notify('Matière supprimée', 'warning');
  };

  /** Retourne les matières d'une classe, triées par ordre */
  const getMatieresClasse = (classeId) =>
    matieres.filter(m => m.classeId === classeId).sort((a, b) => a.ordre - b.ordre);

  /* ═══════════════════════════════════════════════════════════════
     PAIEMENTS
  ═══════════════════════════════════════════════════════════════ */
  const enregistrerPaiement = async (data) => {
    await delay(100);
    const now = new Date();
    const nouveau = {
      id: randomId(),
      recu: `REC-${now.getFullYear()}-${String(paiements.length + 1).padStart(3, '0')}`,
      date: now.toISOString().slice(0, 10),
      datePaiement: now.toISOString(),
      ...data
    };
    setPaiements(prev => [nouveau, ...prev]);
    notify('Paiement enregistré');
    return nouveau;
  };

  /* ═══════════════════════════════════════════════════════════════
     BULLETINS / NOTES
  ═══════════════════════════════════════════════════════════════ */
  const enregistrerBulletin = async (data) => {
    await delay(100);
    const existing = notes.find(n => n.eleveId === data.eleveId && n.sequence === data.sequence);
    if (existing) {
      setNotes(prev => prev.map(n => n.id === existing.id ? { ...n, ...data } : n));
    } else {
      setNotes(prev => [{ id: randomId(), ...data }, ...prev]);
    }
    notify('Bulletin enregistré');
  };

  /** 
   * Saisie de masse pour une matière et une séquence données
   * Mises à jour partielles de plusieurs bulletins d'un coup
   */
  const updateNotesMasse = async (classeId, matiereId, sequence, donneesEleves) => {
    await delay(100);
    setNotes(prev => {
      let newNotes = [...prev];
      Object.entries(donneesEleves).forEach(([eleveId, dataMatiere]) => {
        const existingBulletinIdx = newNotes.findIndex(n => n.eleveId === eleveId && n.sequence === sequence);
        
        if (existingBulletinIdx >= 0) {
          // Bulletin existe déjà
          const bulletin = { ...newNotes[existingBulletinIdx] };
          const notesMatiereIdx = bulletin.notes.findIndex(n => n.matiereId === matiereId);
          
          if (notesMatiereIdx >= 0) {
            bulletin.notes[notesMatiereIdx] = { matiereId, ...dataMatiere };
          } else {
            bulletin.notes = [...bulletin.notes, { matiereId, ...dataMatiere }];
          }
          newNotes[existingBulletinIdx] = bulletin;
        } else {
          // Nouveau bulletin pour cette séquence
          const anneeScolaire = '2025-2026';
          newNotes.push({
            id: randomId(),
            eleveId,
            sequence,
            anneeScolaire,
            notes: [{ matiereId, ...dataMatiere }],
            absences: 0,
            retards: 0,
            conduite: '',
            soin: '',
            ponctualite: '',
            appreciationGenerale: '',
            dateConseil: ''
          });
        }
      });
      return newNotes;
    });
    notify('Notes enregistrées avec succès');
  };

  /* ═══════════════════════════════════════════════════════════════
     RANG AUTOMATIQUE
     Calcule le rang de chaque élève dans sa classe pour une séquence donnée.
     Le rang est déduit des moyennes, non saisi manuellement.
  ═══════════════════════════════════════════════════════════════ */
  const calculerRang = (eleveId, classeId, sequence) => {
    // Tous les bulletins de la même classe et séquence
    const elevesDeLaClasse = eleves.filter(e => e.classeId === classeId && e.statut === 'actif');
    const bulletinsClasse = elevesDeLaClasse
      .map(e => {
        const b = notes.find(n => n.eleveId === e.id && n.sequence === sequence);
        return { eleveId: e.id, moyenne: b ? parseFloat(getMoyenneFromBulletin(b, classeId)) : -1 };
      })
      .filter(b => b.moyenne >= 0)
      .sort((a, b) => b.moyenne - a.moyenne);

    const index = bulletinsClasse.findIndex(b => b.eleveId === eleveId);
    return index >= 0 ? index + 1 : null;
  };

  /* ═══════════════════════════════════════════════════════════════
     CALCULS DE MOYENNES
  ═══════════════════════════════════════════════════════════════ */
  /** Calcule la note finale pondérée d'une matière */
  const calculateNoteFinale = (evalNotes, evalDefs) => {
    if (!evalNotes?.length || !evalDefs?.length) return 0;
    let total = 0;
    evalNotes.forEach((evalNote, index) => {
      const pct = evalDefs[index]?.percentage || 0;
      total += (parseFloat(evalNote.note) || 0) * (pct / 100);
    });
    return parseFloat(total.toFixed(2));
  };

  /** Calcule la moyenne générale d'un bulletin pour une classe donnée */
  const getMoyenneFromBulletin = (bulletin, classeId) => {
    if (!bulletin) return '0.00';
    let total = 0, coeff = 0;
    bulletin.notes.forEach(n => {
      const coef = coefficients.find(c => c.classeId === classeId && c.matiereId === n.matiereId);
      if (coef && n.noteFinale !== '' && n.noteFinale !== undefined) {
        total += parseFloat(n.noteFinale) * coef.coefficient;
        coeff += coef.coefficient;
      }
    });
    return coeff ? (total / coeff).toFixed(2) : '0.00';
  };

  /** getMoyenne compatible ancienne API — accepte un bulletin avec eleveId */
  const getMoyenne = (bulletin) => {
    if (!bulletin) return '0.00';
    const eleve = eleves.find(e => e.id === bulletin.eleveId);
    if (!eleve) return '0.00';
    return getMoyenneFromBulletin(bulletin, eleve.classeId);
  };

  /* ═══════════════════════════════════════════════════════════════
     ÉVALUATIONS & COEFFICIENTS
  ═══════════════════════════════════════════════════════════════ */
  const definirEvaluations = async (classeId, matiereId, evaluationsData) => {
    await delay(100);
    const existing = evaluations.find(e => e.classeId === classeId && e.matiereId === matiereId);
    if (existing) {
      setEvaluations(prev => prev.map(e =>
        e.id === existing.id ? { ...e, evaluations: evaluationsData } : e
      ));
    } else {
      setEvaluations(prev => [{ id: randomId(), classeId, matiereId, evaluations: evaluationsData }, ...prev]);
    }
    notify('Évaluations définies');
  };

  const modifierCoefficient = async (id, coefficient) => {
    await delay(100);
    setCoefficients(prev => prev.map(c => c.id === id ? { ...c, coefficient } : c));
    notify('Coefficient mis à jour');
  };

  /* ═══════════════════════════════════════════════════════════════
     UTILISATEURS / PERSONNEL
  ═══════════════════════════════════════════════════════════════ */
  const ajouterUtilisateur = async (data) => {
    await delay(100);
    const nouveau = { id: randomId(), actif: true, classesIds: [], ...data };
    setUtilisateurs(prev => [nouveau, ...prev]);
    notify('Utilisateur créé');
    return nouveau;
  };

  const modifierUtilisateur = async (id, data) => {
    await delay(100);
    setUtilisateurs(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (utilisateurActif?.id === id) {
      setUtilisateurActif(prev => ({ ...prev, ...data }));
    }
    notify('Profil mis à jour');
  };

  const supprimerUtilisateur = async (id) => {
    await delay(100);
    setUtilisateurs(prev => prev.filter(u => u.id !== id));
    notify('Utilisateur supprimé', 'warning');
  };

  /* ═══════════════════════════════════════════════════════════════
     MESSAGERIE
  ═══════════════════════════════════════════════════════════════ */
  const envoyerMessage = async (data) => {
    await delay(100);
    const nouveau = {
      id: randomId(),
      expediteurId: utilisateurActif?.id,
      dateEnvoi: new Date().toISOString(),
      lu: false,
      ...data
    };
    setMessages(prev => [...prev, nouveau]);
    notify('Message envoyé');
    return nouveau;
  };

  const marquerLu = async (messageId) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, lu: true } : m));
  };

  /** Messages reçus par l'utilisateur actif */
  const getMessagesRecus = () =>
    messages.filter(m => m.destinataireId === utilisateurActif?.id)
      .sort((a, b) => new Date(b.dateEnvoi) - new Date(a.dateEnvoi));

  /** Messages envoyés par l'utilisateur actif */
  const getMessagesEnvoyes = () =>
    messages.filter(m => m.expediteurId === utilisateurActif?.id)
      .sort((a, b) => new Date(b.dateEnvoi) - new Date(a.dateEnvoi));

  /** Destinataires autorisés selon le rôle */
  const getDestinatairesAutorises = () => {
    if (!utilisateurActif) return [];
    const role = utilisateurActif.role;
    if (role === 'fondateur') {
      return utilisateurs.filter(u => u.role === 'directeur' && u.actif);
    }
    if (role === 'directeur') {
      return utilisateurs.filter(u => (u.role === 'enseignant' || u.role === 'fondateur') && u.actif);
    }
    if (role === 'enseignant') {
      // Peut écrire aux parents des élèves de ses classes et au directeur
      const mesClassesIds = utilisateurActif.classesIds || [utilisateurActif.classeId].filter(Boolean);
      const parentEmails = eleves
        .filter(e => mesClassesIds.includes(e.classeId) && e.statut === 'actif')
        .map(e => e.parentEmail).filter(Boolean);
      const parents = utilisateurs.filter(u => u.role === 'parent' && parentEmails.includes(u.email) && u.actif);
      const directeurs = utilisateurs.filter(u => u.role === 'directeur' && u.actif);
      return [...directeurs, ...parents];
    }
    if (role === 'parent') {
      // Peut écrire aux enseignants des classes de ses enfants
      const mesEnfants = eleves.filter(e => e.parentEmail === utilisateurActif.email && e.statut === 'actif');
      const classesIds = [...new Set(mesEnfants.map(e => e.classeId))];
      return utilisateurs.filter(u =>
        u.role === 'enseignant' && u.actif &&
        (u.classesIds || [u.classeId]).some(cid => classesIds.includes(cid))
      );
    }
    return [];
  };

  /* ═══════════════════════════════════════════════════════════════
     FRAIS
  ═══════════════════════════════════════════════════════════════ */
  const saveFrais = async (data) => {
    await delay(100);
    setFraisState(typeof data === 'function' ? data : data);
    notify('Frais mis à jour');
  };

  /* ═══════════════════════════════════════════════════════════════
     PARAMÈTRES GLOBAUX DE L'ÉCOLE
  ═══════════════════════════════════════════════════════════════ */
  const updateSchoolSettings = async (data) => {
    await delay(100);
    setSchoolSettings(prev => ({ ...prev, ...data }));
    notify('Paramètres de l\'école mis à jour');
  };

  /* ═══════════════════════════════════════════════════════════════
     HELPERS LECTURE
  ═══════════════════════════════════════════════════════════════ */
  const getEleve       = (id) => eleves.find(e => e.id === id);
  const getClasse      = (id) => classes.find(c => c.id === id);
  const getElevesClasse = (classeId) => eleves.filter(e => e.classeId === classeId && e.statut === 'actif');
  const getPaiementsEleve = (eleveId) => paiements.filter(p => p.eleveId === eleveId);
  const getBulletins   = (eleveId) => notes.filter(n => n.eleveId === eleveId);
  const getBulletin    = (eleveId, seq) => notes.find(n => n.eleveId === eleveId && n.sequence === seq);

  /* ═══════════════════════════════════════════════════════════════
     DROITS D'ACCÈS
  ═══════════════════════════════════════════════════════════════ */
  const peutAcceder = (action) => {
    const role = utilisateurActif?.role;
    const droitsParRole = {
      admin:      ['tout'],
      fondateur:  ['tout_lecture'],  // Lecture seule — le fondateur peut tout VOIR mais ne peut RIEN modifier
      directeur:  ['gestion', 'eleves', 'classes', 'paiements', 'bulletins', 'transport', 'rapports',
                   'enseignants', 'coefficients_ecriture', 'matieres_ecriture', 'eleves_inscription',
                   'personnel_inscription'],
      enseignant: ['eleves_lecture', 'eleves_ecriture', 'bulletins_ecriture', 'classes_lecture',
                   'evaluations_ecriture', 'discipline_ecriture'],
      parent:     ['enfant_lecture', 'paiements_lecture', 'bulletins_lecture'],
    };
    const droits = droitsParRole[role] || [];
    if (droits.includes('tout')) return true;
    // Fondateur : autorisé en lecture seule pour tout
    if (droits.includes('tout_lecture')) {
      // Autoriser les accès lecture + navigation, bloquer les écritures
      const actionsLecture = ['gestion','eleves','classes','paiements','bulletins','transport',
        'rapports','enseignants','eleves_lecture','classes_lecture','paiements_lecture',
        'bulletins_lecture','enfant_lecture'];
      return actionsLecture.includes(action) || action === 'tout_lecture';
    }
    return droits.includes(action);
  };

  /**
   * Peut inscrire un élève ?
   * Directeur et admin uniquement (PAS le fondateur)
   */
  const peutInscrireEleve = () => {
    const role = utilisateurActif?.role;
    return ['admin', 'directeur'].includes(role);
  };

  /**
   * Peut créer des comptes fondateur/directeur/enseignant ?
   * Admin uniquement — ne peut PAS créer d'autre admin
   */
  const peutCreerCompteHaut = () => {
    return utilisateurActif?.role === 'admin';
  };

  /**
   * Peut inscrire un parent ou un enseignant ?
   * Admin et directeur uniquement
   */
  const peutInscrirePersonnel = () => {
    const role = utilisateurActif?.role;
    return ['admin', 'directeur'].includes(role);
  };

  /**
   * L'utilisateur actif peut-il éditer la discipline d'un élève donné ?
   * Seul l'enseignant peut éditer la discipline, et seulement pour ses élèves.
   */
  const peutEditerDiscipline = (eleveId) => {
    const role = utilisateurActif?.role;
    if (role === 'admin') return true;
    if (role !== 'enseignant') return false;
    // Vérifier que l'élève fait partie des classes de l'enseignant
    const eleve = eleves.find(e => e.id === eleveId);
    if (!eleve) return false;
    const mesClassesIds = utilisateurActif?.classesIds?.length
      ? utilisateurActif.classesIds
      : [utilisateurActif?.classeId].filter(Boolean);
    return mesClassesIds.includes(eleve.classeId);
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDU CONDITIONNEL (chargement)
  ═══════════════════════════════════════════════════════════════ */
  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#1B4F72', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div>Chargement de l'École Les Étoiles…</div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     VALEUR DU CONTEXTE
  ═══════════════════════════════════════════════════════════════ */
  return (
    <AppContext.Provider value={{
      // État données
      utilisateurs, classes, eleves, matieres,
      frais, paiements, notes, coefficients, evaluations, messages, schoolSettings,

      // UI globale
      utilisateurActif, notification, darkMode, langue,

      // Navigation
      currentPage, pageHistory, naviguer, goBack,

      // Thème & langue
      toggleDarkMode, toggleLangue,

      // Auth
      login, logout,

      // Élèves
      ajouterEleve, modifierEleve, supprimerEleve,

      // Classes
      ajouterClasse, modifierClasse, supprimerClasse,

      // Matières (par classe)
      ajouterMatiere, modifierMatiere, supprimerMatiere, getMatieresClasse,

      // Paiements
      enregistrerPaiement,

      // Bulletins
      enregistrerBulletin, updateNotesMasse,

      // Rang auto
      calculerRang,

      // Évaluations & coefficients
      definirEvaluations, modifierCoefficient,

      // Utilisateurs
      ajouterUtilisateur, modifierUtilisateur, supprimerUtilisateur,

      // Frais
      setFrais: saveFrais,

      // Paramètres Globaux
      updateSchoolSettings,

      // Messagerie
      envoyerMessage, marquerLu, getMessagesRecus, getMessagesEnvoyes, getDestinatairesAutorises,

      // Helpers
      getEleve, getClasse, getElevesClasse, getPaiementsEleve,
      getBulletins, getBulletin,
      calculateNoteFinale, getMoyenne, getMoyenneFromBulletin,

      // Droits
      peutAcceder, peutInscrireEleve, peutInscrirePersonnel, peutCreerCompteHaut, peutEditerDiscipline,

      // Notify
      notify,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
