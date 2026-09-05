import { useEffect, useState } from 'react';
import { productApi } from '../api/client';

const emptyForm = { name: '', description: '', price: '', stock: '', imageUrl: '', category: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  function loadProducts() {
    productApi.get('/api/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products'))
      .finally(() => setLoading(false));
  }

  useEffect(loadProducts, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || '', price: p.price,
      stock: p.stock, imageUrl: p.imageUrl || '', category: p.category || ''
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    };
    try {
      if (editingId) {
        await productApi.put(`/api/products/${editingId}`, payload);
      } else {
        await productApi.post('/api/products', payload);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed. Are you logged in as an admin?');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await productApi.delete(`/api/products/${id}`);
      loadProducts();
    } catch {
      setError('Delete failed. Are you logged in as an admin?');
    }
  }

  if (loading) return <p className="center-msg">Loading...</p>;

  return (
    <div className="page">
      <h1>Admin: Manage Products</h1>
      {error && <div className="alert-error">{error}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? `Editing Product #${editingId}` : 'Add New Product'}</h3>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <input name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <div className="admin-form-actions">
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <button className="btn-link" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn-link danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
