import { useState } from 'react';

const URGENCIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TYPES = ['CHAT', 'DOC', 'COMMIT'];

export default function NewThreadForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    type: 'CHAT',
    title: '',
    source: '',
    summary: '',
    urgency: 'MEDIUM',
    messageCount: 5,
    sectionCount: 3,
    filesChanged: 2,
    additions: 50,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <form className="drawer drawer--form" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="drawer__head">
          <p className="kicker">New thread</p>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="field">
          <label htmlFor="nt-type">Type</label>
          <select id="nt-type" value={form.type} onChange={set('type')}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="nt-title">Title</label>
          <input
            id="nt-title"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Pricing feedback flood"
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="nt-source">Source</label>
          <input
            id="nt-source"
            value={form.source}
            onChange={set('source')}
            placeholder="channel, repo or tool"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="nt-summary">Summary</label>
          <textarea
            id="nt-summary"
            rows={3}
            value={form.summary}
            onChange={set('summary')}
            placeholder="What is happening in this thread?"
          />
        </div>

        <div className="field">
          <label htmlFor="nt-urgency">Urgency</label>
          <select id="nt-urgency" value={form.urgency} onChange={set('urgency')}>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {form.type === 'CHAT' && (
          <div className="field field--inline">
            <label htmlFor="nt-messages">Messages</label>
            <input id="nt-messages" type="number" min="0" value={form.messageCount} onChange={set('messageCount')} />
          </div>
        )}
        {form.type === 'DOC' && (
          <div className="field field--inline">
            <label htmlFor="nt-sections">Sections</label>
            <input id="nt-sections" type="number" min="0" value={form.sectionCount} onChange={set('sectionCount')} />
          </div>
        )}
        {form.type === 'COMMIT' && (
          <div className="field-row">
            <div className="field field--inline">
              <label htmlFor="nt-files">Files changed</label>
              <input id="nt-files" type="number" min="0" value={form.filesChanged} onChange={set('filesChanged')} />
            </div>
            <div className="field field--inline">
              <label htmlFor="nt-adds">Additions</label>
              <input id="nt-adds" type="number" min="0" value={form.additions} onChange={set('additions')} />
            </div>
          </div>
        )}

        <div className="drawer__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add thread'}
          </button>
        </div>
      </form>
    </div>
  );
}
