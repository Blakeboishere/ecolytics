import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../Style/Home.css';
import '../Style/Entry.css';

export function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [remnantType, setRemnantType] = useState('');
  const [itemName, setItemName] = useState('');
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('');
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/remnants/${id}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || 'Could not load this remnant entry.');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setEntry(data);
        setRemnantType(data.remnantType);
        setItemName(data.itemName);
        setWeight(String(data.weight));
        setCategory(data.category);
        setMealType(data.mealType || '');
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function saveEntry(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const request = {
      weight: Number(weight),
      remnantType,
      itemName,
      category,
      mealType: remnantType === 'food' ? mealType : null,
    };
    try {
      const response = await fetch(`/api/remnants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'Could not update this entry. Check the details and try again.');
      navigate('/waste/Total');
    } catch (saveError) {
      setError(saveError.message || 'Could not connect to Ecolytics. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="entry-page">
      <header className="entry-heading">
        <p className="entry-eyebrow">WASTE TRACKING</p>
        <h1>Update remnant entry</h1>
        <p>Edit the saved details below. The entry remains associated with your account.</p>
      </header>
      {loading && <p role="status">Loading entry…</p>}
      {!loading && entry && (
        <section className="waste-form-container" aria-label="Edit remnant details">
          <form className="waste-form" onSubmit={saveEntry}>
            <div className="form-group">
              <label htmlFor="update-weight">Estimated / Exact Weight (kg)</label>
              <input id="update-weight" type="number" min="0.01" step="0.01" max="99999999.99" required value={weight} onChange={(event) => setWeight(event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="update-kind">Remnant Type</label>
              <select id="update-kind" required value={remnantType} onChange={(event) => { setRemnantType(event.target.value); setCategory(''); setMealType(''); }}>
                <option value="food">Edible Food</option>
                <option value="waste">Inedible Waste</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="update-name">{remnantType === 'food' ? 'Food Name' : 'Waste Name'}</label>
              <input id="update-name" type="text" maxLength="120" required value={itemName} onChange={(event) => setItemName(event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="update-category">{remnantType === 'food' ? 'Category' : 'Waste Type'}</label>
              <select id="update-category" required value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="" disabled>Select category</option>
                {remnantType === 'food' ? <>
                  <option value="raw">Raw</option><option value="cooked">Cooked</option><option value="packed">Packed</option>
                </> : <>
                  <option value="biodegradable">Biodegradable</option><option value="non-biodegradable">Non-biodegradable</option>
                </>}
              </select>
            </div>
            {remnantType === 'food' && <div className="form-group">
              <label htmlFor="update-meal">Meal Type</label>
              <select id="update-meal" required value={mealType} onChange={(event) => setMealType(event.target.value)}>
                <option value="" disabled>Select meal type</option>
                <option value="veg">Vegetarian</option><option value="non-veg">Non-vegetarian</option>
              </select>
            </div>}
            {error && <p className="form-feedback form-feedback-error" role="alert">{error}</p>}
            <div className="update-form-actions">
              <Link className="home-text-action" to="/waste/Total">Cancel</Link>
              <button className="new-entry-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </section>
      )}
      {!loading && !entry && <p className="form-feedback form-feedback-error" role="alert">{error || 'This entry could not be found.'}</p>}
    </main>
  );
}
