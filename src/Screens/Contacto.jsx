import React, { useState } from 'react';

export const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: 'Consulta General',
    mensaje: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    // Simular el envío de consulta
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ nombre: '', email: '', asunto: 'Consulta General', mensaje: '' });
      alert('¡Consulta enviada con éxito! Nos comunicaremos a la brevedad.');
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-width-container" style={{ padding: '64px 32px', minHeight: '100vh' }}>
      {/* Header */}
      <section style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
        <h1 className="text-display-lg" style={{ marginBottom: '16px' }}>Consultas & Conexión</h1>
        <p className="text-body-lg">
          Estamos aquí para acompañar tu camino hacia el bienestar. Si tienes dudas sobre nuestros rituales, productos o compras mayoristas, contáctanos.
        </p>
      </section>

      {/* Grid Bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '64px' }}>
        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card Visítanos */}
          <div style={{ backgroundColor: '#f5f3f3', padding: '32px', borderRadius: '16px', border: '1px solid rgba(192,200,196,0.3)' }}>
            <h2 className="text-headline-md" style={{ marginBottom: '20px' }}>Visítanos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#0c3b32', marginTop: '2px' }}>location_on</span>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Showroom de Mister Holistic</p>
                  <p style={{ color: '#404846' }}>Chacabuco 489</p>
                  <p style={{ color: '#717976', fontSize: '13px' }}>San Fernando del Valle de Catamarca, Argentina</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#0c3b32', marginTop: '2px' }}>call</span>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Teléfono</p>
                  <p style={{ color: '#404846' }}>+54 383 4359155</p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div style={{ backgroundColor: '#0c3b32', color: '#ffffff', padding: '32px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            <h2 className="text-headline-md" style={{ color: '#ffffff', marginBottom: '16px' }}>Respuesta Inmediata</h2>
            <p style={{ color: '#beecde', marginBottom: '24px', fontSize: '15px' }}>
              ¿Buscas asesoramiento personalizado de stock o catálogos específicos? Escríbenos directamente por WhatsApp.
            </p>
            <a 
              href="https://wa.me/543834359155?text=Hola%20Mister%20Holistic!%20Quisiera%20hacer%20una%20consulta%20sobre%20los%20productos." 
              target="_blank" 
              rel="noreferrer"
              className="btn-primary" 
              style={{ backgroundColor: '#ffffff', color: '#0c3b32', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="material-symbols-outlined">chat</span>
              Enviar WhatsApp
            </a>
          </div>

          {/* Map Image */}
          <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600" 
              alt="Catamarca Map" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

        </div>

        {/* Form Column */}
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #efeded', boxShadow: '0 4px 20px rgba(12,59,50,0.03)' }}>
          <h2 className="text-headline-lg" style={{ marginBottom: '24px' }}>Déjanos un mensaje</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Nombre Completo *</label>
              <input 
                type="text" 
                name="nombre" 
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre" 
                className="form-input" 
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@ejemplo.com" 
                className="form-input" 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Asunto</label>
              <select 
                name="asunto"
                value={formData.asunto}
                onChange={handleInputChange}
                className="form-input"
                style={{ appearance: 'none', backgroundImage: 'linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Pedidos Mayoristas">Pedidos Mayoristas</option>
                <option value="Estado de Envío">Estado de Envío</option>
                <option value="Colaboraciones">Colaboraciones</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mensaje *</label>
              <textarea 
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                rows="5" 
                placeholder="¿En qué podemos acompañarte hoy?" 
                className="form-input" 
                required
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-rounded-full"
              style={{ width: 'fit-content', marginTop: '12px' }}
              disabled={submitted}
            >
              {submitted ? 'Enviando...' : 'Enviar Consulta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
