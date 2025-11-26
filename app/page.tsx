'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserForm } from '@/components/UserForm';
import { Quiz } from '@/components/Quiz';
import { Results } from '@/components/Results';
import { getAuthInstance, getDbInstance } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [step, setStep] = useState<'form' | 'quiz' | 'results'>('form');
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
    } catch (error) {
      console.error('Error submitting form:', error);
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
        <div>
          <span className="pill">Sitecore City Tour London</span>
          <h1 className="hero-title">SitecoreAI Knowledge Sprint</h1>
          <p className="hero-subtitle">
            Five questions. One minute. Discover how ready you are for Sitecore’s AI-powered era.
          </p>
        </div>
        <div className="hero-flags">
          <div>
            <p className="flag-label">Question pool</p>
            <p className="flag-value">20+</p>
          </div>
          <div>
            <p className="flag-label">Data retention</p>
            <p className="flag-value">30 days</p>
          </div>
        </div>
      </div>

      <div className="card quiz-shell">
        {step === 'form' && <UserForm onSubmit={handleFormSubmit} />}
        {step === 'quiz' && userData && (
          <Quiz userData={userData} onComplete={handleQuizComplete} />
        )}
        {step === 'results' && quizResults && (
          <Results results={quizResults} userData={userData} />
        )}
      </div>
    </main>
  );
}

