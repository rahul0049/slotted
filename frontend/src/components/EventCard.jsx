import { Link } from 'react-router-dom';
import { getProviderImage } from '../utils/providerMedia.js';

const TYPE_COLORS = {
  SPORTS: 'bg-teal-100 text-teal-800 border border-teal-200',
  MOVIE: 'bg-blue-100 text-blue-800 border border-blue-200',
  DINING: 'bg-amber-100 text-amber-800 border border-amber-200',
  EVENT: 'bg-rose-100 text-rose-800 border border-rose-200',
};

const TYPE_LABELS = {
  SPORTS: 'Sports',
  MOVIE:  'Movie',
  DINING: 'Dining',
  EVENT:  'Event',
};

export default function EventCard({ provider }) {
  const imageUrl = getProviderImage(provider);
  const teams    = provider.metadata?.teams;
  const saleDate = new Date(provider.saleStartsAt);
  const now      = new Date();
  const saleOpen = saleDate <= now;

  return (
    <Link to={`/event/${provider.id}`} className="block group">
      <div className="card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/50">
        
        <div className="relative h-44 bg-[#eadfc9] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={provider.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-40">🎫</span>
            </div>
          )}
          
          <span className={`absolute top-3 left-3 badge ${TYPE_COLORS[provider.type] || 'bg-white text-slate-600 border border-[#d7c8ae]'}`}>
            {TYPE_LABELS[provider.type] || provider.type}
          </span>
          
          {saleOpen ? (
            <span className="absolute top-3 right-3 badge bg-[#ef7d57] text-white animate-pulse">
              Live now
            </span>
          ) : (
            <span className="absolute top-3 right-3 badge bg-[#1f2a2e]/70 text-white">
              Upcoming
            </span>
          )}
        </div>

        
        <div className="p-4">
          {teams && (
            <p className="text-teal-700 text-xs font-semibold mb-1">
              {teams.join(' vs ')}
            </p>
          )}
          <h3 className="text-slate-900 font-semibold text-base leading-snug mb-2 line-clamp-2">
            {provider.name}
          </h3>
          <p className="text-muted text-sm mb-3">
            {provider.venue?.name} · {provider.venue?.city}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted">
              <span>Sale: </span>
              <span className="text-slate-700 font-medium">
                {saleDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
                {saleDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="text-teal-800 text-sm font-semibold">View</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
