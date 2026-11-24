const TYPE_META = {
  CHAT: { label: 'Chat', glyph: '◆' },
  DOC: { label: 'Doc', glyph: '◇' },
  COMMIT: { label: 'Commit', glyph: '⬡' },
};

const URGENCY_CLASS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export { TYPE_META, URGENCY_CLASS };

export function formatType(type) {
  return TYPE_META[type]?.label ?? type;
}

export function formatTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
