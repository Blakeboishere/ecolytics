import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: '', email: '', phone: '', organization: '', location: '', password: '', confirmPassword: '', accountType: 'canteen' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault(); setError('');
    if (values.password !== values.confirmPassword) { setError('The passwords do not match.'); return; }
    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = values;
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.status === 409) { setError('An account with this email already exists. Log in instead.'); return; }
      if (!response.ok) { const result = await response.json().catch(() => ({})); setError(result.detail || 'Please check your details and try again.'); return; }
      navigate('/login?registered=1', { replace: true });
    } catch { setError('Could not reach Ecolytics. Check that the app is running and try again.'); }
    finally { setSubmitting(false); }
  }

  const ngo = values.accountType === 'ngo';
  return <main className="auth-page"><section className="auth-card auth-card-signup" aria-labelledby="signup-title">
    <div className="auth-brand-mark" aria-hidden="true">E</div><p className="auth-eyebrow">JOIN THE COMMUNITY</p>
    <h1 id="signup-title">Create your account</h1><p className="auth-intro">Choose how you’ll use Ecolytics and set up your organization profile.</p>
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="signup-type">Account interface</label><select id="signup-type" value={values.accountType} onChange={set('accountType')}><option value="canteen">Canteen</option><option value="ngo">NGO</option></select>
      <label htmlFor="signup-name">Full name</label><input id="signup-name" autoComplete="name" maxLength="100" required value={values.fullName} onChange={set('fullName')} placeholder="Your name" />
      <label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" maxLength="254" required value={values.email} onChange={set('email')} placeholder="you@example.com" />
      <label htmlFor="signup-phone">Contact number</label><input id="signup-phone" type="tel" autoComplete="tel" maxLength="30" value={values.phone} onChange={set('phone')} placeholder="Phone number" />
      <label htmlFor="signup-organization">{ngo ? 'NGO name' : 'Canteen name'}</label><input id="signup-organization" autoComplete="organization" maxLength="120" required={ngo} value={values.organization} onChange={set('organization')} placeholder={ngo ? 'Organization name' : 'Canteen or organization'} />
      <label htmlFor="signup-location">{ngo ? 'Service area / address' : 'Canteen location'}</label><input id="signup-location" autoComplete="address-level2" maxLength="120" required={ngo} value={values.location} onChange={set('location')} placeholder="City, region" />
      <label htmlFor="signup-password">Password</label><input id="signup-password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={values.password} onChange={set('password')} placeholder="At least 8 characters" />
      <label htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" autoComplete="new-password" required value={values.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" />
      {error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
    </form><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
  </section><p className="auth-footnote">Small actions. A more sustainable future.</p></main>;
}
