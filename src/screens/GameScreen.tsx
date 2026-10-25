import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AIDifficulty, BoardDimension, GameMode, GameState, PlayerId } from '../game/engine/types';
import { createInitialGameState, getLegalMoves } from '../game/engine/board';
import { applyMove, undoLastMove } from '../game/engine/rules';
import { getAIMove } from '../game/ai/aiOpponent';
import { sounds } from '../game/audio/soundEngine';
import { BoardThemeId } from '../game/state/settings';
import { GameBoard } from '../components/GameBoard';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameOverModal } from './GameOverModal';
import { networkClient, OpponentInfo } from '../game/multiplayer/networkClient';
import { RotateCcw, Lightbulb, Flag, Volume2, VolumeX } from 'lucide-react';
import { debugInspectBoardState } from '../game/engine/debug';

interface GameScreenProps {
  gameMode: GameMode;
  boardSize: BoardDimension;
  aiDifficulty?: AIDifficulty;
  themeId: BoardThemeId;
  player1Name: string;
  player2Name: string;
  player1Avatar: string;
  player2Avatar: string;
  initialState?: GameState;
  onlineOpponent?: OpponentInfo | null;
  onlineRole?: PlayerId;
  entryFee?: number;
  onMatchComplete: (data: {
    result: 'VICTORY' | 'DEFEAT' | 'DRAW';
    p1Score: number;
    p2Score: number;
    moves: any[];
    durationSeconds: number;
    isAIExpert?: boolean;
    entryFee?: number;
  }) => { xpGained: number; newAchievements: string[]; coinsGained: number };
  onExit: () => void;
  onOpenReplay: (historyItem: any) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  gameMode,
  boardSize,
  aiDifficulty = 'medium',
  themeId,
  player1Name,
  player2Name,
  player1Avatar,
  player2Avatar,
  initialState,
  onlineRole = 'player1',
  entryFee = 100,
  onMatchComplete,
  onExit,
  onOpenReplay,
}) => {
  const [gameState, setGameState] = useState<GameState>(
    () => initialState || createInitialGameState(boardSize)
  );
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hintEdgeId, setHintEdgeId] = useState<string | null>(null);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [opponentStatusText, setOpponentStatusText] = useState<string | null>(null);
  const [matchResultMeta, setMatchResultMeta] = useState<{
    xpGained: number;
    newAchievements: string[];
    coinsGained: number;
    perWinBonus?: number;
    milestoneBonus?: number;
    milestoneLabel?: string;
  }>({ xpGained: 0, newAchievements: [], coinsGained: 0, perWinBonus: 100, milestoneBonus: 0 });
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const timerRef = useRef<number | null>(null);
  const aiThinkingRef = useRef(false);
  const isOnline = gameMode.includes('online');

  // Timer loop
  useEffect(() => {
    if (gameState.status === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status]);

  // Expose global debug inspection tool
  useEffect(() => {
    (window as unknown as { __dotsDebugInspect?: () => void }).__dotsDebugInspect = () => {
      return debugInspectBoardState(gameState, true);
    };
  }, [gameState]);

  // Log gameState on every update for visual tracking of state changes
  useEffect(() => {
    console.log('[GameScreen] gameState updated:', gameState);
  }, [gameState]);

  // Online WebSocket move listener
  useEffect(() => {
    if (isOnline) {
      networkClient.connect({
        onMoveAccepted: (data) => {
          setGameState(data.gameState);
          setOpponentStatusText(null);
          if (data.completedBoxIds.length > 0) {
            sounds.playBoxComplete();
          } else {
            sounds.playEdgeDraw();
          }
        },
        onMatchRestarted: (newState) => {
          setGameState(newState);
          setTimerSeconds(0);
          setOpponentStatusText(null);
          setIsGameOverModalOpen(false);
        },
        onPlayerDisconnected: () => {
          setOpponentStatusText('Opponent connection interrupted. Reconnecting...');
        },
        onPlayerReconnected: () => {
          setOpponentStatusText(null);
        },
        onOpponentLeft: () => {
          setOpponentStatusText('Opponent surrendered or left the room. Victory!');
          setGameState((prev) => ({
            ...prev,
            status: 'FINISHED',
            winner: onlineRole,
          }));
        },
      });
    }
  }, [isOnline, onlineRole]);

  // Finish game handler
  const handleGameFinished = useCallback(
    (finishedState: GameState) => {
      const isP1 = onlineRole === 'player1';
      let result: 'VICTORY' | 'DEFEAT' | 'DRAW';

      if (finishedState.winner === 'DRAW') {
        result = 'DRAW';
      } else if (
        (finishedState.winner === 'player1' && isP1) ||
        (finishedState.winner === 'player2' && !isP1)
      ) {
        result = 'VICTORY';
      } else {
        result = 'DEFEAT';
      }

      const meta = onMatchComplete({
        result,
        p1Score: finishedState.scores.player1,
        p2Score: finishedState.scores.player2,
        moves: finishedState.moves,
        durationSeconds: timerSeconds,
        isAIExpert: gameMode === 'vs_ai' && aiDifficulty === 'expert',
        entryFee,
      });

      setMatchResultMeta(meta);
      setIsGameOverModalOpen(true);
    },
    [aiDifficulty, entryFee, gameMode, onMatchComplete, onlineRole, timerSeconds]
  );

  // Check game over
  useEffect(() => {
    if (gameState.status === 'FINISHED' && !isGameOverModalOpen) {
      handleGameFinished(gameState);
    }
  }, [gameState, handleGameFinished, isGameOverModalOpen]);

  // AI Move Loop
  useEffect(() => {
    if (
      gameMode === 'vs_ai' &&
      gameState.status === 'PLAYING' &&
      gameState.currentPlayer === 'player2' &&
      !aiThinkingRef.current
    ) {
      aiThinkingRef.current = true;
      // Stagger moves slightly (350ms) so sequential captures animate smoothly
      const delay = Math.floor(350 + Math.random() * 250);

      const timeoutId = window.setTimeout(() => {
        try {
          let edgeToPlay = getAIMove(gameState, aiDifficulty);
          if (!edgeToPlay) {
            const free = getLegalMoves(gameState);
            if (free.length > 0) edgeToPlay = free[0];
          }

          if (edgeToPlay) {
            const res = applyMove(gameState, edgeToPlay, 'player2');
            if (res.valid) {
              setGameState(res.newState);
              if (res.completedBoxIds.length > 0) {
                sounds.playBoxComplete();
              } else {
                sounds.playEdgeDraw();
              }
            } else {
              // Fallback to any legal move
              const free = getLegalMoves(gameState);
              if (free.length > 0) {
                const fallbackRes = applyMove(gameState, free[0], 'player2');
                if (fallbackRes.valid) setGameState(fallbackRes.newState);
              }
            }
          }
        } catch (e) {
          console.error('AI Move Error:', e);
        } finally {
          aiThinkingRef.current = false;
        }
      }, delay);

      return () => {
        clearTimeout(timeoutId);
        aiThinkingRef.current = false;
      };
    }
  }, [gameState, gameMode, aiDifficulty]);

  // Player clicks an edge
  const handleEdgeClick = (edgeId: string) => {
    // If online, only allow if it's our turn
    if (isOnline) {
      if (gameState.currentPlayer !== onlineRole) return;
      sounds.playEdgeDraw();
      networkClient.makeMove(edgeId);
      return;
    }

    // If vs AI, only allow if it's player1's turn
    if (gameMode === 'vs_ai' && gameState.currentPlayer !== 'player1') {
      return;
    }

    // Apply move
    const current = gameState.currentPlayer;
    const res = applyMove(gameState, edgeId, current);

    if (res.valid) {
      setHintEdgeId(null);
      setGameState(res.newState);

      if (res.completedBoxIds.length > 0) {
        sounds.playBoxComplete();
      } else {
        sounds.playEdgeDraw();
      }
    } else {
      sounds.playError();
    }
  };

  // Undo (practice mode)
  const handleUndo = () => {
    if (gameMode !== 'practice') return;
    sounds.playButtonClick();
    setGameState((prev) => undoLastMove(prev));
  };

  // Hint (practice mode)
  const handleHint = () => {
    sounds.playButtonClick();
    const bestMove = getAIMove(gameState, 'hard');
    if (bestMove) {
      setHintEdgeId(bestMove);
      setTimeout(() => setHintEdgeId(null), 3000);
    }
  };

  // Rematch
  const handleRematch = () => {
    sounds.playButtonClick();
    if (isOnline) {
      networkClient.requestRematch();
      setIsGameOverModalOpen(false);
    } else {
      setGameState(createInitialGameState(boardSize));
      setTimerSeconds(0);
      setIsGameOverModalOpen(false);
    }
  };

  const isInteractive =
    gameState.status === 'PLAYING' &&
    (!isOnline || gameState.currentPlayer === onlineRole) &&
    (gameMode !== 'vs_ai' || gameState.currentPlayer === 'player1');

  return (
    <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden relative">
      {/* Top Score & Status */}
      <ScoreBoard
        gameState={gameState}
        player1Name={player1Name}
        player2Name={player2Name}
        player1Avatar={player1Avatar}
        player2Avatar={player2Avatar}
        isP2AI={gameMode === 'vs_ai'}
        themeId={themeId}
        clientRole={onlineRole}
        timerSeconds={timerSeconds}
        entryFee={entryFee}
        prizePool={entryFee * 2}
      />

      {/* Opponent Status / Disconnection Notice */}
      {opponentStatusText && (
        <div className="w-full max-w-sm mx-auto my-1 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold text-center animate-pulse">
          {opponentStatusText}
        </div>
      )}

      {/* Center Game Board */}
      <div className="flex-1 flex items-center justify-center my-auto min-h-0">
        <GameBoard
          gameState={gameState}
          onEdgeClick={handleEdgeClick}
          themeId={themeId}
          player1Name={player1Name}
          player2Name={player2Name}
          isInteractive={isInteractive}
          hintEdgeId={hintEdgeId}
          showCoordinates={boardSize >= 6}
        />
      </div>

      {/* Bottom Controls / Action Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 border-t border-slate-900 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setShowExitConfirm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>

          <button
            onClick={() => {
              const muted = !isMuted;
              sounds.setMuted(muted);
              setIsMuted(muted);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>

        {/* Practice Mode Aids */}
        {gameMode === 'practice' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={gameState.moves.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleHint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 text-xs font-semibold border border-purple-800/80 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
              <span>Hint</span>
            </button>
          </div>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold mb-2">Leave Current Match?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Exiting an active game will forfeit your current progress.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  sounds.playButtonClick();
                  if (isOnline) networkClient.leaveRoom();
                  onExit();
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20"
              >
                Forfeit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOverModalOpen && (
        <GameOverModal
          winner={gameState.winner}
          player1Score={gameState.scores.player1}
          player2Score={gameState.scores.player2}
          player1Name={player1Name}
          player2Name={player2Name}
          clientRole={onlineRole}
          xpGained={matchResultMeta.xpGained}
          coinsGained={matchResultMeta.coinsGained}
          entryFee={entryFee}
          perWinBonus={matchResultMeta.perWinBonus ?? 100}
          milestoneBonus={matchResultMeta.milestoneBonus ?? 0}
          milestoneLabel={matchResultMeta.milestoneLabel}
          newAchievements={matchResultMeta.newAchievements}
          onRematch={handleRematch}
          onWatchReplay={() => {
            onOpenReplay({
              id: 'current_match',
              gameMode,
              boardSize,
              opponentName: player2Name,
              playerScore: gameState.scores.player1,
              opponentScore: gameState.scores.player2,
              moves: gameState.moves,
              durationSeconds: timerSeconds,
            });
          }}
          onHome={onExit}
        />
      )}
    </div>
  );
};
