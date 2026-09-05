import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/client';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleCheckout() {
    if (!user) {
      navigate('/login');
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      };
      await orderApi.post('/api/orders', payload);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return <p className="center-msg">Your cart is empty.</p>;
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      {error && <div className="alert-error">{error}</div>}
      <div className="cart-list">
        {items.map((i) => (
          <div key={i.productId} className="cart-row">
            <img src={i.imageUrl} alt={i.name} />
            <div className="cart-info">
              <strong>{i.name}</strong>
              <span>${Number(i.price).toFixed(2)} each</span>
            </div>
            <input
              type="number"
              min={1}
              value={i.quantity}
              onChange={(e) => updateQuantity(i.productId, Number(e.target.value))}
            />
            <span className="line-total">${(i.price * i.quantity).toFixed(2)}</span>
            <button className="btn-link" onClick={() => removeFromCart(i.productId)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h2>Total: ${total.toFixed(2)}</h2>
        <button onClick={handleCheckout} disabled={placing}>
          {placing ? 'Placing order...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
