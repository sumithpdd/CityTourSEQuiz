'use client';

interface ExplanationProps {
  explanation?: string;
  reference?: string;
  competency?: string;
  isCorrect?: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
}

export function Explanation({ explanation, reference, competency, isCorrect, selectedAnswer, correctAnswer }: ExplanationProps) {
  if (!explanation && !reference && !competency) {
    return null;
  }

  return (
    <div className="explanation-container" style={{ 
      marginTop: '1.5rem', 
      padding: '1.25rem', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '12px',
      border: `1px solid ${isCorrect ? 'rgba(29, 209, 161, 0.3)' : 'rgba(248, 80, 50, 0.3)'}`
    }}>
      {competency && (
        <div style={{ 
          marginBottom: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            color: 'rgba(255,255,255,0.7)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            fontWeight: 600
          }}>
            {competency}
          </span>
        </div>
      )}
      
      {isCorrect !== undefined && selectedAnswer && (
        <div style={{ 
          marginBottom: '1rem',
          padding: '0.75rem',
          borderRadius: '8px',
          background: isCorrect ? 'rgba(29, 209, 161, 0.15)' : 'rgba(248, 80, 50, 0.15)',
          border: `1px solid ${isCorrect ? 'rgba(29, 209, 161, 0.3)' : 'rgba(248, 80, 50, 0.3)'}`
        }}>
          <p style={{ 
            color: isCorrect ? '#1dd1a1' : '#f85032', 
            fontWeight: 600,
            marginBottom: '0.25rem',
            fontSize: '1rem'
          }}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {!isCorrect && correctAnswer && (
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}>
              <strong>Correct answer:</strong> {correctAnswer}
            </p>
          )}
        </div>
      )}

      {explanation && (
        <div style={{ marginBottom: reference ? '1rem' : '0' }}>
          <p style={{ 
            color: 'rgba(255,255,255,0.95)', 
            fontSize: '0.95rem', 
            lineHeight: 1.7,
            marginBottom: '0.5rem'
          }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Explanation:</strong>
            <span style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{explanation}</span>
          </p>
        </div>
      )}

      {reference && (
        <div style={{ 
          paddingTop: explanation ? '1rem' : '0',
          borderTop: explanation ? '1px solid rgba(255,255,255,0.1)' : 'none',
          marginTop: explanation ? '1rem' : '0'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            <strong style={{ color: 'rgba(255,255,255,0.95)', display: 'block', marginBottom: '0.25rem' }}>Reference:</strong>
            <a
              href={reference}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#1dd1a1', 
                textDecoration: 'underline',
                wordBreak: 'break-all',
                display: 'inline-block',
                marginTop: '0.25rem'
              }}
            >
              {reference}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

