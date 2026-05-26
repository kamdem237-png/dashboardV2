import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/History.css';

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

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboards, setDashboards] = useState([]);
  const [dashboardVerdicts, setDashboardVerdicts] = useState({});
  const [filteredDashboards, setFilteredDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  useEffect(() => {
    if (location.state?.filter && Object.keys(dashboardVerdicts).length > 0) {
      setFilter(location.state.filter);
      applyFilter(location.state.filter);
    }
  }, [location.state, dashboardVerdicts]);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboards.php?user_id=${user.user_id}`);
      const dashboardsList = response.data;
      setDashboards(dashboardsList);
      setFilteredDashboards(dashboardsList);

      const verdicts = {};
      await Promise.all(
        dashboardsList.map(async (d) => {
          try {
            const detail = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboard.php?id=${d.id}`);
            verdicts[d.id] = computeVerdict(detail.data?.data || {});
          } catch {
            verdicts[d.id] = 'Indéterminé';
          }
        })
      );
      setDashboardVerdicts(verdicts);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filterType) => {
    let filtered = [...dashboards];

    switch (filterType) {
      case 'favorable':
        filtered = filtered.filter(d => dashboardVerdicts[d.id] === 'Favorable');
        break;
      case 'unfavorable':
        filtered = filtered.filter(d => dashboardVerdicts[d.id] === 'Défavorable');
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

  const handleDeleteClick = (dashboard) => {
    setDashboardToDelete(dashboard);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!dashboardToDelete) return;
    try {
      await axios.delete(`https://dashboard-etudiant.free.nf/api/delete_dashboard.php?id=${dashboardToDelete.id}`);
      setDashboards(prev => prev.filter(d => d.id !== dashboardToDelete.id));
      setFilteredDashboards(prev => prev.filter(d => d.id !== dashboardToDelete.id));
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    } finally {
      setShowDeleteModal(false);
      setDashboardToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDashboardToDelete(null);
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
                <div className="card-verdict">
                  <span className={`badge ${dashboardVerdicts[dashboard.id] === 'Favorable' ? 'bg-success' : 'bg-danger'}`}>
                    {dashboardVerdicts[dashboard.id] || 'Chargement...'}
                  </span>
                </div>
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewDashboard(dashboard.id)}
                  >
                    <i className="bi bi-eye me-2"></i>
                    Voir
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteClick(dashboard)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Supprimer
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

      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Confirmer la suppression</h3>
              <button className="modal-close-btn" onClick={handleCancelDelete}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body-custom">
              <div className="modal-icon-warning">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <p>Êtes-vous sûr de vouloir supprimer le tableau de bord <strong>"{dashboardToDelete?.titre}"</strong> ?</p>
              <p className="text-muted">Cette action est irréversible.</p>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={handleCancelDelete}>Annuler</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                <i className="bi bi-trash me-1"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
