import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your admin email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (loginError) throw loginError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('This account does not have administrator access.');
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <form onSubmit={handleLogin} className="admin-login-form" noValidate={false}>
        <div className="admin-login-brand">
          <span className="admin-brand-mark" aria-hidden="true">
            S
          </span>
          <div>
            <strong>
              SYNC<span>RA</span>
            </strong>
            <small>PRIVATE MANAGEMENT CONSOLE</small>
          </div>
        </div>

        <h1>Sign in to Admin</h1>
        <p>Authorized Syncra administrators only.</p>

        <label htmlFor="admin-email">Email address *</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your admin email"
          autoComplete="username"
          required
        />

        <label htmlFor="admin-password">Password *</label>
        <div className="admin-password-wrap">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="admin-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && (
          <p role="alert" className="admin-login-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in to Dashboard →'}
        </button>
      </form>
    </main>
  );
}
