import React, { useState, useEffect } from 'react';
import { checkoutService } from './api/checkoutService';
import type { ExperimentVariant, PaymentResult } from './api/checkoutService';

export default function App() {
  const [userId, setUserId] = useState<string>('usr_spotify_89');
  const [variant, setVariant] = useState<ExperimentVariant>('CONTROL');
  const [cvv, setCvv] = useState<string>('123');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`idemp_${Date.now()}`);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    checkoutService.fetchVariant(userId)
      .then(setVariant)
      .catch((err) => console.error('Experiment Service error:', err));
  }, [userId]);

    const handlePayment = async () => {
      setLoading(true);
      setResult(null);

      const newKey = `idemp_${Date.now()}`;
      setIdempotencyKey(newKey);

      try {
        const data = await checkoutService.processPayment(
          { userId, cardCvv: cvv, variant },
          newKey
        );
      setResult(data);
    } catch (error) {
      setResult({ status: 'FAILED', message: 'Network error while processing payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Spotify Premium</h2>
          <span style={styles.badge}>Variant: {variant}</span>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Simulated User ID (Modify to test A/B):</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>CVV (Enter 4005 for decline):</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            style={styles.input}
          />
        </div>

        {variant === 'VARIANT_B' ? (
          <button onClick={handlePayment} disabled={loading} style={{ ...styles.button, ...styles.buttonB }}>
            {loading ? 'Processing...' : '🚀 GET 3 MONTHS FOR $0'}
          </button>
        ) : (
          <button onClick={handlePayment} disabled={loading} style={{ ...styles.button, ...styles.buttonA }}>
            {loading ? 'Processing...' : 'Subscribe to Premium'}
          </button>
        )}

        {result && (
          <div style={result.status === 'SUCCESS' ? styles.successAlert : styles.errorAlert}>
            <strong>{result.message}</strong>
            {result.transactionId && (
              <div style={{ fontSize: '11px', marginTop: '4px' }}>Trx ID: {result.transactionId}</div>
            )}
            {result.errorCode && (
              <div style={{ fontSize: '11px', marginTop: '4px' }}>Error Code: {result.errorCode}</div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          Header X-Idempotency-Key: <br />
          <code>{idempotencyKey}</code>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#121212',
    border: '1px solid #282828',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  badge: {
    fontSize: '10px',
    padding: '4px 8px',
    backgroundColor: '#282828',
    borderRadius: '4px',
    color: '#1db954',
    fontFamily: 'monospace',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#b3b3b3',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#181818',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '50px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonA: {
    backgroundColor: '#1db954',
    color: '#000',
  },
  buttonB: {
    background: 'linear-gradient(90deg, #1db954, #8e44ad)',
    color: '#fff',
  },
  successAlert: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#0f3818',
    color: '#4dff7e',
    fontSize: '12px',
  },
  errorAlert: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#3d0f0f',
    color: '#ff6b6b',
    fontSize: '12px',
  },
  footer: {
    marginTop: '20px',
    fontSize: '10px',
    color: '#555',
    textAlign: 'center',
    wordBreak: 'break-all',
  },
};