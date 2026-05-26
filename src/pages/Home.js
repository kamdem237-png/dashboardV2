import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Home.css';

const computeVerdict = (dashboard) => {
  const stats = dashboard.statistics || {};
  const students = dashboard.students || [];
  const totalStudents = students.length || 1;

  const presenceRate = parseFloat(stats.average_presence_rate || 0);
  const absenceRate = parseFloat(stats.average_absence_rate || 0);
  const stageCount = students.filter(s => {
    const v = s.stage || s.data?.Stage || s.data?.stage;
    return v && ['oui','yes','true','1','en_cours','in_progress','stagiaire'].includes(
      String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    );
  }).length;
  const stageRate = (stageCount / totalStudents) * 100;
  const ccCount = students.filter(s => {
    const v = s.cc_participation || s.data?.['Participation CC'] || s.data?.cc_participation || s.data?.CC;
    return v && !['0', 'non', 'no', 'false', ''].includes(
      String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    );
  }).length;
  const ccRate = (ccCount / totalStudents) * 100;

  let score = 0;
  if (presenceRate >= 50) score++;
  if (absenceRate <= 50) score++;
  if (stageRate >= 50) score++;
  if (ccRate >= 50) score++;

  return score >= 2 ? 'Favorable' : 'Défavorable';
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    favorableResults: 0,
    unfavorableResults: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboards.php?user_id=${user.user_id}`);
        const dashboards = response.data;

        const detailedDashboards = await Promise.all(
          dashboards.map(async (d) => {
            try {
              const detail = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboard.php?id=${d.id}`);
              return { ...d, ...(detail.data?.data || {}) };
            } catch {
              return d;
            }
          })
        );

        const verdicts = detailedDashboards.map(d => computeVerdict(d));
        const favorableCount = verdicts.filter(v => v === 'Favorable').length;
        const unfavorableCount = verdicts.filter(v => v === 'Défavorable').length;

        setStats({
          totalFiles: dashboards.length,
          favorableResults: favorableCount,
          unfavorableResults: unfavorableCount
        });

        const transactions = detailedDashboards.slice(0, 5).map((dashboard, i) => ({
          id: dashboard.id,
          titre: dashboard.titre,
          date: new Date(dashboard.date_creation).toLocaleDateString('fr-FR'),
          status: verdicts[i]
        }));
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.code === 'ERR_NETWORK' || !error.response) {
          console.error('Network error - backend may be unavailable');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchDashboardData();
    }
  }, [user?.user_id]);

  const handleStatClick = (filter) => {
    navigate('/history', { state: { filter } });
  };

  const handleViewDashboard = (id) => {
    navigate(`/dashboard/${id}`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page fade-in">
      <div className="welcome-section">
        <h1>Bienvenue, {user?.prenom} {user?.nom} !</h1>
        <p className="welcome-text">
          Gérez efficacement vos tableaux de bord pour les salles de classe.
          Téléversez vos fichiers Excel/CSV pour analyser la présence, les absences et les stages des étudiants.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <i className="bi bi-cloud-upload me-2"></i>
          Téléverser des fichiers
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => handleStatClick('all')}>
          <h3>{stats.totalFiles}</h3>
          <p>Fichiers téléversés et analysés</p>
          <i className="bi bi-file-earmark-spreadsheet stat-icon"></i>
        </div>
        <div className="stat-card favorable" onClick={() => handleStatClick('favorable')}>
          <h3>{stats.favorableResults}</h3>
          <p>Résultats favorables</p>
          <i className="bi bi-check-circle stat-icon"></i>
        </div>
        <div className="stat-card unfavorable" onClick={() => handleStatClick('unfavorable')}>
          <h3>{stats.unfavorableResults}</h3>
          <p>Résultats défavorables</p>
          <i className="bi bi-exclamation-circle stat-icon"></i>
        </div>
      </div>

      <div className="transactions-section">
        <h2>Transactions récentes</h2>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Titre du tableau de bord</th>
                <th>Date de création</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.titre}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <span className={`badge ${transaction.status === 'Favorable' ? 'bg-success' : 'bg-danger'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewDashboard(transaction.id)}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Aucune transaction récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {recentTransactions.length > 0 && (
          <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/history')}>
            Voir tout l'historique
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
