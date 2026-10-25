import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../game/audio/soundEngine';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Bot, Users } from 'lucide-react';

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy: 'P1' | 'P2' | null;
}

const ICONS = [
  { symbol: '💎', name: 'Diamond' },
  { symbol: '👑', name: 'Crown' },
  { symbol: '⚔️', name: 'Swords' },
  { symbol: '🛡️', name: 'Shield' },
  { symbol: '⚡', name: 'Thunder' },
  { symbol: '🌟', name: 'Star' },
  { symbol: '🔥', name: 'Flame' },
  { symbol: '🏆', name: 'Trophy' },
];

function generateDeck(): CardItem[] {
  const deck: CardItem[] = [];
  let id = 0;
  for (const item of ICONS) {
    deck.push({ id: id++, symbol: item.symbol, name: item.name, isFlipped: false, isMatched: false, matchedBy: null });
    deck.push({ id: id++, symbol: item.symbol, name: item.name, isFlipped: false, isMatched: false, matchedBy: null });
  }
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
}

interface MemoryMatchScreenProps {
  player1Name: string;
  entryFee?: number;
  onDeductStake?: (stake: number) => boolean;
  onMatchComplete: (data: {
    result: 'VICTORY' | 'DEFEAT' | 'DRAW';
    entryFee: number;
    gameName: string;
  }) => { coinsGained: number };
  onExit: () => void;
}

