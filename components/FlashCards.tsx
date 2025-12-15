'use client';

import { useState, useEffect } from 'react';
import { initialQuestions, shuffleArray, Question } from '@/lib/questions';

export function FlashCards() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'all' | 'by-competency'>('all');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');

  const loadQuestions = () => {
    let filteredQuestions = [...initialQuestions];

    if (studyMode === 'by-competency' && selectedCompetency) {
      filteredQuestions = initialQuestions.filter(
        (q) => q.competency === selectedCompetency
      );
    }

    const shuffled = shuffleArray(filteredQuestions);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray([...questions]);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    loadQuestions();
  }, [studyMode, selectedCompetency]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          setIsFlipped(false);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
        }
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped, questions.length]);

  const competencies = Array.from(
    new Set(
      initialQuestions
        .map((q) => q.competency)
        .filter((c): c is string => !!c)
    )
  ).sort();

  const currentQuestion = questions[currentIndex];

  if (questions.length === 0) {
    return (
      <div className="glass-card">
        <p>Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="quiz-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="pill">Study Mode</span>
          <h2 style={{ color: '#fff', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
            Flashcards
          </h2>
          <p className="meta-sub">
            Click the card to flip and see the answer. Study all {questions.length} questions at your own pace.
          </p>
        </div>
        <div className="glass-card mini-card">
          <p className="stat-label">Card</p>
          <p className="stat-value" style={{ fontSize: '2.4rem' }}>
            {currentIndex + 1}
            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>
              / {questions.length}
            </span>
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '1rem', flex: '1', minWidth: '200px' }}>
          <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Study Mode
          </label>
          <select
            className="input"
            value={studyMode}
            onChange={(e) => {
              setStudyMode(e.target.value as 'all' | 'by-competency');
              setSelectedCompetency('');
            }}
            style={{ width: '100%' }}
          >
            <option value="all">All Questions</option>
            <option value="by-competency">By Competency</option>
          </select>
        </div>

        {studyMode === 'by-competency' && (
          <div className="glass-card" style={{ padding: '1rem', flex: '1', minWidth: '200px' }}>
            <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Select Competency
            </label>
            <select
              className="input"
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All Competencies</option>
              {competencies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp.replace('Competency ', '')}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleShuffle}>
            Shuffle
          </button>
        </div>
      </div>

      <div
        style={{
          perspective: '1000px',
          marginBottom: '2rem',
        }}
      >
        <div
          onClick={handleFlip}
          style={{
            width: '100%',
            minHeight: '400px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            cursor: 'pointer',
          }}
        >
          {/* Front of card - Question */}
          <div
            className="question-card"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Question
              </span>
            </div>
            {currentQuestion.competency && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {currentQuestion.competency}
              </p>
            )}
            <h2 className="question-text" style={{ marginBottom: '2rem' }}>
              {currentQuestion.question}
            </h2>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Click to flip and see the answer
              </p>
            </div>
          </div>

          {/* Back of card - Answer */}
          <div
            className="question-card"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'rgba(29, 209, 161, 0.1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Answer
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p
                style={{
                  color: '#1dd1a1',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '1rem',
                }}
              >
                ✓ Correct Answer:
              </p>
              <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: 1.6 }}>
                {currentQuestion.correctAnswer}
              </p>
            </div>

            {currentQuestion.explanation && (
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  Explanation:
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {currentQuestion.reference && (
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  Reference:
                </p>
                <a
                  href={currentQuestion.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1dd1a1',
                    textDecoration: 'underline',
                    fontSize: '0.85rem',
                    wordBreak: 'break-all',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentQuestion.reference}
                </a>
              </div>
            )}

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Click to flip back to question
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="nav-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button className="btn" onClick={handleFlip}>
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button
          className="btn"
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Use arrow keys to navigate • Space to flip
        </p>
      </div>
    </div>
  );
}

