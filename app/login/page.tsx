"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);
      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } else {
      // Sign Up Flow
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Signup failed");
          setLoading(false);
          return;
        }

        setSuccess("Account created successfully! Logging you in...");

        // Auto-login after signup
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        setLoading(false);
        if (loginRes?.error) {
          setError("Failed to auto-login. Please sign in manually.");
          setMode("login");
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err: any) {
        setError("Network error occurred during signup");
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: "google-mock@example.com",
      password: "oauth123",
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Failed mock Google login authentication");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleGithubSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: "github-mock@example.com",
      password: "oauth123",
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Failed mock GitHub login authentication");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Sign In / Sign Up Selector Tabs */}
        <div className="admin-tabs" style={{ marginBottom: "2rem", justifyContent: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
          <button 
            type="button"
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`} 
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{ padding: "8px 24px", fontSize: "1rem", border: "none", cursor: "pointer" }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`tab-btn ${mode === 'signup' ? 'active' : ''}`} 
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            style={{ padding: "8px 24px", fontSize: "1rem", border: "none", cursor: "pointer" }}
          >
            Sign Up
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="subtitle">
          {mode === "login" 
            ? "Sign in to your Foody Moody account" 
            : "Sign up to start ordering delicious premium food"}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.9rem' }}>{success}</div>}

        <form onSubmit={handleCredentialsSubmit} className="auth-form">
          {mode === "signup" && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder={mode === "login" ? "admin@example.com" : "jane@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder={mode === "login" ? "admin123" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "signup" && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-btn credentials-btn">
            {loading 
              ? "Processing..." 
              : mode === "login" 
                ? "Sign In with Email" 
                : "Register Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-social">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="auth-btn google-btn"
          >
            <span className="icon">G</span> {mode === "login" ? "Sign in" : "Sign up"} with Google
          </button>
          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={loading}
            className="auth-btn github-btn"
          >
            <span className="icon">GH</span> {mode === "login" ? "Sign in" : "Sign up"} with GitHub
          </button>
        </div>
        
        {mode === "login" && (
          <div className="demo-credentials">
            <p>Demo Credentials:</p>
            <ul>
              <li>Admin: admin@example.com / admin123</li>
              <li>User: user@example.com / user123</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="auth-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><p>Loading...</p></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
