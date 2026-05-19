import React, { useState } from 'react';
import ScrollableChartContainer from './ScrollableChartContainer';
import '../styles/StudentTimeline.css';

/**
 * StudentTimeline
 * 
 * Affiche la timeline temporelle scrollable d'un étudiant.
 * Les données sont extraites automatiquement du fichier analysé par l'IA.
 */
const StudentTimeline = ({ studentData, aiAnalysis }) => {
  const [viewMode, setViewMode] = useState('detailed'); // detailed, compact, calendar
  const [filter, setFilter] = useState('all'); // all, presence, absence, justified

  if (!studentData || !studentData.timeline_data) {
    return <div className="timeline-empty">Aucune donnée temporelle disponible</div>;
  }

  const timeline = studentData.timeline_data || [];
  const stats = studentData.calculated_statistics || {};

  // Filtrer les données selon le filtre
  const filteredTimeline = timeline.filter(point => {
    if (filter === 'all') return true;
    if (filter === 'presence') return (point.presence || 0) > 0;
    if (filter === 'absence') return (point.absence || 0) > 0;
    if (filter === 'justified') return (point.absence_justifiee || 0) > 0;
    return true;
  });

  // Formatter la date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Obtenir le statut d'un point
  const getPointStatus = (point) => {
    const presence = point.presence || 0;
    const absence = point.absence || 0;
    const justified = point.absence_justifiee || 0;

    if (presence > 0) return { status: 'present', color: '#27ae60', icon: 'bi-check-circle', label: 'Présent' };
    if (justified > 0) return { status: 'justified', color: '#f39c12', icon: 'bi-clock', label: 'Justifié' };
    if (absence > 0) return { status: 'absent', color: '#e74c3c', icon: 'bi-x-circle', label: 'Absent' };
    return { status: 'unknown', color: '#95a5a6', icon: 'bi-question-circle', label: 'Inconnu' };
  };

  // Calculer les statistiques de la timeline
  const timelineStats = {
    total: filteredTimeline.length,
    present: filteredTimeline.filter(p => (p.presence || 0) > 0).length,
    absent: filteredTimeline.filter(p => (p.absence || 0) > 0).length,
    justified: filteredTimeline.filter(p => (p.absence_justifiee || 0) > 0).length,
    totalPresence: filteredTimeline.reduce((sum, p) => sum + (p.presence || 0), 0),
    totalAbsence: filteredTimeline.reduce((sum, p) => sum + (p.absence || 0), 0),
    totalJustified: filteredTimeline.reduce((sum, p) => sum + (p.absence_justifiee || 0), 0)
  };

  // Rendu détaillé
  const renderDetailedView = () => (
    <div className="timeline-detailed">
      {filteredTimeline.map((point, index) => {
        const status = getPointStatus(point);
        return (
          <div key={index} className="timeline-item detailed">
            <div className="timeline-date">
              <div className="date-day">{formatDate(point.date)}</div>
              <div className="date-time">{point.time || 'Heure inconnue'}</div>
            </div>
            <div className="timeline-content">
              <div className={`timeline-status ${status.status}`}>
                <i className={`bi ${status.icon}`}></i>
                <span>{status.label}</span>
              </div>
              <div className="timeline-details">
                {point.presence > 0 && (
                  <div className="detail-item presence">
                    <i className="bi bi-calendar-check"></i>
                    <span>{point.presence}h</span>
                  </div>
                )}
                {point.absence > 0 && (
                  <div className="detail-item absence">
                    <i className="bi bi-calendar-x"></i>
                    <span>{point.absence}h</span>
                  </div>
                )}
                {point.absence_justifiee > 0 && (
                  <div className="detail-item justified">
                    <i className="bi bi-check-circle"></i>
                    <span>{point.absence_justifiee}h</span>
                  </div>
                )}
                {point.notes && (
                  <div className="detail-item notes">
                    <i className="bi bi-chat-text"></i>
                    <span>{point.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Rendu compact
  const renderCompactView = () => (
    <div className="timeline-compact">
      <ScrollableChartContainer width="100%" height={200}>
        <div className="compact-timeline">
          {filteredTimeline.map((point, index) => {
            const status = getPointStatus(point);
            return (
              <div key={index} className="compact-item">
                <div 
                  className="compact-marker" 
                  style={{ backgroundColor: status.color }}
                  title={`${formatDate(point.date)} - ${status.label}`}
                >
                  <i className={`bi ${status.icon}`}></i>
                </div>
                <div className="compact-date">
                  {new Date(point.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollableChartContainer>
    </div>
  );

  // Rendu calendrier
  const renderCalendarView = () => {
    // Grouper par mois
    const groupedByMonth = {};
    filteredTimeline.forEach(point => {
      const date = new Date(point.date);
      const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(point);
    });

    return (
      <div className="timeline-calendar">
        {Object.entries(groupedByMonth).map(([month, points]) => (
          <div key={month} className="calendar-month">
            <h4 className="month-title">{month}</h4>
            <div className="calendar-grid">
              {points.map((point, index) => {
                const status = getPointStatus(point);
                const day = new Date(point.date).getDate();
                return (
                  <div 
                    key={index} 
                    className={`calendar-day ${status.status}`}
                    title={`${day} - ${status.label}`}
                  >
                    <span className="day-number">{day}</span>
                    <i className={`bi ${status.icon}`}></i>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="student-timeline">
      {/* Header */}
      <div className="timeline-header">
        <h3>Timeline temporelle</h3>
        <div className="timeline-controls">
          <div className="view-modes">
            <button
              className={`mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
              onClick={() => setViewMode('detailed')}
              title="Vue détaillée"
            >
              <i className="bi bi-list-ul"></i>
            </button>
            <button
              className={`mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Vue compacte"
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
            <button
              className={`mode-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Vue calendrier"
            >
              <i className="bi bi-calendar3"></i>
            </button>
          </div>
          
          <div className="filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tout
            </button>
            <button
              className={`filter-btn ${filter === 'presence' ? 'active' : ''}`}
              onClick={() => setFilter('presence')}
            >
              Présences
            </button>
            <button
              className={`filter-btn ${filter === 'absence' ? 'active' : ''}`}
              onClick={() => setFilter('absence')}
            >
              Absences
            </button>
            <button
              className={`filter-btn ${filter === 'justified' ? 'active' : ''}`}
              onClick={() => setFilter('justified')}
            >
              Justifiées
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques de la timeline */}
      <div className="timeline-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar3"></i>
          </div>
          <div className="stat-content">
            <h4>{timelineStats.total}</h4>
            <p>Points temporels</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon presence">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h4>{timelineStats.present}</h4>
            <p>Présences</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon absence">
            <i className="bi bi-calendar-x"></i>
          </div>
          <div className="stat-content">
            <h4>{timelineStats.absent}</h4>
            <p>Absences</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon justified">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-content">
            <h4>{timelineStats.justified}</h4>
            <p>Justifiées</p>
          </div>
        </div>
      </div>

      {/* Contenu de la timeline */}
      <div className="timeline-content">
        {viewMode === 'detailed' && renderDetailedView()}
        {viewMode === 'compact' && renderCompactView()}
        {viewMode === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
};

export default StudentTimeline;
