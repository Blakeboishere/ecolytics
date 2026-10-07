import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes } from '../Components/Boxes';
import '../Style/Home.css';
import '../Style/Dashboard.css';

const kilograms = (entries) => entries.reduce((total, entry) => total + Number(entry.weight || 0), 0);
const formatKg = (value) => Number(value.toFixed(2));

export const Home = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/remnants')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your remnant entries. Please refresh and try again.');
        return response.json();
      })
      .then((data) => { if (active) setEntries(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const summaries = useMemo(() => {
    const food = entries.filter((entry) => entry.remnantType === 'food');
    const biodegradable = entries.filter((entry) => entry.category === 'biodegradable');
    const nonBiodegradable = entries.filter((entry) => entry.category === 'non-biodegradable');
    return [
      { title: 'Total recorded', entries, description: `${entries.length} saved ${entries.length === 1 ? 'entry' : 'entries'}`, type: 'total', route: 'Total' },
      { title: 'Food remnants', entries: food, description: 'Edible food entries', type: 'food', route: 'Food' },
      { title: 'Biodegradable', entries: biodegradable, description: 'Biodegradable waste', type: 'organic', route: 'Biodegradable' },
      { title: 'Non-biodegradable', entries: nonBiodegradable, description: 'Non-biodegradable waste', type: 'other', route: 'Non-biodegradable' },
    ].map((item) => ({ ...item, value: formatKg(kilograms(item.entries)) }));
  }, [entries]);

  return (
    <main className="home-dashboard">
      <header className="home-welcome">
        <div className="home-welcome-copy">
          <p className="home-eyebrow"><span aria-hidden="true" /> YOUR ECOLYTICS DASHBOARD</p>
          <h1>Welcome back, <span>{user || 'there'}</span></h1>
          <p className="home-description">A clear view of resources recorded in your account, with simple ways to put surplus to good use.</p>
        </div>
        <Link className="home-primary-action" to="/remnant-entry">
          <span className="home-action-plus" aria-hidden="true">+</span>
          Add remnant entry
        </Link>
      </header>

      <section className="home-overview" aria-labelledby="home-overview-title">
        <div className="home-section-heading">
          <div>
            <p className="home-section-kicker">RESOURCE SNAPSHOT</p>
            <h2 id="home-overview-title">Waste overview</h2>
          </div>
          <span className="home-unit-label">Measured in kilograms</span>
        </div>
        {loading ? <p role="status">Loading your saved entries…</p> : null}
        {error ? <p className="data-feedback" role="alert">{error}</p> : null}
        {!loading && !error && (
          <div className="home-stat-grid">
            {summaries.map((item) => (
              <Link key={item.type} to={`/waste/${item.route}`} className="home-stat-link" aria-label={`${item.title}: ${item.value} kilograms. View details`}>
                <Boxes {...item} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="home-next-step" aria-labelledby="home-next-step-title">
        <div className="home-next-step-mark" aria-hidden="true">↗</div>
        <div className="home-next-step-copy">
          <p className="home-section-kicker">MAKE THE NEXT MOVE</p>
          <h2 id="home-next-step-title">Give surplus a second life</h2>
          <p>Record new remnants or explore donation options to connect useful resources with people who need them.</p>
        </div>
        <div className="home-next-step-actions">
          <Link to="/donate" className="home-secondary-action">Explore donations</Link>
          <Link to="/remnant-entry" className="home-text-action">Record a remnant <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
};
