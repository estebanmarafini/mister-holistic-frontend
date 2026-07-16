import React, { useState, useEffect } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { supabase } from '../Config/supabase';
import { formatPrice } from '../Config/utils';


export const MiCuenta = () => {
  const {
    user,
    token,
    loading: authLoading,
    loginClient,
    sendOTP,
    registerClient,
    recoverPassword
  } = useAuth();

  // Estados de vista
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Estado para órdenes cargadas
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Estados de los formularios
  const [loginForm, setLoginForm] = useState({ dni: '', contrasena: '' });
  const [recoveryForm, setRecoveryForm] = useState({ dni: '', email: '' });
  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    contrasena: '',
    email: '',
    otp: ''
  });

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar órdenes del cliente una vez logueado
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setOrdersLoading(true);
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            id,
            fecha_pedido,
            estado,
            detalles_pedido (
              id,
              cantidad,
              productos (
                id,
                nombre,
                precio_minorista,
                precio_mayorista
              )
            )
          `)
          .eq('cliente_id', user.id)
          .order('fecha_pedido', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error al cargar órdenes de cliente:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Manejadores de Formularios
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.dni || !loginForm.contrasena) {
      setFormError('DNI y contraseña son requeridos.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await loginClient(loginForm.dni, loginForm.contrasena);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOTPClick = async () => {
    const { email, nombre, apellido, dni, telefono, contrasena } = registerForm;
    if (!email || !nombre || !apellido || !dni || !telefono || !contrasena) {
      setFormError('Por favor completa todos los campos del registro antes de solicitar el código.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const msg = await sendOTP(email);
      setOtpSent(true);
      setFormSuccess(msg);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { nombre, apellido, dni, telefono, contrasena, email, otp } = registerForm;

    if (!otp) {
      setFormError('Por favor ingresa el código OTP que enviamos a tu email.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      // Guardar localmente el email registrado para enviar confirmaciones futuras
      localStorage.setItem('mh_registered_email', email);

      await registerClient({
        nombre,
        apellido,
        dni: parseInt(dni),
        telefono: parseInt(telefono),
        contrasena,
        email,
        otp
      });

      setFormSuccess('¡Registro completado e inicio de sesión exitoso!');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryForm.dni || !recoveryForm.email) {
      setFormError('DNI y correo electrónico son requeridos.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const msg = await recoverPassword(recoveryForm.dni, recoveryForm.email);
      setFormSuccess(msg);
      setRecoveryForm({ dni: '', email: '' });
      setTimeout(() => setIsRecoveryMode(false), 4000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '64px' }}>Verificando portal holístico...</div>;
  }

  return (
    <div className="max-width-container" style={{ padding: '64px 32px', minHeight: '100vh' }}>

      {/* Vista de Usuario NO Logueado */}
      {!user ? (
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #efeded', boxShadow: '0 4px 20px rgba(12,59,50,0.04)' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="text-headline-lg" style={{ marginBottom: '8px' }}>
              {isRecoveryMode ? 'Recuperar Contraseña' : isRegisterMode ? 'Crear Cuenta' : 'Mi Cuenta'}
            </h1>
            <p style={{ color: '#404846', fontSize: '14px' }}>
              {isRecoveryMode
                ? 'Introduce tus datos para enviarte una contraseña provisoria.'
                : isRegisterMode
                  ? 'Únete a Mister Holistic para guardar tus presupuestos.'
                  : 'Bienvenido de nuevo a tu portal consciente.'
              }
            </p>
          </div>

          {formError && <div className="alert alert-error">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          {/* Formulario 1: Recuperación de Contraseña */}
          {isRecoveryMode ? (
            <form onSubmit={handleRecoverySubmit}>
              <div className="form-group">
                <label className="form-label">DNI del Cliente</label>
                <input
                  type="number"
                  value={recoveryForm.dni}
                  onChange={(e) => setRecoveryForm(prev => ({ ...prev, dni: e.target.value }))}
                  placeholder="Ej. 34567890"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico de Recepción</label>
                <input
                  type="email"
                  value={recoveryForm.email}
                  onChange={(e) => setRecoveryForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={submitting}>
                {submitting ? 'Enviando email...' : 'Enviar Contraseña Provisoria'}
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => { setIsRecoveryMode(false); setFormError(null); }}
              >
                Volver a Iniciar Sesión
              </button>
            </form>
          ) : isRegisterMode ? (
            /* Formulario 2: Registro de Cliente con OTP */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    value={registerForm.nombre}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Juan"
                    className="form-input"
                    required
                    disabled={otpSent}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    value={registerForm.apellido}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, apellido: e.target.value }))}
                    placeholder="Pérez"
                    className="form-input"
                    required
                    disabled={otpSent}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DNI (Documento)</label>
                <input
                  type="number"
                  value={registerForm.dni}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, dni: e.target.value }))}
                  placeholder="34567890"
                  className="form-input"
                  required
                  disabled={otpSent}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="number"
                  value={registerForm.telefono}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="3834123456"
                  className="form-input"
                  required
                  disabled={otpSent}
                />
              </div>


              <div className="form-group">
                <label className="form-label">Correo Electrónico (Para Validación)</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="juanperez@gmail.com"
                  className="form-input"
                  required
                  disabled={otpSent}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  value={registerForm.contrasena}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, contrasena: e.target.value }))}
                  placeholder="Contraseña segura"
                  className="form-input"
                  required
                  disabled={otpSent}
                />
              </div>

              {otpSent ? (
                <div style={{ border: '1px solid #c0c8c4', padding: '16px', borderRadius: '8px', backgroundColor: '#f5f3f3', marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#0c3b32', fontWeight: 'bold' }}>Introduce el Código OTP de 6 dígitos</label>
                    <input
                      type="text"
                      value={registerForm.otp}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, otp: e.target.value }))}
                      placeholder="Ej. 123456"
                      className="form-input"
                      style={{ fontSize: '20px', letterSpacing: '4px', textAlign: 'center', backgroundColor: '#ffffff' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
                    {submitting ? 'Verificando...' : 'Completar Registro'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleSendOTPClick}
                  disabled={submitting}
                >
                  {submitting ? 'Solicitando código...' : 'Verificar Correo Electrónico'}
                </button>
              )}

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#404846' }}>
                ¿Ya tienes una cuenta?{' '}
                <button type="button" style={{ color: '#0c3b32', fontWeight: 'bold', textDecoration: 'underline' }} onClick={() => { setIsRegisterMode(false); setFormError(null); setFormSuccess(null); }}>
                  Inicia Sesión
                </button>
              </p>
            </form>
          ) : (
            /* Formulario 3: Login de Cliente Estándar */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">DNI del Cliente</label>
                <input
                  type="number"
                  value={loginForm.dni}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, dni: e.target.value }))}
                  placeholder="34567890"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Contraseña</label>
                  <button
                    type="button"
                    style={{ fontSize: '12px', color: '#695d43', textDecoration: 'underline' }}
                    onClick={() => { setIsRecoveryMode(true); setFormError(null); setFormSuccess(null); }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginForm.contrasena}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, contrasena: e.target.value }))}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={submitting}>
                {submitting ? 'Iniciando sesión...' : 'Ingresar'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#404846' }}>
                ¿No tienes cuenta?{' '}
                <button type="button" style={{ color: '#0c3b32', fontWeight: 'bold', textDecoration: 'underline' }} onClick={() => { setIsRegisterMode(true); setFormError(null); setFormSuccess(null); }}>
                  Regístrate gratis
                </button>
              </p>
            </form>
          )}

        </div>
      ) : (
        /* Vista de Usuario LOGUEADO */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
            <div>
              <h1 className="text-display-lg" style={{ color: '#0c3b32', marginBottom: '8px' }}>Mi Cuenta</h1>
              <p className="text-body-lg">Bienvenido de nuevo a tu espacio de tranquilidad, <strong>{user.nombre}</strong>.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="badge badge-approved" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Tarifa: {user.rol === 'admin' ? 'Administrador' : 'Mayorista'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {/* Sidebar / Info Perfil */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Resumen Perfil */}
              <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #efeded', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#beecde', color: '#0c3b32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                    {user.nombre[0].toUpperCase()}{user.apellido[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-headline-md" style={{ color: '#0c3b32', marginBottom: '4px' }}>{user.nombre} {user.apellido}</h3>
                    <p style={{ fontSize: '13px', color: '#717976' }}>DNI: {user.dni}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #efeded', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#717976' }}>Estatus de Cliente</span>
                    <span style={{ fontWeight: 'bold', color: '#0c3b32' }}>{user.rol === 'admin' ? 'Administrador' : 'Cliente Mayorista'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#717976' }}>Teléfono</span>
                    <span style={{ fontWeight: '500' }}>{user.telefono}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#717976' }}>Miembro desde</span>
                    <span style={{ fontWeight: '500' }}>{new Date(user.fecha_registro || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Panel Principal: Historial de Pedidos */}
            <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #efeded', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 className="text-headline-lg" style={{ marginBottom: '24px' }}>Pedidos de Presupuesto Recientes</h3>

              {ordersLoading ? (
                <p style={{ color: '#717976' }}>Cargando tus solicitudes de presupuesto...</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#717976' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px' }}>pending_actions</span>
                  <p>Aún no has solicitado ningún presupuesto.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map((order) => {
                    // Calcular total del pedido
                    const itemsCount = order.detalles_pedido?.reduce((acc, d) => acc + d.cantidad, 0) || 0;
                    const subtotal = order.detalles_pedido?.reduce((acc, d) => {
                      const prod = d.productos;
                      if (!prod) return acc;
                      // Asumimos minorista si el usuario es normal
                      const price = user.rol === 'admin' ? prod.precio_minorista : prod.precio_minorista;
                      return acc + (price * d.cantidad);
                    }, 0) || 0;

                    // Badge de estado
                    let badgeClass = 'badge-pending';
                    if (order.estado === 'Aprobado') badgeClass = 'badge-approved';
                    if (order.estado === 'Rechazado') badgeClass = 'badge-rejected';
                    if (order.estado === 'Modificado') badgeClass = 'badge-modified';

                    return (
                      <div
                        key={order.id}
                        style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f5f3f3', border: '1px solid #efeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
                      >
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#0c3b32', fontSize: '15px' }}>Presupuesto #{order.id}</p>
                          <p style={{ color: '#717976', fontSize: '13px' }}>
                            {new Date(order.fecha_pedido).toLocaleDateString('es-ES')} • {itemsCount} productos
                          </p>

                          {/* Detalle rápido */}
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#404846' }}>
                            {order.detalles_pedido?.map(d => (
                              <div key={d.id}>• {d.productos?.nombre} (x{d.cantidad})</div>
                            ))}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#0c3b32', fontSize: '16px' }}>
                            Subtotal: {formatPrice(subtotal)}
                          </span>
                          <span className={`badge ${badgeClass}`}>
                            {order.estado}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
