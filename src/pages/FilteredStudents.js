import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/FilteredStudents.css';

const TEXT = {
  students: '\u00c9tudiants',
  found: '\u00e9tudiant(s) trouv\u00e9(s)',
  firstname: 'Pr\u00e9nom',
  noStudent: 'Aucun \u00e9tudiant trouv\u00e9',
  noMatch: 'Aucun \u00e9tudiant ne correspond \u00e0 cette cat\u00e9gorie'
};

const normalizeValue = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const isYes = (value) => {
  if (!value) return false;
  const normalized = normalizeValue(value);
  return ['oui', 'yes', 'true', '1', 'en_cours', 'in_progress', 'travailleur', 'employe', 'stagiaire'].includes(normalized);
};

const FilteredStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [dashboardId, setDashboardId] = useState(null);

  useEffect(() => {
    if (location.state?.category && location.state?.dashboardId) {
      setCategory(location.state.category);
      setDashboardId(location.state.dashboardId);
      fetchFilteredStudents(location.state.dashboardId, location.state.category);
    } else {
      navigate('/history');
    }
  }, [location.state, navigate]);

  const fetchFilteredStudents = async (nextDashboardId, nextCategory) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://dashboard-etudiant.free.nf/api/get_dashboard.php?id=${nextDashboardId}`);
      const allStudents = response.data?.data?.students || [];
      const normalizedCategory = normalizeValue(nextCategory);

      const filteredStudents = allStudents.filter((student) => {
        const stageValue = student.stage || student.data?.Stage || student.data?.stage;
        const workValue = student.work || student.data?.Travail || student.data?.work;

        switch (normalizedCategory) {
          case 'en_stage':
            return isYes(stageValue);
          case 'employes':
          case 'emploi':
          case 'travaille':
            return isYes(workValue);
          case 'sans_activite':
            return !isYes(stageValue) && !isYes(workValue);
          case 'tous_les_etudiants':
          default:
            return true;
        }
      });

      setStudents(filteredStudents.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  const handleBack = () => {
    navigate(dashboardId ? `/dashboard/${dashboardId}` : '/history');
  };

  const getAbsenceCount = (student) => Number(student.absence || 0) + Number(student.justified || 0);

  const getStageStatus = (student) => {
    const stageValue = student.stage || student.data?.Stage || student.data?.stage;
    return isYes(stageValue) ? 'En stage' : 'Pas de stage';
  };

  const getWorkStatus = (student) => {
    const workValue = student.work || student.data?.Travail || student.data?.work;
    return isYes(workValue) ? 'Travailleur' : 'Sans travail';
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
    <div className="filtered-students-page fade-in">
      <div className="page-header">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
        <h1>{TEXT.students} : {category}</h1>
        <p>{students.length} {TEXT.found}</p>
      </div>

      <div className="students-table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>{TEXT.firstname}</th>
                <th>Heures d'absence</th>
                <th>Statut stage</th>
                <th>Statut travail</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name || '-'}</td>
                  <td>{student.firstname || '-'}</td>
                  <td>{getAbsenceCount(student)}</td>
                  <td>{getStageStatus(student)}</td>
                  <td>{getWorkStatus(student)}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleViewStudent(student.id)}>
                      Voir infos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <h3>{TEXT.noStudent}</h3>
          <p>{TEXT.noMatch}</p>
        </div>
      )}
    </div>
  );
};

export default FilteredStudents;
