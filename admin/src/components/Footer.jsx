import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      Election Admin • {new Date().getFullYear()}
    </footer>
  );
}

export default Footer;
