import React from 'react';
import { CHALLENGE_PUZZLES } from '../game/engine/puzzleData';
import { PuzzleDefinition } from '../game/engine/types';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, CheckCircle2, Play, Sparkles, Star } from 'lucide-react';

interface ChallengeScreenProps {
  solvedPuzzleIds: string[];
  onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
  onBack: () => void;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  solvedPuzzleIds,
  onSelectPuzzle,
  onBack,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Arena</span>
        </button>

        <h2 className="text-base font-black text-white tracking-tight">TACTICAL PUZZLES</h2>
        <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{solvedPuzzleIds.length}/{CHALLENGE_PUZZLES.length}</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed">
        Test your strategic instincts! In each scenario, enter a pre-drawn endgame puzzle and execute the decisive sequence to secure victory.
      </div>

      {/* Puzzle Cards List */}
      <div className="space-y-3">
        {CHALLENGE_PUZZLES.map((puzzle, idx) => {
          const isSolved = solvedPuzzleIds.includes(puzzle.id);

          return (
            <div
              key={puzzle.id}
              className={`p-4 rounded-2xl border transition-all ${
                isSolved
                  ? 'bg-slate-900/60 border-emerald-900/40 opacity-90'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      0{idx + 1}.
                    </span>
                    <h3 className="text-sm font-bold text-white">{puzzle.title}</h3>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {puzzle.subtitle} · {puzzle.boardSize}×{puzzle.boardSize} Grid
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      puzzle.difficulty === 'Beginner'
                        ? 'bg-emerald-950 text-emerald-400'
                        : puzzle.difficulty === 'Intermediate'
                        ? 'bg-sky-950 text-sky-400'
                        : 'bg-purple-950 text-purple-400'
                    }`}
                  >
                    {puzzle.difficulty}
                  </span>

                  {isSolved && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {puzzle.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Goal: Score $\ge$ {puzzle.targetWinScore} Boxes
                </span>

                <button
                  onClick={() => {
                    sounds.playButtonClick();
                    onSelectPuzzle(puzzle);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isSolved ? 'Replay' : 'Solve'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
