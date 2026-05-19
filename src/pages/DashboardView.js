import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/DashboardView.css';

const normalizeKey = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const hiddenStudentTableKeys = new Set([
  'nom',
  'prenom',
  'nom_complet',
  'name',
  'student_name',
  'salle',
  'room',
  'classroom',
  'classe',
  'semaine',
  'week',
  'date_debut',
  'date_de_debut',
  'date_debut_semaine',
  'date_fin',
  'date_de_fin',
  'date_fin_semaine'
]);

const shouldHideStudentColumn = (column) => {
  const key = normalizeKey(column);
  return hiddenStudentTableKeys.has(key) || (key.includes('date') && (key.includes('debut') || key.includes('fin')));
};

const metricColumnMap = {
  heures_presence: 'presence',
  heure_presence: 'presence',
  heures_presences: 'presence',
  heure_presences: 'presence',
  presence: 'presence',
  presences: 'presence',
  heures_absence: 'absence',
  heure_absence: 'absence',
  heures_absences: 'absence',
  heure_absences: 'absence',
  absence: 'absence',
  absences: 'absence',
  heures_justifiees: 'justified',
  heures_justifees: 'justified',
  heure_justifiee: 'justified',
  absence_justifiee: 'justified',
  absences_justifiees: 'justified'
};

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const number = Number(value.replace(',', '.').replace(/[^\d.-]/g, ''));
    return Number.isFinite(number) ? number : 0;
  }
  return 0;
};

const isYesValue = (value) => {
  if (!value) return false;
  const normalized = normalizeKey(value);
  return ['oui', 'yes', 'true', '1', 'en_cours', 'in_progress', 'travailleur', 'employe', 'stagiaire'].includes(normalized);
};

const DashboardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('4weeks');
  const [chartStartIndex, setChartStartIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchDashboardData();
    } else {
      console.error('Dashboard ID is undefined - cannot fetch data');
      setLoading(false);
    }
  }, [id]);

  const fetchDashboardData = async () => {
    console.log('=== FETCH DASHBOARD START ===');
    console.log('Dashboard ID:', id);

    try {
      const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboard.php?id=${id}`);
      console.log('RAW API RESPONSE:', response);
      console.log('RESPONSE DATA:', response.data);

      if (response.data.success && response.data.data) {
        console.log('FINAL DASHBOARD:', response.data.data);
        setDashboardData(response.data.data);
      } else {
        console.error('Invalid response structure:', response.data);
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      console.error('Error details:', error.response?.data);
      setDashboardData(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleStageClick = (category) => {
    navigate('/filtered-students', { state: { category, dashboardId: id } });
  };

  const handleStudentClick = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  const handleViewAllStudents = () => {
    navigate('/filtered-students', { state: { category: 'Tous les étudiants', dashboardId: id } });
  };

  const getZoomedData = (data) => {
    return data;
  };

  const generateTimeSeriesData = () => getZoomedData(buildTimeSeriesData());
  const normalizePoint = (point, fallbackName) => ({
    name: point?.name || fallbackName,
    presence: toNumber(point?.presence),
    absenceJustifiee: toNumber(point?.absence_justifiee || point?.absenceJustifiee),
    absenceNonJustifiee: toNumber(point?.absence_non_justifiee || point?.absenceNonJustifiee || point?.absence)
  });

  const aggregatePoints = (points, label, start, end) => {
    const slice = points.slice(start, end);
    return {
      name: label,
      presence: slice.reduce((sum, point) => sum + toNumber(point.presence), 0),
      absenceJustifiee: slice.reduce((sum, point) => sum + toNumber(point.absenceJustifiee), 0),
      absenceNonJustifiee: slice.reduce((sum, point) => sum + toNumber(point.absenceNonJustifiee), 0)
    };
  };

  const distributePoint = (point) => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((label) => ({
    name: label,
    presence: Math.round((point?.presence || 0) / 5),
    absenceJustifiee: Math.round((point?.absenceJustifiee || 0) / 5),
    absenceNonJustifiee: Math.round((point?.absenceNonJustifiee || 0) / 5)
  }));

  const buildTimeSeriesData = () => {
    const rawSeries = dashboardData?.statistics?.time_series || [];
    const weeklyPoints = rawSeries.map((point, index) => normalizePoint(point, `Semaine ${index + 1}`));

    if (!weeklyPoints.length) {
      const stats = dashboardData?.statistics || {};
      return [{
        name: 'Période',
        presence: Number(stats.total_presence || 0),
        absenceJustifiee: Number(stats.total_justified || 0),
        absenceNonJustifiee: Number(stats.total_absence || 0)
      }];
    }

    if (timeFilter === '1week') {
      return distributePoint(weeklyPoints[chartStartIndex] || weeklyPoints[0]);
    }

    if (timeFilter === '4months') {
      return [
        aggregatePoints(weeklyPoints, 'Mois 1', 0, 4),
        aggregatePoints(weeklyPoints, 'Mois 2', 4, 8),
        aggregatePoints(weeklyPoints, 'Mois 3', 8, 12),
        aggregatePoints(weeklyPoints, 'Mois 4', 12, 16)
      ].filter(point => point.presence || point.absenceJustifiee || point.absenceNonJustifiee);
    }

    return weeklyPoints;
  };

  const normalizeActivityPoint = (point, fallbackName) => {
    // Si le name est invalide ou vide, utiliser le fallback
    let name = point?.name || fallbackName;
    // Si le name est seulement "SEMAINE" ou similaire sans numéro, utiliser le fallback
    if (name && name.toUpperCase() === 'SEMAINE') {
      name = fallbackName;
    }
    return {
      name,
      employes: toNumber(point?.employes),
      stagiaires: toNumber(point?.stagiaires),
      sansActivite: toNumber(point?.sans_activite || point?.sansActivite)
    };
  };

  const aggregateActivityPoints = (points, label, start, end) => {
    const slice = points.slice(start, end);
    return {
      name: label,
      employes: slice.reduce((sum, point) => sum + toNumber(point.employes), 0),
      stagiaires: slice.reduce((sum, point) => sum + toNumber(point.stagiaires), 0),
      sansActivite: slice.reduce((sum, point) => sum + toNumber(point.sansActivite), 0)
    };
  };

  const buildActivitySeriesData = () => {
    const rawSeries = dashboardData?.statistics?.activity_time_series || [];
    const weeklyPoints = rawSeries.map((point, index) => normalizeActivityPoint(point, `Semaine ${index + 1}`));

    if (!weeklyPoints.length) {
      const students = dashboardData?.students || [];
      const fallback = students.reduce((acc, student) => {
        const hasWork = isYesValue(student.work || student.data?.Travail || student.data?.work);
        const hasStage = isYesValue(student.stage || student.data?.Stage || student.data?.stage);

        if (hasWork) acc.employes += 1;
        else if (hasStage) acc.stagiaires += 1;
        else acc.sansActivite += 1;

        return acc;
      }, { name: 'Période', employes: 0, stagiaires: 0, sansActivite: 0 });

      return [fallback];
    }

    if (timeFilter === '4months') {
      return [
        aggregateActivityPoints(weeklyPoints, 'Mois 1', 0, 4),
        aggregateActivityPoints(weeklyPoints, 'Mois 2', 4, 8),
        aggregateActivityPoints(weeklyPoints, 'Mois 3', 8, 12),
        aggregateActivityPoints(weeklyPoints, 'Mois 4', 12, 16)
      ].filter(point => point.employes || point.stagiaires || point.sansActivite);
    }

    return weeklyPoints;
  };

  const generateActivitySeriesData = () => getZoomedData(buildActivitySeriesData());

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setChartStartIndex(0);
  };

  const stageData = () => {
    if (!dashboardData) return [];

    const students = dashboardData.students || [];
    const stageCount = students.filter(student => isYesValue(student.stage || student.data?.Stage || student.data?.stage)).length;
    const workCount = students.filter(student => isYesValue(student.work || student.data?.Travail || student.data?.work)).length;
    const noActivityCount = students.filter((student) => {
      const hasStage = isYesValue(student.stage || student.data?.Stage || student.data?.stage);
      const hasWork = isYesValue(student.work || student.data?.Travail || student.data?.work);
      return !hasStage && !hasWork;
    }).length;

    const data = [];

    if (stageCount > 0) {
      data.push({ name: 'En Stage', value: stageCount, color: '#3498db' });
    }

    if (workCount > 0) {
      data.push({ name: 'Employés', value: workCount, color: '#27ae60' });
    }

    if (noActivityCount > 0) {
      data.push({ name: 'Sans activité', value: noActivityCount, color: '#e74c3c' });
    }

    return data;
  };

  const topAbsencesData = () => {
    if (!dashboardData || !dashboardData.statistics || !dashboardData.statistics.top_absentees) return [];

    const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#3498db', '#27ae60'];

    return dashboardData.statistics.top_absentees.map((student, index) => ({
      name: student.name,
      absences: student.absence,
      color: colors[index],
      id: student.id
    }));
  };

  const getStudentTableValue = (student, column) => {
    const metricKey = metricColumnMap[normalizeKey(column)];

    if (metricKey && student[metricKey] !== undefined) {
      return student[metricKey];
    }

    return student.data && student.data[column] !== undefined ? student.data[column] : '-';
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
    return <div className="alert alert-danger">Erreur lors du chargement du tableau de bord</div>;
  }

  const timeSeriesData = generateTimeSeriesData();
  const activitySeriesData = generateActivitySeriesData();
  const stagePieData = stageData();
  const topAbsences = topAbsencesData();
  const studentTableHeaders = (dashboardData?.headers || [])
    .filter((column) => !shouldHideStudentColumn(column))
    .slice(0, 5);

  return (
    <div className="dashboard-view fade-in">
      <div className="dashboard-header">
        <h1>{dashboardData?.title || 'Tableau de bord'}</h1>
        <p className="dashboard-description">
          {dashboardData?.description || "Ce tableau de bord présente les différents flux de transactions effectuées au sein de cette salle de classe"}
        </p>
      </div>

      <div className="stats-overview">
        <div className="stat-box">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h3>{dashboardData?.total_students || 0}</h3>
            <p>Total étudiants</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon presence">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>{(dashboardData?.statistics?.average_presence_rate || 0)}%</h3>
            <p>Assiduité moyenne</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon absence">
            <i className="bi bi-calendar-x"></i>
          </div>
          <div className="stat-content">
            <h3>{(dashboardData?.statistics?.average_absence_rate || 0)}%</h3>
            <p>Taux d'absence</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon stage">
            <i className="bi bi-briefcase"></i>
          </div>
          <div className="stat-content">
            <h3>{dashboardData?.statistics?.total_stage || 0}</h3>
            <p>En stage</p>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h2>L'évolution de la présence dans le temps</h2>
          <div className="time-filters">
            <button
              className={`filter-btn ${timeFilter === '4weeks' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('4weeks')}
            >
              Semaine
            </button>
            <button
              className={`filter-btn ${timeFilter === '4months' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('4months')}
            >
              Mois
            </button>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="presence" stroke="#27ae60" strokeWidth={2} name="Présence" />
              <Line type="monotone" dataKey="absenceJustifiee" stroke="#f39c12" strokeWidth={2} strokeDasharray="5 5" name="Absences justifiées" />
              <Line type="monotone" dataKey="absenceNonJustifiee" stroke="#e74c3c" strokeWidth={2} strokeDasharray="3 3" name="Absences non justifiées" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section activity-chart-section">
        <div className="chart-header">
          <h2>Évolution stage, emploi et sans activité</h2>
          <div className="time-filters">
            <button
              className={`filter-btn ${timeFilter === '4weeks' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('4weeks')}
            >
              Semaine
            </button>
            <button
              className={`filter-btn ${timeFilter === '4months' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('4months')}
            >
              Mois
            </button>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={activitySeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="employes" stroke="#27ae60" strokeWidth={2} name="Employés" />
              <Line type="monotone" dataKey="stagiaires" stroke="#f39c12" strokeWidth={2} name="Stagiaires" />
              <Line type="monotone" dataKey="sansActivite" stroke="#e74c3c" strokeWidth={2} name="Sans activité" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-charts">
        <div className="chart-card pie-chart-card">
          <h3>Vision des stagiaires</h3>
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stagePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handleStageClick(data.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {stagePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {stagePieData.map((item, index) => (
              <div key={index} className="legend-item" onClick={() => handleStageClick(item.name)} style={{ cursor: 'pointer' }}>
                <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                <span className="legend-label">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card bar-chart-card">
          <h3>Top 5 absences</h3>
          <div className="bar-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topAbsences} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="absences" onClick={(data) => handleStudentClick(data.id)} style={{ cursor: 'pointer' }}>
                  {topAbsences.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bar-legend">
            {topAbsences.map((item, index) => (
              <div key={`legend-${item.id}-${index}`} className="legend-item" onClick={() => handleStudentClick(item.id)} style={{ cursor: 'pointer' }}>
                <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                <span className="legend-label">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="students-table-section">
        <div className="table-header">
          <h3>Étudiants (Top 5 alphabétique)</h3>
          <button className="btn btn-primary" onClick={handleViewAllStudents}>
            Voir tout
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                {studentTableHeaders.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.students && dashboardData.students.length > 0 ? (
                [...dashboardData.students]
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .slice(0, 5)
                  .map((student) => (
                    <tr key={student.id}>
                      {studentTableHeaders.map((col, index) => (
                        <td key={`${student.id}-${col}-${index}`}>
                          {getStudentTableValue(student, col)}
                        </td>
                      ))}
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleStudentClick(student.id)}
                        >
                          Voir infos
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={studentTableHeaders.length + 1} className="text-center">Aucun étudiant trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
