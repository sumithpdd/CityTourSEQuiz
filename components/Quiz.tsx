'use client';

import { useState, useEffect } from 'react';
import { Question, getRandomQuestions, shuffleAnswers, initialQuestions, shuffleArray } from '@/lib/questions';
import { getDbInstance, getAuthInstance } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';

interface QuizProps {
  userData: {
    name: string;
    company: string;
    email?: string;
    consent: boolean;
  };
  onComplete: (results: any) => void;
}

const QUIZ_QUESTION_COUNT = 5;

export function Quiz({ userData, onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<{ [key: string]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        // Get 3 random questions
        const shuffled = shuffleArray([...availableQuestions]);
        const randomQuestions = shuffled.slice(0, QUIZ_QUESTION_COUNT);
        setQuestions(randomQuestions);

        // Shuffle answers for each question
        const shuffledAnswersMap: { [key: string]: string[] } = {};
        randomQuestions.forEach((q) => {
          shuffledAnswersMap[q.id] = shuffleAnswers(q);
        });
        setShuffledAnswers(shuffledAnswersMap);
      } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback to local questions on error
        const randomQuestions = getRandomQuestions(QUIZ_QUESTION_COUNT);
        setQuestions(randomQuestions);

        const shuffled: { [key: string]: string[] } = {};
        randomQuestions.forEach((q) => {
          shuffled[q.id] = shuffleAnswers(q);
        });
        setShuffledAnswers(shuffled);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
    } catch (error) {
      console.error('Error submitting quiz:', error);
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
            5 scenarios on SitecoreAI, XM Cloud, and innovation lab news. Answer what feels right—instinct wins!
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
        <h2 className="question-text">{currentQuestion.question}</h2>
        {currentQuestion.imageUrl && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img
              src={currentQuestion.imageUrl}
              alt="Question image"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                objectFit: 'contain',
              }}
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <ul className="answers-list">
          {currentAnswers.map((answer, index) => (
            <li key={index} className="answer-item">
              <button
                type="button"
                className={`answer-button ${
                  selectedAnswer === answer ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, answer)}
              >
                {answer}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="nav-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            className="btn"
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            Next
          </button>
        ) : (
          <button
            className="btn"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}

