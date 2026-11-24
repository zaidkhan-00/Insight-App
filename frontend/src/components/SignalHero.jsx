import { formatTime } from '../format.js';

export default function SignalHero({ signal, loading, scanning, onScan }) {
  return (
    <section className="signal-hero">
      <div className="signal-hero__top">
        <p className="kicker">
          <span className="kicker__stroke" />
          {signal ? `Signal · computed ${formatTime(signal.computedAt)}` : 'Signal'}
        </p>
        <button className="btn btn--ghost btn--small" onClick={onScan} disabled={scanning}>
          {scanning ? 'Scanning…' : 'Rescan'}
        </button>
      </div>

      {loading ? (
        <h1 className="signal-hero__headline is-loading">Reading your threads…</h1>
      ) : signal ? (
        <>
          <h1 className="signal-hero__headline">{signal.headline}</h1>
          <p className="signal-hero__rationale">{signal.rationale}</p>
          <div className="signal-hero__meta">
            <span className="chip">{formatTypeSafe(signal.threadType)}</span>
            <span className="chip chip--accent">score {signal.score}</span>
            <span className="chip">{signal.scannedThreads} threads read</span>
          </div>
        </>
      ) : (
        <h1 className="signal-hero__headline">No signal yet — add your first thread.</h1>
      )}
    </section>
  );
}

function formatTypeSafe(type) {
  if (!type) return 'THREAD';
  return type.charAt(0) + type.slice(1).toLowerCase();
}
