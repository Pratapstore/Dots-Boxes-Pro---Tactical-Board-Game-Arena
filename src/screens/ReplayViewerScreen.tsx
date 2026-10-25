import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MatchHistoryItem } from '../game/state/playerProfile';
import { createInitialGameState } from '../game/engine/board';
import { applyMove } from '../game/engine/rules';
import { GameBoard } from '../components/GameBoard';
import { ScoreBoard } from '../components/ScoreBoard';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { GameState } from '../game/engine/types';

interface ReplayViewerScreenProps {
  matchItem: MatchHistoryItem;
  onBack: () => void;
}

export const ReplayViewerScreen: React.FC<ReplayViewerScreenProps> = ({ matchItem, onBack }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);

  // Reconstruct game states for each move index
  const statesByStep = useMemo(() => {
    const list: GameState[] = [];
    let state = createInitialGameState(matchItem.boardSize);
    list.push(state);

    for (const move of matchItem.moves) {
      const res = applyMove(state, move.edgeId, move.player);
      if (res.valid) {
        state = res.newState;
      }
      list.push(state);
    }
    return list;
  }, [matchItem]);

  const currentState = statesByStep[currentMoveIndex] || statesByStep[0];

  // Auto-play loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = window.setInterval(() => {
        setCurrentMoveIndex((prev) => {
          if (prev >= statesByStep.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          sounds.playEdgeDraw();
          return prev + 1;
        });
      }, 700);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, statesByStep.length]);

  const handleNext = () => {
    if (currentMoveIndex < statesByStep.length - 1) {
      sounds.playEdgeDraw();
      setCurrentMoveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentMoveIndex > 0) {
      sounds.playButtonClick();
      setCurrentMoveIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    sounds.playButtonClick();
    setIsPlaying(false);
    setCurrentMoveIndex(0);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 py-1">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <div className="text-center">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            MATCH REPLAY THEATER
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            vs {matchItem.opponentName} · {matchItem.boardSize}×{matchItem.boardSize}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 text-slate-400 hover:text-white"
          title="Restart Replay"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Score Header */}
      <ScoreBoard
        gameState={currentState}
        player1Name="You"
        player2Name={matchItem.opponentName}
        player1Avatar="tactician"
        player2Avatar="grandmaster"
        themeId="neon_cyber"
      />

      {/* Board */}
      <div className="flex-1 flex items-center justify-center my-auto min-h-0">
        <GameBoard
          gameState={currentState}
          onEdgeClick={() => {}}
          themeId="neon_cyber"
          player1Name="You"
          player2Name={matchItem.opponentName}
          isInteractive={false}
        />
      </div>

      {/* Controls & Scrubber */}
      <div className="w-full flex flex-col gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Progress Slider */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Move {currentMoveIndex}</span>
          <span>Total: {matchItem.moves.length} Moves</span>
        </div>

        <input
          type="range"
          min={0}
          max={statesByStep.length - 1}
          value={currentMoveIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentMoveIndex(parseInt(e.target.value, 10));
          }}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={handlePrev}
            disabled={currentMoveIndex === 0}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold shadow-md hover:brightness-105 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950" />}
          </button>

          <button
            onClick={handleNext}
            disabled={currentMoveIndex >= statesByStep.length - 1}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
