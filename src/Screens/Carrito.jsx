import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../Hooks/useCart';
import { useAuth } from '../Hooks/useAuth';

export const Carrito = () => {
  const { 
    cartItems, 
    priceTier, 
    togglePriceTier, 
    updateQuantity, 
    removeFromCart, 
    getSubtotal, 
    getShippingCost, 
    getTotal, 
    submitOrder,
    orderSubmitting 
  } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const discountAmount = subtotal * (discountPercent / 100);
  const finalTotal = subtotal + shipping - discountAmount;

  // Envio gratis a partir de $25000
  const freeShippingThreshold = 25000;
  const leftForFreeShipping = freeShippingThreshold - subtotal;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'HOLA2026') {
      setDiscountPercent(10);
      setCouponMessage('¡Cupón HOLA2026 aplicado! 10% de descuento.');
    } else {
      setCouponMessage('Cupón inválido.');
      setDiscountPercent(0);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Por favor, inicia sesión para poder finalizar tu solicitud de presupuesto.');
      navigate('/cuenta');
      return;
    }

    try {
      const orderId = await submitOrder(user, token);
      alert(`¡Presupuesto #${orderId} registrado con éxito! Recibirás un correo electrónico de confirmación.`);
      navigate('/cuenta');
    } catch (err) {
      alert(`Error al registrar el presupuesto: ${err.message}`);
    }
  };

  return (
    <div className="max-width-container" style={{ padding: '64px 32px', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-display-lg" style={{ marginBottom: '8px' }}>Tu Carrito</h1>
        <p className="text-body-lg">Revisa tus selecciones antes de continuar tu ritual de compra.</p>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#695d43', marginBottom: '16px' }}>shopping_basket</span>
          <p style={{ fontSize: '18px', color: '#404846', marginBottom: '24px' }}>Tu carrito de compras está vacío</p>
          <Link to="/tienda" className="btn-primary">Volver a la Tienda</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="grid-cols-3">
          {/* Listado de Productos */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Envío Gratis Banner */}
            {leftForFreeShipping > 0 ? (
              <div style={{ backgroundColor: '#f2e1c0', color: '#706349', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span className="material-symbols-outlined">local_shipping</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  ¡Estás a <strong>${leftForFreeShipping.toFixed(2)}</strong> de obtener envío gratis!
                </span>
              </div>
            ) : (
              <div style={{ backgroundColor: '#beecde', color: '#00201a', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span className="material-symbols-outlined">local_shipping</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  ¡Felicidades! Tienes envío gratis en esta orden.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => {
                const price = priceTier === 'mayorista' ? item.precio_mayorista : item.precio_minorista;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: '20px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #efeded', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#efeded', flexShrink: 0 }}>
                      <img 
                        src={item.imagen || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=256'} 
                        alt={item.nombre} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontFamily: 'Newsreader', fontSize: '22px', color: '#0c3b32', marginBottom: '4px' }}>{item.nombre}</h3>
                      <p style={{ fontSize: '14px', color: '#717976' }}>Código Manual: #{item.id}</p>
                      <span className="badge badge-pending" style={{ fontSize: '10px', marginTop: '6px' }}>
                        Tarifa {priceTier}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #c0c8c4', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#fbf9f8' }}>
                        <button 
                          style={{ fontWeight: 'bold' }} 
                          onClick={() => updateQuantity(item.id, item.cantidad - 1, item.stock)}
                        >-</button>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                        <button 
                          style={{ fontWeight: 'bold' }} 
                          onClick={() => updateQuantity(item.id, item.cantidad + 1, item.stock)}
                        >+</button>
                      </div>
                      <span style={{ fontSize: '18px', fontFamily: 'Newsreader', fontWeight: 'bold', color: '#0c3b32' }}>
                        ${(price * item.cantidad).toFixed(2)}
                      </span>
                      <button 
                        style={{ color: '#ba1a1a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold' }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link to="/tienda" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0c3b32', fontWeight: 'bold' }}>
                <span className="material-symbols-outlined">arrow_back</span>
                Continuar comprando
              </Link>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ backgroundColor: '#f5f3f3', padding: '24px', borderRadius: '12px', position: 'sticky', top: '100px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '20px', fontFamily: 'Newsreader', borderBottom: '1px solid #c0c8c4', paddingBottom: '8px', marginBottom: '20px' }}>Resumen del Pedido</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#404846' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#404846' }}>Envío Estimado</span>
                  <span style={{ fontWeight: '600' }}>
                    {shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ba1a1a' }}>
                    <span>Descuento (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Cupón */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#404846', marginBottom: '6px' }}>Código de Descuento</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Ej. HOLA2026" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flexGrow: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c0c8c4', fontSize: '14px' }}
                  />
                  <button 
                    className="btn-primary" 
                    style={{ padding: '10px 16px', fontSize: '13px' }}
                    onClick={handleApplyCoupon}
                  >
                    Aplicar
                  </button>
                </div>
                {couponMessage && (
                  <p style={{ fontSize: '12px', marginTop: '6px', color: discountPercent > 0 ? '#0c3b32' : '#ba1a1a', fontWeight: '500' }}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Total final */}
              <div style={{ borderTop: '2px solid rgba(12,59,50,0.1)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '18px', fontFamily: 'Newsreader', fontWeight: 'bold' }}>Total Estimado:</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '26px', fontFamily: 'Newsreader', fontWeight: 'bold', color: '#0c3b32', display: 'block', lineHeight: '1' }}>
                      ${finalTotal.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#717976' }}>IVA incluido (presupuesto)</span>
                  </div>
                </div>
              </div>

              {/* Alternar precio de tarifa desde resumen */}
              <div className="pricing-toggle-container" style={{ width: '100%', marginBottom: '20px' }}>
                <div className={`pricing-toggle-slider ${priceTier === 'mayorista' ? 'wholesale' : ''}`} style={{ width: 'calc(50% - 4px)' }}></div>
                <button 
                  className={`pricing-toggle-btn ${priceTier === 'minorista' ? 'active' : ''}`}
                  style={{ flexGrow: 1, textAlign: 'center' }}
                  onClick={() => togglePriceTier('minorista')}
                >
                  Minorista
                </button>
                <button 
                  className={`pricing-toggle-btn ${priceTier === 'mayorista' ? 'active' : ''}`}
                  style={{ flexGrow: 1, textAlign: 'center' }}
                  onClick={() => togglePriceTier('mayorista')}
                >
                  Mayorista
                </button>
              </div>

              <button 
                className="btn-rounded-full" 
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                onClick={handleCheckout}
                disabled={orderSubmitting}
              >
                {orderSubmitting ? 'Procesando presupuesto...' : 'Solicitar Presupuesto'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: '0.6', marginTop: '16px', fontSize: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                <span>Validación manual de stock</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
