import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { useCart } from '../Hooks/useCart';
import { FloatingWhatsApp } from 'react-floating-whatsapp';


export const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, setCartOpen, cartOpen } = useCart();
  const navigate = useNavigate();

  const totalQty = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <header className="top-app-bar">
      <div className="max-width-container header-container">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
            <img src="/Logo mister holistic.png" alt="Mister Holistic Logo" style={{ height: '130px', width: 'auto', objectFit: 'contain' }} />
          </h2>
        </Link>
        <nav className="nav-links">
          <Link to="/tienda" className="nav-item">Tienda</Link>
          <Link to="/tienda?categoria=Sahumerios" className="nav-item">Sahumerios</Link>
          <Link to="/tienda?categoria=Saphirus" className="nav-item">Saphirus</Link>
          <Link to="/tienda?categoria=Tarot" className="nav-item">Tarot</Link>
          <Link to="/tienda?categoria=Holística" className="nav-item">Holística</Link>
          <Link to="/contacto" className="nav-item">Contacto</Link>
          {user?.rol === 'admin' && (
            <Link to="/admin" className="nav-item" style={{ color: '#695d43', fontWeight: 'bold' }}>Dashboard Admin</Link>
          )}
        </nav>
        <div className="header-actions">
          <Link to="/cuenta" className="action-btn" title="Mi Cuenta">
            <span className="material-symbols-outlined">person</span>
            {user && <span style={{ fontSize: '10px', marginLeft: '4px', fontWeight: 'bold' }}>{user.nombre}</span>}
          </Link>
          <button
            className="action-btn"
            onClick={() => setCartOpen(!cartOpen)}
            title="Carrito de compras"
          >
            <span className="material-symbols-outlined">shopping_basket</span>
            {totalQty > 0 && <span className="badge-count">{totalQty}</span>}
          </button>
          {user && (
            <button
              className="action-btn"
              onClick={() => { logout(); navigate('/cuenta'); }}
              title="Cerrar Sesión"
              style={{ color: '#ba1a1a' }}
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          )}
          <FloatingWhatsApp
            phoneNumber="5493834359155"
            accountName="Mister Holistic"
            statusMessage="Available"
            chatMessage="Hola, en que podemos ayudarte?"
            avatar="/Logo mister holistic.png"
            allowClickAway
            allowEsc
          />
        </div>
      </div>
      
      {/* Ticker Banner (Marquee) */}
      <div className="ticker-banner">
        <div className="ticker-track">
          {Array(6).fill("Compra mínima por mayor $40.000,00").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
          {Array(6).fill("Compra mínima por mayor $40.000,00").map((text, i) => (
            <span key={`dup-${i}`}>{text}</span>
          ))}
        </div>
      </div>
    </header>
  );
};


