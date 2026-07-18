"use client";

import { useState, useEffect, useRef } from "react";

interface ResultScreenProps {
  hit: boolean;
  message: string;
  playerName: string;
  onPlayAgain: () => void;
}

export default function ResultScreen({
  hit,
  message,
  playerName,
  onPlayAgain,
}: ResultScreenProps) {
  const [visible, setVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showSecondaryButtons, setShowSecondaryButtons] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [countUpScore, setCountUpScore] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setShowMessage(true), 600);
    const t3 = setTimeout(
      () => setShowSecondaryButtons(true),
      hit ? 1600 : 1200,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [hit]);

  useEffect(() => {
    if (!showMessage) return;
    if (displayedChars >= message.length) return;
    const timer = setTimeout(() => setDisplayedChars((c) => c + 1), 25);
    return () => clearTimeout(timer);
  }, [showMessage, displayedChars, message.length]);

  useEffect(() => {
    if (!hit || !showSecondaryButtons) return;
    let current = 0;
    const target = 100;
    intervalRef.current = setInterval(() => {
      current += 2;
      if (current >= target) {
        current = target;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setCountUpScore(current);
    }, 20);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hit, showSecondaryButtons]);

  useEffect(() => {
    if (!hit || !showSecondaryButtons) return;
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setShowPlayAgain(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [hit, showSecondaryButtons]);

  if (hit) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 80 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        />
        <div
          className={`relative mx-6 max-w-sm w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-90"}`}
        >
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4 animate-count-bounce">🎯</div>

            {showMessage && (
              <div className="mb-2">
                <div
                  className="inline-block px-5 py-2.5 rounded-2xl mb-3"
                  style={{
                    background: "rgba(46,125,50,0.2)",
                    border: "1px solid rgba(46,125,50,0.3)",
                  }}
                >
                  <p
                    className="font-display font-semibold text-sm text-white leading-snug"
                    style={{ minHeight: "1.5em" }}
                  >
                    {message.slice(0, displayedChars)}
                    {displayedChars < message.length && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 bg-white/60 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </div>
            )}

            {showSecondaryButtons && (
              <div className="mt-4 mb-2">
                <div
                  className="inline-block px-4 py-2 rounded-xl animate-count-bounce"
                  style={{
                    background: "rgba(124,252,0,0.15)",
                    border: "1px solid rgba(124,252,0,0.3)",
                  }}
                >
                  <span
                    className="font-display font-black text-3xl"
                    style={{
                      color: "#7CFC00",
                      textShadow: "0 0 15px rgba(124,252,0,0.5)",
                    }}
                  >
                    +{countUpScore}
                  </span>
                  <span className="font-display text-xs text-white/60 ml-2 uppercase tracking-wider">
                    score
                  </span>
                </div>
              </div>
            )}

            {playerName && showSecondaryButtons && (
              <p className="text-white/60 text-xs mt-3 mb-4">
                Welcome to the Wall, {playerName}!
              </p>
            )}

            {showSecondaryButtons && (
              <div className="space-y-3 mt-4 animate-slide-in-up">
                {showPlayAgain ? (
                  <button
                    onClick={onPlayAgain}
                    className="w-full btn-primary text-sm py-3.5 animate-scale-in"
                  >
                    PLAY AGAIN
                  </button>
                ) : (
                  <div
                    className="w-full text-sm py-3.5 text-center font-display font-bold text-white/40"
                    style={{
                      background: "rgba(46,125,50,0.15)",
                      border: "1px solid rgba(46,125,50,0.2)",
                      borderRadius: "1rem",
                    }}
                  >
                    Play Again in {countdown}s...
                  </div>
                )}
                <a
                  href="https://180dc.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary text-sm py-3.5 block text-center"
                >
                  VISIT 180DC VIT CHENNAI
                </a>
                <a
                  href="/wall"
                  className="w-full btn-secondary text-sm py-3.5 block text-center"
                >
                  SEE WHO HIT IT
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 80 }}
    >
      <div
        className={`relative mx-6 max-w-sm w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="text-center">
          {showMessage && (
            <div className="mb-6">
              <div
                className="inline-block px-5 py-3 rounded-2xl"
                style={{
                  background: "rgba(15,20,35,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <p
                  className="font-display font-semibold text-base text-white/90 leading-snug"
                  style={{ minHeight: "1.5em" }}
                >
                  {message.slice(0, displayedChars)}
                  {displayedChars < message.length && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-white/50 animate-pulse align-middle" />
                  )}
                </p>
              </div>
            </div>
          )}
          {showSecondaryButtons && (
            <div className="space-y-3 animate-slide-in-up">
              <button
                onClick={onPlayAgain}
                className="w-full btn-primary text-sm py-3.5"
              >
                PLAY AGAIN
              </button>
              <a
                href="https://180dc.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-secondary text-sm py-3.5 block text-center"
              >
                VISIT 180DC VIT CHENNAI
              </a>
              <a
                href="/wall"
                className="w-full btn-secondary text-sm py-3.5 block text-center"
              >
                SEE WHO HIT IT
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
