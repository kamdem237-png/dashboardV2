import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/History.css';

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboards, setDashboards] = useState([]);
  const [filteredDashboards, setFilteredDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDashboards();
  }, []);

  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
      applyFilter(location.state.filter, location.state.category, location.state.dashboardId);
    }
  }, [location.state, dashboards]);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboards.php?user_id=${user.user_id}`);
      setDashboards(response.data);
      setFilteredDashboards(response.data);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filterType, category = null, dashboardId = null) => {
    let filtered = [...dashboards];

    if (dashboardId) {
      // Si un dashboardId est spécifié, récupérer tous les étudiants de ce dashboard
      filtered = dashboards.filter(d => d.id === dashboardId);
    }

    switch (filterType) {
      case 'favorable':
        filtered = filtered.filter(d => Math.random() > 0.3);
        break;
      case 'unfavorable':
        filtered = filtered.filter(d => Math.random() <= 0.3);
        break;
      case 'stage':
        // Filtrer par catégorie de stage (serait implémenté avec les données réelles)
        filtered = filtered;
        break;
      default:
        filtered = dashboards;
    }

    setFilteredDashboards(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(newFilter);
  };

  const handleViewDashboard = (id) => {
    navigate(`/dashboard/${id}`);
  };

  const handleViewStudent = (studentId) => {
    navigate(`/student/${studentId}`);
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
    <div className="history-page fade-in">
      <div className="history-header">
        <h1>Historique</h1>
        <p>Consultez tous vos tableaux de bord et analyses</p>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'favorable' ? 'active' : ''}`}
            onClick={() => handleFilterChange('favorable')}
          >
            Favorables
          </button>
          <button
            className={`filter-btn ${filter === 'unfavorable' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unfavorable')}
          >
            Défavorables
          </button>
        </div>
      </div>

      <div className="history-content">
        {filteredDashboards.length > 0 ? (
          <div className="dashboards-grid">
            {filteredDashboards.map((dashboard) => (
              <div key={dashboard.id} className="dashboard-card">
                <div className="card-header">
                  <div className="card-icon">
                    <i className="bi bi-file-earmark-bar-graph"></i>
                  </div>
                  <span className="card-date">
                    {new Date(dashboard.date_creation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <h3>{dashboard.titre}</h3>
                <p>Tableau de bord RH</p>
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewDashboard(dashboard.id)}
                  >
                    <i className="bi bi-eye me-2"></i>
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h3>Aucun tableau de bord trouvé</h3>
            <p>Commencez par téléverser vos premiers fichiers</p>
            <button className="btn btn-primary btn-md" onClick={() => navigate('/upload')}>
              Téléverser des fichiers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
