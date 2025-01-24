import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../builderio/navigation/Navigation.module.css';

const Header: React.FC = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'path/to/fallback-image.png'; // Provide a path to your fallback image
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Find Club', path: '/find-club' },
    { label: 'Recommend Club', path: '/recommend-club' },
    { label: 'Submit Club', path: '/submit-club' },
    { label: 'My Profile', path: '/golfer-profile' },
  ];

  return (
    <header
      style={{
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        flexWrap: 'wrap',
      }}
    >
      <div className={styles.brandSection} style={{ display: 'flex', alignItems: 'center' }}>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/77a24dc57639d26939b3ee58a9557092803bbb4e29fc613a6e982727f846cf6d?placeholderIfAbsent=true&apiKey=9e1847323d5241858d1db34992e94222"
          alt="Find My Club Logo"
          className={styles.brandLogo}
          style={{ maxWidth: '100px', height: 'auto' }}
          onError={handleImageError}
        />
        <h1 className={styles.brandName} style={{ fontSize: '1.5rem', marginLeft: '10px' }}>Find My Club</h1>
      </div>
      <nav className={styles.navLinks} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px' }}>
        <Link to="/" className={styles.navLink}>Home</Link>
        {session ? (
          <>
            <Link to="/find-club" className={styles.navLink}>Find Club</Link>
            <Link to="/recommend-club" className={styles.navLink}>Recommend Club</Link>
            <Link to="/submit-club" className={styles.navLink}>Submit Club</Link>
            <Link to="/golfer-profile" className={styles.navLink}>Golfer Profile</Link>
            <button 
              onClick={handleSignOut} 
              className={styles.navLink} 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/create-account" className={styles.navLink}>Create Account</Link>
            <Link to="/login" className={styles.navLink}>Log In</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;