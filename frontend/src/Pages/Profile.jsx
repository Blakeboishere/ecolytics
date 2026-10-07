import { useEffect, useMemo, useState } from 'react';
import '../Style/Profile.css';
import { SectionTitle } from '../Components/SectionTitle';
import { DetailItem } from '../Components/DetailItem';
import { SummaryCard } from '../Components/SummaryCard';

const totalWeight = (entries) => entries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);

export const Profile = ({ account, onAccountUpdated }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [phone, setPhone] = useState(account.phone || '');
    const [organization, setOrganization] = useState(account.organization || '');
    const [location, setLocation] = useState(account.location || '');

    useEffect(() => {
        let active = true;
        fetch('/api/remnants')
            .then(async (response) => {
                if (!response.ok) throw new Error('Could not load your account activity. Please refresh and try again.');
                return response.json();
            })
            .then((data) => { if (active) setEntries(data); })
            .catch((requestError) => { if (active) setError(requestError.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        setPhone(account.phone || '');
        setOrganization(account.organization || '');
        setLocation(account.location || '');
    }, [account]);

    async function saveProfile(event) {
        event.preventDefault();
        setSavingProfile(true);
        setProfileError('');
        setProfileSuccess('');
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, organization, location }),
            });
            const updatedAccount = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(updatedAccount.detail || 'Could not save your profile. Try again.');
            onAccountUpdated(updatedAccount);
            setEditing(false);
            setProfileSuccess('Profile details saved.');
        } catch (saveError) {
            setProfileError(saveError.message || 'Could not connect to Ecolytics. Try again.');
        } finally {
            setSavingProfile(false);
        }
    }

    const summaryData = useMemo(() => {
        const foodEntries = entries.filter((entry) => entry.remnantType === 'food');
        const wasteEntries = entries.filter((entry) => entry.remnantType === 'waste');
        return [
            { icon: '↗', value: `${totalWeight(entries).toFixed(2)} kg`, label: 'Total recorded' },
            { icon: '♧', value: `${totalWeight(foodEntries).toFixed(2)} kg`, label: 'Food remnants' },
            { icon: '♲', value: `${totalWeight(wasteEntries).toFixed(2)} kg`, label: 'Other waste' },
            { icon: '▤', value: entries.length, label: 'Saved entries' },
        ];
    }, [entries]);

    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-avatar" aria-hidden="true">{account.fullName.charAt(0).toUpperCase()}</div>
                <div className="profile-info">
                    <h1>{account.fullName}</h1>
                    <p>Ecolytics account</p>
                    <span>{account.email}</span>
                </div>
                <button className="edit-profile-btn" type="button" onClick={() => { setEditing((value) => !value); setProfileError(''); }}>
                    {editing ? 'Cancel editing' : 'Edit profile'}
                </button>
            </section>

            {editing && <form className="profile-edit-form" onSubmit={saveProfile}>
                <h2>Edit profile details</h2>
                <label htmlFor="profile-phone">Phone number</label>
                <input id="profile-phone" type="tel" maxLength="30" value={phone} onChange={(event) => setPhone(event.target.value)} />
                <label htmlFor="profile-organization">Organization</label>
                <input id="profile-organization" type="text" maxLength="120" value={organization} onChange={(event) => setOrganization(event.target.value)} />
                <label htmlFor="profile-location">Location</label>
                <input id="profile-location" type="text" maxLength="120" value={location} onChange={(event) => setLocation(event.target.value)} />
                {profileError && <p className="data-feedback" role="alert">{profileError}</p>}
                <button className="edit-profile-btn" type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
            </form>}
            {profileSuccess && <p className="profile-save-success" role="status">{profileSuccess}</p>}

            <section className="profile-details">
                <SectionTitle className="section-title" label="USER MANAGEMENT" title="Account Information" />
                <div className="details-grid">
                    <DetailItem label="Full Name" value={account.fullName} />
                    <DetailItem label="Email" value={account.email} />
                    <DetailItem label="Phone" value={account.phone || 'Not provided'} />
                    <DetailItem label="Organization" value={account.organization || 'Not provided'} />
                    <DetailItem label="Location" value={account.location || 'Not provided'} />
                    <DetailItem label="Member Since" value={account.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(account.createdAt)) : 'Not available for existing account'} />
                    <DetailItem label="Account Status" value="Active" className="status-active" />
                </div>
            </section>

            <section className="donation-summary">
                <SectionTitle label="WASTE MANAGEMENT" title="Your Recorded Resources" description="Totals are calculated from entries saved to your account." />
                {loading && <p role="status">Loading your entries…</p>}
                {error && <p className="data-feedback" role="alert">{error}</p>}
                {!loading && !error && <div className="summary-grid">{summaryData.map((item) => <SummaryCard key={item.label} {...item} />)}</div>}
            </section>

            <section className="donation-history">
                <SectionTitle label="RECENT ACTIVITY" title="Your Waste Entries" description="The latest records stored for this account." />
                {loading && <p role="status">Loading entries…</p>}
                {error && <p className="data-feedback" role="alert">{error}</p>}
                {!loading && !error && (
                    <div className="table-container">
                        <table className="profile-entry-table">
                            <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Weight</th><th>Date recorded</th></tr></thead>
                            <tbody>
                                {entries.slice(0, 10).map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{entry.itemName}</td>
                                        <td>{entry.remnantType === 'food' ? 'Food' : 'Waste'}</td>
                                        <td>{entry.category.replaceAll('-', ' ')}</td>
                                        <td>{Number(entry.weight).toFixed(2)} kg</td>
                                        <td>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(entry.createdAt))}</td>
                                    </tr>
                                ))}
                                {entries.length === 0 && <tr><td colSpan="5">No entries yet. Add a remnant entry to start your activity history.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
};
