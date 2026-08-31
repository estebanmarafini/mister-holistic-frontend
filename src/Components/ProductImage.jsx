import React, { useState, useEffect } from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500';

const getBaseImageUrl = () => {
  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (backendApiUrl) {
    // Standardize URL: use backend URL (handling with or without /api prefix)
    const cleanBase = backendApiUrl.replace(/\/$/, '');
    return cleanBase.endsWith('/api')
      ? `${cleanBase}/imagenes/productos/`
      : `${cleanBase}/api/imagenes/productos/`;
  }
  return 'https://api.misterholistic.com.ar/api/imagenes/productos/';
};

export const ProductImage = ({ product, className, style }) => {
  const BASE_IMAGE_URL = getBaseImageUrl();

  // Determine initial image source without brute-forcing multiple extensions
  const getInitialSrc = () => {
    if (!product) return DEFAULT_IMAGE;

    // If product has a custom image path/URL stored in DB
    if (product.imagen) {
      // If the image URL is an Unsplash seed sample, ignore it and prefer local backend image by product ID
      if (product.imagen.includes('unsplash.com') && product.id) {
        return `${BASE_IMAGE_URL}${product.id}.jpg`;
      }
      if (product.imagen.startsWith('http://') || product.imagen.startsWith('https://')) {
        return product.imagen;
      }
      const cleanPath = product.imagen.replace(/^\/?(api\/)?(imagenes\/productos\/)?/, '');
      return `${BASE_IMAGE_URL}${cleanPath}`;
    }

    // If no custom image column in DB, request image by product ID from backend
    if (product.id) {
      return `${BASE_IMAGE_URL}${product.id}.jpg`;
    }

    return DEFAULT_IMAGE;
  };

  const [imgSrc, setImgSrc] = useState(getInitialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(getInitialSrc());
    setHasError(false);
  }, [product?.id, product?.imagen]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={product?.nombre || 'Producto'}
      className={className}
      style={style}
      loading="lazy"
      onError={handleError}
    />
  );
};

