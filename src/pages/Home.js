import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Home.css';

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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://dashboard-etudiant.free.nf/api/get_dashboards.php?user_id=${user.user_id}`);
      const dashboards = response.data;

      setStats({
        totalFiles: dashboards.length,
        favorableResults: Math.floor(dashboards.length * 0.7),
        unfavorableResults: Math.ceil(dashboards.length * 0.3)
      });

      // Simuler les transactions récentes
      const transactions = dashboards.slice(0, 5).map(dashboard => ({
        id: dashboard.id,
        titre: dashboard.titre,
        date: new Date(dashboard.date_creation).toLocaleDateString('fr-FR'),
        status: Math.random() > 0.3 ? 'Favorable' : 'Défavorable'
      }));
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          Gérez efficacement vos tableaux de bord RH pour les salles de classe.
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
