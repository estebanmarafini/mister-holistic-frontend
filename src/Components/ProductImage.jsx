import React, { useState, useEffect } from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500';
const BASE_IMAGE_URL = 'https://api.misterholistic.com.ar/imagenes/productos/';

export const ProductImage = ({ product, className, style }) => {
  // Determine initial image source without brute-forcing multiple extensions
  const getInitialSrc = () => {
    if (!product) return DEFAULT_IMAGE;

    // If product has a custom URL/path stored in DB
    if (product.imagen) {
      if (product.imagen.startsWith('http://') || product.imagen.startsWith('https://')) {
        return product.imagen;
      }
      return `${BASE_IMAGE_URL}${product.imagen}`;
    }

    // Fallback directly to default placeholder if no image URL is provided in DB
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

