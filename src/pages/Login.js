import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
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
      fd.append('email', formData.email);
      fd.append('password', formData.password);

      const response = await axios.post('https://dashboard-etudiant.free.nf/api/login.php', fd);
      if (response.data.user_id) {
        login(response.data);
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      } else if (err.response?.status === 401) {
        setError('Email ou mot de passe incorrect.');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        setError(err.response?.data?.message || 'Erreur de connexion');
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
          <p>Connectez-vous pour accéder à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-danger">{error}</div>}

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
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
