import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!response.ok) {
        setError('That email and password combination was not found. Try again or create an account.');
        return;
      }
      window.location.assign('/');
    } catch {
      setError('Could not reach Ecolytics. Check that the app is running and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand-mark" aria-hidden="true">E</div>
        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1 id="login-title">Log in to Ecolytics</h1>
        <p className="auth-intro">Continue making a difference with every resource you save.</p>
        {searchParams.get('registered') === '1' && <p className="auth-success" role="status">Your account is ready. Log in to continue.</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="auth-switch">New to Ecolytics? <Link to="/signup">Create an account</Link></p>
      </section>
      <p className="auth-footnote">Small actions. A more sustainable future.</p>
    </main>
  );
}
