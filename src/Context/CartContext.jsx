import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../Config/supabase';

export const CartContext = createContext();

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [priceTier, setPriceTier] = useState('minorista'); // 'minorista' o 'mayorista'
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Cargar carrito guardado en localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('mh_cart');
    const savedTier = localStorage.getItem('mh_price_tier');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    if (savedTier) {
      setPriceTier(savedTier);
    }
  }, []);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('mh_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('mh_price_tier', priceTier);
  }, [priceTier]);

  // Alternar el tipo de tarifa minorista / mayorista
  const togglePriceTier = (tier) => {
    if (tier === 'minorista' || tier === 'mayorista') {
      setPriceTier(tier);
    }
  };

  // Añadir ítem al carrito (valida contra stock actual)
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      const currentQty = existing ? existing.cantidad : 0;
      const newQty = currentQty + quantity;

      // Validar disponibilidad de stock
      if (product.stock !== undefined && newQty > product.stock) {
        alert(`Lo sentimos, no hay suficiente stock disponible. Stock máximo: ${product.stock} unidades.`);
        return prevItems;
      }

      if (existing) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, cantidad: newQty } : item
        );
      } else {
        return [...prevItems, { ...product, cantidad: quantity }];
      }
    });
    setCartOpen(true); // Abrir drawer de carrito
  };

  // Quitar del carrito
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Modificar cantidad en carrito (valida contra stock)
  const updateQuantity = (productId, newQuantity, maxStock) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (maxStock !== undefined && newQuantity > maxStock) {
      alert(`Lo sentimos, no hay suficiente stock. Solo quedan ${maxStock} unidades.`);
      return;
    }

    setCartItems(prev =>
      prev.map(item => (item.id === productId ? { ...item, cantidad: newQuantity } : item))
    );
  };

  // Vaciar carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Totales
  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = priceTier === 'mayorista' ? item.precio_mayorista : item.precio_minorista;
      return acc + (price * item.cantidad);
    }, 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    // Envio gratis a partir de $25000 (o lo que el usuario decida)
    if (subtotal >= 25000 || subtotal === 0) return 0;
    return 1500; // Costo fijo de envío de presupuesto
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  // Enviar presupuesto (Operación de Base de Datos directa + API de Email en Backend)
  const submitOrder = async (user, token) => {
    if (!user || !token) {
      throw new Error('Debes iniciar sesión para finalizar tu pedido de presupuesto.');
    }

    if (cartItems.length === 0) {
      throw new Error('Tu carrito está vacío.');
    }

    setOrderSubmitting(true);
    try {
      // 1. Insertar el Pedido en Supabase
      const { data: newOrder, error: orderError } = await supabase
        .from('pedidos')
        .insert([
          {
            cliente_id: user.id,
            estado: 'Pendiente de revisión'
          }
        ])
        .select()
        .single();

      if (orderError) throw new Error(`Error al crear pedido: ${orderError.message}`);
      const orderId = newOrder.id;

      // 2. Insertar los Detalles e ir actualizando el stock
      for (const item of cartItems) {
        // Registrar detalles_pedido
        const { error: detailError } = await supabase
          .from('detalles_pedido')
          .insert([
            {
              pedido_id: orderId,
              producto_id: item.id,
              cantidad: item.cantidad
            }
          ]);

        if (detailError) throw new Error(`Error en detalles de pedido: ${detailError.message}`);

        // Descontar del stock del producto
        const newStock = Math.max(0, item.stock - item.cantidad);
        const { error: stockError } = await supabase
          .from('productos')
          .update({ stock: newStock })
          .eq('id', item.id);

        if (stockError) throw new Error(`Error al actualizar stock del producto: ${stockError.message}`);
      }

      // 3. Disparar API de correo electrónico en Backend
      const totalsObj = {
        subtotal: getSubtotal(),
        shipping: getShippingCost(),
        total: getTotal()
      };

      const emailPayload = {
        email: user.email || (user.dni ? `${user.nombre.toLowerCase()}@misterholistic.com` : 'cliente@ejemplo.com'),
        clientName: `${user.nombre} ${user.apellido}`,
        orderId: orderId,
        items: cartItems,
        totals: totalsObj,
        isWholesale: priceTier === 'mayorista'
      };

      // Si el email del usuario está guardado en localStorage, lo usamos
      if (user.dni && localStorage.getItem('mh_registered_email')) {
        emailPayload.email = localStorage.getItem('mh_registered_email');
      }

      const res = await fetch(`${API_URL}/email/order-created`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailPayload)
      });

      if (!res.ok) {
        console.warn('El pedido se creó en la base de datos, pero falló el envío de correo de confirmación.');
      }

      // Vaciar carrito
      clearCart();
      setCartOpen(false);
      return orderId;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        priceTier,
        cartOpen,
        orderSubmitting,
        setCartOpen,
        togglePriceTier,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getShippingCost,
        getTotal,
        submitOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
