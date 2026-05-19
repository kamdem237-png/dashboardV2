import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ScrollableChartContainer from '../components/ScrollableChartContainer';
import StudentProfileCard from '../components/StudentProfileCard';
import StudentStats from '../components/StudentStats';
import StudentCharts from '../components/StudentCharts';
import StudentTimeline from '../components/StudentTimeline';
import StudentInsights from '../components/StudentInsights';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('4weeks');
  const [zoom, setZoom] = useState(50);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    if (id) {
      fetchStudentData();
    } else {
      console.error('Student ID is undefined - cannot fetch data');
      setLoading(false);
    }
  }, [id]);

  const fetchStudentData = async () => {
    console.log('=== FETCH STUDENT START ===');
    console.log('Student ID:', id);

    if (!id) {
      console.error('Student ID is undefined');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_student.php?id=${id}`);
      console.log('RAW STUDENT RESPONSE:', response);
      console.log('RESPONSE DATA:', response.data);

      if (response.data.success && response.data.data) {
        console.log('FINAL STUDENT DATA:', response.data.data);
        setStudentData(response.data.data);
      } else {
        console.error('Invalid response structure:', response.data);
        setStudentData(null);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      console.error('Error details:', error.response?.data);
      setStudentData(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const getZoomedData = (data) => {
    const totalPoints = data.length;
    const visiblePoints = Math.max(5, Math.floor(totalPoints * (zoom / 100)));
    const startIndex = Math.floor((totalPoints - visiblePoints) / 2);
    return data.slice(startIndex, startIndex + visiblePoints);
  };

  const generateTimeSeriesData = () => {
    if (!studentData || !studentData.timeline_data) return [];

    const labels = {
      '1week': ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
      '4weeks': ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      '1month': ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      '4months': ['Mois 1', 'Mois 2', 'Mois 3', 'Mois 4']
    };

    const baseData = labels[timeFilter] || labels['4weeks'];

    // Utiliser les vraies données temporelles
    const timeline = studentData.timeline_data || [];

    if (timeline.length > 0) {
      const presenceData = baseData.map((label, index) => {
        const point = timeline[index] || timeline[0] || {};
        return {
          name: label,
          presence: point.presence || 0,
          absenceJustifiee: point.absence_justifiee || 0,
          absenceNonJustifiee: point.absence || 0
        };
      });
      return getZoomedData(presenceData);
    }

    // Fallback: pas de données fictives
    return [];
  };

  const getConclusion = () => {
    if (!studentData || !studentData.statistics) return '';

    const student = studentData;
    const stats = studentData.statistics || {};
    const tauxPresence = stats.taux_presence || 0;
    const donnees = student.data || {};

    // Chercher stage dans les données JSON
    let hasStage = false;
    let stageStatus = '';
    for (const key of ['stage', 'stages', 'internship']) {
      if (donnees[key]) {
        const value = String(donnees[key]).toLowerCase();
        if (value !== 'non' && value !== 'no' && value !== 'false') {
          hasStage = true;
          stageStatus = value;
          break;
        }
      }
    }

    // Chercher travail dans les données JSON
    let hasTravail = false;
    for (const key of ['travail', 'work', 'job', 'emploi']) {
      if (donnees[key]) {
        const value = String(donnees[key]).toLowerCase();
        if (value === 'oui' || value === 'yes' || value === 'true') {
          hasTravail = true;
          break;
        }
      }
    }

    let conclusion = `L'étudiant ${student.name} ${student.firstname} `;

    // Évaluation de la présence
    if (tauxPresence >= 90) {
      conclusion += `présente un taux de présence excellent de ${tauxPresence}%, ce qui démontre une assiduité remarquable et une participation active aux cours. `;
    } else if (tauxPresence >= 80) {
      conclusion += `présente un taux de présence favorable de ${tauxPresence}%, ce qui prouve sa participation régulière aux cours. `;
    } else if (tauxPresence >= 70) {
      conclusion += `présente un taux de présence acceptable de ${tauxPresence}%, ce qui indique une participation modérée aux cours. `;
    } else if (tauxPresence >= 50) {
      conclusion += `présente un taux de présence préoccupant de ${tauxPresence}%, ce qui nécessite une attention particulière et une amélioration. `;
    } else {
      conclusion += `présente un taux de présence critique de ${tauxPresence}%, ce qui est très préoccupant et demande une intervention urgente. `;
    }

    // Stage
    if (hasStage) {
      if (stageStatus === 'en_cours' || stageStatus === 'yes' || stageStatus === 'in_progress') {
        conclusion += `Il exerce actuellement un stage en cours, ce qui montre son engagement professionnel. `;
      } else if (stageStatus === 'termine' || stageStatus === 'finished' || stageStatus === 'completed') {
        conclusion += `Il a terminé son stage avec succès, ce qui démontre sa capacité à mener à terme ses projets. `;
      } else {
        conclusion += `Il possède une expérience de stage, ce qui enrichit son parcours. `;
      }
    } else {
      conclusion += `Il ne s'exerce aucune activité de stage actuellement. `;
    }

    // Travail
    if (hasTravail) {
      conclusion += `Il est également travailleur, ce qui témoigne de sa capacité à concilier études et vie professionnelle. `;
    }

    return conclusion;
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

  if (!studentData) {
    return <div className="alert alert-danger">Erreur lors du chargement des données de l'étudiant</div>;
  }

  const timeSeriesData = generateTimeSeriesData();
  const student = studentData;
  const stats = studentData.statistics || {};
  const hasAbsenceJustifiee = stats.absence_justifiee > 0;

  return (
    <div className="student-dashboard fade-in">
      <div className="student-header">
        <button className="btn btn-outline-light back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
        <h1>{student.name} {student.firstname}</h1>
        <p className="student-description">{getConclusion()}</p>
      </div>

      {/* Composants intelligents générés par l'IA */}
      <StudentProfileCard studentData={studentData} aiAnalysis={aiAnalysis} />
      <StudentStats studentData={studentData} aiAnalysis={aiAnalysis} />
      <StudentCharts studentData={studentData} aiAnalysis={aiAnalysis} />
      <StudentInsights studentData={studentData} aiAnalysis={aiAnalysis} globalStats={globalStats} />

      {/* Section conclusion traditionnelle (backup) */}
      <div className="conclusion-section">
        <h3>Conclusion</h3>
        <div className={`conclusion-card ${studentData.taux_presence >= 70 ? 'favorable' : 'defavorable'}`}>
          <div className="conclusion-icon">
            <i className={`bi ${studentData.taux_presence >= 70 ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
          </div>
          <div className="conclusion-content">
            <h4>Résultat {studentData.taux_presence >= 70 ? 'Favorable' : 'Défavorable'}</h4>
            <p>{getConclusion()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
