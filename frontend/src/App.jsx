import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import './Style/Auth.css';
import { Navbar } from './Components/Navbar';
import { Home } from './Pages/Home';
import { Entry } from './Pages/Entry';
import { Donate } from './Pages/Donate';
import { Profile } from './Pages/Profile';
import { WasteDetails } from './Pages/WasteDetails';
import { Login } from './Pages/Login';
import { Signup } from './Pages/Signup';
import {UpdatePage} from "./Pages/UpdatePage.jsx";
import { NgoDashboard } from './Pages/NgoDashboard';

function ProtectedRoute({ account, checking, children }) {
  if (checking) return <main className="auth-loading">Loading your account…</main>;
  return account ? (account.accountType ? children : <Navigate to="/choose-account" replace />) : <Navigate to="/login" replace />;
}

function App() {
  const [account, setAccount] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then(setAccount)
      .catch(() => setAccount(null))
      .finally(() => setChecking(false));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAccount(null);
    navigate('/login', { replace: true });
  }

  return (
    <>
      {account && <Navbar account={account} onLogout={logout} />}
      <Routes>
        <Route path="/login" element={account ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={account ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/choose-account" element={checking ? <main className="auth-loading">Loading your account…</main> : account ? (account.accountType ? <Navigate to="/" replace /> : <AccountTypeChoice account={account} onUpdated={setAccount} />) : <Navigate to="/login" replace />} />
        <Route path="/" element={<ProtectedRoute account={account} checking={checking}>{account?.accountType === 'ngo' ? <NgoDashboard /> : <Home user={account?.fullName} />}</ProtectedRoute>} />
        <Route path="/remnant-entry" element={<ProtectedRoute account={account} checking={checking}>{account?.accountType === 'canteen' ? <Entry /> : <Navigate to="/" replace />}</ProtectedRoute>} />
        <Route path="/donate" element={<ProtectedRoute account={account} checking={checking}>{account?.accountType === 'canteen' ? <Donate account={account} /> : <Navigate to="/" replace />}</ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute account={account} checking={checking}><Profile account={account} onAccountUpdated={setAccount} /></ProtectedRoute>} />
        <Route path="/waste/:type" element={<ProtectedRoute account={account} checking={checking}>{account?.accountType === 'canteen' ? <WasteDetails /> : <Navigate to="/" replace />}</ProtectedRoute>} />
        <Route path="/update/:id" element={<ProtectedRoute account={account} checking={checking}>{account?.accountType === 'canteen' ? <UpdatePage/> : <Navigate to="/" replace />}</ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function AccountTypeChoice({ account, onUpdated }) {
  const [error, setError] = useState('');
  const choose = async (accountType) => {
    const response = await fetch('/api/auth/type', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountType }) });
    if (response.ok) { onUpdated(await response.json()); window.location.assign('/'); }
    else setError('Could not save your choice. Please try again.');
  };
  return <main className="auth-page"><section className="auth-card"><p className="auth-eyebrow">FINISH ACCOUNT SETUP</p><h1>Choose your interface</h1><p className="auth-intro">Select how you’ll use Ecolytics to continue as {account.fullName}.</p><div className="auth-form"><button className="auth-submit" onClick={() => choose('canteen')}>Canteen interface</button><button className="auth-submit" onClick={() => choose('ngo')}>NGO interface</button>{error && <p className="auth-error">{error}</p>}</div></section></main>;
}

export default App;
