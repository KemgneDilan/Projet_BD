const users = [
  {
    id: 'u1',
    nom: 'Tchamba',
    prenom: 'Rose',
    email: 'directeur@ecole.cm',
    motDePasse: '1234',
    role: 'directeur',
    avatar: null,
    classeId: null,
    actif: true
  },
  {
    id: 'u2',
    nom: 'Kamga',
    prenom: 'Emmanuel',
    email: 'fondateur@ecole.cm',
    motDePasse: '1234',
    role: 'fondateur',
    avatar: null,
    classeId: null,
    actif: true
  },
  {
    id: 'u3',
    nom: 'Nkomo',
    prenom: 'Albert',
    email: 'enseignant@ecole.cm',
    motDePasse: '1234',
    role: 'enseignant',
    avatar: null,
    classeId: 'c1',
    actif: true
  },
  {
    id: 'u4',
    nom: 'Ebongue',
    prenom: 'Marie',
    email: 'parent@ecole.cm',
    motDePasse: '1234',
    role: 'parent',
    avatar: null,
    classeId: null,
    actif: true
  }
];

const classes = [
  { id: 'c1', nom: 'SIL A', niveau: 'SIL', section: 'francophone', annee: '2024-2025', effectif: 1 },
  { id: 'c2', nom: 'CP B', niveau: 'CP', section: 'anglophone', annee: '2024-2025', effectif: 0 },
  { id: 'c3', nom: 'CE1 Bilingue', niveau: 'CE1', section: 'bilingue', annee: '2024-2025', effectif: 0 }
];

const matieres = [
  { id: 'm1', nom: 'Mathématiques' },
  { id: 'm2', nom: 'Français' },
  { id: 'm3', nom: 'Anglais' },
  { id: 'm4', nom: 'Histoire-Géographie' },
  { id: 'm5', nom: 'Sciences' },
  { id: 'm6', nom: 'Éducation Physique' },
  { id: 'm7', nom: 'Arts Plastiques' },
  { id: 'm8', nom: 'Musique' }
];

const frais = {
  inscription: 25000,
  scolariteAnnuelle: 120000,
  tranches: [
    { id: 't1', nom: '1ère Tranche', montant: 40000, echeance: '2024-10-15' },
    { id: 't2', nom: '2ème Tranche', montant: 40000, echeance: '2025-01-15' },
    { id: 't3', nom: '3ème Tranche', montant: 40000, echeance: '2025-04-15' }
  ],
  bus: 15000,
  anneeScolaire: '2024-2025'
};

const eleves = [
  {
    id: 'e1',
    matricule: 'MAT-2024-001',
    nom: 'Fouda',
    prenom: 'Kevin',
    dateNaissance: '2018-03-15',
    lieuNaissance: 'Douala',
    sexe: 'M',
    classeId: 'c1',
    section: 'francophone',
    photo: null,
    parentNom: 'Fouda Jean-Pierre',
    parentTel: '677123456',
    parentEmail: 'parent@ecole.cm',
    adresse: 'Bonanjo, Douala',
    bus: true,
    busLigne: 'Ligne A - Bonanjo',
    anneeScolaire: '2024-2025',
    statut: 'actif'
  }
];

const paiements = [
  {
    id: 'p1',
    eleveId: 'e1',
    montant: 40000,
    type: 'scolarite',
    statut: 'payé',
    datePaiement: '2024-10-05',
    trancheId: 't1'
  }
];

const notes = [
  {
    id: 'n1',
    eleveId: 'e1',
    sequence: 'Trimestre 1',
    notes: [
      {
        matiereId: 'm1',
        evaluations: [
          { name: 'Devoir 1', note: 14 },
          { name: 'Examen', note: 16 }
        ],
        noteFinale: 15
      },
      {
        matiereId: 'm2',
        evaluations: [
          { name: 'Contrôle Continu', note: 13 },
          { name: 'Examen Final', note: 15 }
        ],
        noteFinale: 14
      }
    ]
  }
];

const coefficients = [
  { id: 'coef1', classeId: 'c1', matiereId: 'm1', coefficient: 2 },
  { id: 'coef2', classeId: 'c1', matiereId: 'm2', coefficient: 2 },
  { id: 'coef3', classeId: 'c1', matiereId: 'm3', coefficient: 1.5 },
  { id: 'coef4', classeId: 'c1', matiereId: 'm4', coefficient: 1 },
  { id: 'coef5', classeId: 'c1', matiereId: 'm5', coefficient: 1 },
  { id: 'coef6', classeId: 'c1', matiereId: 'm6', coefficient: 1 },
  { id: 'coef7', classeId: 'c1', matiereId: 'm7', coefficient: 0.5 },
  { id: 'coef8', classeId: 'c1', matiereId: 'm8', coefficient: 0.5 }
];

const evaluations = [
  {
    id: 'eval1',
    classeId: 'c1',
    matiereId: 'm1',
    evaluations: [
      { name: 'Devoir 1', percentage: 30 },
      { name: 'Examen', percentage: 70 }
    ]
  },
  {
    id: 'eval2',
    classeId: 'c1',
    matiereId: 'm2',
    evaluations: [
      { name: 'Contrôle Continu', percentage: 40 },
      { name: 'Examen Final', percentage: 60 }
    ]
  }
];

export default {
  users,
  classes,
  eleves,
  matieres,
  paiements,
  notes,
  frais,
  coefficients,
  evaluations
};
