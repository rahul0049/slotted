import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI, bookingAPI } from '../api/index.js';
import StadiumMap from '../components/StadiumMap.jsx';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import { getStadiumLayout, mediaFallbacks } from '../utils/providerMedia.js';

const LOCK_TTL = 600;

const parseLabelFallback = (label = '') => {
  const match = label.match(/(?:-|^)([A-Za-z]+)(\d+)$/);
  if (!match) return { row: null, column: null, stand: null };
  return {
    stand: label.includes('-') ? label.split('-')[0] : null,
    row: match[1].toUpperCase(),
    column: Number(match[2]),
  };
};

const sortText = (a, b) =>
  String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });

export default function SeatSelection() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeStand, setActiveStand] = useState(null);
  const [locking, setLocking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, iRes] = await Promise.all([
          catalogAPI.getProvider(providerId),
          catalogAPI.getInventory(providerId),
        ]);
        setProvider(pRes.data.provider);
        setSeats(iRes.data.inventory || []);
      } catch {
        setError('Failed to load seats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [providerId]);

  
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setSelected([]);
      setTimeLeft(null);
      setError('Your seat hold expired. Please re-select.');
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const seatsWithGrid = useMemo(() => {
    const standRowCounters = {};

    return (seats || []).map((seat) => {
      const fallback = parseLabelFallback(seat.label);
      const stand = seat.seat?.section || fallback.stand || 'General Stand';
      const row = seat.seat?.row || fallback.row || 'A';

      if (!standRowCounters[stand]) standRowCounters[stand] = {};
      if (!standRowCounters[stand][row]) standRowCounters[stand][row] = 0;

      standRowCounters[stand][row] += 1;
      const fallbackColumn = standRowCounters[stand][row];

      const parsedColumn = Number(seat.seat?.column ?? fallback.column);
      const column = Number.isFinite(parsedColumn) && parsedColumn > 0 ? parsedColumn : fallbackColumn;

      return {
        ...seat,
        standName: stand,
        uiRow: String(row).toUpperCase(),
        uiColumn: column,
      };
    });
  }, [seats]);

  const standSummaries = useMemo(() => {
    const grouped = seatsWithGrid.reduce((acc, seat) => {
      if (!acc[seat.standName]) {
        acc[seat.standName] = {
          name: seat.standName,
          total: 0,
          available: 0,
          minPrice: Number(seat.price),
          maxPrice: Number(seat.price),
        };
      }

      acc[seat.standName].total += 1;
      if (seat.status === 'AVAILABLE') acc[seat.standName].available += 1;

      const price = Number(seat.price);
      acc[seat.standName].minPrice = Math.min(acc[seat.standName].minPrice, price);
      acc[seat.standName].maxPrice = Math.max(acc[seat.standName].maxPrice, price);

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => sortText(a.name, b.name));
  }, [seatsWithGrid]);

  useEffect(() => {
    if (!standSummaries.length) return;
    if (!activeStand || !standSummaries.find((stand) => stand.name === activeStand)) {
      setActiveStand(standSummaries[0].name);
    }
  }, [standSummaries, activeStand]);

  const visibleSeats = useMemo(
    () => seatsWithGrid.filter((seat) => seat.standName === activeStand),
    [seatsWithGrid, activeStand]
  );

  const handleSeatClick = useCallback(
    async (seat) => {
      const alreadySelected = selected.some((picked) => picked.id === seat.id);

      if (alreadySelected) {
        try {
          await bookingAPI.releaseLock(seat.id);
        } catch {}

        setSelected((prev) => prev.filter((picked) => picked.id !== seat.id));
        if (selected.length === 1) setTimeLeft(null);
        return;
      }

      setLocking(true);
      setError(null);

      try {
        await bookingAPI.lockSeat(seat.id, providerId);
        setSelected((prev) => [...prev, seat]);
        if (selected.length === 0) setTimeLeft(LOCK_TTL);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not lock seat');
      } finally {
        setLocking(false);
      }
    },
    [selected, providerId]
  );

  const handleContinue = async () => {
    if (selected.length === 0) return;
    setLocking(true);
    try {
      const idempotencyKey = uuidv4();
      localStorage.setItem('idempotencyKey', idempotencyKey);

      const totalAmount = selected.reduce((sum, seat) => sum + parseFloat(seat.price), 0);

      const res = await bookingAPI.createBooking(
        {
          providerId,
          unitIds: selected.map((seat) => seat.id),
          totalAmount,
        },
        idempotencyKey
      );

      navigate(`/confirm/${res.data.booking.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLocking(false);
    }
  };

  const totalAmount = selected.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
  const convFee = Math.round(totalAmount * 0.02);
  const stadiumLayoutUrl = getStadiumLayout(provider) || mediaFallbacks.DEFAULT_STADIUM_LAYOUT;
  const hasProviderLayout = Boolean(getStadiumLayout(provider));

  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted hover:text-slate-900 transition-colors"
          >
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{provider?.name}</h1>
          <p className="text-sm text-muted">
            {provider?.venue?.name} in {provider?.venue?.city}
          </p>
        </div>

        {timeLeft !== null && (
          <div
            className={`px-4 py-2 rounded-xl border font-semibold ${
            timeLeft < 120
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-amber-50 border-amber-300 text-amber-700'
            }`}
          >
            Hold timer: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <aside className="card p-4 h-fit lg:sticky lg:top-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Choose a Stand</h2>
            <span className="text-xs text-muted">{standSummaries.length} stands</span>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {standSummaries.map((stand) => {
              const active = stand.name === activeStand;
              return (
                <button
                  key={stand.name}
                  type="button"
                  onClick={() => setActiveStand(stand.name)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    active
                      ? 'border-teal-700 bg-teal-50'
                      : 'border-[#d7c8ae] bg-[#fffaf2] hover:bg-[#f6efe4]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{stand.name}</p>
                    <span className="text-xs rounded-full px-2 py-1 bg-white border border-[#d7c8ae] text-slate-700">
                      {stand.available}/{stand.total} left
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    Price:{' '}
                    {stand.minPrice === stand.maxPrice
                      ? `Rs ${stand.minPrice.toLocaleString('en-IN')}`
                      : `Rs ${stand.minPrice.toLocaleString('en-IN')} - Rs ${stand.maxPrice.toLocaleString('en-IN')}`}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-4">
          <StadiumMap
            seats={visibleSeats}
            selectedIds={selected.map((seat) => seat.id)}
            onSeatClick={handleSeatClick}
            standName={activeStand}
          />

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Selected Seats</h3>
              <button
                type="button"
                onClick={async () => {
                  const seatsToRelease = [...selected];
                  for (const seat of seatsToRelease) {
                    try {
                      await bookingAPI.releaseLock(seat.id);
                    } catch {}
                  }
                  setSelected([]);
                  setTimeLeft(null);
                }}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>

            {selected.length === 0 ? (
              <p className="text-sm text-muted">No seat selected yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selected.map((seat) => (
                  <div
                    key={seat.id}
                    className="rounded-lg border border-[#dccfb7] bg-[#fff8ec] px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{seat.label}</p>
                      <p className="text-xs text-muted">
                        {seat.standName} Row {seat.uiRow} Seat {seat.uiColumn}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-teal-800">
                        Rs {Number(seat.price).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected.length > 0 && (
              <div className="space-y-2 border-t border-[#dccfb7] pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-slate-900">Rs {totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Convenience fee</span>
                  <span className="font-semibold text-slate-900">Rs {convFee}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#dccfb7]">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-teal-800">
                    Rs {(totalAmount + convFee).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={selected.length === 0 || locking}
              className="btn-primary w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locking
                ? 'Processing...'
                : `Proceed to Checkout - Rs ${(totalAmount + convFee).toLocaleString('en-IN')}`}
            </button>
          </div>

          <div className="card p-4 sm:p-5 rise-in">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stadium Layout Guide</h3>
                <p className="text-xs text-muted mt-1">
                  {hasProviderLayout
                    ? 'Uploaded by provider to help you locate stands quickly.'
                    : 'Provider has not uploaded layout yet. Showing default guide map.'}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                {hasProviderLayout ? 'Provider Map' : 'Default Map'}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#d7c8ae] bg-[#fff8ec]">
              <img
                src={stadiumLayoutUrl}
                alt="Stadium stand layout"
                className="w-full h-44 sm:h-56 object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
