import { useEffect, useState } from 'react';
import { orderApi } from '../api/client';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderApi.get('/api/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load your orders. Is order-service running on :8083?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center-msg">Loading your orders...</p>;
  if (error) return <p className="center-msg alert-error">{error}</p>;
  if (orders.length === 0) return <p className="center-msg">You haven't placed any orders yet.</p>;

  return (
    <div className="page">
      <h1>My Orders</h1>
      <div className="order-list">
        {orders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="order-header">
              <span>Order #{o.id}</span>
              <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
              <span>{new Date(o.createdAt).toLocaleString()}</span>
            </div>
            <ul>
              {o.items.map((item) => (
                <li key={item.id}>
                  {item.productName} × {item.quantity} — ${Number(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="order-total">Total: ${Number(o.totalAmount).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
