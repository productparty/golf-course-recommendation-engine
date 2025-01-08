import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../builderio/navigation/Navigation.module.css';

const Header: React.FC = () => {
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
          alt="Golf Course Finder Logo"
          className={styles.brandLogo}
          style={{ maxWidth: '100px', height: 'auto' }}
        />
        <h1 className={styles.brandName} style={{ fontSize: '1.5rem', marginLeft: '10px' }}>Fairway Finder</h1>
      </div>
      <nav className={styles.navLinks} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px' }}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/find-course" className={styles.navLink}>Find Course</Link>
        <Link to="/recommend-course" className={styles.navLink}>Recommend Course</Link>
        <Link to="/submit-course" className={styles.navLink}>Submit Course</Link>
        <Link to="/sign-up" className={styles.navLink}>Sign Up</Link>
      </nav>
    </header>
  );
};

export default Header;