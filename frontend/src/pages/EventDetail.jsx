import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI } from '../api/index.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { getProviderBanner } from '../utils/providerMedia.js';

function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center bg-[#fff8ec] border border-[#d7c8ae] rounded-xl px-4 py-3 min-w-[60px]">
      <span className="text-2xl font-bold text-slate-900 tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-muted text-xs mt-0.5">{label}</span>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading]   = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    catalogAPI.getProvider(id)
      .then(res => setProvider(res.data.provider))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const { days, hours, minutes, seconds, expired } = useCountdown(provider?.saleStartsAt);

  const handleJoinQueue = () => {
    if (!token) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    navigate(`/queue/${id}`);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-64 bg-[#eadfc9] rounded-2xl" />
      <div className="h-8 bg-[#eadfc9] rounded w-2/3" />
      <div className="h-4 bg-[#eadfc9] rounded w-1/3" />
    </div>
  );

  if (!provider) return (
    <div className="text-center py-20 text-muted">Event not found</div>
  );

  const { metadata } = provider;
  const saleDate = new Date(provider.saleStartsAt);
  const eventDate = provider.eventAt ? new Date(provider.eventAt) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-slate-900 text-sm mb-5 transition-colors">
        Back
      </button>

      
      <div className="relative rounded-2xl overflow-hidden h-52 sm:h-72 bg-[#eadfc9] border border-[#d7c8ae] mb-6">
        <img src={getProviderBanner(provider)} alt={provider.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a2e]/80 to-transparent" />

        {metadata?.teams && (
          <div className="absolute bottom-4 left-5">
            <p className="text-[#f8d7b5] text-sm font-medium">{metadata.teams.join(' vs ')}</p>
          </div>
        )}
      </div>


      <div className="mb-6">
        <span className="badge bg-teal-100 text-teal-800 mb-2 inline-block">
          {provider.type}
        </span>
        <h1 className="text-slate-900 text-2xl font-bold mb-1">{provider.name}</h1>
        <p className="text-muted text-sm">
          {provider.venue?.name} · {provider.venue?.city}
        </p>
        {provider.venue?.address && (
          <p className="text-muted text-sm">{provider.venue.address}</p>
        )}
      </div>

      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-muted text-xs mb-1">Event date</p>
          <p className="text-slate-900 font-medium text-sm">
            {eventDate ? eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
          {eventDate && (
            <p className="text-muted text-xs mt-0.5">
              {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-muted text-xs mb-1">Sale opens</p>
          <p className="text-slate-900 font-medium text-sm">
            {saleDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {saleDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      
      {!expired && (
        <div className="card p-5 mb-6">
          <p className="text-muted text-sm mb-3">Sale starts in</p>
          <div className="flex gap-3">
            <CountdownBox value={days}    label="Days" />
            <CountdownBox value={hours}   label="Hours" />
            <CountdownBox value={minutes} label="Mins" />
            <CountdownBox value={seconds} label="Secs" />
          </div>
        </div>
      )}

      
      <div className="card p-5 border-teal-300 border mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-900 font-medium mb-1">Join the waitlist</p>
            <p className="text-muted text-sm">
              {expired
                ? 'Sale is live! Join the queue now to get a chance to book.'
                : 'Join before sale starts to enter the pre-queue and get a randomly assigned position.'}
            </p>
          </div>
          <div className="text-3xl">🎟️</div>
        </div>
        <button
          onClick={handleJoinQueue}
          className="btn-primary w-full mt-4"
        >
          {expired ? 'Join Queue Now' : 'Join Waitlist'}
        </button>
      </div>

      
      <div className="card p-5">
        <p className="text-slate-900 font-medium mb-3">Event guide</p>
        <ul className="space-y-2 text-muted text-sm">
          <li className="flex gap-2"><span>•</span> Tickets are non-transferable.</li>
          <li className="flex gap-2"><span>•</span> Please carry a valid ID proof.</li>
          <li className="flex gap-2"><span>•</span> Seats held for 10 minutes once selected.</li>
          <li className="flex gap-2"><span>•</span> Multiple tabs may remove you from the queue.</li>
        </ul>
      </div>
    </div>
  );
}
