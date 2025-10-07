import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">MARVEL</span>
          <span className="logo-subtext">Character Explorer</span>
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              List View
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/gallery" 
              className={`navbar-link ${location.pathname === '/gallery' ? 'active' : ''}`}
            >
              Gallery
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
