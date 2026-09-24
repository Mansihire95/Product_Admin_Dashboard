import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/products" className="nav-logo">
          🛒 Product Admin
        </Link>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-right ${menuOpen ? 'nav-open' : ''}`}>
        {user && (
          <div className="nav-user">
            {user.image && (
              <img src={user.image} alt={user.firstName} className="nav-avatar" />
            )}
            <span className="nav-username">
              {user.firstName} {user.lastName}
            </span>
          </div>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
