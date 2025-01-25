import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../builderio/navigation/Navigation.module.css';
import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header: React.FC = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'path/to/fallback-image.png'; // Provide a path to your fallback image
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    handleClose();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const navItems = [
    { label: 'Find Clubs', path: '/find-club' },
    { label: 'Recommended Clubs', path: '/recommend-club' },
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

      {/* Desktop Navigation */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
        <Link to="/" className={styles.navLink}>Home</Link>
        {session ? (
          <>
            <Link to="/find-club" className={styles.navLink}>Find Clubs</Link>
            <Link to="/recommend-club" className={styles.navLink}>Recommended Clubs</Link>
            <Link to="/submit-club" className={styles.navLink}>Submit Club</Link>
            <Link to="/golfer-profile" className={styles.navLink}>My Profile</Link>
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
            <Link to="/login" className={styles.navLink}>Login</Link>
          </>
        )}
      </Box>

      {/* Mobile Navigation */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <IconButton
          size="medium"
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
          sx={{ 
            padding: '8px',
            '& .MuiSvgIcon-root': {
              width: 24,
              height: 24
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleNavigate('/')}>Home</MenuItem>
          {session ? (
            <>
              <MenuItem onClick={() => handleNavigate('/find-club')}>Find Clubs</MenuItem>
              <MenuItem onClick={() => handleNavigate('/recommend-club')}>Recommended Clubs</MenuItem>
              <MenuItem onClick={() => handleNavigate('/submit-club')}>Submit Club</MenuItem>
              <MenuItem onClick={() => handleNavigate('/golfer-profile')}>My Profile</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => handleNavigate('/create-account')}>Create Account</MenuItem>
              <MenuItem onClick={() => handleNavigate('/login')}>Login</MenuItem>
            </>
          )}
        </Menu>
      </Box>
    </header>
  );
};

export default Header;