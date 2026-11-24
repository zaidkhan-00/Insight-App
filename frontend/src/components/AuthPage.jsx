import { useState } from 'react';
import { api, token } from '../api.js';

export default function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };
      const result = mode === 'login' ? await api.login(body) : await api.register(body);
      token.set(result.token);
      onAuthed(result.user);
    } catch (err) {
      if (err.message === 'BACKEND_OFFLINE') setError('API offline — start the backend on :8080.');
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__aside">
        <div className="brand">
          <span className="brand__mark" />
          <span className="brand__word">
            INSIGHT<span className="brand__sup">APP</span>
          </span>
        </div>
        <p className="auth__tag">Every thread. One clear signal.</p>
        <ul className="auth__points">
          <li>All your threads — chat, docs, commits — in one workspace</li>
          <li>A parallel scanner distills today's loudest signal</li>
          <li>Message trails keep the full story behind every thread</li>
        </ul>
        <p className="auth__foot">workspace · port 5173 → api :8080</p>
      </aside>

      <main className="auth__main">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card__tabs">
            <button
              type="button"
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => switchMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => switchMode('register')}
            >
              Create account
            </button>
          </div>

          {mode === 'register' && (
            <div className="field">
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                value={form.name}
                onChange={set('name')}
                placeholder="Ada Lovelace"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {error && <p className="auth-card__error">{error}</p>}

          <button type="submit" className="btn btn--primary auth-card__submit" disabled={busy}>
            {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p className="auth-card__demo">
            Demo account — <span>demo@insight.app</span> · <span>insight123</span>
          </p>
        </form>
      </main>
    </div>
  );
}
