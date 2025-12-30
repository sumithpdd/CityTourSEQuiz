'use client';

import { useState } from 'react';

interface UserFormProps {
  onSubmit: (data: { name: string; company: string; email?: string; consent: boolean; useAllQuestions?: boolean }) => void;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [useAllQuestions, setUseAllQuestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && company.trim() && consent) {
      onSubmit({
        name: name.trim(),
        company: company.trim(),
        email: email.trim() || undefined,
        consent,
        useAllQuestions,
      });
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>
        Sitecore City Tour London - Quiz
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'rgba(255,255,255,0.8)' }}>
        Test your Sitecore knowledge! Please provide your information to get started.
      </p>
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        This quiz is purely for fun. We only retain your data for 30 days and never use it for marketing purposes.
      </p>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="name">
            Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="company"
            type="text"
            className="input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            placeholder="Enter your company name"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email (Optional)
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="glass-card" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)' }}>
          <label style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              style={{ marginTop: '0.2rem' }}
            />
            <span>
              I understand this quiz is for fun, my data will only be stored for up to 30 days, and it will never be used for marketing purposes.
            </span>
          </label>
        </div>
        <div className="glass-card" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)' }}>
          <label style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
            <input
              type="checkbox"
              checked={useAllQuestions}
              onChange={(e) => setUseAllQuestions(e.target.checked)}
              style={{ marginTop: '0.2rem' }}
            />
            <span>
              Answer all available questions (instead of a random subset)
            </span>
          </label>
        </div>
        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1.5rem' }} disabled={!consent}>
          Start Quiz
        </button>
      </form>
    </div>
  );
}

