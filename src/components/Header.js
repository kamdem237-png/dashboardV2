import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dropdown } from 'react-bootstrap';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle btn btn-link" onClick={toggleSidebar}>
          <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
        </button>
        <div className="logo">
          <i className="bi bi-graph-up-arrow"></i>
          <span className="logo-text">Dashboard</span>
        </div>
      </div>
      <div className="header-right">
        <Dropdown show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
          <Dropdown.Toggle variant="light" id="user-dropdown" className="user-dropdown">
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <span className="user-name">
              {user?.nom} {user?.prenom}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item onClick={handleProfile}>
              <i className="bi bi-person me-2"></i>
              Profil
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
