import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
}

const copy = {
  login: {
    title: 'Login',
    submitLabel: 'Login',
    linkText: "Don't have an account?",
    linkLabel: 'Register',
    linkTo: '/register',
    errorMessage: 'Invalid username or password',
  },
  register: {
    title: 'Register',
    submitLabel: 'Register',
    linkText: 'Already have an account?',
    linkLabel: 'Login',
    linkTo: '/login',
    errorMessage: 'Registration failed. Username may already exist.',
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }

      navigate('/feed');
    } catch {
      setError(copy[mode].errorMessage);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">{copy[mode].title}</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="auth-input"
            required
            minLength={3}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="auth-input"
            required
            minLength={6}
          />
          <button type="submit" className="button-primary button-primary--full">
            {copy[mode].submitLabel}
          </button>
        </form>
        <p className="auth-link">
          {copy[mode].linkText}{' '}
          <Link to={copy[mode].linkTo} className="link-primary">
            {copy[mode].linkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
