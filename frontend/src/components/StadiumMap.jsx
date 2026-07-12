const STATUS_STYLE = {
  AVAILABLE: 'bg-[#8bcf90] border-[#5fa76a] hover:bg-[#73c77d] text-[#12331e] cursor-pointer',
  SELECTED: 'bg-[#5b7cfa] border-[#3d5cc9] hover:bg-[#4e70ea] text-white cursor-pointer',
  LOCKED: 'bg-[#edd78a] border-[#cfb664] text-[#5e4f21] cursor-not-allowed',
  BOOKED: 'bg-[#d3d6d9] border-[#a7afb4] text-[#5f676c] cursor-not-allowed',
};

const sortRowValue = (a, b) =>
  String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });

export default function StadiumMap({ seats, selectedIds, onSeatClick, standName }) {
  const rows = [...new Set(seats.map((seat) => seat.uiRow))].sort(sortRowValue);
  const maxColumn = seats.reduce(
    (max, seat) => (seat.uiColumn > max ? seat.uiColumn : max),
    0
  );

  const seatLookup = seats.reduce((acc, seat) => {
    acc[`${seat.uiRow}:${seat.uiColumn}`] = seat;
    return acc;
  }, {});

  if (seats.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-muted text-sm">No seats available in this stand.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6 rise-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Selected Stand</p>
          <h3 className="text-lg font-bold text-slate-900">{standName}</h3>
        </div>
        <p className="text-sm text-muted">Click an available seat to lock it for booking</p>
      </div>

      <div className="overflow-auto rounded-xl border border-[#d7c8ae] bg-[#fffaf2] p-3">
        <div className="inline-block min-w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8" />
            {Array.from({ length: maxColumn }, (_, i) => (
              <div key={`col-${i + 1}`} className="w-8 text-center text-[11px] font-semibold text-muted">
                {i + 1}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2 mb-2 last:mb-0">
              <div className="w-8 text-xs font-bold text-slate-700 text-center">{row}</div>
              {Array.from({ length: maxColumn }, (_, i) => {
                const col = i + 1;
                const seat = seatLookup[`${row}:${col}`];

                if (!seat) {
                  return <div key={`${row}-${col}`} className="w-8 h-8" />;
                }

                const isSelected = selectedIds.includes(seat.id);
                const status = isSelected ? 'SELECTED' : seat.status;
                const isClickable = seat.status === 'AVAILABLE' || isSelected;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => isClickable && onSeatClick(seat)}
                    className={`w-8 h-8 rounded-md border text-[10px] font-semibold transition-colors ${
                      STATUS_STYLE[status] || STATUS_STYLE.AVAILABLE
                    }`}
                    title={seat.label}
                    aria-label={`${seat.label} ${status.toLowerCase()}`}
                  >
                    {seat.uiColumn}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {['AVAILABLE', 'SELECTED', 'LOCKED', 'BOOKED'].map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={`w-3 h-3 rounded border ${STATUS_STYLE[status] || ''}`} />
            {status.toLowerCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
