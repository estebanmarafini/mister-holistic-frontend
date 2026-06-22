import React, { useEffect, useState } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { supabase } from '../Config/supabase';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

export const AdminDashboard = () => {
  const { user, token } = useAuth();

  // Pestañas: 'pedidos' o 'catalogo'
  const [activeTab, setActiveTab] = useState('pedidos');

  // Estados de Pedidos
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingItems, setEditingItems] = useState({}); // { [detId]: newQty }

  // Estados de Catálogo
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición

  useEffect(() => {
    if (user?.rol === 'admin') {
      fetchOrders();
      fetchProducts();
    }
  }, [user]);

  // --- OBTENER DATOS DE SUPABASE ---
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          fecha_pedido,
          estado,
          clientes (
            id,
            nombre,
            apellido,
            dni,
            telefono,
            domicilio,
            email
          ),
          detalles_pedido (
            id,
            cantidad,
            producto_id,
            productos (
              id,
              nombre,
              precio_minorista,
              precio_mayorista,
              stock
            )
          )
        `)
        .order('fecha_pedido', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error al obtener pedidos para admin:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error al obtener catálogo de productos:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // --- GESTIÓN DE PEDIDOS ---

  // Guardar cantidades editadas temporalmente
  const handleQtyChange = (detId, qty) => {
    const val = parseInt(qty);
    if (val < 0) return;
    setEditingItems(prev => ({ ...prev, [detId]: val }));
  };

  // Procesar Aprobación, Rechazo o Modificación del pedido
  const processOrderState = async (order, actionType) => {
    if (!token) return;

    try {
      let finalStatus = '';
      let missingItems = [];
      let finalItems = [];

      // Copiar ítems actuales para manipularlos
      const dbDetails = order.detalles_pedido;

      if (actionType === 'aprobado') {
        finalStatus = 'Aprobado';
        finalItems = dbDetails.map(d => ({
          nombre: d.productos.nombre,
          cantidad: d.cantidad,
          precio_minorista: d.productos.precio_minorista,
          precio_mayorista: d.productos.precio_mayorista,
          precio_aplicado: d.productos.precio_minorista // Por defecto minorista
        }));
      }
      else if (actionType === 'rechazado') {
        finalStatus = 'Rechazado';

        // Devolver stock a la base de datos (reposición)
        for (const detail of dbDetails) {
          const prod = detail.productos;
          const { error: stockErr } = await supabase
            .from('productos')
            .update({ stock: prod.stock + detail.cantidad })
            .eq('id', prod.id);

          if (stockErr) throw stockErr;
        }

        finalItems = dbDetails.map(d => ({
          nombre: d.productos.nombre,
          cantidad: d.cantidad,
          precio_minorista: d.productos.precio_minorista,
          precio_mayorista: d.productos.precio_mayorista,
          precio_aplicado: d.productos.precio_minorista
        }));
      }
      else if (actionType === 'modificado') {
        finalStatus = 'Modificado';

        // Aplicar los cambios de cantidades y recalcular el stock
        for (const detail of dbDetails) {
          const newQty = editingItems[detail.id] !== undefined ? editingItems[detail.id] : detail.cantidad;
          const oldQty = detail.cantidad;
          const difference = newQty - oldQty;

          const prod = detail.productos;

          // Si el admin redujo o aumentó la cantidad, ajustamos el stock disponible en consecuencia:
          // stock = stock - diferencia
          const adjustedStock = Math.max(0, prod.stock - difference);

          // Actualizar el detalle en Supabase
          if (newQty === 0) {
            // Eliminar detalle si se bajó a 0
            const { error: delErr } = await supabase
              .from('detalles_pedido')
              .delete()
              .eq('id', detail.id);
            if (delErr) throw delErr;
          } else {
            const { error: updDetailErr } = await supabase
              .from('detalles_pedido')
              .update({ cantidad: newQty })
              .eq('id', detail.id);
            if (updDetailErr) throw updDetailErr;
          }

          // Actualizar stock del producto
          const { error: stockErr } = await supabase
            .from('productos')
            .update({ stock: adjustedStock })
            .eq('id', prod.id);

          if (stockErr) throw stockErr;

          // Si hubo faltantes
          if (newQty < oldQty) {
            missingItems.push({
              nombre: prod.nombre,
              faltante: oldQty - newQty
            });
          }

          if (newQty > 0) {
            finalItems.push({
              nombre: prod.nombre,
              cantidad: newQty,
              precio_minorista: prod.precio_minorista,
              precio_mayorista: prod.precio_mayorista,
              precio_aplicado: prod.precio_minorista
            });
          }
        }
      }

      // 1. Actualizar el estado del pedido en Supabase
      const { error: statusUpdateErr } = await supabase
        .from('pedidos')
        .update({ estado: finalStatus })
        .eq('id', order.id);

      if (statusUpdateErr) throw statusUpdateErr;

      // 2. Disparar API de correo electrónico en Backend
      // Cálculo de totales final
      const subtotal = finalItems.reduce((acc, item) => acc + (item.precio_aplicado * item.cantidad), 0);
      const totalsObj = {
        subtotal,
        shipping: 0,
        total: subtotal
      };

      const emailPayload = {
        email: order.clientes.email || `${order.clientes.nombre.toLowerCase()}@misterholistic.com`, // email real o ficticio
        clientName: `${order.clientes.nombre} ${order.clientes.apellido}`,
        orderId: order.id,
        status: finalStatus,
        items: finalItems,
        totals: totalsObj,
        missingItems
      };

      // Si tenemos guardado el email en la sesión simulada o BD local, lo enviamos
      // Normalmente el DNI es la llave. Buscamos si hay email registrado en localStorage
      const registeredEmail = localStorage.getItem('mh_registered_email');
      if (registeredEmail) {
        emailPayload.email = registeredEmail;
      }

      const res = await fetch(`${API_URL}/email/order-status-updated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailPayload)
      });

      if (!res.ok) {
        console.warn('Pedido actualizado en Supabase pero falló el envío del correo de estado.');
      }

      alert(`Pedido #${order.id} actualizado a "${finalStatus}" y notificado por correo.`);
      setSelectedOrder(null);
      setEditingItems({});
      fetchOrders();
    } catch (err) {
      alert(`Error al procesar el estado del pedido: ${err.message}`);
      console.error(err);
    }
  };

  // --- GESTIÓN DE CATÁLOGO (CRUD) ---
  const handleProductEditClick = (product) => {
    setEditingProduct({ ...product });
  };

  const handleProductSave = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: editingProduct.nombre,
          precio_minorista: parseFloat(editingProduct.precio_minorista),
          precio_mayorista: parseFloat(editingProduct.precio_mayorista),
          stock: parseInt(editingProduct.stock),
          disponibilidad: editingProduct.disponibilidad,
          imagen: editingProduct.imagen
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      alert(`Producto #${editingProduct.id} actualizado exitosamente.`);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(`Error al guardar cambios: ${err.message}`);
    }
  };

  if (user?.rol !== 'admin') {
    return (
      <div className="max-width-container" style={{ padding: '64px', textAlign: 'center', color: '#ba1a1a' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>lock</span>
        <h2>Acceso Denegado</h2>
        <p>Se requieren credenciales de Administrador para acceder a este portal.</p>
      </div>
    );
  }

  return (
    <div className="max-width-container" style={{ padding: '64px 32px', minHeight: '100vh' }}>

      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-display-lg" style={{ color: '#0c3b32', marginBottom: '8px' }}>Portal de Administración</h1>
          <p className="text-body-lg">Gestiona pedidos de presupuesto, valida stock y controla el catálogo general.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={`btn-outline ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
            style={activeTab === 'pedidos' ? { backgroundColor: '#0c3b32', color: '#ffffff' } : {}}
          >
            Pedidos Presupuesto
          </button>
          <button
            className={`btn-outline ${activeTab === 'catalogo' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalogo')}
            style={activeTab === 'catalogo' ? { backgroundColor: '#0c3b32', color: '#ffffff' } : {}}
          >
            Catálogo Productos
          </button>
        </div>
      </section>

      {/* --- PESTAÑA: PEDIDOS DE PRESUPUESTO --- */}
      {activeTab === 'pedidos' && (
        <section>
          {ordersLoading ? (
            <p style={{ color: '#717976' }}>Cargando solicitudes de clientes...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: '#717976' }}>No hay solicitudes de presupuesto registradas.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="grid-cols-3">
              {/* Listado */}
              <div style={{ gridColumn: 'span 2' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      let badgeClass = 'badge-pending';
                      if (order.estado === 'Aprobado') badgeClass = 'badge-approved';
                      if (order.estado === 'Rechazado') badgeClass = 'badge-rejected';
                      if (order.estado === 'Modificado') badgeClass = 'badge-modified';

                      return (
                        <tr key={order.id} style={{ cursor: 'pointer', backgroundColor: selectedOrder?.id === order.id ? '#eae8e7' : 'transparent' }} onClick={() => { setSelectedOrder(order); setEditingItems({}); }}>
                          <td style={{ fontWeight: 'bold' }}>#{order.id}</td>
                          <td>{order.clientes?.nombre} {order.clientes?.apellido}</td>
                          <td>{new Date(order.fecha_pedido).toLocaleDateString('es-ES')}</td>
                          <td>
                            <span className={`badge ${badgeClass}`}>{order.estado}</span>
                          </td>
                          <td>
                            <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }}>
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Detalle y Operaciones del Pedido Seleccionado */}
              <div style={{ gridColumn: 'span 1' }}>
                {selectedOrder ? (
                  <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #efeded', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontFamily: 'Newsreader', fontSize: '22px', borderBottom: '1px solid #c0c8c4', paddingBottom: '8px', marginBottom: '16px' }}>
                      Detalle Pedido #{selectedOrder.id}
                    </h3>

                    <div style={{ fontSize: '13px', color: '#404846', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                      <p><strong>Cliente:</strong> {selectedOrder.clientes?.nombre} {selectedOrder.clientes?.apellido}</p>
                      <p><strong>DNI:</strong> {selectedOrder.clientes?.dni}</p>
                      <p><strong>Teléfono:</strong> {selectedOrder.clientes?.telefono}</p>
                      <p><strong>Domicilio:</strong> {selectedOrder.clientes?.domicilio}</p>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0c3b32', marginBottom: '12px' }}>Productos Solicitados</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {selectedOrder.detalles_pedido?.map((detail) => {
                        const prod = detail.productos;
                        const currentVal = editingItems[detail.id] !== undefined ? editingItems[detail.id] : detail.cantidad;

                        return (
                          <div key={detail.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f3f3', paddingBottom: '8px' }}>
                            <div style={{ flexGrow: 1, marginRight: '16px' }}>
                              <p style={{ fontWeight: '500', fontSize: '14px' }}>{prod?.nombre}</p>
                              <p style={{ fontSize: '11px', color: '#717976' }}>
                                Stock Disp: <strong style={{ color: prod?.stock <= 3 ? '#ba1a1a' : '#0c3b32' }}>{prod?.stock} u.</strong>
                              </p>
                            </div>

                            {selectedOrder.estado === 'Pendiente de revisión' ? (
                              <input
                                type="number"
                                value={currentVal}
                                onChange={(e) => handleQtyChange(detail.id, e.target.value)}
                                style={{ width: '60px', padding: '6px', border: '1px solid #c0c8c4', borderRadius: '4px', textAlign: 'center' }}
                              />
                            ) : (
                              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>x{detail.cantidad}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {selectedOrder.estado === 'Pendiente de revisión' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                          className="btn-primary"
                          style={{ width: '100%', backgroundColor: '#beecde', color: '#00201a', border: 'none' }}
                          onClick={() => processOrderState(selectedOrder, 'aprobado')}
                        >
                          Aprobar Pedido
                        </button>
                        <button
                          className="btn-primary"
                          style={{ width: '100%', backgroundColor: '#d4c4ab', color: '#231a0a', border: 'none' }}
                          onClick={() => processOrderState(selectedOrder, 'modificado')}
                        >
                          Aplicar Modificaciones
                        </button>
                        <button
                          className="btn-primary"
                          style={{ width: '100%', backgroundColor: '#ffdad6', color: '#93000a', border: 'none' }}
                          onClick={() => processOrderState(selectedOrder, 'rechazado')}
                        >
                          Rechazar Pedido
                        </button>
                      </div>
                    )}

                    {selectedOrder.estado !== 'Pendiente de revisión' && (
                      <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #c0c8c4', backgroundColor: '#f5f3f3', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#404846' }}>
                        Presupuesto {selectedOrder.estado}
                      </div>
                    )}

                  </div>
                ) : (
                  <div style={{ padding: '32px', backgroundColor: '#f5f3f3', borderRadius: '12px', textAlign: 'center', color: '#717976', border: '1px dashed #c0c8c4' }}>
                    Selecciona un presupuesto del listado para gestionarlo.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- PESTAÑA: CATÁLOGO DE PRODUCTOS (CRUD DIRECTO A SUPABASE) --- */}
      {activeTab === 'catalogo' && (
        <section>
          {productsLoading ? (
            <p style={{ color: '#717976' }}>Cargando catálogo del almacén...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="grid-cols-3">
              {/* Tabla de Productos */}
              <div style={{ gridColumn: 'span 2' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>ID Manual</th>
                      <th>Producto</th>
                      <th>P. Minorista</th>
                      <th>P. Mayorista</th>
                      <th>Stock</th>
                      <th>Disp.</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td style={{ fontWeight: 'bold' }}>#{prod.id}</td>
                        <td>{prod.nombre}</td>
                        <td>${Number(prod.precio_minorista).toFixed(2)}</td>
                        <td>${Number(prod.precio_mayorista).toFixed(2)}</td>
                        <td style={{ fontWeight: 'bold', color: prod.stock <= 3 ? '#ba1a1a' : 'inherit' }}>{prod.stock} u.</td>
                        <td>
                          <span className={`badge ${prod.disponibilidad ? 'badge-approved' : 'badge-rejected'}`}>
                            {prod.disponibilidad ? 'Activo' : 'Pausado'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleProductEditClick(prod)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Formulario de Edición Directa */}
              <div style={{ gridColumn: 'span 1' }}>
                {editingProduct ? (
                  <form onSubmit={handleProductSave} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #efeded', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontFamily: 'Newsreader', fontSize: '22px', borderBottom: '1px solid #c0c8c4', paddingBottom: '8px', marginBottom: '20px' }}>
                      Editar Producto #{editingProduct.id}
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Nombre del Producto</label>
                      <input
                        type="text"
                        value={editingProduct.nombre}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, nombre: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Precio Minorista ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.precio_minorista}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, precio_minorista: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Precio Mayorista ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.precio_mayorista}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, precio_mayorista: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock en Depósito</label>
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">URL de Imagen</label>
                      <input
                        type="text"
                        value={editingProduct.imagen || ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, imagen: e.target.value }))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', margin: '20px 0' }}>
                      <input
                        type="checkbox"
                        id="disponibilidad-chk"
                        checked={editingProduct.disponibilidad}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, disponibilidad: e.target.checked }))}
                        style={{ width: '18px', height: '18px', accentColor: '#0c3b32' }}
                      />
                      <label htmlFor="disponibilidad-chk" style={{ fontSize: '14px', fontWeight: '600', color: '#0c3b32' }}>Disponibilidad en Tienda</label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: '32px', backgroundColor: '#f5f3f3', borderRadius: '12px', textAlign: 'center', color: '#717976', border: '1px dashed #c0c8c4' }}>
                    Selecciona un producto del catálogo para editar sus detalles.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
};
