import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Charts } from '../Components/Charts';
import '../Style/Dashboard.css';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatCountdown(deadline, now) {
  const secondsLeft = Math.max(0, Math.ceil((new Date(deadline).getTime() - now) / 1000));
  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export const WasteDetails = () => {
  const { type = 'Total' } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let active = true;
    fetch('/api/remnants')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your saved entries. Please refresh and try again.');
        return response.json();
      })
      .then((data) => { if (active) setEntries(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  const navigate = useNavigate();
  const visibleEntries = useMemo(() => {
    const selected = decodeURIComponent(type).toLowerCase();
    if (selected === 'total') return entries;
    if (selected === 'food') return entries.filter((entry) => entry.remnantType === 'food');
    return entries.filter((entry) => entry.category.toLowerCase() === selected);
  }, [entries, type]);

  const hasExpiredFood = visibleEntries.some((entry) => entry.remnantType === 'food'
    && entry.donationExpiresAt
    && new Date(entry.donationExpiresAt).getTime() <= now);

  useEffect(() => {
    if (!hasExpiredFood) return undefined;
    let active = true;
    const refreshEntries = () => {
      fetch('/api/remnants')
        .then((response) => (response.ok ? response.json() : []))
        .then((data) => { if (active) setEntries(data); })
        .catch(() => {});
    };
    refreshEntries();
    const refreshTimer = window.setInterval(refreshEntries, 1000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [hasExpiredFood]);

  const title = decodeURIComponent(type);
  const total = visibleEntries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
  const deleteWaste = async (id) => {
    setDeletingId(id);
    setDeleteError('');
    try {
      const response = await fetch(`/api/remnants/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.detail || 'Could not delete this entry. Please try again.');
      }
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (deleteRequestError) {
      setDeleteError(deleteRequestError.message || 'Could not connect to Ecolytics. Try again.');
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <main className="data-page">
      <header className="data-page-header">
        <p className="home-section-kicker">WASTE MANAGEMENT</p>
        <h1>{title} entries</h1>
        <p>Records saved to your account, shown with their latest details.</p>
      </header>
      {loading && <p role="status">Loading entries…</p>}
      {error && <p className="data-feedback" role="alert">{error}</p>}
      {!loading && !error && (
        <>
        <Charts entries={visibleEntries} category={title} />
        {deleteError && <p className="data-feedback" role="alert">{deleteError}</p>}
        <section className="data-table-card" aria-label={`${title} remnant entries`}>
          <div className="data-table-summary">
            <span>{visibleEntries.length} {visibleEntries.length === 1 ? 'entry' : 'entries'}</span>
            <strong>{total.toFixed(2)} kg</strong>
          </div>
          <div className="data-table-scroll">
            <table className="data-table">
              <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Meal</th><th>Weight</th><th>Recorded</th><th>Donation window</th><th>Update</th><th>Delete</th></tr></thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.itemName}</td>
                    <td>{entry.remnantType === 'food' ? 'Food' : 'Waste'}</td>
                    <td>{entry.category.replaceAll('-', ' ')}</td>
                    <td>{entry.mealType ? entry.mealType === 'non-veg' ? 'Non-vegetarian' : 'Vegetarian' : '—'}</td>
                    <td>{Number(entry.weight).toFixed(2)} kg</td>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>{entry.remnantType === 'food' ? (
                      entry.donationExpiresAt && now
                        ? new Date(entry.donationExpiresAt).getTime() <= now
                          ? <span className="donation-timer-expired">Moving to biodegradable…</span>
                          : <span className="donation-timer" aria-label={`${formatCountdown(entry.donationExpiresAt, now)} remaining`}>{formatCountdown(entry.donationExpiresAt, now)}</span>
                        : <span>Preparing timer…</span>
                    ) : '—'}</td>
                    <td><button type="button" className="tableBtn" aria-label={`Edit ${entry.itemName}`} title="Edit entry" onClick={() => navigate(`/update/${entry.id}`)}>✏️</button></td>
                    <td><button type="button" className="tableBtn" aria-label={`Delete ${entry.itemName}`} title="Delete entry" disabled={deletingId === entry.id} onClick={() => deleteWaste(entry.id)}>{deletingId === entry.id ? '⏳' : '🗑️'}</button></td>
                  </tr>
                ))}
                {visibleEntries.length === 0 && <tr><td className="data-table-empty" colSpan="9">No matching entries yet. Add a remnant entry to see it here.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        </>
      )}
    </main>
  );
};
