import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../api/index.js';

export default function PaymentSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let attempts = 0;
    const poll = async () => {
      try {
        const res = await bookingAPI.getBooking(bookingId);
        const b = res.data.booking;
        setBooking(b);
        if (b.status !== 'CONFIRMED' && attempts < 5) {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch {
        
      } finally {
        setLoading(false);
      }
    };
    poll();
  }, [bookingId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-muted text-sm">Confirming payment...</p>
    </div>
  );

  const totalAmount = parseFloat(booking?.total_amount || 0);
  const convFee = Math.round(totalAmount * 0.02);
  const confirmed = booking?.status === 'CONFIRMED';

  return (
    <div className="max-w-lg mx-auto px-4 py-8">


      <div className="flex flex-col items-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
          confirmed ? 'bg-emerald-500' : 'bg-amber-500'
        }`}>
          <span className="text-4xl">{confirmed ? '✓' : '⏳'}</span>
        </div>
        <h1 className="text-slate-900 text-2xl font-bold mb-1">
          {confirmed ? 'Booking confirmed!' : 'Payment received'}
        </h1>
        <p className="text-muted text-sm text-center">
          {confirmed
            ? 'Your tickets have been booked successfully.'
            : 'We\'re confirming your booking — this may take a moment.'}
        </p>
      </div>


      <div className="card overflow-hidden mb-6">
        
        <div className="bg-[#f4e8d5] border-b border-[#d7c8ae] p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 brand-chip rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-muted text-xs">Slotted · Your ticket</span>
          </div>
          <p className="text-slate-900 font-bold text-lg">Event booking</p>
        </div>


        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-muted text-xs mb-0.5">Booking ID</p>
              <p className="text-slate-900 font-mono text-sm font-medium">
                {bookingId.slice(0,8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Seats</p>
              <p className="text-slate-900 text-sm font-medium">
                {booking?.unit_ids?.length || 0} ticket(s)
              </p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Amount paid</p>
              <p className="text-slate-900 text-sm font-medium">
                Rs {(totalAmount + convFee).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Status</p>
              <span className={`badge ${
                confirmed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {booking?.status || 'Processing'}
              </span>
            </div>
          </div>

          
          <div className="border-t border-dashed border-[#d7c8ae] my-4" />


          <div className="text-center">
            <p className="text-muted text-xs">
              Booked on {new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            {confirmed && (
              <p className="text-muted text-xs mt-1">
                Show this confirmation at the venue gate
              </p>
            )}
          </div>
        </div>
      </div>


      <div className="space-y-3">
        <Link to="/" className="btn-primary w-full block text-center">
          Browse more events
        </Link>
        <button
          onClick={() => navigate('/')}
          className="btn-outline w-full"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
