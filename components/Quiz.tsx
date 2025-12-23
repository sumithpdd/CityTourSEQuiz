'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Question, getRandomQuestions, shuffleAnswers, initialQuestions, shuffleArray } from '@/lib/questions';
import { getDbInstance, getAuthInstance } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { logClientError } from '@/lib/client-logger';
import { Explanation } from './Explanation';

interface QuizProps {
  userData: {
    name: string;
    company: string;
    email?: string;
    consent: boolean;
  };
  onComplete: (results: any) => void;
}

const DEFAULT_QUESTION_COUNT = 100;

export function Quiz({ userData, onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<{ [key: string]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isFlagging, setIsFlagging] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const db = getDbInstance();
        const quizConfigDoc = await getDoc(doc(db, 'config', 'quiz'));
        if (quizConfigDoc.exists()) {
          const configData = quizConfigDoc.data();
          if (configData.questionCount && typeof configData.questionCount === 'number') {
            setQuestionCount(configData.questionCount);
          }
        }
      } catch (error) {
        console.error('Error loading config:', error);
        // Use default if config load fails
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Try to fetch questions from Firestore first
        const db = getDbInstance();
        const questionsRef = collection(db, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);
        
        let availableQuestions: Question[] = [];
        
        if (!questionsSnapshot.empty) {
          // Use questions from Firestore
          availableQuestions = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Question[];
        } else {
          // Fallback to local questions if Firestore is empty
          availableQuestions = initialQuestions;
        }
        
        // Get random questions based on configured count
        const shuffled = shuffleArray([...availableQuestions]);
        const randomQuestions = shuffled.slice(0, questionCount);
        setQuestions(randomQuestions);

        // Shuffle answers for each question
        const shuffledAnswersMap: { [key: string]: string[] } = {};
        randomQuestions.forEach((q) => {
          shuffledAnswersMap[q.id] = shuffleAnswers(q);
        });
        setShuffledAnswers(shuffledAnswersMap);
      } catch (error: any) {
        console.error('Error loading questions:', error);
        // Send details to server so failures on mobile/etc. show up in Vercel logs
        logClientError({
          source: 'quiz_loadQuestions',
          message: error?.message ?? 'Unknown error loading questions',
          errorName: error?.name,
          stack: error?.stack,
          extra: {
            hasWindow: typeof window !== 'undefined',
          },
        });
        // Fallback to local questions on error
        const randomQuestions = getRandomQuestions(questionCount);
        setQuestions(randomQuestions);

        const shuffled: { [key: string]: string[] } = {};
        randomQuestions.forEach((q) => {
          shuffled[q.id] = shuffleAnswers(q);
        });
        setShuffledAnswers(shuffled);
      }
    };

    if (questionCount > 0) {
      loadQuestions();
    }
  }, [questionCount]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (showAnswerFeedback) {
      // Don't allow changing answer after feedback is shown
      return;
    }
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer,
    });
    // Show feedback immediately when answer is selected
    setShowAnswerFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswerFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswerFeedback(false);
    }
  };

  const handleFlagQuestion = async (questionId: string) => {
    if (isFlagging) return;
    
    setIsFlagging(true);
    try {
      const auth = getAuthInstance();
      const db = getDbInstance();
      const user = auth.currentUser;
      
      if (!user) {
        alert('Please sign in to flag questions');
        return;
      }

      const currentQuestion = questions.find(q => q.id === questionId);
      if (!currentQuestion) return;

      // Check if already flagged
      const isFlagged = flaggedQuestions.has(questionId);
      
      if (isFlagged) {
        // Unflag - remove from Firestore
        const flaggedRef = collection(db, 'flaggedQuestions');
        const flaggedSnapshot = await getDocs(flaggedRef);
        const flaggedDoc = flaggedSnapshot.docs.find(
          doc => doc.data().questionId === questionId && doc.data().userId === user.uid
        );
        
        if (flaggedDoc) {
          // Note: Firestore doesn't allow delete from client-side easily, so we'll mark as unflagged
          // For now, we'll just remove from local state
          const newFlagged = new Set(flaggedQuestions);
          newFlagged.delete(questionId);
          setFlaggedQuestions(newFlagged);
        }
      } else {
        // Flag - add to Firestore
        await addDoc(collection(db, 'flaggedQuestions'), {
          questionId: questionId,
          question: currentQuestion.question,
          userId: user.uid,
          userName: userData.name,
          userCompany: userData.company,
          userEmail: userData.email || '',
          flaggedAt: new Date().toISOString(),
          reason: 'User flagged for review',
        });
        
        const newFlagged = new Set(flaggedQuestions);
        newFlagged.add(questionId);
        setFlaggedQuestions(newFlagged);
      }
    } catch (error: any) {
      console.error('Error flagging question:', error);
      alert('Failed to flag question. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  useEffect(() => {
    // Load flagged questions for current user
    const loadFlaggedQuestions = async () => {
      try {
        const auth = getAuthInstance();
        const user = auth.currentUser;
        if (!user) return;

        const db = getDbInstance();
        const flaggedRef = collection(db, 'flaggedQuestions');
        const flaggedSnapshot = await getDocs(flaggedRef);
        const userFlagged = flaggedSnapshot.docs
          .filter(doc => doc.data().userId === user.uid)
          .map(doc => doc.data().questionId);
        
        setFlaggedQuestions(new Set(userFlagged));
      } catch (error) {
        console.error('Error loading flagged questions:', error);
      }
    };

    loadFlaggedQuestions();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const auth = getAuthInstance();
      const db = getDbInstance();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate results
      let correctCount = 0;
      const questionResults = questions.map((q) => {
        const selected = selectedAnswers[q.id];
        const isCorrect = selected === q.correctAnswer;
        if (isCorrect) correctCount++;

        return {
          questionId: q.id,
          question: q.question,
          correctAnswer: q.correctAnswer,
          selectedAnswer: selected || 'No answer',
          isCorrect,
          explanation: q.explanation,
          reference: q.reference,
          competency: q.competency,
        };
      });

      const score = correctCount;
      const totalQuestions = questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);

      const results = {
        userId: user.uid,
        userName: userData.name,
        userCompany: userData.company,
        userEmail: userData.email || '',
        score,
        totalQuestions,
        percentage,
        questionResults,
        completedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await addDoc(collection(db, 'quizResponses'), results);

      // Also save to user's document
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...userData,
          lastQuizCompleted: new Date().toISOString(),
          lastScore: score,
          lastTotalQuestions: totalQuestions,
        },
        { merge: true }
      );

      onComplete(results);
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      // Log to server so we can trace submit issues in Vercel, including mobile-only problems
      logClientError({
        source: 'quiz_submit',
        message: error?.message ?? 'Unknown error submitting quiz',
        errorName: error?.name,
        stack: error?.stack,
        extra: {
          userName: userData.name,
          userCompany: userData.company,
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
      alert('Error submitting quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return <div className="glass-card">Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = shuffledAnswers[currentQuestion.id] || [];
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const canSubmit = questions.every((q) => selectedAnswers[q.id]);
  const firstName = userData.name.split(' ')[0] || userData.name;

  return (
    <div>
      <div className="quiz-header">
        <div>
          <span className="pill">Representing {userData.company}</span>
          <h2 style={{ color: '#fff', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
            Ready, {firstName}?
          </h2>
          <p className="meta-sub">
            {questionCount} scenarios on SitecoreAI, XM Cloud, and innovation lab news. Answer what feels right—instinct wins!
          </p>
        </div>
        <div className="glass-card mini-card">
          <p className="stat-label">Question</p>
          <p className="stat-value" style={{ fontSize: '2.4rem' }}>
            {currentQuestionIndex + 1}
            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>/ {questions.length}</span>
          </p>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="question-number">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <div className="question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <h2 className="question-text" style={{ flex: 1, margin: 0 }}>{currentQuestion.question}</h2>
          <button
            onClick={() => handleFlagQuestion(currentQuestion.id)}
            disabled={isFlagging}
            style={{
              background: flaggedQuestions.has(currentQuestion.id) 
                ? 'rgba(248, 80, 50, 0.25)' 
                : 'rgba(248, 80, 50, 0.15)',
              border: `1px solid ${flaggedQuestions.has(currentQuestion.id) ? '#f85032' : 'rgba(248, 80, 50, 0.4)'}`,
              color: flaggedQuestions.has(currentQuestion.id) ? '#f85032' : '#f85032',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              cursor: isFlagging ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              opacity: isFlagging ? 0.6 : 1,
              fontWeight: 500,
              boxShadow: flaggedQuestions.has(currentQuestion.id) ? '0 0 0 2px rgba(248, 80, 50, 0.3)' : 'none'
            }}
            title={flaggedQuestions.has(currentQuestion.id) ? 'Unflag this question' : 'Flag this question for review'}
            onMouseEnter={(e) => {
              if (!isFlagging && !flaggedQuestions.has(currentQuestion.id)) {
                e.currentTarget.style.background = 'rgba(248, 80, 50, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isFlagging && !flaggedQuestions.has(currentQuestion.id)) {
                e.currentTarget.style.background = 'rgba(248, 80, 50, 0.15)';
              }
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🚩</span>
            <span>{flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag Question'}</span>
          </button>
        </div>
        {currentQuestion.imageUrl && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <Image
              src={currentQuestion.imageUrl}
              alt="Question image"
              width={600}
              height={400}
              unoptimized
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '12px',
                objectFit: 'contain',
                background: 'rgba(255,255,255,0.04)',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <ul className="answers-list">
          {currentAnswers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === currentQuestion.correctAnswer;
            const showCorrectness = showAnswerFeedback && isSelected;
            
            return (
              <li key={index} className="answer-item">
                <button
                  type="button"
                  className={`answer-button ${
                    showCorrectness 
                      ? (isCorrect ? 'correct' : 'incorrect')
                      : isSelected 
                      ? 'selected' 
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, answer)}
                  disabled={showAnswerFeedback}
                  style={{
                    cursor: showAnswerFeedback ? 'not-allowed' : 'pointer',
                    opacity: showAnswerFeedback && !isSelected ? 0.6 : 1,
                  }}
                >
                  {answer}
                  {showCorrectness && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem' }}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        
        {showAnswerFeedback && selectedAnswer && (
          <Explanation
            explanation={currentQuestion.explanation}
            reference={currentQuestion.reference}
            competency={currentQuestion.competency}
            isCorrect={selectedAnswer === currentQuestion.correctAnswer}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
          />
        )}
      </div>
      <div className="nav-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || showAnswerFeedback}
        >
          Previous
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            className="btn"
            onClick={handleNext}
            disabled={!showAnswerFeedback}
          >
            Next Question
          </button>
        ) : (
          <button
            className="btn"
            onClick={handleSubmit}
            disabled={!showAnswerFeedback || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}

