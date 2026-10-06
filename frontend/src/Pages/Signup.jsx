import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      if (response.status === 409) {
        setError('An account with this email already exists. Log in instead.');
        return;
      }
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.detail || 'Please check your details and try again. Use a valid email and a password with at least 8 characters.');
        return;
      }
      navigate('/login?registered=1', { replace: true });
    } catch {
      setError('Could not reach Ecolytics. Check that the app is running and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-signup" aria-labelledby="signup-title">
        <div className="auth-brand-mark" aria-hidden="true">E</div>
        <p className="auth-eyebrow">JOIN THE COMMUNITY</p>
        <h1 id="signup-title">Create your account</h1>
        <p className="auth-intro">Start tracking resources and sharing what your community can use.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full name</label>
          <input id="signup-name" type="text" autoComplete="name" maxLength="100" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" />
          <label htmlFor="signup-email">Email address</label>
          <input id="signup-email" type="email" autoComplete="email" maxLength="254" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
          <label htmlFor="signup-confirm-password">Confirm password</label>
          <input id="signup-confirm-password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </section>
      <p className="auth-footnote">Small actions. A more sustainable future.</p>
    </main>
  );
}
