import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../api/index.js';

export default function BookingConfirm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);
  const [error, setError]     = useState(null);
  const [timeLeft, setTimeLeft] = useState(540); 

  useEffect(() => {
    bookingAPI.getBooking(bookingId)
      .then(res => setBooking(res.data.booking))
      .catch(() => setError('Could not load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);


  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/');
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const res = await paymentAPI.initiate(bookingId);
      const { orderId, amount, currency, keyId } = res.data.payment;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'Slotted',
        description: `Booking #${bookingId.slice(0,8)}`,
        handler: (response) => {
        
          navigate(`/success/${bookingId}`);
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not initiate payment');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && !booking) return (
    <div className="text-center py-20 text-red-400">{error}</div>
  );

  const totalAmount = parseFloat(booking?.total_amount || 0);
  const convFee = Math.round(totalAmount * 0.02);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-muted hover:text-slate-900 text-sm transition-colors">Back</button>
          <h1 className="text-slate-900 text-xl font-bold mt-1">Confirm booking</h1>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
          timeLeft < 120
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-amber-50 border-amber-300 text-amber-700'
        }`}>
          <span className="font-mono text-sm font-semibold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">✓</span>
        </div>
        <div>
          <p className="text-emerald-700 font-medium text-sm">Seats locked</p>
          <p className="text-emerald-700/70 text-xs">Complete payment before the timer runs out</p>
        </div>
      </div>

      
      <div className="card p-5 mb-4">
        <p className="text-slate-900 font-medium mb-4">Order summary</p>
        {booking?.unit_ids?.map((unitId, i) => (
          <div key={unitId} className="flex justify-between items-center py-2 border-b border-[#d7c8ae] last:border-0">
            <div>
              <p className="text-slate-900 text-sm">Seat {i + 1}</p>
              <p className="text-muted text-xs font-mono">{unitId.slice(0,8)}...</p>
            </div>
          </div>
        ))}
        <div className="pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-slate-900">Rs {totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Convenience fee</span>
            <span className="text-slate-900">Rs {convFee}</span>
          </div>
          <div className="flex justify-between font-semibold pt-1 border-t border-[#d7c8ae]">
            <span className="text-slate-900">Total</span>
            <span className="text-teal-800 text-lg">Rs {(totalAmount + convFee).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      
      <div className="card p-5 mb-6">
        <p className="text-slate-900 font-medium mb-3">Booking details</p>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted text-sm">Booking ID</span>
            <span className="text-slate-700 font-mono text-sm">{bookingId.slice(0,8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted text-sm">Status</span>
            <span className="badge bg-amber-100 text-amber-700">Pending payment</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      
      <button
        onClick={handlePay}
        disabled={paying}
        className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
      >
        {paying ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Pay Rs {(totalAmount + convFee).toLocaleString('en-IN')}</span>
            <span className="text-white/80 text-sm">via Razorpay</span>
          </>
        )}
      </button>

      <p className="text-muted text-xs text-center">
        By proceeding, you agree to our Terms & Conditions. Secure checkout powered by Razorpay.
      </p>
    </div>
  );
}
