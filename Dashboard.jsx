import React from 'react';
import PropTypes from 'prop-types';
import { useApp } from './AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import './global.css';

const COLORS = ['#1B4F72', '#2980B9', '#F39C12', '#27AE60', '#E74C3C', '#8E44AD'];

// Composant réutilisable pour les cartes de statistiques
const StatCard = ({ icon, label, value, color, sub, onClick }) => (
  <div
    className="stat-card"
    onClick={onClick}
    role="button"
    tabIndex={onClick ? 0 : -1}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        onClick();
      }
    }}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="stat-icon" style={{ background: `${color}18` }}>
      <span aria-hidden="true" style={{ fontSize: 24 }}>
        {icon}
      </span>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change up">↗ {sub}</div>}
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  sub: PropTypes.string,
  onClick: PropTypes.func,
};

StatCard.defaultProps = {
  sub: null,
  onClick: null,
};

// Composant pour afficher les enfants d'un parent
const EnfantCard = ({ enfant, classes, notes, getMoyenne }) => {
  if (!enfant) {
    return null;
  }

  const bulletins = notes.filter((n) => n.eleveId === enfant.id);
  const classInfo = classes.find((c) => c.id === enfant.classeId);

  return (
    <div key={enfant.id} className="card card-enfant">
      <div className="card-header">
        <div className="enfant-info">
          <div className="enfant-avatar">{enfant.prenom[0]}</div>
          <div>
            <h3 className="enfant-name">
              {enfant.prenom} {enfant.nom}
            </h3>
            <span className="badge badge-primary">
              {classInfo?.nom} — {enfant.section}
            </span>
          </div>
        </div>
        <span className="badge badge-success">{enfant.statut}</span>
      </div>
      <div className="card-body">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Matricule</span>
            <span>{enfant.matricule}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Bus scolaire</span>
            <span>{enfant.bus ? `🚌 Oui — ${enfant.busLigne}` : 'Non'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Bulletins</span>
            <span>{bulletins.length} disponible(s)</span>
          </div>
          {bulletins[0] && (
            <div className="info-item">
              <span className="info-label">Dernière moyenne</span>
              <span className="moyenne-badge">
                {getMoyenne(bulletins[0])}/20
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EnfantCard.propTypes = {
  enfant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    prenom: PropTypes.string.isRequired,
    nom: PropTypes.string.isRequired,
    matricule: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
    statut: PropTypes.string.isRequired,
    bus: PropTypes.bool,
    busLigne: PropTypes.string,
    classeId: PropTypes.string,
  }).isRequired,
  classes: PropTypes.arrayOf(PropTypes.object).isRequired,
  notes: PropTypes.arrayOf(PropTypes.object).isRequired,
  getMoyenne: PropTypes.func.isRequired,
};

EnfantCard.defaultProps = {};

// Dashboard Parent
const ParentDashboard = ({
  utilisateurActif,
  eleves,
  classes,
  notes,
  paiements,
  getMoyenne,
}) => {
  if (!utilisateurActif) {
    return null;
  }

  const mesEnfants = eleves.filter(
    (e) =>
      e.statut === 'actif' && e.parentEmail === utilisateurActif.email
  );

  const bulletinsCount = notes.filter((n) =>
    mesEnfants.some((e) => e.id === n.eleveId)
  ).length;

  const paiementsCount = paiements.filter((p) =>
    mesEnfants.some((e) => e.id === p.eleveId)
  ).length;

  return (
    <div className="dashboard-container">
      <div className="welcome-box">
        <div>
          <h2 className="welcome-title">
            Bonjour, {utilisateurActif.prenom} 👋
          </h2>
          <p className="welcome-sub">
            Voici le suivi scolaire de vos enfants.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="👦"
          label="Enfants scolarisés"
          value={mesEnfants.length}
          color="#1B4F72"
        />
        <StatCard
          icon="📋"
          label="Bulletins disponibles"
          value={bulletinsCount}
          color="#27AE60"
        />
        <StatCard
          icon="💰"
          label="Paiements effectués"
          value={paiementsCount}
          color="#F39C12"
        />
      </div>

      {mesEnfants.length > 0 ? (
        <div className="enfants-list">
          {mesEnfants.map((enfant) => (
            <EnfantCard
              key={enfant.id}
              enfant={enfant}
              classes={classes}
              notes={notes}
              getMoyenne={getMoyenne}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">👨‍👩‍👧</span>
          <h3>Aucun enfant inscrit</h3>
          <p>Contactez la direction pour l'inscription.</p>
        </div>
      )}
    </div>
  );
};

ParentDashboard.propTypes = {
  utilisateurActif: PropTypes.shape({
    prenom: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
  eleves: PropTypes.arrayOf(PropTypes.object).isRequired,
  classes: PropTypes.arrayOf(PropTypes.object).isRequired,
  notes: PropTypes.arrayOf(PropTypes.object).isRequired,
  paiements: PropTypes.arrayOf(PropTypes.object).isRequired,
  getMoyenne: PropTypes.func.isRequired,
};

ParentDashboard.defaultProps = {
  utilisateurActif: null,
};

// Dashboard Enseignant
const TeacherDashboard = ({
  utilisateurActif,
  eleves,
  classes,
  notes,
}) => {
  if (!utilisateurActif) {
    return null;
  }

  const maClasse = classes.find((c) => c.id === utilisateurActif.classeId);
  const mesEleves = maClasse
    ? eleves.filter((e) => e.classeId === maClasse.id && e.statut === 'actif')
    : [];

  const bulletinsCount = notes.filter((n) =>
    mesEleves.some((e) => e.id === n.eleveId)
  ).length;

  const busCount = mesEleves.filter((e) => e.bus).length;

  return (
    <div className="dashboard-container">
      <div className="welcome-box">
        <h2 className="welcome-title">Bonjour, {utilisateurActif.prenom} 👋</h2>
        <p className="welcome-sub">
          {maClasse
            ? `Classe : ${maClasse.nom}`
            : 'Aucune classe assignée'}
        </p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="👦"
          label="Mes élèves"
          value={mesEleves.length}
          color="#1B4F72"
        />
        <StatCard
          icon="📋"
          label="Bulletins saisis"
          value={bulletinsCount}
          color="#27AE60"
        />
        <StatCard
          icon="🚌"
          label="Élèves en bus"
          value={busCount}
          color="#F39C12"
        />
      </div>
    </div>
  );
};

TeacherDashboard.propTypes = {
  utilisateurActif: PropTypes.shape({
    prenom: PropTypes.string.isRequired,
    classeId: PropTypes.string,
  }),
  eleves: PropTypes.arrayOf(PropTypes.object).isRequired,
  classes: PropTypes.arrayOf(PropTypes.object).isRequired,
  notes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

TeacherDashboard.defaultProps = {
  utilisateurActif: null,
};

// Dashboard Admin
const AdminDashboard = ({
  utilisateurActif,
  setPage,
  eleves,
  classes,
  paiements,
  notes,
  getMoyenne,
}) => {
  if (!utilisateurActif || typeof setPage !== 'function') {
    return null;
  }

  const actifs = eleves.filter((e) => e.statut === 'actif');

  const elevesParSection = [
    {
      name: 'Francophone',
      value: actifs.filter((e) => e.section === 'francophone').length,
    },
    {
      name: 'Anglophone',
      value: actifs.filter((e) => e.section === 'anglophone').length,
    },
    {
      name: 'Bilingue',
      value: actifs.filter((e) => e.section === 'bilingue').length,
    },
  ];

  const elevesParNiveau = classes
    .map((c) => ({
      name: c.niveau,
      eleves: eleves.filter(
        (e) => e.classeId === c.id && e.statut === 'actif'
      ).length,
    }))
    .filter((c) => c.eleves > 0);

  const totalPaye = paiements
    .filter((p) => p.statut === 'payé')
    .reduce((sum, p) => sum + (p.montant || 0), 0);

  const busEleves = actifs.filter((e) => e.bus).length;

  const derniersPaiements = paiements.slice(-5).reverse();

  return (
    <div className="dashboard-container">
      <div className="welcome-box welcome-box-admin">
        <div>
          <h2 className="welcome-title">
            Bienvenue, {utilisateurActif.prenom} 🎉
          </h2>
          <p className="welcome-sub">
            Vue d'ensemble de l'École Les Étoiles — Année 2024-2025
          </p>
        </div>
        <div className="welcome-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPage('eleves')}
            type="button"
          >
            + Inscrire un élève
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage('bulletins')}
            type="button"
          >
            📋 Bulletins
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon="👦"
          label="Élèves inscrits"
          value={actifs.length}
          color="#1B4F72"
          sub="Actifs"
          onClick={() => setPage('eleves')}
        />
        <StatCard
          icon="🏫"
          label="Classes"
          value={classes.length}
          color="#2980B9"
          onClick={() => setPage('classes')}
        />
        <StatCard
          icon="💰"
          label="Recettes (FCFA)"
          value={totalPaye.toLocaleString('fr')}
          color="#F39C12"
          sub="Encaissé"
          onClick={() => setPage('paiements')}
        />
        <StatCard
          icon="🚌"
          label="Élèves en bus"
          value={busEleves}
          color="#27AE60"
          onClick={() => setPage('transport')}
        />
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Élèves par niveau</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={elevesParNiveau} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="eleves" fill="#1B4F72" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Répartition par section</h3>
          </div>
          <div className="card-body card-body-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={elevesParSection}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {elevesParSection.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Derniers paiements */}
      <div className="card">
        <div className="card-header card-header-payments">
          <h3 className="card-title">Derniers paiements</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage('paiements')}
            type="button"
          >
            Voir tout →
          </button>
        </div>
        <div className="table-wrap">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Reçu</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {derniersPaiements.length > 0 ? (
                derniersPaiements.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code className="receipt-code">{p.recu}</code>
                    </td>
                    <td className="payment-type">
                      {p.type}
                    </td>
                    <td className="payment-amount">
                      <strong>
                        {(p.montant || 0).toLocaleString('fr')} FCFA
                      </strong>
                    </td>
                    <td className="payment-date">{p.date}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.statut === 'payé'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {p.statut}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table">
                    Aucun paiement enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

AdminDashboard.propTypes = {
  utilisateurActif: PropTypes.shape({
    prenom: PropTypes.string.isRequired,
  }),
  setPage: PropTypes.func.isRequired,
  eleves: PropTypes.arrayOf(PropTypes.object).isRequired,
  classes: PropTypes.arrayOf(PropTypes.object).isRequired,
  paiements: PropTypes.arrayOf(PropTypes.object).isRequired,
  notes: PropTypes.arrayOf(PropTypes.object).isRequired,
  getMoyenne: PropTypes.func.isRequired,
};

AdminDashboard.defaultProps = {
  utilisateurActif: null,
};

// Composant principal
export default function Dashboard({ setPage }) {
  const { eleves, classes, paiements, utilisateurActif, notes, getMoyenne } =
    useApp();

  if (!utilisateurActif) {
    return (
      <div className="dashboard-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  const role = utilisateurActif.role || 'admin';

  switch (role) {
    case 'parent':
      return (
        <ParentDashboard
          utilisateurActif={utilisateurActif}
          eleves={eleves}
          classes={classes}
          notes={notes}
          paiements={paiements}
          getMoyenne={getMoyenne}
        />
      );
    case 'enseignant':
      return (
        <TeacherDashboard
          utilisateurActif={utilisateurActif}
          eleves={eleves}
          classes={classes}
          notes={notes}
        />
      );
    default:
      return (
        <AdminDashboard
          utilisateurActif={utilisateurActif}
          setPage={setPage}
          eleves={eleves}
          classes={classes}
          paiements={paiements}
          notes={notes}
          getMoyenne={getMoyenne}
        />
      );
  }
}

Dashboard.propTypes = {
  setPage: PropTypes.func.isRequired,
};

Dashboard.defaultProps = {};