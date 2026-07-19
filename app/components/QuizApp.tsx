'use client';

import { useState, useEffect, useCallback } from 'react';
import { questions, shuffleArray, Question } from '../data/questions';
import styles from './QuizApp.module.css';

type Screen = 'home' | 'quiz' | 'review' | 'results';
type FilterMode = 'all' | 'true-false' | 'multiple-choice';

interface UserAnswer {
  questionId: number;
  selectedIndex: number | null;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const totalQuestions = shuffledQuestions.length;
  const current = shuffledQuestions[currentIndex];

  const score = userAnswers.filter(
    (a) => {
      const q = shuffledQuestions.find((sq) => sq.id === a.questionId);
      return q && a.selectedIndex === q.correctIndex;
    }
  ).length;

  const answeredCount = userAnswers.filter((a) => a.selectedIndex !== null).length;

  const startQuiz = useCallback(() => {
    const pool = filterMode === 'all'
      ? questions
      : questions.filter((q) => q.type === filterMode);
    const shuffled = shuffleArray(pool).slice(0, Math.min(questionCount, pool.length));
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsAnswered(false);
    setCardKey(0);
    setScreen('quiz');
  }, [filterMode, questionCount]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const newAnswers = userAnswers.filter((a) => a.questionId !== current.id);
    newAnswers.push({ questionId: current.id, selectedIndex: index });
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (animating) return;
    if (currentIndex + 1 >= totalQuestions) {
      setScreen('results');
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsAnswered(false);
      setCardKey((k) => k + 1);
      setAnimating(false);
    }, 300);
  };

  const prevQuestion = () => {
    if (animating || currentIndex === 0) return;
    setAnimating(true);
    setTimeout(() => {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevAnswer = userAnswers.find(
        (a) => a.questionId === shuffledQuestions[prevIdx].id
      );
      setSelectedOption(prevAnswer?.selectedIndex ?? null);
      setIsAnswered(prevAnswer !== undefined && prevAnswer.selectedIndex !== null);
      setShowExplanation(false);
      setCardKey((k) => k + 1);
      setAnimating(false);
    }, 300);
  };

  const getOptionClass = (index: number) => {
    if (!isAnswered) {
      return selectedOption === index ? styles.optionSelected : styles.option;
    }
    if (index === current.correctIndex) return styles.optionCorrect;
    if (index === selectedOption && selectedOption !== current.correctIndex)
      return styles.optionWrong;
    return styles.option;
  };

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade =
    percentage >= 90 ? 'Excellent! 🎉' :
    percentage >= 80 ? 'Great Job! 👍' :
    percentage >= 70 ? 'Good Work! 📚' :
    percentage >= 60 ? 'Keep Studying! 💪' :
    'More Practice Needed 📖';

  // ─── HOME SCREEN ────────────────────────────────────────────────────────────
  if (screen === 'home') {
    const availableCount =
      filterMode === 'all' ? questions.length :
      questions.filter((q) => q.type === filterMode).length;

    return (
      <div className={styles.container}>
        <div className={styles.homeCard}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🏥</div>
            <div>
              <h1 className={styles.title}>PSW Exam Prep</h1>
              <p className={styles.subtitle}>NACC Personal Support Worker</p>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{questions.length}</span>
              <span className={styles.statLabel}>Total Questions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{questions.filter(q => q.type === 'true-false').length}</span>
              <span className={styles.statLabel}>True / False</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{questions.filter(q => q.type === 'multiple-choice').length}</span>
              <span className={styles.statLabel}>Multiple Choice</span>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h2 className={styles.settingsTitle}>Quiz Settings</h2>

            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>Question Type</label>
              <div className={styles.filterRow}>
                {(['all', 'true-false', 'multiple-choice'] as FilterMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`filter-${mode}`}
                    className={filterMode === mode ? styles.filterBtnActive : styles.filterBtn}
                    onClick={() => setFilterMode(mode)}
                  >
                    {mode === 'all' ? 'All Types' : mode === 'true-false' ? 'True / False' : 'Multiple Choice'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>
                Number of Questions
                <span className={styles.countBadge}>{Math.min(questionCount, availableCount)} / {availableCount}</span>
              </label>
              <div className={styles.quickCounts}>
                {[10, 20, 30, 50].map((n) => (
                  <button
                    key={n}
                    id={`count-${n}`}
                    className={!showCustomInput && questionCount === n ? styles.countBtnActive : styles.countBtn}
                    onClick={() => { setQuestionCount(n); setShowCustomInput(false); }}
                    disabled={n > availableCount}
                  >
                    {n}
                  </button>
                ))}
                <button
                  id="count-all"
                  className={!showCustomInput && questionCount === availableCount ? styles.countBtnActive : styles.countBtn}
                  onClick={() => { setQuestionCount(availableCount); setShowCustomInput(false); }}
                >
                  All
                </button>
                <button
                  id="count-custom"
                  className={showCustomInput ? styles.countBtnActive : styles.countBtn}
                  onClick={() => {
                    setShowCustomInput(true);
                    setCustomInputValue(String(questionCount));
                  }}
                >
                  Custom
                </button>
              </div>
              {showCustomInput && (
                <div className={styles.customInputRow}>
                  <input
                    id="custom-count-input"
                    type="number"
                    min={1}
                    max={availableCount}
                    value={customInputValue}
                    autoFocus
                    className={styles.customInput}
                    placeholder={`1 – ${availableCount}`}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = Math.min(Math.max(1, parseInt(customInputValue) || 1), availableCount);
                        setQuestionCount(val);
                        setCustomInputValue(String(val));
                        setShowCustomInput(false);
                      }
                      if (e.key === 'Escape') setShowCustomInput(false);
                    }}
                    onBlur={() => {
                      const val = Math.min(Math.max(1, parseInt(customInputValue) || 1), availableCount);
                      setQuestionCount(val);
                      setCustomInputValue(String(val));
                      setShowCustomInput(false);
                    }}
                  />
                  <span className={styles.customInputHint}>Press Enter to confirm</span>
                </div>
              )}
            </div>
          </div>

          <button id="start-quiz-btn" className={styles.startBtn} onClick={startQuiz}>
            <span>Start Quiz</span>
            <span className={styles.startArrow}>→</span>
          </button>

          <p className={styles.hint}>Questions are randomized each session</p>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ─────────────────────────────────────────────────────────
  if (screen === 'results') {
    const wrongAnswers = userAnswers.filter((a) => {
      const q = shuffledQuestions.find((sq) => sq.id === a.questionId);
      return q && a.selectedIndex !== q.correctIndex;
    });

    return (
      <div className={styles.container}>
        <div className={styles.resultsCard}>
          <div className={styles.resultsBg} />
          <div className={styles.resultsContent}>
            <div className={styles.scoreCircle}>
              <svg viewBox="0 0 120 120" className={styles.scoreCircleSvg}>
                <circle cx="60" cy="60" r="52" className={styles.scoreCircleBg} />
                <circle
                  cx="60" cy="60" r="52"
                  className={styles.scoreCircleFill}
                  strokeDasharray={`${percentage * 3.267} 326.7`}
                  strokeDashoffset="81.675"
                />
              </svg>
              <div className={styles.scoreInner}>
                <span className={styles.scorePercent}>{percentage}%</span>
                <span className={styles.scoreLabel}>Score</span>
              </div>
            </div>

            <h2 className={styles.gradeText}>{grade}</h2>
            <p className={styles.scoreDetails}>
              You got <strong>{score}</strong> out of <strong>{totalQuestions}</strong> correct
            </p>

            <div className={styles.resultStatsRow}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatIcon}>✅</span>
                <span className={styles.resultStatNum}>{score}</span>
                <span className={styles.resultStatLabel}>Correct</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatIcon}>❌</span>
                <span className={styles.resultStatNum}>{totalQuestions - score}</span>
                <span className={styles.resultStatLabel}>Incorrect</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatIcon}>📝</span>
                <span className={styles.resultStatNum}>{totalQuestions}</span>
                <span className={styles.resultStatLabel}>Total</span>
              </div>
            </div>

            <div className={styles.resultBtns}>
              <button id="review-answers-btn" className={styles.reviewBtn} onClick={() => { setReviewIndex(0); setScreen('review'); }}>
                📋 Review Answers
              </button>
              <button id="try-again-btn" className={styles.tryAgainBtn} onClick={startQuiz}>
                🔄 Try Again
              </button>
              <button id="home-btn" className={styles.homeBtn} onClick={() => setScreen('home')}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── REVIEW SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'review') {
    const reviewQ = shuffledQuestions[reviewIndex];
    const reviewAnswer = userAnswers.find((a) => a.questionId === reviewQ.id);
    const isCorrect = reviewAnswer?.selectedIndex === reviewQ.correctIndex;

    return (
      <div className={styles.container}>
        <div className={styles.quizCard}>
          <div className={styles.reviewHeader}>
            <button id="review-back-btn" className={styles.backBtn} onClick={() => setScreen('results')}>← Results</button>
            <span className={styles.reviewCounter}>{reviewIndex + 1} / {totalQuestions}</span>
            <div className={`${styles.reviewBadge} ${isCorrect ? styles.badgeCorrect : styles.badgeWrong}`}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
          </div>

          <div className={styles.typeBadge}>{reviewQ.type === 'true-false' ? '🔵 True / False' : '🟣 Multiple Choice'}</div>

          <p className={styles.questionText}>{reviewQ.question}</p>

          <div className={styles.optionsGrid}>
            {reviewQ.options.map((opt, idx) => {
              let cls = styles.option;
              if (idx === reviewQ.correctIndex) cls = styles.optionCorrect;
              else if (idx === reviewAnswer?.selectedIndex && idx !== reviewQ.correctIndex) cls = styles.optionWrong;
              return (
                <div key={idx} className={cls}>
                  <span className={styles.optionLabel}>
                    {reviewQ.type === 'true-false' ? (idx === 0 ? 'T' : 'F') : OPTION_LABELS[idx]}
                  </span>
                  <span className={styles.optionText}>{opt}</span>
                  {idx === reviewQ.correctIndex && <span className={styles.correctMark}>✓</span>}
                  {idx === reviewAnswer?.selectedIndex && idx !== reviewQ.correctIndex && <span className={styles.wrongMark}>✗</span>}
                </div>
              );
            })}
          </div>

          {reviewQ.explanation && (
            <div className={styles.explanation}>
              <span className={styles.explanationIcon}>💡</span>
              <p>{reviewQ.explanation}</p>
            </div>
          )}

          <div className={styles.navRow}>
            <button
              id="review-prev-btn"
              className={styles.navBtn}
              onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
              disabled={reviewIndex === 0}
            >
              ← Previous
            </button>
            <button
              id="review-next-btn"
              className={styles.navBtnPrimary}
              onClick={() => {
                if (reviewIndex + 1 >= totalQuestions) setScreen('results');
                else setReviewIndex((i) => i + 1);
              }}
            >
              {reviewIndex + 1 >= totalQuestions ? 'Finish Review' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ SCREEN ────────────────────────────────────────────────────────────
  if (!current) return null;
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;
  const existingAnswer = userAnswers.find((a) => a.questionId === current.id);

  return (
    <div className={styles.container}>
      <div className={`${styles.quizCard} ${animating ? styles.cardExit : styles.cardEnter}`} key={cardKey}>
        {/* Header */}
        <div className={styles.quizHeader}>
          <button id="quiz-home-btn" className={styles.backBtn} onClick={() => setScreen('home')}>✕ Quit</button>
          <div className={styles.progressInfo}>
            <span className={styles.questionCounter}>{currentIndex + 1} / {totalQuestions}</span>
          </div>
          <div className={styles.scorePill}>
            <span className={styles.scoreGreen}>✓ {score}</span>
            <span className={styles.scoreRed}>✗ {answeredCount - score}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Question type badge */}
        <div className={styles.typeBadge}>
          {current.type === 'true-false' ? '🔵 True / False' : '🟣 Multiple Choice'}
        </div>

        {/* Question */}
        <p className={styles.questionText}>{current.question}</p>

        {/* Options */}
        <div className={styles.optionsGrid}>
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              id={`option-${idx}`}
              className={getOptionClass(idx)}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswered}
            >
              <span className={styles.optionLabel}>
                {current.type === 'true-false' ? (idx === 0 ? 'T' : 'F') : OPTION_LABELS[idx]}
              </span>
              <span className={styles.optionText}>{opt}</span>
              {isAnswered && idx === current.correctIndex && (
                <span className={styles.correctMark}>✓</span>
              )}
              {isAnswered && idx === selectedOption && selectedOption !== current.correctIndex && (
                <span className={styles.wrongMark}>✗</span>
              )}
            </button>
          ))}
        </div>

        {/* Explanation toggle */}
        {isAnswered && current.explanation && (
          <button
            id="show-explanation-btn"
            className={styles.explanationToggle}
            onClick={() => setShowExplanation((v) => !v)}
          >
            {showExplanation ? '▲ Hide Explanation' : '💡 Show Explanation'}
          </button>
        )}

        {showExplanation && current.explanation && (
          <div className={styles.explanation}>
            <span className={styles.explanationIcon}>💡</span>
            <p>{current.explanation}</p>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navRow}>
          <button
            id="prev-btn"
            className={styles.navBtn}
            onClick={prevQuestion}
            disabled={currentIndex === 0 || animating}
          >
            ← Prev
          </button>

          {!isAnswered ? (
            <button
              id="skip-btn"
              className={styles.skipBtn}
              onClick={nextQuestion}
            >
              Skip →
            </button>
          ) : (
            <button
              id="next-btn"
              className={styles.navBtnPrimary}
              onClick={nextQuestion}
              disabled={animating}
            >
              {currentIndex + 1 >= totalQuestions ? 'See Results 🎯' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
