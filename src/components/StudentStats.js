import React from 'react';
import '../styles/StudentStats.css';

/**
 * StudentStats
 * 
 * Affiche les statistiques calculées automatiquement par l'IA
 * basées sur les données réelles détectées dans le fichier.
 */
const StudentStats = ({ studentData, aiAnalysis }) => {
  if (!studentData || !studentData.calculated_statistics) {
    return <div className="stats-empty">Aucune statistique disponible</div>;
  }

  const stats = studentData.calculated_statistics;
  const timeline = studentData.timeline_data || [];

  // Calculer les taux
  const totalSessions = (stats.total_presence || 0) + (stats.total_absence || 0);
  const presenceRate = totalSessions > 0 ? ((stats.total_presence || 0) / totalSessions * 100).toFixed(1) : 0;
  const absenceRate = totalSessions > 0 ? ((stats.total_absence || 0) / totalSessions * 100).toFixed(1) : 0;
  const justifiedRate = totalSessions > 0 ? ((stats.total_justified || 0) / totalSessions * 100).toFixed(1) : 0;

  // Déterminer le niveau de performance
  const getPerformanceLevel = () => {
    if (presenceRate >= 90) return { level: 'Excellent', color: '#27ae60', icon: 'bi-award' };
    if (presenceRate >= 80) return { level: 'Très bon', color: '#3498db', icon: 'bi-star' };
    if (presenceRate >= 70) return { level: 'Bon', color: '#f39c12', icon: 'bi-hand-thumbs-up' };
    if (presenceRate >= 50) return { level: 'Moyen', color: '#e67e22', icon: 'bi-exclamation-triangle' };
    return { level: 'Faible', color: '#e74c3c', icon: 'bi-x-circle' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="student-stats">
      {/* Performance Overview */}
      <div className="stats-overview">
        <h3>Vue d'ensemble</h3>
        <div className="performance-card">
          <div className="performance-icon" style={{ color: performance.color }}>
            <i className={`bi ${performance.icon}`}></i>
          </div>
          <div className="performance-content">
            <h4>Niveau de performance</h4>
            <p className="performance-level" style={{ color: performance.color }}>
              {performance.level}
            </p>
            <p className="performance-description">
              Taux de présence: {presenceRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="main-stats">
        <h3>Statistiques principales</h3>
        <div className="stats-grid">
          <div className="stat-card presence">
            <div className="stat-header">
              <i className="bi bi-calendar-check"></i>
              <span>Présences</span>
            </div>
            <div className="stat-value">{stats.total_presence || 0}</div>
            <div className="stat-rate">{presenceRate}%</div>
          </div>

          <div className="stat-card absence">
            <div className="stat-header">
              <i className="bi bi-calendar-x"></i>
              <span>Absences</span>
            </div>
            <div className="stat-value">{stats.total_absence || 0}</div>
            <div className="stat-rate">{absenceRate}%</div>
          </div>

          <div className="stat-card justified">
            <div className="stat-header">
              <i className="bi bi-check-circle"></i>
              <span>Absences justifiées</span>
            </div>
            <div className="stat-value">{stats.total_justified || 0}</div>
            <div className="stat-rate">{justifiedRate}%</div>
          </div>

          <div className="stat-card sessions">
            <div className="stat-header">
              <i className="bi bi-calendar3"></i>
              <span>Total sessions</span>
            </div>
            <div className="stat-value">{totalSessions}</div>
            <div className="stat-rate">100%</div>
          </div>
        </div>
      </div>

      {/* Statistiques temporelles */}
      {timeline.length > 0 && (
        <div className="temporal-stats">
          <h3>Évolution temporelle</h3>
          <div className="timeline-summary">
            <div className="timeline-item">
              <i className="bi bi-graph-up"></i>
              <div>
                <p>Période analysée</p>
                <strong>{timeline.length} semaines</strong>
              </div>
            </div>
            <div className="timeline-item">
              <i className="bi bi-trending-up"></i>
              <div>
                <p>Tendance</p>
                <strong>
                  {timeline.length > 1 && timeline[timeline.length - 1].presence > timeline[0].presence
                    ? 'Amélioration'
                    : timeline.length > 1 && timeline[timeline.length - 1].presence < timeline[0].presence
                      ? 'Baisse'
                      : 'Stable'
                  }
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateurs de performance */}
      <div className="performance-indicators">
        <h3>Indicateurs de performance</h3>
        <div className="indicators-grid">
          <div className="indicator">
            <div className="indicator-label">Assiduité</div>
            <div className="indicator-bar">
              <div
                className="indicator-fill presence"
                style={{ width: `${Math.min(100, presenceRate)}%` }}
              ></div>
            </div>
            <div className="indicator-value">{presenceRate}%</div>
          </div>

          <div className="indicator">
            <div className="indicator-label">Régularité</div>
            <div className="indicator-bar">
              <div
                className="indicator-fill neutral"
                style={{ width: `${Math.max(0, 100 - parseFloat(absenceRate))}%` }}
              ></div>
            </div>
            <div className="indicator-value">{Math.max(0, 100 - parseFloat(absenceRate))}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;
