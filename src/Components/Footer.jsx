import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant" style={{ marginTop: '64px', backgroundColor: '#eae8e7', borderTop: '1px solid #c0c8c4' }}>
      <div className="max-width-container" style={{ padding: '64px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontFamily: 'Newsreader', fontSize: '24px', color: '#0c3b32', marginBottom: '16px' }}>Mister Holistic</h3>
            <p style={{ color: '#404846', fontSize: '14px', lineHeight: '1.6' }}>Cultivando tranquilidad y consciencia en cada rincón de tu hogar.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0c3b32', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Soporte</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/contacto" style={{ fontSize: '14px', color: '#404846' }}>Contacto</Link></li>
              <li><Link to="/contacto" style={{ fontSize: '14px', color: '#404846' }}>Envíos y Devoluciones</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0c3b32', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Marca</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/" style={{ fontSize: '14px', color: '#404846' }}>Sostenibilidad</Link></li>
              <li><Link to="/" style={{ fontSize: '14px', color: '#404846' }}>Nuestra Historia</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0c3b32', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Cuenta</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/cuenta" style={{ fontSize: '14px', color: '#404846' }}>Mi Cuenta</Link></li>
              <li><Link to="/cuenta" style={{ fontSize: '14px', color: '#404846' }}>Mis Pedidos</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(192,200,196,0.3)', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#404846' }}>© 2026 Mister Holistic. Cultivando tranquilidad.</p>
        </div>
      </div>
    </footer>
  );
};