export const MemoryMatchScreen: React.FC<MemoryMatchScreenProps> = ({
  player1Name,
  entryFee = 100,
  onDeductStake,
  onMatchComplete,
  onExit,
}) => {
  const [cards, setCards] = useState<CardItem[]>(generateDeck);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<'P1' | 'P2'>('P1');
  const [scores, setScores] = useState({ P1: 0, P2: 0 });
  const [mode, setMode] = useState<'vs_ai' | 'pass_and_play'>('vs_ai');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'P1' | 'P2' | 'DRAW' | null>(null);
  const [hasReportedResult, setHasReportedResult] = useState(false);
  const [hasDeductedStake, setHasDeductedStake] = useState(false);
  const [coinsWon, setCoinsWon] = useState<number | null>(null);
  const [currentStake, setCurrentStake] = useState<number>(entryFee);
  const stakeOptions = [50, 100, 250, 500, 1000];

  // Bot memory: map card id to symbol
  const botMemoryRef = useRef<Map<number, string>>(new Map());
  const aiThinkingRef = useRef(false);

  // Check Game Over
  useEffect(() => {
    const allMatched = cards.every((c) => c.isMatched);
    if (allMatched && !isGameOver) {
      setIsGameOver(true);
      let win: 'P1' | 'P2' | 'DRAW' = 'DRAW';
      if (scores.P1 > scores.P2) win = 'P1';
      else if (scores.P2 > scores.P1) win = 'P2';
      setWinner(win);

      if (!hasReportedResult) {
        setHasReportedResult(true);
        let result: 'VICTORY' | 'DEFEAT' | 'DRAW' = 'DRAW';
        if (win === 'P1') {
          result = 'VICTORY';
          sounds.playVictory();
          setTimeout(() => sounds.playCoinCollect(), 300);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#06B6D4', '#F59E0B', '#10B981'],
            });
          } catch {}
        } else if (win === 'P2') {
          result = mode === 'vs_ai' ? 'DEFEAT' : 'VICTORY';
          if (mode === 'vs_ai') sounds.playDefeat();
          else sounds.playVictory();
        } else {
          result = 'DRAW';
          sounds.playBoxComplete();
        }

        const res = onMatchComplete({
          result,
          entryFee: currentStake,
          gameName: 'Memory Cards Clash',
        });
        setCoinsWon(res.coinsGained);
      }
    }
  }, [cards, scores, isGameOver, hasReportedResult, mode, currentStake, onMatchComplete]);

  // AI Turn Logic
  useEffect(() => {
    if (
      mode === 'vs_ai' &&
      currentPlayer === 'P2' &&
      !isGameOver &&
      !isProcessing &&
      !aiThinkingRef.current
    ) {
      aiThinkingRef.current = true;
      const delay = Math.floor(700 + Math.random() * 300);

      const tId = window.setTimeout(() => {
        try {
          const unmatched = cards.filter((c) => !c.isMatched);
          if (unmatched.length === 0) return;

          // Check if bot remembers a pair in memory
          let card1Id: number | null = null;
          let card2Id: number | null = null;

          const mem = botMemoryRef.current;
          const seenSymbols = new Map<string, number[]>();

          for (const [id, sym] of mem.entries()) {
            const cardObj = cards.find((c) => c.id === id);
            if (cardObj && !cardObj.isMatched) {
              const list = seenSymbols.get(sym) || [];
              list.push(id);
              seenSymbols.set(sym, list);
            }
          }

          // If a known pair exists, pick it!
          for (const [_, ids] of seenSymbols.entries()) {
            if (ids.length >= 2) {
              card1Id = ids[0];
              card2Id = ids[1];
              break;
            }
          }

          // Otherwise pick a random unmatched card, and check if its match is in memory
          if (card1Id === null) {
            const rand = unmatched[Math.floor(Math.random() * unmatched.length)];
            card1Id = rand.id;
            // Check if we know its pair
            for (const [id, sym] of mem.entries()) {
              if (id !== card1Id && sym === rand.symbol) {
                const cObj = cards.find((c) => c.id === id);
                if (cObj && !cObj.isMatched) {
                  card2Id = id;
                  break;
                }
              }
            }
            if (card2Id === null) {
              const otherUnmatched = unmatched.filter((c) => c.id !== card1Id);
              if (otherUnmatched.length > 0) {
                card2Id = otherUnmatched[Math.floor(Math.random() * otherUnmatched.length)].id;
              }
            }
          }

          if (card1Id !== null && card2Id !== null) {
            executeCardFlips(card1Id, card2Id, 'P2');
          }
        } finally {
          aiThinkingRef.current = false;
        }
      }, delay);

      return () => {
        clearTimeout(tId);
        aiThinkingRef.current = false;
      };
    }
  }, [currentPlayer, mode, isGameOver, isProcessing, cards]);

  const executeCardFlips = (id1: number, id2: number, player: 'P1' | 'P2') => {
    setIsProcessing(true);

    // Flip first card
    sounds.playEdgeDraw();
    setCards((prev) =>
      prev.map((c) => (c.id === id1 ? { ...c, isFlipped: true } : c))
    );

    // Flip second card after 350ms
    setTimeout(() => {
      sounds.playEdgeDraw();
      setCards((prev) =>
        prev.map((c) => (c.id === id2 ? { ...c, isFlipped: true } : c))
      );

      // Check match after 600ms
      setTimeout(() => {
        const c1 = cards.find((c) => c.id === id1)!;
        const c2 = cards.find((c) => c.id === id2)!;

        // Remember in bot memory
        botMemoryRef.current.set(id1, c1.symbol);
        botMemoryRef.current.set(id2, c2.symbol);

        if (c1.symbol === c2.symbol) {
          // MATCH!
          sounds.playBoxComplete();
          setScores((prev) => ({
            ...prev,
            [player]: prev[player] + 1,
          }));
          setCards((prev) =>
            prev.map((c) =>
              c.id === id1 || c.id === id2
                ? { ...c, isMatched: true, matchedBy: player }
                : c
            )
          );
          // Matcher gets another turn!
          setIsProcessing(false);
        } else {
          // MISMATCH -> Flip back and pass turn
          sounds.playButtonClick();
          setCards((prev) =>
            prev.map((c) =>
              c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
            )
          );
          setCurrentPlayer(player === 'P1' ? 'P2' : 'P1');
          setIsProcessing(false);
        }
      }, 600);
    }, 350);
  };

  const handleCardClick = (id: number) => {
    if (isProcessing || isGameOver) return;
    if (mode === 'vs_ai' && currentPlayer !== 'P1') return;

    const clicked = cards.find((c) => c.id === id);
    if (!clicked || clicked.isMatched || clicked.isFlipped) return;

    if (!hasDeductedStake) {
      if (onDeductStake && !onDeductStake(currentStake)) {
        return;
      }
      setHasDeductedStake(true);
    }

    if (selectedCards.length === 0) {
      sounds.playEdgeDraw();
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
      );
      setSelectedCards([id]);
      botMemoryRef.current.set(id, clicked.symbol);
    } else if (selectedCards.length === 1) {
      const firstId = selectedCards[0];
      if (firstId === id) return;
      setSelectedCards([]);
      executeCardFlips(firstId, id, currentPlayer);
    }
  };

  const handleReset = () => {
    sounds.playButtonClick();
    setCards(generateDeck());
    setSelectedCards([]);
    setIsProcessing(false);
    setCurrentPlayer('P1');
    setScores({ P1: 0, P2: 0 });
    setIsGameOver(false);
    setWinner(null);
    setHasReportedResult(false);
    setCoinsWon(null);
    setHasDeductedStake(false);
    botMemoryRef.current.clear();
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onExit();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <span>MEMORY CARDS CLASH</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentStake} 🪙 STAKE
              </span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Win Pot: {currentStake * 2} 🪙 (+100 Win Bonus)
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setMode('vs_ai');
              handleReset();
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'vs_ai' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vs Bot
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setMode('pass_and_play');
              handleReset();
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'pass_and_play' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2P Local
          </button>
        </div>
      </div>

      {/* Multiple Entry Price Stakes Selector Chips */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Stake Price:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {stakeOptions.map((stk) => (
            <button
              key={stk}
              disabled={cards.some((c) => c.isMatched || c.isFlipped)}
              onClick={() => {
                sounds.playButtonClick();
                setCurrentStake(stk);
              }}
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition-all ${
                currentStake === stk
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {stk} 🪙
            </button>
          ))}
        </div>
      </div>

      {/* Score Boards */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            currentPlayer === 'P1' && !isGameOver
              ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800/80 opacity-70'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[100px]">{player1Name}</div>
            <div className="text-[9px] text-cyan-300 font-mono">Matched: {scores.P1} Pairs</div>
          </div>
          <div className="text-xl font-black font-mono text-cyan-400">{scores.P1}</div>
        </div>

        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            currentPlayer === 'P2' && !isGameOver
              ? 'bg-amber-950/70 border-amber-400 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800/80 opacity-70'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[100px]">
              {mode === 'vs_ai' ? 'Memory Bot' : 'Player 2'}
            </div>
            <div className="text-[9px] text-amber-300 font-mono">Matched: {scores.P2} Pairs</div>
          </div>
          <div className="text-xl font-black font-mono text-amber-400">{scores.P2}</div>
        </div>
      </div>

      {/* 4x4 Cards Matrix */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="w-full max-w-sm grid grid-cols-4 gap-2 aspect-square p-3 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-2xl">
          {cards.map((card) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                disabled={card.isMatched || isProcessing || (mode === 'vs_ai' && currentPlayer !== 'P1')}
                onClick={() => handleCardClick(card.id)}
                className={`rounded-xl aspect-square flex items-center justify-center text-3xl font-black transition-all transform duration-300 active:scale-95 ${
                  card.isMatched
                    ? card.matchedBy === 'P1'
                      ? 'bg-cyan-950/60 border-2 border-cyan-400/80 opacity-90'
                      : 'bg-amber-950/60 border-2 border-amber-400/80 opacity-90'
                    : isRevealed
                    ? 'bg-slate-800 border-2 border-white shadow-lg'
                    : 'bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/80 hover:border-slate-600 shadow-md cursor-pointer'
                }`}
              >
                {isRevealed ? (
                  <span className="animate-in zoom-in-75 duration-200">{card.symbol}</span>
                ) : (
                  <span className="text-slate-600 text-lg">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Result Banner */}
      {isGameOver && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 text-center animate-in zoom-in-95">
          <div className="text-sm font-black text-white mb-1 flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>
              {winner === 'DRAW'
                ? 'MATCH DRAW'
                : winner === 'P1'
                ? `${player1Name.toUpperCase()} WON!`
                : mode === 'vs_ai'
                ? 'AI BOT WON!'
                : 'PLAYER 2 WON!'}
            </span>
          </div>

          {winner === 'P1' && (
            <div className="text-xs text-amber-300 font-bold font-mono">
              🎉 Pot Claimed: +200 🪙 Winner Prize Added!
            </div>
          )}

          {winner === 'DRAW' && (
            <div className="text-xs text-slate-300 font-medium">
              100 🪙 Entry Refunded to your balance.
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all"
            >
              PLAY AGAIN (100 🪙)
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
