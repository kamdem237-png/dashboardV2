import React from 'react';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      icon: 'bi-person-plus',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en quelques secondes. Aucune validation d\'email requise.'
    },
    {
      icon: 'bi-cloud-upload',
      title: 'Téléversez vos fichiers',
      description: 'Importez vos fichiers Excel ou CSV contenant les données des étudiants.'
    },
    {
      icon: 'bi-magic',
      title: 'Générez le tableau de bord',
      description: 'L\'analyse automatique crée des visualisations et statistiques détaillées.'
    },
    {
      icon: 'bi-graph-up',
      title: 'Analysez les résultats',
      description: 'Consultez les graphiques, statistiques et identifiez les étudiants à observer.'
    }
  ];

  const features = [
    {
      icon: 'bi-shield-check',
      title: 'Sécurisé',
      description: 'Vos données sont protégées et stockées localement.'
    },
    {
      icon: 'bi-lightning',
      title: 'Rapide',
      description: 'Analyse instantanée de vos fichiers sans attente.'
    },
    {
      icon: 'bi-phone',
      title: 'Responsive',
      description: 'Accessible sur PC, tablette et mobile comme une vraie application.'
    },
    {
      icon: 'bi-download',
      title: 'PWA',
      description: 'Installez l\'application sur votre appareil pour un accès hors ligne.'
    }
  ];

  return (
    <div className="how-it-works-page fade-in">
      <div className="page-header">
        <h1>Comment ça marche ?</h1>
        <p>Découvrez comment utiliser EduManage en 4 étapes simples</p>
      </div>

      <div className="steps-section">
        <h2>Étapes d'utilisation</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">
                <i className={`bi ${step.icon}`}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="format-section">
        <h2>Format des fichiers</h2>
        <div className="format-card">
          <p>Importez vos fichiers Excel (.xlsx, .xls) ou CSV avec <strong>n'importe quel format</strong>. L'application lit automatiquement toutes les colonnes présentes.</p>
          <div className="format-features">
            <div className="feature-item">
              <i className="bi bi-check-circle text-success"></i>
              <span>Lecture dynamique de toutes les colonnes</span>
            </div>
            <div className="feature-item">
              <i className="bi bi-check-circle text-success"></i>
              <span>Aucun format strict requis</span>
            </div>
            <div className="feature-item">
              <i className="bi bi-check-circle text-success"></i>
              <span>Gestion automatique des doublons</span>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Fonctionnalités</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <i className={`bi ${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-card">
          <h2>Prêt à commencer ?</h2>
          <p>Créez votre compte et commencez à analyser vos données dès maintenant</p>
          <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/upload'}>
            <i className="bi bi-rocket-takeoff me-2"></i>
            Commencer maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
