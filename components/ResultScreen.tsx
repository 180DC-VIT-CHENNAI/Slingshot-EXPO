"use client";

import { useState, useEffect, useRef } from "react";

interface ResultScreenProps {
  hit: boolean;
  message: string;
  playerName: string;
  score: number;
  stars?: number;
  levelId?: number;
  levelName?: string;
  campaignScore?: number;
  rank?: string;
  onPlayAgain?: () => void;
  onNextLevel?: () => void;
  onBackToCampaign?: () => void;
  hasNextLevel?: boolean;
}

export default function ResultScreen({
  hit,
  message,
  playerName,
  score,
  stars = 0,
  levelId = 1,
  levelName = '',
  campaignScore = 0,
  rank = 'Intern',
  onPlayAgain,
  onNextLevel,
  onBackToCampaign,
  hasNextLevel = true,
}: ResultScreenProps) {
  const [visible, setVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [countUpScore, setCountUpScore] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [starsVisible, setStarsVisible] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setShowMessage(true), 600);
    const t3 = setTimeout(() => setShowButtons(true), hit ? 2600 : 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [hit]);

  useEffect(() => {
    if (!showMessage) return;
    if (displayedChars >= message.length) return;
    const timer = setTimeout(() => setDisplayedChars((c) => c + 1), 25);
    return () => clearTimeout(timer);
  }, [showMessage, displayedChars, message.length]);

  useEffect(() => {
    if (!hit || !showButtons) return;
    const target = Math.max(0, score);
    if (target === 0) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 50));
    intervalRef.current = setInterval(() => {
      current += step;
      if (current >= target) { current = target; if (intervalRef.current) clearInterval(intervalRef.current); }
      setCountUpScore(current);
    }, 20);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hit, showButtons, score]);

  useEffect(() => {
    if (!showButtons) return;
    if (hit && stars > 0) {
      let i = 0;
      const showStar = () => { if (i >= stars) return; setStarsVisible(i + 1); i++; setTimeout(showStar, 400); };
      setTimeout(showStar, 800);
    }
    if (hasNextLevel) {
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { if (countdownRef.current) clearInterval(countdownRef.current); setShowPlayAgain(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      setShowPlayAgain(true);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [showButtons, hit, stars, hasNextLevel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 80 }}>
      <div className="absolute inset-0" style={{ background: hit ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }} />
      <div className={`relative mx-6 max-w-sm w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-90"}`}>
        <div className="glass-card p-7 text-center">
          <div className="text-5xl mb-2 animate-count-bounce">{hit ? "🎯" : "💨"}</div>

          <div className="mb-1">
            <span className="text-xs font-display text-white/40 uppercase tracking-wider">
              Mission {levelId}: {levelName}
            </span>
          </div>

          {hit ? (
            <h2 className="font-display font-black text-2xl text-180dc-green-neon mb-1">
              MISSION COMPLETE
            </h2>
          ) : (
            <h2 className="font-display font-bold text-xl text-white/80 mb-1">
              MISSION FAILED
            </h2>
          )}

          {showMessage && (
            <div className="mb-2 mt-2">
              <div
                className="inline-block px-4 py-2 rounded-xl"
                style={{
                  background: hit ? "rgba(46,125,50,0.2)" : "rgba(255,255,255,0.06)",
                  border: hit ? "1px solid rgba(46,125,50,0.3)" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className={`font-display font-semibold text-sm leading-snug ${hit ? 'text-white' : 'text-white/70'}`} style={{ minHeight: "1.5em" }}>
                  {message.slice(0, displayedChars)}
                  {displayedChars < message.length && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-white/50 animate-pulse align-middle" />
                  )}
                </p>
              </div>
            </div>
          )}

          {hit && showButtons && stars > 0 && (
            <div className="flex justify-center gap-3 my-3">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className="text-3xl transition-all duration-500"
                  style={{
                    opacity: s <= starsVisible ? 1 : 0.15,
                    transform: s <= starsVisible ? 'scale(1)' : 'scale(0.5)',
                    filter: s <= starsVisible ? 'drop-shadow(0 0 8px rgba(250,204,21,0.6))' : 'none',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {hit && showButtons && (
            <div className="mb-1">
              <div
                className="inline-block px-4 py-2 rounded-xl animate-count-bounce"
                style={{ background: "rgba(124,252,0,0.12)", border: "1px solid rgba(124,252,0,0.25)" }}
              >
                <span className="font-display font-black text-2xl" style={{ color: "#7CFC00", textShadow: "0 0 12px rgba(124,252,0,0.4)" }}>
                  +{countUpScore}
                </span>
                <span className="font-display text-xs text-white/50 ml-2 uppercase tracking-wider">score</span>
              </div>
            </div>
          )}

          {showButtons && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs text-white/40 font-display">
              <span>Mission Score</span>
              <span className="text-right text-white/60">{hit ? score : 0}</span>
              <span>Campaign Score</span>
              <span className="text-right text-white/60">{campaignScore}</span>
              <span>Rank</span>
              <span className="text-right text-180dc-green-neon font-bold">{rank}</span>
            </div>
          )}

          {showButtons && (
            <div className="space-y-2 mt-4 animate-slide-in-up">
              {hasNextLevel && onNextLevel && (
                showPlayAgain ? (
                  <button onClick={onNextLevel} className="w-full btn-primary text-sm py-3.5 animate-scale-in">
                    NEXT MISSION →
                  </button>
                ) : (
                  <div
                    className="w-full text-sm py-3.5 text-center font-display font-bold text-white/40"
                    style={{ background: hit ? "rgba(46,125,50,0.12)" : "rgba(255,255,255,0.06)", border: hit ? "1px solid rgba(46,125,50,0.2)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem" }}
                  >
                    Next in {countdown}s...
                  </div>
                )
              )}

              {onPlayAgain && (
                <button onClick={onPlayAgain} className={`w-full text-sm py-3 rounded-xl font-display font-bold transition-all ${hit ? 'btn-secondary' : 'btn-primary'}`}>
                  {hit ? 'REPLAY MISSION' : 'TRY AGAIN'}
                </button>
              )}

              <a
                href="/wall"
                className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-display font-bold transition-all"
                style={{ background: 'rgba(124,252,0,0.08)', border: '1px solid rgba(124,252,0,0.2)', color: '#7CFC00' }}
              >
                👤 SEE THE WALL
              </a>

              <a
                href="/leaderboard"
                className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-display font-bold transition-all"
                style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#facc15' }}
              >
                🏆 LEADERBOARD
              </a>

              {onBackToCampaign && (
                <button onClick={onBackToCampaign} className="w-full text-white/40 text-xs text-center hover:text-white/70 transition-colors py-1.5 font-display">
                  Back to Campaign
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
