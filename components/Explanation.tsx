'use client';

import { useState } from 'react';

interface ExplanationProps {
  explanation?: string;
  reference?: string;
  competency?: string;
  isCorrect?: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(29, 209, 161, 0.25)' : 'rgba(29, 209, 161, 0.15)',
        border: `1px solid ${copied ? '#1dd1a1' : 'rgba(29, 209, 161, 0.4)'}`,
        color: copied ? '#1dd1a1' : '#1dd1a1',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        boxShadow: copied ? '0 0 0 2px rgba(29, 209, 161, 0.3)' : 'none'
      }}
      title={copied ? 'Copied!' : 'Copy link to clipboard'}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.background = 'rgba(29, 209, 161, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.background = 'rgba(29, 209, 161, 0.15)';
        }
      }}
    >
      {copied ? (
        <>
          <span style={{ fontSize: '1.1rem' }}>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '1.1rem' }}>📋</span>
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem' }}>Reference:</strong>
            <CopyLinkButton url={reference} />
          </div>
          <a
            href={reference}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#1dd1a1', 
              textDecoration: 'underline',
              wordBreak: 'break-all',
              display: 'block',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}
          >
            {reference}
          </a>
        </div>
      )}
    </div>
  );
}

