import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';
import { CartDrawer } from './Components/CartDrawer';
import { Inicio } from './Screens/Inicio';
import { Tienda } from './Screens/Tienda';
import { Carrito } from './Screens/Carrito';
import { Contacto } from './Screens/Contacto';
import { MiCuenta } from './Screens/MiCuenta';
import { AdminDashboard } from './Screens/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/tienda" element={<Tienda />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/cuenta" element={<MiCuenta />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <CartDrawer />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
