'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserForm } from '@/components/UserForm';
import { Quiz } from '@/components/Quiz';
import { Results } from '@/components/Results';
import { FlashCards } from '@/components/FlashCards';
import { getAuthInstance, getDbInstance } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { logClientError } from '@/lib/client-logger';

export default function Home() {
  const [step, setStep] = useState<'form' | 'quiz' | 'results' | 'flashcards'>('form');
  const [userData, setUserData] = useState<{
    name: string;
    company: string;
    email?: string;
    consent: boolean;
  } | null>(null);
  const [quizResults, setQuizResults] = useState<any>(null);

  const handleFormSubmit = async (data: {
    name: string;
    company: string;
    email?: string;
    consent: boolean;
  }) => {
    try {
      // Sign in anonymously
      const auth = getAuthInstance();
      const db = getDbInstance();
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Store user data
      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        company: data.company,
        email: data.email || '',
        consentAccepted: data.consent,
        createdAt: new Date().toISOString(),
      });

      setUserData(data);
      setStep('quiz');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      // Log to server to trace onboarding/auth issues
      logClientError({
        source: 'form_submit',
        message: error?.message ?? 'Unknown error submitting form',
        errorName: error?.name,
        stack: error?.stack,
        extra: {
          name: data.name,
          company: data.company,
          hasAuthInstance: (() => {
            try {
              const auth = getAuthInstance();
              return !!auth;
            } catch {
              return false;
            }
          })(),
          hasDbInstance: (() => {
            try {
              const db = getDbInstance();
              return !!db;
            } catch {
              return false;
            }
          })(),
        },
      });
      alert('Error submitting form. Please try again.');
    }
  };

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setStep('results');
  };

  return (
    <main className="container">
      <div className="logo-wrapper">
        <div className="logo-left">
          <Image
            src="/sitecore-logo.svg"
            alt="Sitecore Logo"
            width={160}
            height={48}
            priority
          />
        </div>
        <div className="logo-center">
          <Image
            src="/city-tour-logo.svg"
            alt="Sitecore City Tour"
            width={220}
            height={80}
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="hero-intro card">
        <div className="hero-copy">
          <span className="pill">Sitecore City Tour London</span>
          <h1 className="hero-title">SitecoreAI Knowledge Sprint</h1>
          <p className="hero-subtitle">
            Five questions. One minute. Discover how ready you are for Sitecore’s AI-powered era.
          </p>
          <div className="hero-flags">
            <div>
              <p className="flag-label">Question pool</p>
              <p className="flag-value">224+</p>
            </div>
            <div>
              <p className="flag-label">Data retention</p>
              <p className="flag-value">30 days</p>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => setStep('flashcards')}
              style={{ flex: '1', minWidth: '150px' }}
            >
              📚 Study Flashcards
            </button>
          </div>
        </div>
        <div className="hero-side">
          <div className="qr-card glass-card">
            <p className="qr-title">Scan to play</p>
            <Image
              src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fcity-tour-se-quiz.vercel.app%2F"
              alt="QR code linking to Sitecore City Tour Quiz"
              width={220}
              height={220}
              unoptimized
            />
            <p className="qr-url">city-tour-se-quiz.vercel.app</p>
          </div>
        </div>
      </div>

      <div className="card quiz-shell">
        {step === 'form' && (
          <>
            <UserForm onSubmit={handleFormSubmit} />
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep('flashcards')}
                style={{ width: '100%', maxWidth: '300px' }}
              >
                📚 Study with Flashcards
              </button>
            </div>
          </>
        )}
        {step === 'quiz' && userData && (
          <Quiz userData={userData} onComplete={handleQuizComplete} />
        )}
        {step === 'results' && quizResults && (
          <Results results={quizResults} userData={userData} />
        )}
        {step === 'flashcards' && (
          <div>
            <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep('form')}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                ← Back to Quiz
              </button>
            </div>
            <FlashCards />
          </div>
        )}
      </div>
    </main>
  );
}

