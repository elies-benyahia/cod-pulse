import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import MetaTags from '../components/MetaTags';
import { QUIZ_TEAMS } from '../data/teamsData';
import styles from './Quiz.module.css';

const QUESTIONS_PER_GAME = 10;
const TIMER_SECONDS = 15;
const BASE_POINTS = 100;
const STREAK_BONUS = 150;
const STREAK_THRESHOLD = 3;

const KNOWLEDGE_QUESTIONS = [
  {
    question: "Quelle équipe a remporté le CDL Championship 2023 ?",
    options: ["OpTic Texas", "FaZe Vegas", "Atlanta FaZe", "LA Thieves"],
    correct: 2,
    category: "CDL",
  },
  {
    question: "Quel mode de jeu se joue en 250 points au CDL ?",
    options: ["Hardpoint", "Search & Destroy", "Control", "Domination"],
    correct: 0,
    category: "CDL",
  },
  {
    question: "Combien de maps max dans une série CDL Best-of-5 ?",
    options: ["3", "4", "5", "Au maximum 5"],
    correct: 3,
    category: "CDL",
  },
  {
    question: "Quel pays accueille les Riyadh Falcons CDL ?",
    options: ["Émirats Arabes Unis", "Qatar", "Arabie Saoudite", "Bahreïn"],
    correct: 2,
    category: "CDL",
  },
  {
    question: "En Warzone BO7, combien de joueurs en équipe BR classique ?",
    options: ["2", "3", "4", "6"],
    correct: 2,
    category: "WARZONE",
  },
  {
    question: "Quel est le nom du classement compétitif Warzone ?",
    options: ["WRS", "WCL", "WRL", "WCS"],
    correct: 0,
    category: "WARZONE",
  },
  {
    question: "Quelle organisation possède OpTic Texas au CDL ?",
    options: ["Activision", "NRG", "Envy Gaming", "FaZe Clan"],
    correct: 1,
    category: "CDL",
  },
  {
    question: "En S&D au CDL, combien de rounds pour gagner le map ?",
    options: ["4", "5", "6", "3"],
    correct: 2,
    category: "CDL",
  },
  {
    question: "Quel type d'arme joue le rôle Sub en CDL ?",
    options: ["AR", "SMG", "Sniper", "LMG"],
    correct: 1,
    category: "META",
  },
  {
    question: "Combien de maps dans le pool CDL en 2026 ?",
    options: ["6", "8", "10", "12"],
    correct: 1,
    category: "CDL",
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildLogoQuestion(allTeams) {
  const pool = allTeams.filter((t) => t.logo);
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(pool.filter((t) => t.id !== correct.id)).slice(0, 3);
  return {
    type: 'logo',
    correct,
    choices: shuffle([correct, ...wrong]),
    category: correct.category === 'cdl' ? 'CDL' : 'WARZONE',
  };
}

function buildGame(allTeams) {
  const logoQs = Array.from({ length: 5 }, () => buildLogoQuestion(allTeams));
  const knowledgeQs = shuffle(KNOWLEDGE_QUESTIONS).slice(0, 5).map((q) => ({
    type: 'knowledge',
    question: q.question,
    options: q.options,
    correctIndex: q.correct,
    category: q.category,
  }));
  return shuffle([...logoQs, ...knowledgeQs]);
}

function TimerArc({ timeLeft, total }) {
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - timeLeft / total);
  const color = timeLeft <= 5 ? '#FF3A1A' : timeLeft <= 10 ? '#FF8C00' : '#D4AF37';
  return (
    <div className={styles.timerWrap}>
      <svg width="56" height="56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#1A1A1A" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span className={styles.timerNum} style={{ color }}>{timeLeft}</span>
    </div>
  );
}

export default function Quiz() {
  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [answered, setAnswered] = useState([]);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startGame = useCallback(() => {
    clearTimer();
    const q = buildGame(QUIZ_TEAMS);
    setQuestions(q);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(TIMER_SECONDS);
    setAnswered([]);
    setPhase('playing');
  }, []);

  // Réf pour éviter closure stale dans handleAnswer
  const streakRef = useRef(streak);
  streakRef.current = streak;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const currentRef = useRef(current);
  currentRef.current = current;

  const handleAnswer = useCallback((answer) => {
    clearTimer();
    const isTimeout = answer === null;
    setSelected(isTimeout ? '__timeout__' : answer);

    const q = questionsRef.current[currentRef.current];
    let isCorrect = false;
    if (!isTimeout) {
      isCorrect = q.type === 'logo'
        ? answer === q.correct.id
        : answer === q.correctIndex;
    }

    const newStreak = isCorrect ? streakRef.current + 1 : 0;
    const bonusActivated = isCorrect && newStreak >= STREAK_THRESHOLD;
    const points = isCorrect ? BASE_POINTS + (bonusActivated ? STREAK_BONUS : 0) : 0;

    setStreak(newStreak);
    setMaxStreak((ms) => Math.max(ms, newStreak));
    if (isCorrect) setScore((s) => s + points);

    const correctLabel = q.type === 'logo'
      ? q.correct.name
      : q.options[q.correctIndex];
    const chosenLabel = isTimeout ? null
      : q.type === 'logo'
        ? q.choices.find((c) => c.id === answer)?.name
        : q.options[answer];

    setAnswered((prev) => [...prev, {
      isCorrect, points, correctLabel, chosenLabel,
      category: q.category, bonusActivated, isTimeout,
    }]);

    setTimeout(() => {
      if (currentRef.current + 1 >= QUESTIONS_PER_GAME) {
        setPhase('results');
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimeLeft(TIMER_SECONDS);
      }
    }, 1400);
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          handleAnswer(null);
          return TIMER_SECONDS;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, current, selected, handleAnswer]);

  // Confetti
  useEffect(() => {
    if (phase !== 'results') return;
    const maxPossible = QUESTIONS_PER_GAME * (BASE_POINTS + STREAK_BONUS);
    const pct = score / maxPossible;
    if (pct >= 0.4) {
      confetti({ particleCount: pct >= 0.7 ? 200 : 100, spread: 70, origin: { y: 0.6 }, colors: ['#D4AF37', '#FFD700', '#FFF', '#FF8C00'] });
      if (pct >= 0.7) {
        setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#D4AF37', '#FFD700'] }), 350);
        setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#D4AF37', '#FFD700'] }), 600);
      }
    }
  }, [phase, score]);

  // ── INTRO ──────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <>
        <MetaTags title="Quiz CDL & Warzone — CoD Pulse" description="10 questions : logos + culture CDL/Warzone. 15s par question. Streaks bonus." />
        <div className={styles.introPage}>
          <motion.div
            className={styles.introContent}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.introOverline}>CHALLENGE</span>
            <h1 className={styles.introTitle}>
              TEST TON<br />
              <span className={styles.introAccent}>SKILL</span>
            </h1>
            <p className={styles.introDesc}>
              10 questions — logos d'équipes &amp; culture CDL/Warzone.
              15 secondes par question. Streak ×{STREAK_THRESHOLD} = bonus activé.
            </p>
            <div className={styles.introStats}>
              <div className={styles.introStat}>
                <span className={styles.introStatVal}>{QUESTIONS_PER_GAME}</span>
                <span className={styles.introStatLbl}>QUESTIONS</span>
              </div>
              <div className={styles.introStatSep} />
              <div className={styles.introStat}>
                <span className={styles.introStatVal}>15s</span>
                <span className={styles.introStatLbl}>PAR Q.</span>
              </div>
              <div className={styles.introStatSep} />
              <div className={styles.introStat}>
                <span className={styles.introStatVal}>×2.5</span>
                <span className={styles.introStatLbl}>STREAK</span>
              </div>
            </div>
            <button className={styles.startBtn} onClick={startGame}>
              DÉMARRER →
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // ── RÉSULTATS ──────────────────────────────────────────────────
  if (phase === 'results') {
    const maxPossible = QUESTIONS_PER_GAME * (BASE_POINTS + STREAK_BONUS);
    const pct = Math.round((score / maxPossible) * 100);
    const correctCount = answered.filter((a) => a.isCorrect).length;
    const verdict =
      pct >= 80 ? { label: 'LÉGENDAIRE', icon: '🏆', color: '#D4AF37' }
      : pct >= 60 ? { label: 'EXCELLENT',   icon: '⭐', color: '#C89B3C' }
      : pct >= 40 ? { label: 'SOLIDE',       icon: '✓', color: '#2D8A5F' }
      :             { label: 'À AMÉLIORER',  icon: '📚', color: '#666' };

    const shareText = `J'ai scoré ${score} pts au quiz COD sur CodPulse ! ${correctCount}/${QUESTIONS_PER_GAME} réponses. Streak max : ${maxStreak} 🔥`;

    return (
      <>
        <MetaTags title="Résultats Quiz — CoD Pulse" />
        <div className={styles.resultsPage}>
          <motion.div
            className={styles.resultsContent}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.resultsOverline}>RÉSULTATS FINAUX</span>

            <div className={styles.scoreDisplay}>
              <div className={styles.scoreMain}>{score.toLocaleString('fr-FR')}</div>
              <div className={styles.scoreSub}>POINTS</div>
            </div>

            <div className={styles.verdict} style={{ color: verdict.color }}>
              {verdict.icon} {verdict.label}
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statBoxVal}>{correctCount}/{QUESTIONS_PER_GAME}</span>
                <span className={styles.statBoxLbl}>RÉPONSES</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxVal}>{pct}%</span>
                <span className={styles.statBoxLbl}>RÉUSSITE</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxVal}>{maxStreak}</span>
                <span className={styles.statBoxLbl}>STREAK MAX</span>
              </div>
            </div>

            <div className={styles.recap}>
              {answered.map((a, i) => (
                <div key={i} className={`${styles.recapRow} ${a.isCorrect ? styles.recapCorrect : styles.recapWrong}`}>
                  <span className={styles.recapNum}>{i + 1}</span>
                  <span className={styles.recapIcon}>{a.isCorrect ? '✓' : '✗'}</span>
                  <span className={styles.recapLabel}>{a.correctLabel}</span>
                  {a.bonusActivated && <span className={styles.recapBonus}>STREAK</span>}
                  {!a.isCorrect && (
                    <span className={styles.recapYours}>
                      {a.isTimeout ? 'TIMEOUT' : `→ ${a.chosenLabel}`}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.resultsActions}>
              <button className={styles.startBtn} onClick={startGame}>REJOUER</button>
              <a
                className={styles.shareBtn}
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank" rel="noopener noreferrer"
              >
                PARTAGER SUR 𝕏
              </a>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ── JEU ────────────────────────────────────────────────────────
  const q = questions[current];
  if (!q) return null;

  return (
    <>
      <MetaTags title={`Quiz Q${current + 1} — CoD Pulse`} />
      <div className={styles.gamePage}>
        <div className={styles.gameHeader}>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${((current + 1) / QUESTIONS_PER_GAME) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className={styles.gameHUD}>
            <span className={styles.hudQ}>Q<strong>{current + 1}</strong>/{QUESTIONS_PER_GAME}</span>
            <AnimatePresence>
              {streak >= STREAK_THRESHOLD && (
                <motion.span
                  className={styles.streakBadge}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                >
                  🔥 ×{streak} STREAK
                </motion.span>
              )}
            </AnimatePresence>
            <span className={styles.hudScore}>{score.toLocaleString('fr-FR')} pts</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className={styles.gameBody}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28 }}
          >
            <div className={styles.questionMeta}>
              <span className={styles.questionCat}>{q.category}</span>
              <TimerArc timeLeft={timeLeft} total={TIMER_SECONDS} />
            </div>

            {q.type === 'logo' && (
              <div className={styles.logoContainer}>
                <div className={`${styles.logoBlur} ${selected !== null ? styles.logoRevealed : ''}`}>
                  <img
                    src={q.correct.logo}
                    alt="Logo mystère"
                    className={styles.logoImg}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                {selected === null && <p className={styles.logoHint}>Quelle est cette équipe ?</p>}
              </div>
            )}

            {q.type === 'knowledge' && (
              <div className={styles.questionText}>
                <h2 className={styles.questionQ}>{q.question}</h2>
              </div>
            )}

            <div className={styles.choices}>
              {q.type === 'logo'
                ? q.choices.map((choice) => {
                  let st = '';
                  if (selected !== null) {
                    if (choice.id === q.correct.id) st = styles.choiceCorrect;
                    else if (choice.id === selected) st = styles.choiceWrong;
                    else st = styles.choiceDimmed;
                  }
                  return (
                    <motion.button
                      key={choice.id}
                      className={`${styles.choice} ${st}`}
                      onClick={() => selected === null && handleAnswer(choice.id)}
                      whileHover={selected === null ? { x: 4 } : {}}
                      whileTap={selected === null ? { scale: 0.98 } : {}}
                    >
                      <span className={styles.choiceCat}>{choice.category === 'cdl' ? 'CDL' : 'WZ'}</span>
                      {choice.name}
                    </motion.button>
                  );
                })
                : q.options.map((opt, i) => {
                  let st = '';
                  if (selected !== null) {
                    if (i === q.correctIndex) st = styles.choiceCorrect;
                    else if (i === selected) st = styles.choiceWrong;
                    else st = styles.choiceDimmed;
                  }
                  return (
                    <motion.button
                      key={i}
                      className={`${styles.choice} ${st}`}
                      onClick={() => selected === null && handleAnswer(i)}
                      whileHover={selected === null ? { x: 4 } : {}}
                      whileTap={selected === null ? { scale: 0.98 } : {}}
                    >
                      <span className={styles.choiceLetter}>{['A', 'B', 'C', 'D'][i]}</span>
                      {opt}
                    </motion.button>
                  );
                })
              }
            </div>

            {selected !== null && (() => {
              const last = answered[answered.length - 1];
              if (!last) return null;
              return (
                <motion.div
                  className={styles.feedbackRow}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {last.isCorrect ? (
                    <span className={styles.feedbackGood}>
                      ✓ BONNE RÉPONSE
                      {last.bonusActivated && <span className={styles.feedbackBonus}> +{STREAK_BONUS} STREAK!</span>}
                    </span>
                  ) : (
                    <span className={styles.feedbackBad}>
                      {last.isTimeout ? '⏱ TEMPS ÉCOULÉ' : `✗ C'ÉTAIT ${last.correctLabel.toUpperCase()}`}
                    </span>
                  )}
                </motion.div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
