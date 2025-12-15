'use client';

import { useEffect, useState, useMemo } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, orderBy, query, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuthInstance, getDbInstance } from '@/lib/firebase';
import { adminEmails } from '@/lib/config';

interface StoredUser {
  id: string;
  name: string;
  company: string;
  email?: string;
  consentAccepted?: boolean;
  createdAt?: string;
  lastScore?: number;
  lastTotalQuestions?: number;
  lastQuizCompleted?: string;
}

interface QuizResponse {
  id: string;
  userName: string;
  userCompany: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

interface FeedbackEntry {
  id: string;
  userName: string;
  interestedInMore: string;
  questions: string;
  submittedAt: string;
}

export default function AdminPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(60);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveMessage, setConfigSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user?.email && adminEmails.includes(user.email.toLowerCase())) {
        setIsAuthorized(true);
        loadData();
      } else {
        setIsAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const db = getDbInstance();
      const usersSnapshot = await getDocs(query(collection(db, 'users')));
      const responsesSnapshot = await getDocs(query(collection(db, 'quizResponses'), orderBy('completedAt', 'desc')));
      const feedbackSnapshot = await getDocs(query(collection(db, 'feedback'), orderBy('submittedAt', 'desc')));

      setUsers(
        usersSnapshot.docs.map((doc) => {
          const data = doc.data() as StoredUser;
          const { id: _ignored, ...rest } = data;
          return { id: doc.id, ...rest };
        })
      );

      setResponses(
        responsesSnapshot.docs.map((doc) => {
          const data = doc.data() as QuizResponse;
          const { id: _ignored, ...rest } = data;
          return { id: doc.id, ...rest };
        })
      );

      setFeedback(
        feedbackSnapshot.docs.map((doc) => {
          const data = doc.data() as FeedbackEntry;
          const { id: _ignored, ...rest } = data;
          return { id: doc.id, ...rest };
        })
      );

      // Load configuration
      const configDoc = await getDoc(doc(db, 'config', 'quiz'));
      if (configDoc.exists()) {
        const configData = configDoc.data();
        if (configData.questionCount && typeof configData.questionCount === 'number') {
          setQuestionCount(configData.questionCount);
        }
      }
    } catch (err) {
      console.error('Error loading admin data', err);
      setError('Unable to load admin data. Please check your permissions.');
    }
  };

  const handleSaveConfig = async () => {
    if (questionCount < 1 || questionCount > 500) {
      setConfigSaveMessage('Question count must be between 1 and 500');
      return;
    }

    setIsSavingConfig(true);
    setConfigSaveMessage(null);
    try {
      const db = getDbInstance();
      await setDoc(doc(db, 'config', 'quiz'), {
        questionCount: questionCount,
        updatedAt: new Date().toISOString(),
      });
      setConfigSaveMessage('Configuration saved successfully!');
      setTimeout(() => setConfigSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving config', err);
      setConfigSaveMessage('Failed to save configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = getAuthInstance();
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuthInstance();
    await signOut(auth);
    setUsers([]);
    setResponses([]);
    setFeedback([]);
  };

  const avgPercentage = useMemo(() => {
    if (!responses.length) return 0;
    const total = responses.reduce((sum, resp) => sum + (resp.percentage || 0), 0);
    return Math.round(total / responses.length);
  }, [responses]);

  const interestedYes = useMemo(
    () => feedback.filter((entry) => entry.interestedInMore === 'yes').length,
    [feedback]
  );

  if (!authUser) {
    return (
      <main className="container">
        <div className="card" style={{ maxWidth: 480, margin: '2rem auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div>
              <label className="label" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p style={{ color: '#dc3545', marginBottom: '0.5rem' }}>{error}</p>}
            <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="container">
        <div className="card" style={{ maxWidth: 480, margin: '2rem auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Unauthorized</h1>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>This account is not allowed to view admin data.</p>
          <button className="btn" onClick={handleLogout} style={{ width: '100%' }}>
            Switch Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <div className="quiz-header" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="pill">Admin mode</span>
            <h1 className="hero-title" style={{ fontSize: '2.2rem' }}>Engagement Command Center</h1>
            <p className="meta-sub">Monitor quiz uptake, responses, and feedback. Data auto-expires after 30 days.</p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        <div className="stats-row" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <p className="stat-label">Participants</p>
            <p className="stat-value">{users.length}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <p className="stat-label">Responses</p>
            <p className="stat-value">{responses.length}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <p className="stat-label">Avg. accuracy</p>
            <p className="stat-value">{avgPercentage}%</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✨</span>
            <p className="stat-label">Interested in more</p>
            <p className="stat-value">{interestedYes}</p>
          </div>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <div className="section-heading">
            <h2>Quiz Configuration</h2>
            <span className="pill">Settings</span>
          </div>
          <div className="glass-card">
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" htmlFor="question-count">
                Number of Questions per Quiz
              </label>
              <input
                id="question-count"
                className="input"
                type="number"
                min="1"
                max="500"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 60)}
                style={{ maxWidth: '200px', marginTop: '0.5rem' }}
              />
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Set the number of questions that will be shown in each quiz (1-500)
              </p>
            </div>
            {configSaveMessage && (
              <p style={{ 
                color: configSaveMessage.includes('successfully') ? '#1dd1a1' : '#f85032', 
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}>
                {configSaveMessage}
              </p>
            )}
            <button 
              className="btn" 
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
            >
              {isSavingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div className="section-heading">
            <h2>Participants</h2>
            <span className="pill">{users.length} total</span>
          </div>
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Consent</th>
                  <th>Last Score</th>
                  <th>Last Played</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.company}</td>
                    <td>{user.email || '—'}</td>
                    <td>{user.consentAccepted ? 'Yes' : 'No'}</td>
                    <td>
                      {user.lastScore !== undefined && user.lastTotalQuestions
                        ? `${user.lastScore}/${user.lastTotalQuestions}`
                        : '—'}
                    </td>
                    <td>{user.lastQuizCompleted ? new Date(user.lastQuizCompleted).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div className="section-heading">
            <h2>Quiz Responses</h2>
            <span className="pill">{responses.length} sessions</span>
          </div>
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id}>
                    <td>
                      {response.userName}
                      <br />
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                        {response.userEmail || 'No email'}
                      </span>
                    </td>
                    <td>{response.userCompany}</td>
                    <td>
                      {response.score}/{response.totalQuestions} ({response.percentage}%)
                    </td>
                    <td>{new Date(response.completedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Feedback</h2>
            <span className="pill">{feedback.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feedback.map((entry) => (
              <div key={entry.id} className="glass-card">
                <p style={{ marginBottom: '0.25rem', fontWeight: 600, color: '#fff' }}>
                  {entry.userName || 'Unknown'} &middot; {entry.interestedInMore || 'No response'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.25rem' }}>
                  {entry.questions || 'No questions submitted.'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  Submitted {new Date(entry.submittedAt).toLocaleString()}
                </p>
              </div>
            ))}
            {feedback.length === 0 && <p style={{ color: 'rgba(255,255,255,0.7)' }}>No feedback submissions yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

