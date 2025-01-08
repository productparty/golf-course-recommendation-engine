import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '1rem',
        margin: 0,
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} Fairway Finder. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
