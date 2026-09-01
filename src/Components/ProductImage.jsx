import React, { useState, useEffect } from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500';
const R2_BASE_URL = (import.meta.env.VITE_CLOUDFLARE_R2_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-d5f5c07266ad46b791fbc7e26c905fef.r2.dev/').replace(/\/$/, '') + '/';

export const ProductImage = ({ product, className, style }) => {
  // Determine initial image source without brute-forcing multiple extensions
  const getInitialSrc = () => {
    if (!product) return DEFAULT_IMAGE;

    // If product has a custom image path/URL stored in DB
    if (product.imagen) {
      // If the image URL is an Unsplash seed sample, ignore it and prefer Cloudflare R2 image by product ID
      if (product.imagen.includes('unsplash.com') && product.id) {
        return `${R2_BASE_URL}${product.id}.jpg`;
      }
      if (product.imagen.startsWith('http://') || product.imagen.startsWith('https://')) {
        return product.imagen;
      }
      const cleanPath = product.imagen.replace(/^\/?(api\/)?(imagenes\/productos\/)?/, '');
      return `${R2_BASE_URL}${cleanPath}`;
    }

    // Default: request image by product ID from Cloudflare R2 bucket
    if (product.id) {
      return `${R2_BASE_URL}${product.id}.jpg`;
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
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(imgSrc.replace(/\.jpg$/, '.png'));
    } else if (imgSrc.endsWith('.png')) {
      setImgSrc(imgSrc.replace(/\.png$/, '.webp'));
    } else if (!hasError) {
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

