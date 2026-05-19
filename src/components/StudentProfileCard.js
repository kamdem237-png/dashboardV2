import React from 'react';
import '../styles/StudentProfileCard.css';

const TEXT = {
  empty: 'Aucune donn\u00e9e \u00e9tudiante disponible',
  unknownStudent: '\u00c9tudiant inconnu',
  unknownId: 'ID inconnu',
  presences: 'Pr\u00e9sences',
  absences: 'Absences',
  justified: 'Abs. justifi\u00e9es',
  presenceRate: 'Taux pr\u00e9sence',
  specializedStatus: 'Statut sp\u00e9cialis\u00e9'
};

const normalizeValue = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const isYes = (value) => ['oui', 'yes', 'true', '1', 'en_cours', 'in_progress', 'travailleur', 'employe', 'stagiaire'].includes(normalizeValue(value));

const timelineHas = (timeline, keys) => timeline.some((row) => keys.some((key) => isYes(row?.[key])));

const StudentProfileCard = ({ studentData }) => {
  if (!studentData) return <div className="profile-card-empty">{TEXT.empty}</div>;

  const student = studentData.student || {};
  const profile = studentData.profile_data || {};
  const statistics = studentData.calculated_statistics || {};
  const timeline = studentData.timeline_data || [];

  const fullName = student.name || student.full_name || `${profile.name || ''} ${profile.firstname || ''}`.trim() || TEXT.unknownStudent;
  const studentId = student.id || student.student_id || student.matricule || profile.id || profile.student_identifier || TEXT.unknownId;
  const hasStage = isYes(student.stage || statistics.stage || profile.stage) || timelineHas(timeline, ['stage', 'stagiaire']);
  const hasWork = isYes(student.work || statistics.work || profile.work || profile.travail || profile.emploi) || timelineHas(timeline, ['work', 'travail', 'emploi']);
  const hasCc = isYes(student.cc || statistics.cc || profile.cc || profile.participation_cc1 || profile.participation_cc) || timelineHas(timeline, ['cc', 'participation_cc1', 'participation_cc']);

  return (
    <div className="student-profile-card">
      <div className="profile-header">
        <div className="profile-avatar"><i className="bi bi-person-circle"></i></div>
        <div className="profile-info">
          <h2 className="profile-name">{fullName}</h2>
          <p className="profile-id">ID: {studentId}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item"><div className="stat-icon presence"><i className="bi bi-calendar-check"></i></div><div className="stat-content"><h4>{statistics.total_presence || 0}</h4><p>{TEXT.presences}</p></div></div>
        <div className="stat-item"><div className="stat-icon absence"><i className="bi bi-calendar-x"></i></div><div className="stat-content"><h4>{statistics.total_absence || 0}</h4><p>{TEXT.absences}</p></div></div>
        <div className="stat-item"><div className="stat-icon justified"><i className="bi bi-check-circle"></i></div><div className="stat-content"><h4>{statistics.total_justified || 0}</h4><p>{TEXT.justified}</p></div></div>
        <div className="stat-item"><div className="stat-icon rate"><i className="bi bi-percent"></i></div><div className="stat-content"><h4>{statistics.presence_rate || 0}%</h4><p>{TEXT.presenceRate}</p></div></div>
      </div>

      <div className="profile-status">
        <h3>{TEXT.specializedStatus}</h3>
        <div className="status-grid">
          <div className={`status-item ${hasStage ? 'active' : 'inactive'}`}><i className="bi bi-briefcase"></i><span>Stage</span><span className="status-value">{hasStage ? 'Oui' : 'Non'}</span></div>
          <div className={`status-item ${hasWork ? 'active' : 'inactive'}`}><i className="bi bi-building"></i><span>Emploi</span><span className="status-value">{hasWork ? 'Oui' : 'Non'}</span></div>
          <div className={`status-item ${hasCc ? 'active' : 'inactive'}`}><i className="bi bi-clipboard-check"></i><span>CC</span><span className="status-value">{hasCc ? 'Oui' : 'Non'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileCard;
