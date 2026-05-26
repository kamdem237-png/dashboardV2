import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('nom', formData.nom);
      fd.append('prenom', formData.prenom);
      fd.append('email', formData.email);
      fd.append('password', formData.password);

      const response = await axios.post('https://dashboard-etudiant.free.nf/api/register.php', fd);
      if (response.data.user_id) {
        login(response.data);
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Données invalides');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        setError(err.response?.data?.message || 'Erreur d\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <h1>EduManage</h1>
          <p>Créez votre compte pour commencer</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              className="form-control"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Entrez votre nom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              className="form-control"
              value={formData.prenom}
              onChange={handleChange}
              required
              placeholder="Entrez votre prénom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Entrez votre email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
            />
            <small className="text-muted">
              Vous pouvez utiliser n'importe quel mot de passe
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
