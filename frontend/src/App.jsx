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

function ProtectedRoute({ account, checking, children }) {
  if (checking) return <main className="auth-loading">Loading your account…</main>;
  return account ? children : <Navigate to="/login" replace />;
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
        <Route path="/" element={<ProtectedRoute account={account} checking={checking}><Home user={account?.fullName} /></ProtectedRoute>} />
        <Route path="/remnant-entry" element={<ProtectedRoute account={account} checking={checking}><Entry /></ProtectedRoute>} />
        <Route path="/donate" element={<ProtectedRoute account={account} checking={checking}><Donate /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute account={account} checking={checking}><Profile account={account} onAccountUpdated={setAccount} /></ProtectedRoute>} />
        <Route path="/waste/:type" element={<ProtectedRoute account={account} checking={checking}><WasteDetails /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
