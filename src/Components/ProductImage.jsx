import React, { useEffect, useState } from 'react';

export const ProductImage = ({ product, className, style }) => {
  const base = 'https://api.misterholistic.com.ar/imagenes/productos/';
  const defaultImg = product?.imagen || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500';

  // Generate candidate URLs using only the ID and extensions
  const getCandidateUrls = () => {
    if (!product || !product.id) {
      return [defaultImg];
    }

    const extensions = ['jpg', 'png', 'webp', 'jpeg', 'JPG', 'PNG', 'WEBP'];
    const urls = [];

    // Try ID with each extension
    extensions.forEach(ext => {
      urls.push(`${base}${product.id}.${ext}`);
    });

    // Finally, fallback to database image or default
    urls.push(defaultImg);

    return urls;
  };

  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const urls = getCandidateUrls();
    setCandidates(urls);
    setCurrentIndex(0);
  }, [product?.id, defaultImg]);

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const currentSrc = candidates[currentIndex] || defaultImg;

  return (
    <img
      src={currentSrc}
      alt={product?.nombre || 'Producto'}
      className={className}
      style={style}
      onError={handleError}
    />
  );
};
