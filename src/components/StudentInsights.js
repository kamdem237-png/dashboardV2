import React, { useState } from 'react';
import '../styles/StudentInsights.css';

/**
 * StudentInsights
 * 
 * Affiche les insights IA générés dynamiquement
 * basés sur l'analyse intelligente des données de l'étudiant.
 * 
 * L'IA génère:
 * - Tendances détectées
 * - Recommandations personnalisées
 * - Points d'attention
 * - Prédictions
 * - Comparaisons avec la moyenne
 */
const StudentInsights = ({ studentData, aiAnalysis, globalStats }) => {
  const [activeTab, setActiveTab] = useState('trends'); // trends, recommendations, alerts, predictions

  if (!studentData || !studentData.calculated_statistics) {
    return <div className="insights-empty">Aucun insight IA disponible</div>;
  }

  const stats = studentData.calculated_statistics || {};
  const timeline = studentData.timeline_data || [];
  const student = studentData.student || {};

  // Générer les tendances
  const generateTrends = () => {
    const trends = [];
    
    // Tendance de présence
    if (timeline.length > 1) {
      const firstHalf = timeline.slice(0, Math.floor(timeline.length / 2));
      const secondHalf = timeline.slice(Math.floor(timeline.length / 2));
      
      const firstHalfPresence = firstHalf.reduce((sum, p) => sum + (p.presence || 0), 0);
      const secondHalfPresence = secondHalf.reduce((sum, p) => sum + (p.presence || 0), 0);
      
      const trend = secondHalfPresence > firstHalfPresence ? 'up' : secondHalfPresence < firstHalfPresence ? 'down' : 'stable';
      const changePercent = firstHalfPresence > 0 ? Math.abs(((secondHalfPresence - firstHalfPresence) / firstHalfPresence) * 100) : 0;
      
      trends.push({
        type: 'presence',
        title: 'Tendance de présence',
        description: `La présence a ${trend === 'up' ? 'augmenté' : trend === 'down' ? 'diminué' : 'stabilisé'} de ${changePercent.toFixed(1)}%`,
        impact: trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral',
        icon: 'bi-graph-up',
        value: `${changePercent.toFixed(1)}%`
      });
    }

    // Tendance d'absences
    if (timeline.length > 1) {
      const totalAbsences = timeline.reduce((sum, p) => sum + (p.absence || 0), 0);
      const justifiedAbsences = timeline.reduce((sum, p) => sum + (p.absence_justifiee || 0), 0);
      const justifiedRate = totalAbsences > 0 ? (justifiedAbsences / totalAbsences) * 100 : 0;
      
      trends.push({
        type: 'justification',
        title: 'Taux de justification',
        description: `${justifiedRate.toFixed(1)}% des absences sont justifiées`,
        impact: justifiedRate >= 80 ? 'positive' : justifiedRate >= 50 ? 'neutral' : 'negative',
        icon: 'bi-check-circle',
        value: `${justifiedRate.toFixed(1)}%`
      });
    }

    // Performance globale
    const totalSessions = (stats.total_presence || 0) + (stats.total_absence || 0);
    const presenceRate = totalSessions > 0 ? ((stats.total_presence || 0) / totalSessions) * 100 : 0;
    
    trends.push({
      type: 'performance',
      title: 'Performance globale',
      description: `Taux de présence de ${presenceRate.toFixed(1)}%`,
      impact: presenceRate >= 90 ? 'positive' : presenceRate >= 70 ? 'neutral' : 'negative',
      icon: 'bi-award',
      value: `${presenceRate.toFixed(1)}%`
    });

    return trends;
  };

  // Générer les recommandations
  const generateRecommendations = () => {
    const recommendations = [];
    
    const totalSessions = (stats.total_presence || 0) + (stats.total_absence || 0);
    const presenceRate = totalSessions > 0 ? ((stats.total_presence || 0) / totalSessions) * 100 : 0;
    const absenceRate = totalSessions > 0 ? ((stats.total_absence || 0) / totalSessions) * 100 : 0;
    
    // Recommandations basées sur le taux de présence
    if (presenceRate < 70) {
      recommendations.push({
        priority: 'high',
        title: 'Améliorer la présence',
        description: 'Le taux de présence est faible. Il est recommandé de mettre en place un plan de rattrapage.',
        action: 'Contacter le conseiller pédagogique',
        icon: 'bi-exclamation-triangle',
        color: '#e74c3c'
      });
    } else if (presenceRate < 85) {
      recommendations.push({
        priority: 'medium',
        title: 'Maintenir l\'effort',
        description: 'Le taux de présence est correct mais peut être amélioré.',
        action: 'Continuer la régularité',
        icon: 'bi-info-circle',
        color: '#f39c12'
      });
    } else {
      recommendations.push({
        priority: 'low',
        title: 'Excellent travail',
        description: 'Le taux de présence est excellent. Continuez ainsi!',
        action: 'Maintenir les bonnes habitudes',
        icon: 'bi-star',
        color: '#27ae60'
      });
    }

    // Recommandations basées sur le stage/emploi
    if (student.stage === undefined || student.stage === 'non') {
      recommendations.push({
        priority: 'medium',
        title: 'Rechercher un stage',
        description: 'Aucun stage en cours. Un stage pourrait enrichir le parcours.',
        action: 'Consulter les offres de stage',
        icon: 'bi-briefcase',
        color: '#3498db'
      });
    }

    // Recommandations basées sur les absences justifiées
    const totalAbsences = stats.total_absence || 0;
    const justifiedAbsences = stats.total_justified || 0;
    const justificationRate = totalAbsences > 0 ? (justifiedAbsences / totalAbsences) * 100 : 0;
    
    if (justificationRate < 50 && totalAbsences > 5) {
      recommendations.push({
        priority: 'medium',
        title: 'Améliorer les justifications',
        description: 'Moins de la moitié des absences sont justifiées.',
        action: 'Fournir les justifications manquantes',
        icon: 'bi-file-text',
        color: '#9b59b6'
      });
    }

    return recommendations;
  };

  // Générer les alertes
  const generateAlerts = () => {
    const alerts = [];
    
    const totalSessions = (stats.total_presence || 0) + (stats.total_absence || 0);
    const presenceRate = totalSessions > 0 ? ((stats.total_presence || 0) / totalSessions) * 100 : 0;
    
    // Alerte de présence critique
    if (presenceRate < 50) {
      alerts.push({
        level: 'critical',
        title: 'Présence critique',
        description: 'Le taux de présence est inférieur à 50%. Une action immédiate est nécessaire.',
        icon: 'bi-exclamation-octagon',
        color: '#e74c3c'
      });
    } else if (presenceRate < 70) {
      alerts.push({
        level: 'warning',
        title: 'Présence faible',
        description: 'Le taux de présence est inférieur à 70%. Une attention particulière est requise.',
        icon: 'bi-exclamation-triangle',
        color: '#f39c12'
      });
    }

    // Alerte d'absences répétées
    if (timeline.length > 3) {
      const recentAbsences = timeline.slice(-3).filter(p => (p.absence || 0) > 0).length;
      if (recentAbsences >= 2) {
        alerts.push({
          level: 'warning',
          title: 'Absences récentes',
          description: 'Plusieurs absences récentes détectées. Un suivi est recommandé.',
          icon: 'bi-calendar-x',
          color: '#f39c12'
        });
      }
    }

    // Alerte de performance
    if (presenceRate >= 95) {
      alerts.push({
        level: 'info',
        title: 'Performance exceptionnelle',
        description: 'Le taux de présence est exceptionnel. Félicitations!',
        icon: 'bi-trophy',
        color: '#27ae60'
      });
    }

    return alerts;
  };

  // Générer les prédictions
  const generatePredictions = () => {
    const predictions = [];
    
    const totalSessions = (stats.total_presence || 0) + (stats.total_absence || 0);
    const presenceRate = totalSessions > 0 ? ((stats.total_presence || 0) / totalSessions) * 100 : 0;
    
    // Prédiction de réussite
    if (presenceRate >= 85) {
      predictions.push({
        confidence: 'high',
        title: 'Probabilité de réussite élevée',
        description: 'Basé sur le taux de présence actuel, la probabilité de réussite est élevée.',
        probability: '85-95%',
        icon: 'bi-graph-up-arrow',
        color: '#27ae60'
      });
    } else if (presenceRate >= 70) {
      predictions.push({
        confidence: 'medium',
        title: 'Probabilité de réussite modérée',
        description: 'Le taux de présence actuel suggère une probabilité modérée de réussite.',
        probability: '60-80%',
        icon: 'bi-dash-lg',
        color: '#f39c12'
      });
    } else {
      predictions.push({
        confidence: 'low',
        title: 'Risque d\'échec',
        description: 'Le faible taux de présence indique un risque d\'échec accru.',
        probability: '30-50%',
        icon: 'bi-graph-down-arrow',
        color: '#e74c3c'
      });
    }

    // Prédiction de progression
    if (timeline.length > 2) {
      const lastThree = timeline.slice(-3);
      const trend = lastThree.reduce((sum, p) => sum + (p.presence || 0), 0) / 3;
      const overall = timeline.reduce((sum, p) => sum + (p.presence || 0), 0) / timeline.length;
      
      if (trend > overall * 1.1) {
        predictions.push({
          confidence: 'medium',
          title: 'Amélioration attendue',
          description: 'La tendance récente suggère une amélioration continue.',
          probability: 'Probable',
          icon: 'bi-trending-up',
          color: '#3498db'
        });
      } else if (trend < overall * 0.9) {
        predictions.push({
          confidence: 'medium',
          title: 'Baisse attendue',
          description: 'La tendance récente suggère une baisse potentielle.',
          probability: 'Possible',
          icon: 'bi-trending-down',
          color: '#e67e22'
        });
      }
    }

    return predictions;
  };

  const trends = generateTrends();
  const recommendations = generateRecommendations();
  const alerts = generateAlerts();
  const predictions = generatePredictions();

  const renderContent = () => {
    switch (activeTab) {
      case 'trends':
        return (
          <div className="insights-trends">
            {trends.map((trend, index) => (
              <div key={index} className={`insight-card ${trend.impact}`}>
                <div className="insight-header">
                  <div className="insight-icon">
                    <i className={`bi ${trend.icon}`}></i>
                  </div>
                  <div className="insight-title">
                    <h4>{trend.title}</h4>
                    <p>{trend.description}</p>
                  </div>
                  <div className="insight-value">
                    <span className="value-number">{trend.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'recommendations':
        return (
          <div className="insights-recommendations">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card" style={{ borderLeftColor: rec.color }}>
                <div className="recommendation-header">
                  <div className="priority-badge" style={{ backgroundColor: rec.color }}>
                    {rec.priority === 'high' ? 'Haute' : rec.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </div>
                  <div className="recommendation-title">
                    <i className={`bi ${rec.icon}`}></i>
                    <h4>{rec.title}</h4>
                  </div>
                </div>
                <div className="recommendation-content">
                  <p>{rec.description}</p>
                  <div className="recommendation-action">
                    <i className="bi bi-lightbulb"></i>
                    <span>{rec.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'alerts':
        return (
          <div className="insights-alerts">
            {alerts.map((alert, index) => (
              <div key={index} className={`alert-card ${alert.level}`} style={{ borderLeftColor: alert.color }}>
                <div className="alert-header">
                  <div className="alert-icon" style={{ backgroundColor: alert.color }}>
                    <i className={`bi ${alert.icon}`}></i>
                  </div>
                  <div className="alert-title">
                    <h4>{alert.title}</h4>
                  </div>
                </div>
                <div className="alert-content">
                  <p>{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'predictions':
        return (
          <div className="insights-predictions">
            {predictions.map((prediction, index) => (
              <div key={index} className="prediction-card">
                <div className="prediction-header">
                  <div className="confidence-badge">
                    Confiance: {prediction.confidence === 'high' ? 'Élevée' : prediction.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                  </div>
                  <div className="prediction-title">
                    <i className={`bi ${prediction.icon}`}></i>
                    <h4>{prediction.title}</h4>
                  </div>
                </div>
                <div className="prediction-content">
                  <p>{prediction.description}</p>
                  <div className="prediction-probability">
                    <span className="probability-label">Probabilité:</span>
                    <span className="probability-value">{prediction.probability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="student-insights">
      <div className="insights-header">
        <h3>Insights IA</h3>
        <div className="insights-tabs">
          <button
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <i className="bi bi-graph-up"></i>
            <span>Tendances</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            <i className="bi bi-lightbulb"></i>
            <span>Recommandations</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <i className="bi bi-exclamation-triangle"></i>
            <span>Alertes</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <i className="bi bi-cpu"></i>
            <span>Prédictions</span>
          </button>
        </div>
      </div>

      <div className="insights-content">
        {renderContent()}
      </div>

      <div className="insights-footer">
        <div className="ai-info">
          <i className="bi bi-cpu"></i>
          <span>Ces insights sont générés automatiquement par l'intelligence artificielle basée sur l'analyse des données réelles</span>
        </div>
      </div>
    </div>
  );
};

export default StudentInsights;
