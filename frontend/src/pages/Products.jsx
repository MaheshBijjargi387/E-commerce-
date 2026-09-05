import { useEffect, useState } from 'react';
import { productApi } from '../api/client';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    productApi.get('/api/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products. Is product-service running on :8082?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="center-msg">Loading products...</p>;
  if (error) return <p className="center-msg alert-error">{error}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <input
          className="search-box"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="product-grid">
        {filtered.map((p) => (
          <div key={p.id} className="product-card">
            <img src={p.imageUrl} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="product-desc">{p.description}</p>
            <div className="product-footer">
              <span className="price">${Number(p.price).toFixed(2)}</span>
              <span className={`stock ${p.stock === 0 ? 'out' : ''}`}>
                {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
              </span>
            </div>
            <button disabled={p.stock === 0} onClick={() => addToCart(p)}>
              Add to Cart
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p>No products match your search.</p>}
      </div>
    </div>
  );
}
