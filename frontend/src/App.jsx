import { useCallback, useEffect, useState } from 'react';
import { api, token } from './api.js';
import Sidebar from './components/Sidebar.jsx';
import SignalHero from './components/SignalHero.jsx';
import ThreadList from './components/ThreadList.jsx';
import ThreadDetail from './components/ThreadDetail.jsx';
import NewThreadForm from './components/NewThreadForm.jsx';
import AuthPage from './components/AuthPage.jsx';

const REFRESH_MS = 20000;

export default function App() {
  // undefined = session check in progress; null = signed out; object = signed in
  const [user, setUser] = useState(undefined);
  const [threads, setThreads] = useState([]);
  const [signal, setSignal] = useState(null);
  const [scan, setScan] = useState(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const flash = useCallback((message, kind = 'ok') => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      const [threadData, signalData] = await Promise.all([api.threads(), api.signal()]);
      setThreads(threadData);
      setSignal(signalData);
      setOffline(false);
    } catch (error) {
      if (error.message === 'AUTH_REQUIRED') {
        setUser(null);
        return;
      }
      if (error.message === 'BACKEND_OFFLINE') setOffline(true);
      else flash(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [flash]);

  // Session check on boot
  useEffect(() => {
    if (!token.get()) {
      setUser(null);
      return;
    }
    api
      .me()
      .then((me) => {
        setUser(me);
      })
      .catch(() => setUser(null));
  }, []);

  // Poll for fresh data once signed in
  useEffect(() => {
    if (!user) return undefined;
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [user, load]);

  const handleScan = useCallback(async () => {
    setScanning(true);
    try {
      const result = await api.scan();
      setScan(result.scan);
      setSignal(result.signal);
      setOffline(false);
      flash(
        `Scan complete — ${result.scan.succeeded}/${result.scan.requested} threads in ${result.scan.durationMs} ms across ${result.scan.workerThreads} workers`
      );
    } catch (error) {
      if (error.message === 'AUTH_REQUIRED') setUser(null);
      else if (error.message === 'BACKEND_OFFLINE') setOffline(true);
      else flash(error.message, 'error');
    } finally {
      setScanning(false);
    }
  }, [flash]);

  const handleCreate = useCallback(
    async (payload) => {
      try {
        const created = await api.createThread(payload);
        setShowForm(false);
        flash(`Thread "${created.title}" added`);
        await load();
        setSelectedId(created.id);
      } catch (error) {
        if (error.message === 'AUTH_REQUIRED') setUser(null);
        else if (error.message === 'BACKEND_OFFLINE') setOffline(true);
        flash(error.message, 'error');
      }
    },
    [flash, load]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await api.deleteThread(id);
        if (selectedId === id) setSelectedId(null);
        flash('Thread removed');
        await load();
      } catch (error) {
        if (error.message === 'AUTH_REQUIRED') setUser(null);
        else if (error.message === 'BACKEND_OFFLINE') setOffline(true);
        flash(error.message, 'error');
      }
    },
    [flash, load, selectedId]
  );

  const signOut = useCallback(() => {
    api.logout().catch(() => {});
    token.clear();
    setThreads([]);
    setSignal(null);
    setScan(null);
    setSelectedId(null);
    setUser(null);
  }, []);

  // Boot splash while the session is being checked
  if (user === undefined) {
    return <div className="boot">INSIGHT · checking session…</div>;
  }

  // Signed out → auth screen
  if (!user) {
    return <AuthPage onAuthed={(me) => setUser(me)} />;
  }

  const selected = threads.find((t) => t.id === selectedId) || null;

  return (
    <div className="app">
      <Sidebar
        user={user}
        onSignOut={signOut}
        threads={threads}
        filter={filter}
        onFilter={setFilter}
        onNewThread={() => setShowForm(true)}
        scanning={scanning}
        scan={scan}
        offline={offline}
        onScan={handleScan}
      />

      <main className="main">
        {offline && (
          <div className="banner banner--error">
            <span className="banner__dot" />
            Backend offline — start the Spring Boot server (port 8080) to load live data.
          </div>
        )}

        <SignalHero signal={signal} loading={loading} scanning={scanning} onScan={handleScan} />

        <ThreadList
          threads={threads}
          filter={filter}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={handleDelete}
          onNewThread={() => setShowForm(true)}
        />
      </main>

      {selected && <ThreadDetail thread={selected} onClose={() => setSelectedId(null)} />}
      {showForm && (
        <NewThreadForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {toast && <div className={`toast toast--${toast.kind}`}>{toast.message}</div>}
    </div>
  );
}
