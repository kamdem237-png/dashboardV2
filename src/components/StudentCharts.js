import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import '../styles/StudentCharts.css';

const TEXT = {
  empty: 'Aucune donn\u00e9e graphique disponible',
  presences: 'Pr\u00e9sences',
  absence: 'Absences',
  justified: 'Absences justifi\u00e9es',
  presence: 'Pr\u00e9sence',
  attendance: 'Assiduit\u00e9',
  regularity: 'R\u00e9gularit\u00e9',
  performance: 'Performance',
  cumulativePresence: 'Pr\u00e9sences cumul\u00e9es',
  cumulativeAbsence: 'Absences cumul\u00e9es',
  temporal: '\u00c9volution temporelle',
  distribution: 'R\u00e9partition',
  multidimensional: 'Performance multidimensionnelle',
  comparison: 'Comparaison par p\u00e9riode',
  cumulative: 'Tendances cumul\u00e9es',
  selectedType: 'Type de graphique s\u00e9lectionn\u00e9',
  weeksAnalyzed: 'Nombre de semaines analys\u00e9es'
};

const chartDescriptions = {
  line: '\u00c9volution temporelle - Id\u00e9al pour visualiser les tendances',
  pie: 'R\u00e9partition - Parfait pour voir les proportions',
  radar: 'Radar - Id\u00e9al pour la performance globale',
  bar: 'Comparaison - Excellent pour comparer les p\u00e9riodes',
  area: 'Tendances - Id\u00e9al pour les cumuls'
};

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const getWeekLabel = (point, index) => point?.label || point?.name || `Semaine ${index + 1}`;

const StudentCharts = ({ studentData }) => {
  const [chartType, setChartType] = useState('line');

  if (!studentData || !studentData.timeline_data) {
    return <div className="charts-empty">{TEXT.empty}</div>;
  }

  const timeline = studentData.timeline_data || [];
  const stats = studentData.calculated_statistics || {};
  let cumulativePresence = 0;
  let cumulativeAbsence = 0;

  const timeData = timeline.map((point, index) => {
    const presence = toNumber(point.presence);
    const absence = toNumber(point.absence);
    const justified = toNumber(point.absence_justifiee);
    cumulativePresence += presence;
    cumulativeAbsence += absence;

    return {
      name: getWeekLabel(point, index),
      presence,
      absence,
      justified,
      total: presence + absence,
      cumulativePresence,
      cumulativeAbsence
    };
  });

  const totalPresence = toNumber(stats.total_presence);
  const totalAbsence = toNumber(stats.total_absence);
  const totalJustified = toNumber(stats.total_justified);
  const totalSessions = totalPresence + totalAbsence;
  const presenceRate = totalSessions > 0 ? (totalPresence / totalSessions) * 100 : 0;
  const absenceRate = totalSessions > 0 ? (totalAbsence / totalSessions) * 100 : 0;

  const pieChartData = [
    { name: TEXT.presences, value: totalPresence, color: '#27ae60' },
    { name: TEXT.absence, value: totalAbsence, color: '#e74c3c' },
    { name: TEXT.justified, value: totalJustified, color: '#f39c12' }
  ].filter((item) => item.value > 0);

  const radarChartData = [
    { subject: TEXT.presence, value: Math.min(100, presenceRate), fullMark: 100 },
    { subject: TEXT.attendance, value: Math.min(100, presenceRate), fullMark: 100 },
    { subject: TEXT.regularity, value: Math.max(0, 100 - absenceRate), fullMark: 100 },
    { subject: TEXT.performance, value: Math.min(100, presenceRate), fullMark: 100 }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="presence" stroke="#27ae60" strokeWidth={2} name={TEXT.presences} />
              <Line type="monotone" dataKey="absence" stroke="#e74c3c" strokeWidth={2} name={TEXT.absence} />
              <Line type="monotone" dataKey="justified" stroke="#f39c12" strokeWidth={2} strokeDasharray="5 5" name={TEXT.justified} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name={TEXT.performance} dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="presence" fill="#27ae60" name={TEXT.presences} />
              <Bar dataKey="absence" fill="#e74c3c" name={TEXT.absence} />
              <Bar dataKey="justified" fill="#f39c12" name={TEXT.justified} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="cumulativePresence" stroke="#27ae60" fill="#27ae60" fillOpacity={0.35} name={TEXT.cumulativePresence} />
              <Area type="monotone" dataKey="cumulativeAbsence" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.25} name={TEXT.cumulativeAbsence} />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="student-charts">
      <div className="charts-header">
        <h3>Graphiques intelligents</h3>
        <div className="chart-controls">
          <div className="chart-type-selector">
            <button className={`chart-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')} title={TEXT.temporal}>
              <i className="bi bi-graph-up"></i>
            </button>
            <button className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`} onClick={() => setChartType('pie')} title={TEXT.distribution}>
              <i className="bi bi-pie-chart"></i>
            </button>
            <button className={`chart-btn ${chartType === 'radar' ? 'active' : ''}`} onClick={() => setChartType('radar')} title={TEXT.multidimensional}>
              <i className="bi bi-radar"></i>
            </button>
            <button className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')} title={TEXT.comparison}>
              <i className="bi bi-bar-chart"></i>
            </button>
            <button className={`chart-btn ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')} title={TEXT.cumulative}>
              <i className="bi bi-graph-down"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>

      <div className="chart-insights">
        <h4>Insights IA</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <i className="bi bi-lightbulb"></i>
            <div>
              <p>{TEXT.selectedType}</p>
              <strong>{chartDescriptions[chartType]}</strong>
            </div>
          </div>

          <div className="insight-item">
            <i className="bi bi-info-circle"></i>
            <div>
              <p>{TEXT.weeksAnalyzed}</p>
              <strong>{timeline.length} semaines</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCharts;
