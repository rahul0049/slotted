import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueuePosition } from '../hooks/useQueuePosition.js';
import { catalogAPI } from '../api/index.js';
import api from '../api/index.js';

const STEPS = ['Waitlist Joined', 'In Queue', 'Seat Selection', 'Payment', 'Confirmation'];

export default function WaitingRoom() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [joining, setJoining]   = useState(true);
  const [joinError, setJoinError] = useState(null);

  const { position, total, eligible, estimatedWaitMins, error, connected } =
    useQueuePosition(providerId);

  
  useEffect(() => {
    const join = async () => {
      try {
        const userId = JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).sub;
        await api.post(`${import.meta.env.VITE_QUEUE_ENGINE_URL || 'http://localhost:5000'}/queue/join`, {
          providerId,
          userId,
        });
      } catch (err) {
        console.error('Join queue failed:', err);
        setJoinError(err.response?.data?.error || err.message || 'Could not join queue');
      } finally {
        setJoining(false);
      }
    };

    catalogAPI.getProvider(providerId).then(res => setProvider(res.data.provider)).catch(() => {});
    join();
  }, [providerId]);

  
  useEffect(() => {
    if (eligible) {
      const timer = setTimeout(() => navigate(`/select/${providerId}`), 1500);
      return () => clearTimeout(timer);
    }
  }, [eligible, providerId, navigate]);

  if (joining) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-muted">Joining queue...</p>
    </div>
  );

  if (joinError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <p className="text-red-400">{joinError}</p>
      <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8">


      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`w-2 h-2 rounded-full live-dot ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="text-muted text-xs">{connected ? 'Connected and receiving updates every 5s' : 'Reconnecting...'}</span>
      </div>

      
      {provider && (
        <div className="card p-4 mb-6 text-center">
          <p className="text-slate-900 font-semibold">{provider.name}</p>
          <p className="text-muted text-sm">{provider.venue?.name} · {provider.venue?.city}</p>
        </div>
      )}

      
      <div className="card p-8 mb-6 text-center">
        <p className="text-muted text-sm mb-2">Your queue number</p>
        {position === null ? (
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
        ) : position === -1 ? (
          <p className="text-muted text-lg">Not in queue yet</p>
        ) : (
          <>
            <p className="text-5xl sm:text-7xl font-bold text-teal-800 tabular-nums mb-1">
              {position.toLocaleString('en-IN')}
            </p>
            {total !== null && (
              <p className="text-muted text-sm">
                {(position).toLocaleString('en-IN')} people ahead of you
              </p>
            )}
          </>
        )}
      </div>


      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-muted text-xs mb-1">Est. wait</p>
          <p className="text-slate-900 font-semibold text-sm">
            {estimatedWaitMins !== null
              ? estimatedWaitMins === 0 ? 'Soon' : `~${estimatedWaitMins}m`
              : '—'}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-muted text-xs mb-1">In queue</p>
          <p className="text-slate-900 font-semibold text-sm">
            {total !== null ? total.toLocaleString('en-IN') : '—'}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-muted text-xs mb-1">Status</p>
          <p className={`font-semibold text-sm ${eligible ? 'text-emerald-400' : 'text-amber-400'}`}>
            {eligible ? 'Active' : 'Waiting'}
          </p>
        </div>
      </div>


      {eligible && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-center">
          <p className="text-emerald-700 font-semibold text-lg">It is your turn</p>
          <p className="text-emerald-700/80 text-sm mt-1">Redirecting to seat selection...</p>
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mt-3" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}


      <div className="card p-5">
        <div className="flex items-center justify-between relative">

          <div className="absolute left-0 right-0 top-4 h-px bg-[#d7c8ae] z-0" />
          {STEPS.map((step, i) => {
            const done    = i === 0;
            const active  = i === 1;
            return (
              <div key={step} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  done   ? 'bg-emerald-600 text-white' :
                  active ? 'bg-teal-700 text-white ring-2 ring-teal-200' :
                           'bg-[#f3e7d2] text-slate-500 border border-[#d7c8ae]'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <p className={`text-center text-[10px] leading-tight ${
                  done || active ? 'text-slate-700' : 'text-muted'
                }`}>
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>


      <div className="card p-4 mt-4">
        <p className="text-muted text-xs font-medium mb-2">Please note</p>
        <ul className="space-y-1.5 text-muted text-xs">
          <li>Do not refresh or close this page.</li>
          <li>Once it is your turn, you have 10 minutes to complete your booking.</li>
          <li>Multiple tabs may remove you from the queue.</li>
        </ul>
      </div>
    </div>
  );
}
