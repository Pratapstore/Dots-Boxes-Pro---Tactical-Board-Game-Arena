import React, { useState } from 'react';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, Check, ChevronRight, Play, Sparkles } from 'lucide-react';
import { GameBoard } from '../components/GameBoard';
import { createInitialGameState } from '../game/engine/board';
import { applyMove } from '../game/engine/rules';
import { GameState } from '../game/engine/types';

interface TutorialScreenProps {
  onBack: () => void;
  onLaunchPractice: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({
  onBack,
  onLaunchPractice,
}) => {
  const [step, setStep] = useState(0);
  const [demoState, setDemoState] = useState<GameState>(() => {
    // 3x3 board for tutorial
    return createInitialGameState(3);
  });

  const tutorialSteps = [
    {
      title: '1. The Grid of Dots',
      desc: 'The game begins with an open grid of dots. Players take turns drawing either a horizontal or vertical line connecting two adjacent dots.',
      actionText: 'Tap on any highlighted line on the board to draw your first edge.',
      suggestedEdge: 'h_0_0',
    },
    {
      title: '2. Drawing Edges',
      desc: 'Each turn, you may claim only ONE unowned edge between adjacent dots. You cannot draw diagonal lines or overwrite an existing line.',
      actionText: 'Draw another line to create partial walls for a box.',
      suggestedEdge: 'v_0_0',
    },
    {
      title: '3. Completing a Box & Scoring',
      desc: 'When a player draws the 4th side of any box, that box is claimed as their territory, marked with their initial, and awards 1 point!',
      actionText: 'Close the 4th wall of the top-left box to capture it!',
      suggestedEdge: 'h_1_0',
    },
    {
      title: '4. The Golden Extra-Turn Rule',
      desc: 'Whenever you complete a box, you IMMEDIATELY get another turn! Skilled players use this rule to capture long chains of boxes in a single unbroken turn.',
      actionText: 'Notice your turn is still active! Continue capturing.',
      suggestedEdge: 'v_0_1',
    },
    {
      title: '5. Winning the Match',
      desc: 'The game ends when all boxes on the board have been captured. The player with the highest total score wins. Ready to test your tactics?',
      actionText: 'Start a practice match against the AI!',
      suggestedEdge: null,
    },
  ];

  const currentStep = tutorialSteps[step];

  const handleEdgeClick = (edgeId: string) => {
    if (demoState.edges[edgeId]?.owner !== null) return;
    const res = applyMove(demoState, edgeId, 'player1');
    if (res.valid) {
      setDemoState(res.newState);
      if (res.completedBoxIds.length > 0) {
        sounds.playBoxComplete();
      } else {
        sounds.playEdgeDraw();
      }
    }
  };

  const handleNextStep = () => {
    sounds.playButtonClick();
    if (step < tutorialSteps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      onLaunchPractice();
    }
  };

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

        <h2 className="text-base font-black text-white tracking-tight">HOW TO PLAY</h2>
        <div className="text-xs font-mono font-bold text-slate-400">
          {step + 1}/{tutorialSteps.length}
        </div>
      </div>

      {/* Step Explanation Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-cyan-500/40 shadow-md">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Academy</span>
        </div>
        <h3 className="text-base font-bold text-white">{currentStep.title}</h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {currentStep.desc}
        </p>

        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-cyan-300 font-medium">
          👉 {currentStep.actionText}
        </div>
      </div>

      {/* Interactive Mini Board */}
      <div className="flex-1 flex items-center justify-center my-auto min-h-0">
        <GameBoard
          gameState={demoState}
          onEdgeClick={handleEdgeClick}
          themeId="neon_cyber"
          player1Name="You"
          player2Name="Rival"
          isInteractive={true}
          hintEdgeId={currentStep.suggestedEdge}
        />
      </div>

      {/* Bottom Step Control */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {tutorialSteps.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-cyan-400 w-6' : i < step ? 'bg-sky-700' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all"
        >
          {step === tutorialSteps.length - 1 ? (
            <>
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>START PRACTICE</span>
            </>
          ) : (
            <>
              <span>NEXT LESSON</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
