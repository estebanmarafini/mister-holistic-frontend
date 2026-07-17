import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Config/supabase';
import { useCart } from '../Hooks/useCart';
import { ProductImage } from '../Components/ProductImage';
import { formatPrice } from '../Config/utils';



export const Inicio = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, priceTier } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('disponibilidad', true)
          .limit(3);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (err) {
        console.error('Error al cargar productos destacados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', height: '650px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="/foto_portada.jpeg"
            alt="Hero holistico"
            style={{
              width: 'calc(100% + 100px)',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'left center'
            }}
          />



          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(251,249,248,0.95), rgba(251,249,248,0.4), transparent)' }}></div>
        </div>

        <div className="max-width-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '550px' }}>
            <h1 className="text-display-lg" style={{ marginBottom: '16px', color: '#0c3b32' }}>Encontrá tu centro en lo cotidiano</h1>
            <p className="text-body-lg" style={{ marginBottom: '32px' }}>
              Bienvenido a Mister Holistic. Un espacio dedicado a la pausa, el ritual y la conexión profunda a través de aromas y elementos naturales curados para tu bienestar.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={() => navigate('/tienda')}>Explorar Tienda</button>
              <button className="btn-secondary" onClick={() => navigate('/contacto')}>Contacto</button>
            </div>
          </div>
        </div>
      </section>

      {/* Colecciones / Categorías */}
      <section style={{ padding: '64px 0', backgroundColor: '#fbf9f8' }}>
        <div className="max-width-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 className="text-headline-lg" style={{ marginBottom: '8px' }}>Colecciones para el Alma</h2>
              <p style={{ color: '#404846' }}>Selecciona tu categoría favorita y descubre el arte de la tranquilidad.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {/* Categoría 1 */}
            <div onClick={() => navigate('/tienda?categoria=Sahumerios')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <img
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=350"
                  alt="Sahumerios"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <h3 className="text-headline-md">Sahumerios</h3>
            </div>

            {/* Categoría 2 */}
            <div onClick={() => navigate('/tienda?categoria=Saphirus')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <img
                  src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=350"
                  alt="Saphirus"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <h3 className="text-headline-md">Saphirus</h3>
            </div>

            {/* Categoría 3 */}
            <div onClick={() => navigate('/tienda?categoria=Tarot')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <img
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=350"
                  alt="Tarot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <h3 className="text-headline-md">Tarot</h3>
            </div>

            {/* Categoría 4 */}
            <div onClick={() => navigate('/tienda?categoria=Holística')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=350"
                  alt="Holística"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <h3 className="text-headline-md">Línea Holística</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '64px 0', backgroundColor: '#f5f3f3' }}>
        <div className="max-width-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="text-label-sm" style={{ color: '#695d43', display: 'block', marginBottom: '8px' }}>Selección Especial</span>
            <h2 className="text-display-lg">Productos Destacados</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>Cargando catálogo consciente...</div>
          ) : featuredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#717976' }}>
              No hay productos disponibles actualmente en tienda.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {featuredProducts.map((product) => {
                const price = priceTier === 'mayorista' ? product.precio_mayorista : product.precio_minorista;
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      <ProductImage product={product} className="product-image" />
                      {product.stock === 0 && (
                        <div className="product-badge" style={{ backgroundColor: '#eae8e7', color: '#717976' }}>
                          Agotado
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.nombre}</h3>
                      <p className="product-desc">Un elemento natural perfecto para propiciar momentos de introspección y calma profunda.</p>
                      <div className="product-price-row">
                        <div className="product-price-box">
                          <span className="product-price">{formatPrice(price)}</span>
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
        </div>
      </section>

      {/* Philosophy Section */}
      <section style={{ padding: '64px 0', backgroundColor: '#fbf9f8' }}>
        <div className="max-width-container">
          <div className="grid-bento-philosophy">
            <div className="col-span-7" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400"
                  alt="Meditación"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', marginTop: '32px' }}>
                <img
                  src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=400"
                  alt="Esencias florales"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-span-5">
              <span className="text-label-sm" style={{ color: '#695d43', display: 'block', marginBottom: '16px' }}>Nuestra Esencia</span>
              <h2 className="text-display-lg" style={{ marginBottom: '24px' }}>Un puente entre el ritual y la modernidad</h2>
              <p className="text-body-lg" style={{ marginBottom: '24px' }}>
                En Mister Holistic, creemos que cada aroma cuenta una historia y cada objeto tiene el poder de transformar un espacio en un santuario. Nuestra filosofía se basa en la selección consciente de elementos que promueven la calma, la claridad y el bienestar integral.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '64px 0', backgroundColor: '#0c3b32', color: '#ffffff', textAlign: 'center' }}>
        <div className="max-width-container">
          <h2 className="text-display-lg" style={{ color: '#ffffff', marginBottom: '16px' }}>Comenzá tu viaje hacia la calma</h2>
          <p className="text-body-lg" style={{ color: '#beecde', maxWidth: '600px', margin: '0 auto 32px' }}>
            Descubrí nuestra colección completa y llevá la tranquilidad de Mister Holistic a tu hogar hoy mismo.
          </p>
          <button
            className="btn-primary"
            style={{ backgroundColor: '#ffffff', color: '#0c3b32' }}
            onClick={() => navigate('/tienda')}
          >
            Ver Catálogo Completo
          </button>
        </div>
      </section>
    </div>
  );
};
