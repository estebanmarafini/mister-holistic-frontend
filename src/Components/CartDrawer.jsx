import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Hooks/useCart';
import { useAuth } from '../Hooks/useAuth';

export const CartDrawer = () => {
  const { 
    cartItems, 
    cartOpen, 
    setCartOpen, 
    priceTier, 
    removeFromCart, 
    updateQuantity, 
    getSubtotal, 
    getShippingCost, 
    getTotal,
    submitOrder,
    orderSubmitting
  } = useCart();

  const { user, token } = useAuth();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      alert('Por favor, inicia sesión para solicitar tu presupuesto.');
      setCartOpen(false);
      navigate('/cuenta');
      return;
    }

    try {
      const orderId = await submitOrder(user, token);
      alert(`¡Presupuesto #${orderId} enviado con éxito! Recibirás confirmación por correo.`);
      navigate('/cuenta');
    } catch (err) {
      alert(`Error al procesar pedido: ${err.message}`);
    }
  };

  return (
    <div className={`drawer-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 style={{ fontSize: '24px', fontFamily: 'Newsreader', color: '#0c3b32' }}>Tu Carrito</h2>
          <button onClick={() => setCartOpen(false)} style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '64px', color: '#717976' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>shopping_basket</span>
              <p>Tu carrito está vacío</p>
              <button 
                className="btn-outline" 
                onClick={() => setCartOpen(false)}
                style={{ marginTop: '16px' }}
              >
                Volver a la Tienda
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const price = priceTier === 'mayorista' ? item.precio_mayorista : item.precio_minorista;
              return (
                <div key={item.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #efeded', paddingBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#efeded' }}>
                    <img 
                      src={item.imagen || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=256'} 
                      alt={item.nombre} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontFamily: 'Newsreader', fontSize: '18px', color: '#0c3b32', marginBottom: '4px' }}>{item.nombre}</h4>
                    <p style={{ fontSize: '14px', color: '#695d43', fontWeight: 'bold' }}>
                      ${Number(price).toFixed(2)} 
                      <span style={{ fontSize: '11px', color: '#717976', textTransform: 'uppercase', marginLeft: '6px' }}>
                        ({priceTier})
                      </span>
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <button 
                        style={{ border: '1px solid #c0c8c4', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                        onClick={() => updateQuantity(item.id, item.cantidad - 1, item.stock)}
                      >-</button>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.cantidad}</span>
                      <button 
                        style={{ border: '1px solid #c0c8c4', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                        onClick={() => updateQuantity(item.id, item.cantidad + 1, item.stock)}
                      >+</button>
                      <span style={{ fontSize: '11px', color: '#717976', marginLeft: '6px' }}>
                        Stock: {item.stock}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button 
                      style={{ color: '#ba1a1a' }}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#404846' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold', color: '#0c3b32' }}>${getSubtotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#404846' }}>
              <span>Envío estimado:</span>
              <span style={{ fontWeight: 'bold', color: '#0c3b32' }}>
                {getShippingCost() === 0 ? 'GRATIS' : `$${getShippingCost().toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderTop: '2px solid #efeded', paddingTop: '16px' }}>
              <span style={{ fontSize: '18px', fontFamily: 'Newsreader', color: '#0c3b32', fontWeight: 'bold' }}>Total Estimado:</span>
              <span style={{ fontSize: '20px', fontFamily: 'Newsreader', color: '#0c3b32', fontWeight: 'bold' }}>${getTotal().toFixed(2)}</span>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleCheckout}
              disabled={orderSubmitting}
            >
              {orderSubmitting ? 'Procesando...' : 'Solicitar Presupuesto'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            
            <button 
              className="btn-outline" 
              style={{ width: '100%', marginTop: '8px' }}
              onClick={() => { setCartOpen(false); navigate('/carrito'); }}
            >
              Ver Detalle del Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
