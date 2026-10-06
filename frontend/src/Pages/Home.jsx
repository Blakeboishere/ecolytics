import { Link } from 'react-router-dom';
import { Boxes } from '../Components/Boxes';
import '../Style/Home.css';
import '../Style/Dashboard.css';

const summaries = [
  { title: 'Total waste', value: 100, description: 'Across all waste types', type: 'total', route: 'Total' },
  { title: 'Plastic', value: 25, description: 'Ready for recycling', type: 'plastic', route: 'Plastic' },
  { title: 'Food', value: 50, description: 'Potential to be shared', type: 'food', route: 'Food' },
  { title: 'Other materials', value: 10, description: 'Additional waste streams', type: 'other', route: 'Others' },
];

export const Home = ({ user }) => (
  <main className="home-dashboard">
    <header className="home-welcome">
      <div className="home-welcome-copy">
        <p className="home-eyebrow"><span aria-hidden="true" /> YOUR ECOLYTICS DASHBOARD</p>
        <h1>Welcome back, <span>{user || 'there'}</span></h1>
        <p className="home-description">A clear view of your resources, with simple ways to put surplus to good use.</p>
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

      <div className="home-stat-grid">
        {summaries.map((item) => (
          <Link key={item.type} to={`/waste/${item.route}`} className="home-stat-link" aria-label={`${item.title}: ${item.value} kilograms. View details`}>
            <Boxes {...item} />
          </Link>
        ))}
      </div>
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
