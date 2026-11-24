import { api } from '../api.js';
import { formatType } from '../format.js';

export default function Sidebar({ user, onSignOut, threads, filter, onFilter, onNewThread, scanning, scan, offline, onScan }) {
  const counts = {
    ALL: threads.length,
    CHAT: threads.filter((t) => t.type === 'CHAT').length,
    DOC: threads.filter((t) => t.type === 'DOC').length,
    COMMIT: threads.filter((t) => t.type === 'COMMIT').length,
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark" />
        <span className="brand__word">
          INSIGHT<span className="brand__sup">APP</span>
        </span>
      </div>

      <nav className="side-nav">
        <p className="side-label">Threads</p>
        {['ALL', 'CHAT', 'DOC', 'COMMIT'].map((key) => (
          <button
            key={key}
            className={`side-nav__item ${filter === key ? 'is-active' : ''}`}
            onClick={() => onFilter(key)}
          >
            <span>{key === 'ALL' ? 'All threads' : formatType(key)}</span>
            <span className="side-nav__count">{counts[key]}</span>
          </button>
        ))}
      </nav>

      <div className="side-actions">
        <button className="btn btn--primary" onClick={onNewThread}>
          + New thread
        </button>
        <button className="btn btn--ghost" onClick={onScan} disabled={scanning}>
          {scanning ? 'Scanning…' : 'Run signal scan'}
        </button>
        <a className="btn btn--ghost btn--link" href={api.exportCsvUrl} download>
          Export CSV
        </a>
      </div>

      {scan && (
        <div className="side-scan">
          <p className="side-label">Last scan</p>
          <dl>
            <div>
              <dt>Threads</dt>
              <dd>
                {scan.succeeded}/{scan.requested}
              </dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{scan.durationMs} ms</dd>
            </div>
            <div>
              <dt>Workers</dt>
              <dd>{scan.workerThreads}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="side-user">
        <span className="side-user__avatar">{user.name.charAt(0).toUpperCase()}</span>
        <span className="side-user__id">
          <b>{user.name}</b>
          <i>{user.email}</i>
        </span>
        <button className="side-user__out" onClick={onSignOut}>
          Sign out
        </button>
      </div>

      <div className="side-status">
        <span className={`status-dot ${offline ? 'is-off' : 'is-on'}`} />
        <span>{offline ? 'API offline' : 'API live · :8080'}</span>
      </div>
    </aside>
  );
}
