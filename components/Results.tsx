'use client';

import { useState } from 'react';
import { getDbInstance } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

interface ResultsProps {
  results: {
    userId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    questionResults: Array<{
      question: string;
      correctAnswer: string;
      selectedAnswer: string;
      isCorrect: boolean;
    }>;
  };
  userData: {
    name: string;
    company: string;
    email?: string;
  } | null;
}

export function Results({ results, userData }: ResultsProps) {
  const [interested, setInterested] = useState<'yes' | 'no' | ''>('');
  const [questions, setQuestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interested && !questions.trim()) {
      setSubmitMessage('Please let us know if you are interested or share a question.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      const db = getDbInstance();
      await addDoc(collection(db, 'feedback'), {
        userId: results.userId,
        userName: userData?.name || '',
        userCompany: userData?.company || '',
        userEmail: userData?.email || '',
        interestedInMore: interested || null,
        questions: questions.trim(),
        submittedAt: new Date().toISOString(),
      });
      setSubmitMessage('Thanks for the feedback! We appreciate it.');
      setInterested('');
      setQuestions('');
    } catch (error) {
      console.error('Error submitting feedback', error);
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="results-container">
      <span className="pill" style={{ marginBottom: '1rem' }}>Quiz complete</span>
      <h1 style={{ color: '#fff', marginBottom: '0.5rem' }}>Nice work, {userData?.name?.split(' ')[0] || 'friend'}!</h1>
      <p className="thank-you">
        Thanks for jumping in with {userData?.company}. Here’s your quick recap.
      </p>

      <div className="stats-row" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card">
          <p className="stat-label">Score</p>
          <p className="stat-value">
            {results.score}/{results.totalQuestions}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Accuracy</p>
          <p className="stat-value">{results.percentage}%</p>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
        We auto-delete every submission after 30 days.
      </p>

      <div style={{ marginTop: '3rem', textAlign: 'left' }}>
        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Your Answers</h2>
        <div className="dashboard-grid">
          {results.questionResults.map((result, index) => (
            <div key={index} className="glass-card" style={{ background: result.isCorrect ? 'rgba(29, 209, 161, 0.1)' : 'rgba(248, 80, 50, 0.08)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
                Q{index + 1}. {result.question}
              </p>
              <p style={{ color: result.isCorrect ? '#1dd1a1' : '#f85032', marginBottom: '0.25rem', fontWeight: 600 }}>
                {result.isCorrect ? '✓ Correct' : '✗ Your answer'}: {result.selectedAnswer}
              </p>
              {!result.isCorrect && (
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                  Correct answer: {result.correctAnswer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'left', width: '100%' }}>
        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Feedback</h2>
        <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.75)' }}>
          Are you interested in learning more? Any questions we can help with?
        </p>
        <form onSubmit={handleFeedbackSubmit} className="glass-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Interested in knowing more?</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                <input
                  type="radio"
                  name="interested"
                  value="yes"
                  checked={interested === 'yes'}
                  onChange={() => setInterested('yes')}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                <input
                  type="radio"
                  name="interested"
                  value="no"
                  checked={interested === 'no'}
                  onChange={() => setInterested('no')}
                />
                Not right now
              </label>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="questions">
              Questions or feedback
            </label>
            <textarea
              id="questions"
              className="input"
              rows={4}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="Let us know what you'd like to learn more about..."
              style={{ resize: 'vertical' }}
            />
          </div>
          {submitMessage && (
            <p style={{ color: submitMessage.includes('Thanks') ? '#1dd1a1' : '#ff6b6b', marginBottom: '0.5rem' }}>
              {submitMessage}
            </p>
          )}
          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

