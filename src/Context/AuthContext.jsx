import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restaurar sesión al cargar
    const storedToken = localStorage.getItem('mh_token');
    const storedUser = localStorage.getItem('mh_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Enviar código OTP por correo electrónico
  const sendOTP = async (email) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar el correo de verificación.');
      return data.message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Registrar cliente completando la validación del OTP
  const registerClient = async (formData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el proceso de registro.');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('mh_token', data.token);
      localStorage.setItem('mh_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Iniciar Sesión (retorna JWT de sesión)
  const loginClient = async (dni, contrasena) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: parseInt(dni), contrasena })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas.');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('mh_token', data.token);
      localStorage.setItem('mh_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Recuperar Contraseña mediante envío de email provisorio
  const recoverPassword = async (dni, email) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: parseInt(dni), email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al solicitar recuperación.');
      return data.message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Cerrar Sesión
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mh_token');
    localStorage.removeItem('mh_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        sendOTP,
        registerClient,
        loginClient,
        recoverPassword,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
