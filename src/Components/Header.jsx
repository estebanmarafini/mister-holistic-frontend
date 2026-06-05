import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { useCart } from '../Hooks/useCart';

export const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, setCartOpen, cartOpen } = useCart();
  const navigate = useNavigate();

  const totalQty = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <header className="top-app-bar">
      <div className="max-width-container header-container">
        <Link to="/" className="logo">
          Mister Holistic
        </Link>
        <nav className="nav-links">
          <Link to="/tienda" className="nav-item">Tienda</Link>
          <Link to="/tienda?categoria=Aromas" className="nav-item">Aromas</Link>
          <Link to="/tienda?categoria=Inciensos" className="nav-item">Inciensos</Link>
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
        </div>
      </div>
    </header>
  );
};
