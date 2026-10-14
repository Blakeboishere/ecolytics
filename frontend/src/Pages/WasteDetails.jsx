import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import '../Style/Dashboard.css';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export const WasteDetails = () => {
  const { type = 'Total' } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const navigate = useNavigate();
  const visibleEntries = useMemo(() => {
    const selected = decodeURIComponent(type).toLowerCase();
    if (selected === 'total') return entries;
    if (selected === 'food') return entries.filter((entry) => entry.remnantType === 'food');
    return entries.filter((entry) => entry.category.toLowerCase() === selected);
  }, [entries, type]);

  const title = decodeURIComponent(type);
  const total = visibleEntries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
  const deleteWaste = async(id) => {
    const response = await fetch(`/api/remnants/${id}`,{
      method: 'DELETE'
    });
    if(response.ok){
      window.location.reload();
    } else{
      setError("Error 404!");
    }
  }
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
        <section className="data-table-card" aria-label={`${title} remnant entries`}>
          <div className="data-table-summary">
            <span>{visibleEntries.length} {visibleEntries.length === 1 ? 'entry' : 'entries'}</span>
            <strong>{total.toFixed(2)} kg</strong>
          </div>
          <div className="data-table-scroll">
            <table className="data-table">
              <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Meal</th><th>Weight</th><th>Recorded</th><th>Update</th><th>Delete</th></tr></thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.itemName}</td>
                    <td>{entry.remnantType === 'food' ? 'Food' : 'Waste'}</td>
                    <td>{entry.category.replaceAll('-', ' ')}</td>
                    <td>{entry.mealType ? entry.mealType === 'non-veg' ? 'Non-vegetarian' : 'Vegetarian' : '—'}</td>
                    <td>{Number(entry.weight).toFixed(2)} kg</td>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td><button className='tableBtn' onClick={() => navigate(`/update/${entry.id}`)}>✏️</button></td>
                    <td><button className='tableBtn' onClick={() => deleteWaste(entry.id)}>🗑️</button></td>
                  </tr>
                ))}
                {visibleEntries.length === 0 && <tr><td className="data-table-empty" colSpan="6">No matching entries yet. Add a remnant entry to see it here.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
};
