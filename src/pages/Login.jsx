import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { setAuth, isAuthenticated } from '../utils/auth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'emilys', password: 'emilyspass' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Already logged in → go to products
  if (isAuthenticated()) {
    return <Navigate to="/products" replace />;
  }

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    if (!form.password.trim()) errs.password = 'Password is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };
/*
So when user clicks Login:
Submit form
   ↓
handleSubmit()
 */
  const handleSubmit = async (e) => {
    //normally when in html we submit a form, the page reloads. 
    // But in React, we want to handle the form submission in JavaScript without reloading the page. 
    // e.preventDefault() stops the default form submission behavior.
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) return;

    setIsLoading(true);
    setApiError('');

    try {
      const data = await login(form.username, form.password);
      // Store token and user info
      setAuth(data.accessToken, {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        image: data.image,
        username: data.username,
      });
      navigate('/products', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🛒</div>
          <h1 className="login-title">Product Admin</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="login-form">
          {apiError && <div className="login-api-error">{apiError}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className={errors.username ? 'input-error' : ''}
              autoComplete="username"
              autoFocus
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-hint">
          Demo: <strong>emilys</strong> / <strong>emilyspass</strong>
        </p>
      </div>
    </div>
  );
};

export default Login;
