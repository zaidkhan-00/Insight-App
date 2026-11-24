import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { URGENCY_CLASS, formatTime } from '../format.js';

export default function ThreadDetail({ thread, onClose }) {
  const [messages, setMessages] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [draft, setDraft] = useState('');
  const [author, setAuthor] = useState('You');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMessages(null);
    setMessagesError(null);
    api
      .messages(thread.id)
      .then((list) => {
        if (!cancelled) setMessages(list);
      })
      .catch((error) => {
        if (!cancelled) setMessagesError(error.message === 'BACKEND_OFFLINE' ? 'API offline — messages unavailable.' : error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [thread.id]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const saved = await api.addMessage(thread.id, { author: author || 'You', body: draft.trim() });
      setMessages((prev) => [...(prev ?? []), saved]);
      setDraft('');
    } catch (error) {
      setMessagesError(error.message === 'BACKEND_OFFLINE' ? 'API offline — message not sent.' : error.message);
    } finally {
      setSending(false);
    }
  };

  const extras = [];
  if (thread.type === 'CHAT') {
    extras.push(['Messages', messages ? messages.length : thread.messageCount]);
  }
  if (thread.type === 'DOC') extras.push(['Sections', thread.sectionCount]);
  if (thread.type === 'COMMIT') {
    extras.push(['Files changed', thread.filesChanged]);
    extras.push(['Additions', thread.additions]);
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer__head">
          <span className={`thread-card__type thread-card__type--${thread.type.toLowerCase()}`}>
            {thread.type}
          </span>
          <button className="drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <h3 className="drawer__title">{thread.title}</h3>
        <p className="drawer__summary">{thread.summary || 'No summary yet.'}</p>

        <dl className="drawer__facts">
          <div>
            <dt>Source</dt>
            <dd>{thread.source}</dd>
          </div>
          <div>
            <dt>Urgency</dt>
            <dd className={`thread-card__urgency thread-card__urgency--${URGENCY_CLASS[thread.urgency]?.toLowerCase()}`}>
              {thread.urgency}
            </dd>
          </div>
          <div>
            <dt>Signal weight</dt>
            <dd>{thread.signalWeight?.toFixed ? thread.signalWeight.toFixed(2) : '—'}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatTime(thread.updatedAt)}</dd>
          </div>
          {extras.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="msgs-section">
          <p className="side-label">Trail — messages leading here</p>
          {messagesError ? (
            <p className="msgs-error">{messagesError}</p>
          ) : messages === null ? (
            <p className="msgs-error">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="msgs-error">No messages yet — start the trail below.</p>
          ) : (
            <ol className="msgs">
              {messages.map((message) => (
                <li key={message.id} className="msg">
                  <span className="msg__dot" />
                  <div className="msg__bubble">
                    <div className="msg__meta">
                      <span className="msg__author">{message.author}</span>
                      <span className="msg__time">{formatTime(message.createdAt)}</span>
                    </div>
                    <p className="msg__body">{message.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <form className="composer" onSubmit={sendMessage}>
            <input
              className="composer__author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Your name"
              aria-label="Your name"
            />
            <input
              className="composer__body"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a message to this thread…"
              aria-label="Message"
            />
            <button type="submit" className="btn btn--primary btn--small" disabled={sending || !draft.trim()}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
