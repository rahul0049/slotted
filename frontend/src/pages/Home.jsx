import { useState, useEffect } from 'react';
import { catalogAPI } from '../api/index.js';
import EventCard from '../components/EventCard.jsx';
import { getProviderBanner } from '../utils/providerMedia.js';

const TYPES = ['ALL', 'SPORTS', 'MOVIE', 'DINING', 'EVENT'];

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [type, setType]           = useState('ALL');
  const [city, setCity]           = useState('');

  useEffect(() => {
    fetchProviders();
  }, [type, city]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type !== 'ALL') params.type = type;
      if (city.trim()) params.city = city.trim();
      const res = await catalogAPI.listProviders(params);
      setProviders(res.data.providers || []);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  
  const hero = providers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      
      {hero && (
        <div className="relative rounded-2xl overflow-hidden mb-8 h-56 sm:h-72 border border-[#d7c8ae] shadow-[0_16px_40px_rgba(96,82,56,0.15)]">
          <img
            src={getProviderBanner(hero)}
            alt={hero.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f2a2e]/85 via-[#1f2a2e]/55 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            {hero.metadata?.teams && (
              <span className="text-[#f8d7b5] text-sm font-semibold mb-1">
                {hero.metadata.teams.join(' vs ')}
              </span>
            )}
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">{hero.name}</h1>
            <p className="text-white/80 text-sm mb-4">
              {hero.venue?.name} · {hero.venue?.city}
            </p>
            <a
              href={`/event/${hero.id}`}
              className="inline-flex items-center gap-2 btn-primary w-fit text-sm py-2.5"
            >
              Book Tickets →
            </a>
          </div>
        </div>
      )}


      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">

        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                type === t
                  ? 'bg-teal-700 text-white'
                  : 'bg-[#fff8ec] text-slate-700 hover:text-slate-900 border border-[#d7c8ae]'
              }`}
            >
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <input
          className="input text-sm py-2 w-full sm:w-44"
          placeholder="City (e.g. Mumbai)"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </div>


      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={fetchProviders} className="btn-outline text-sm">Retry</button>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-muted">No events found</p>
        </div>
      ) : (
        <>
          <p className="text-muted text-sm mb-4">{providers.length} events found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map(p => (
              <EventCard key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
