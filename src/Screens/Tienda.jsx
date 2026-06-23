import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../Config/supabase';
import { useCart } from '../Hooks/useCart';

export const Tienda = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, priceTier, togglePriceTier } = useCart();

  const rawCategory = searchParams.get('categoria') || 'Todos';

  // Normalizar el filtro de la URL para que coincida con los botones del frontend
  let activeCategory = rawCategory;
  const lowerRaw = rawCategory.toLowerCase();
  if (lowerRaw === 'sahumerios') activeCategory = 'Sahumerios';
  if (lowerRaw === 'saphirus') activeCategory = 'Saphirus';
  if (lowerRaw === 'tarot') activeCategory = 'Tarot';
  if (lowerRaw === 'holistica' || lowerRaw === 'holística') activeCategory = 'Holística';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('productos').select('*').eq('disponibilidad', true);

        // Filtrar usando la columna 'categoria' de la base de datos
        if (activeCategory !== 'Todos') {
          let dbCat = activeCategory.toLowerCase();
          if (dbCat === 'holística') dbCat = 'holistica';
          query = query.eq('categoria', dbCat);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error al cargar catálogo de productos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const handleCategorySelect = (category) => {
    if (category === 'Todos') {
      searchParams.delete('categoria');
    } else {
      searchParams.set('categoria', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-width-container" style={{ padding: '64px 32px', minHeight: '100vh' }}>
      {/* Header y Toggle */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-display-lg" style={{ marginBottom: '16px' }}>Tienda Holística</h1>
        <p className="text-body-lg" style={{ maxWidth: '650px', marginBottom: '32px' }}>
          Curando herramientas para tu paz interior. Explora nuestra selección de aromas, joyas y rituales ancestrales.
        </p>

        {/* Pricing Toggle Component */}
        <div className="pricing-toggle-container">
          <div className={`pricing-toggle-slider ${priceTier === 'mayorista' ? 'wholesale' : ''}`}></div>
          <button
            className={`pricing-toggle-btn ${priceTier === 'minorista' ? 'active' : ''}`}
            onClick={() => togglePriceTier('minorista')}
          >
            Precio Minorista
          </button>
          <button
            className={`pricing-toggle-btn ${priceTier === 'mayorista' ? 'active' : ''}`}
            onClick={() => togglePriceTier('mayorista')}
          >
            Precio Mayorista
          </button>
        </div>
      </section>

      {/* Filtros de Categorías */}
      <section style={{ marginBottom: '32px' }}>
        <div className="category-filters-container">
          {['Todos', 'Sahumerios', 'Saphirus', 'Tarot', 'Holística'].map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Productos */}
      <section>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', fontSize: '18px', color: '#717976' }}>
            Alineando esencias holísticas...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#717976' }}>
            No se encontraron productos disponibles en esta categoría.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {products.map((product) => {
              const price = priceTier === 'mayorista' ? product.precio_mayorista : product.precio_minorista;
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image-wrapper">
                    <img
                      src={product.imagen || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500'}
                      alt={product.nombre}
                      className="product-image"
                    />
                    {product.stock <= 3 && product.stock > 0 && (
                      <div className="product-badge" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                        Últimas {product.stock} u.
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="product-badge" style={{ backgroundColor: '#eae8e7', color: '#717976' }}>
                        Agotado
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.nombre}</h3>
                    <p className="product-desc">Un elemento artesanal para complementar tu ritual de introspección y bienestar natural.</p>
                    <div className="product-price-row">
                      <div className="product-price-box">
                        <span className="product-price">${Number(price).toFixed(2)}</span>
                        <span className="product-price-label">{priceTier}</span>
                      </div>
                      <button
                        className="add-cart-circle-btn"
                        onClick={() => addToCart(product, 1)}
                        disabled={product.stock <= 0}
                        title={product.stock <= 0 ? 'Sin Stock' : 'Añadir al Carrito'}
                        style={product.stock <= 0 ? { backgroundColor: '#c0c8c4', cursor: 'not-allowed' } : {}}
                      >
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
