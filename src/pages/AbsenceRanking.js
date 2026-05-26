import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import '../styles/AbsenceRanking.css';

const normalizeKey = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const isYesValue = (value) => {
  if (!value) return false;
  const normalized = normalizeKey(value);
  return ['oui', 'yes', 'true', '1', 'en_cours', 'in_progress', 'travailleur', 'employe', 'stagiaire'].includes(normalized);
};

const AbsenceRanking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dashboardId = location.state?.dashboardId;

  useEffect(() => {
    if (dashboardId) {
      fetchDashboardData();
    } else {
      navigate('/history');
    }
  }, [dashboardId]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboard.php?id=${dashboardId}`);
      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  const handleBack = () => {
    navigate(`/dashboard/${dashboardId}`);
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

  if (!dashboardData) {
    return <div className="alert alert-danger">Erreur lors du chargement des donn\u00e9es</div>;
  }

  const students = dashboardData.students || [];
  const rankedStudents = [...students]
    .map(student => ({
      name: student.name || 'Inconnu',
      absences: Number(student.absence || 0) + Number(student.justified || 0),
      id: student.id,
      hasStage: isYesValue(student.stage || student.data?.Stage || student.data?.stage),
      hasWork: isYesValue(student.work || student.data?.Travail || student.data?.work)
    }))
    .sort((a, b) => b.absences - a.absences);

  const averageAbsence = rankedStudents.length > 0
    ? rankedStudents.reduce((sum, s) => sum + s.absences, 0) / rankedStudents.length
    : 0;

  const chartData = rankedStudents.map(student => ({
    ...student,
    color: student.absences > averageAbsence ? '#e74c3c' : '#27ae60'
  }));

  return (
    <div className="absence-ranking-page fade-in">
      <div className="ranking-header">
        <button className="btn btn-outline-light" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour au tableau de bord
        </button>
        <h1>Classement des absences</h1>
        <p>{dashboardData?.title || 'Tableau de bord'}</p>
      </div>

      <div className="ranking-stats">
        <div className="ranking-stat-card">
          <h3>{rankedStudents.length}</h3>
          <p>\u00c9tudiants</p>
        </div>
        <div className="ranking-stat-card">
          <h3>{Math.round(averageAbsence)}h</h3>
          <p>Moyenne d'absences</p>
        </div>
        <div className="ranking-stat-card danger">
          <h3>{rankedStudents.filter(s => s.absences > averageAbsence).length}</h3>
          <p>Au-dessus de la moyenne</p>
        </div>
        <div className="ranking-stat-card success">
          <h3>{rankedStudents.filter(s => s.absences <= averageAbsence).length}</h3>
          <p>En dessous de la moyenne</p>
        </div>
      </div>

      <div className="ranking-chart-section">
        <h2>Graphique des absences</h2>
        <div className="ranking-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#e74c3c' }}></span>
            <span>Au-dessus de la moyenne</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#27ae60' }}></span>
            <span>En dessous ou \u00e9gal \u00e0 la moyenne</span>
          </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={Math.max(400, rankedStudents.length * 40)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Heures d\'absence', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value} heures`, 'Absences']}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Bar dataKey="absences" onClick={(data) => handleStudentClick(data.id)} style={{ cursor: 'pointer' }}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ranking-table-section">
        <h2>D\u00e9tail par \u00e9tudiant</h2>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Heures d'absence</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>
                    <span className={student.absences > averageAbsence ? 'text-danger fw-bold' : 'text-success'}>
                      {student.absences}h
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${student.absences > averageAbsence ? 'bg-danger' : 'bg-success'}`}>
                      {student.absences > averageAbsence ? 'Critique' : 'Normal'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleStudentClick(student.id)}>
                      Voir infos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AbsenceRanking;
