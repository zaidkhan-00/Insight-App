import { TYPE_META, URGENCY_CLASS, formatTime } from '../format.js';

export default function ThreadList({ threads, filter, loading, selectedId, onSelect, onDelete, onNewThread }) {
  const visible = filter === 'ALL' ? threads : threads.filter((t) => t.type === filter);

  return (
    <section className="thread-list">
      <div className="thread-list__head">
        <h2 className="section-title">
          {filter === 'ALL' ? 'All threads' : `${TYPE_META[filter]?.label ?? filter} threads`}
        </h2>
        <button className="btn btn--ghost btn--small" onClick={onNewThread}>
          + Add
        </button>
      </div>

      {loading ? (
        <div className="thread-card is-loading">Loading threads…</div>
      ) : visible.length === 0 ? (
        <div className="thread-card thread-card--empty">
          <p>No threads here yet.</p>
          <button className="btn btn--ghost btn--small" onClick={onNewThread}>
            + Add your first
          </button>
        </div>
      ) : (
        <ul className="thread-list__items">
          {visible.map((thread) => (
            <li key={thread.id}>
              <button
                className={`thread-card ${selectedId === thread.id ? 'is-selected' : ''}`}
                onClick={() => onSelect(thread.id)}
              >
                <span className={`thread-card__type thread-card__type--${thread.type.toLowerCase()}`}>
                  {TYPE_META[thread.type]?.glyph ?? '◆'} {thread.type}
                </span>
                <span className="thread-card__body">
                  <span className="thread-card__title">{thread.title}</span>
                  <span className="thread-card__source">{thread.source}</span>
                </span>
                <span className={`thread-card__urgency thread-card__urgency--${URGENCY_CLASS[thread.urgency]?.toLowerCase()}`}>
                  {thread.urgency}
                </span>
                <span className="thread-card__time">{formatTime(thread.updatedAt)}</span>
                <span
                  className="thread-card__delete"
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete ${thread.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(thread.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.stopPropagation();
                      event.preventDefault();
                      onDelete(thread.id);
                    }
                  }}
                >
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
