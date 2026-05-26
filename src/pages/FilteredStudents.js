import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardView.css';
import '../styles/FilteredStudents.css';

const TEXT = {
  students: '\u00c9tudiants',
  found: '\u00e9tudiant(s) trouv\u00e9(s)',
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
      const response = await axios.get(`https://dashboard-etudiant.free.nf/api/get_dashboard.php?id=${nextDashboardId}`);
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

  const getPresenceCount = (student) => Number(student.presence || 0);

  const getJustifiedCount = (student) => Number(student.justified || 0);

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
      <div className="students-table-section">
        <div className="table-header">
          <h3>{TEXT.students} : {category} ({students.length} {TEXT.found})</h3>
          <button className="btn btn-primary" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>MATRICULE</th>
                <th>NOMS ET PRENOMS</th>
                <th>HEURES PRESENCES</th>
                <th>HEURE ABSENCES</th>
                <th>HEURES JUSTIFIEES</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.id || '-'}</td>
                    <td>{student.name || '-'}</td>
                    <td>{getPresenceCount(student)}</td>
                    <td>{getAbsenceCount(student)}</td>
                    <td>{getJustifiedCount(student)}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleViewStudent(student.id)}>
                        Voir infos
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">{TEXT.noMatch}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilteredStudents;
