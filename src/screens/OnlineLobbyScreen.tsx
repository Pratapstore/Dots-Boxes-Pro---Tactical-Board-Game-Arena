import React, { useState, useEffect } from 'react';
import { BoardDimension } from '../game/engine/types';
import { PlayerProfile } from '../game/state/playerProfile';
import { networkClient, OpponentInfo } from '../game/multiplayer/networkClient';
import { sounds } from '../game/audio/soundEngine';
import { Copy, Check, Users, Globe, Play, Loader2, ArrowLeft, Share2 } from 'lucide-react';

interface OnlineLobbyScreenProps {
  profile: PlayerProfile;
  onMatchReady: (data: {
    roomCode: string;
    role: 'player1' | 'player2';
    boardSize: BoardDimension;
    opponent: OpponentInfo;
    gameState: any;
  }) => void;
  onBack: () => void;
  onOpenCoinVault?: () => void;
}

export const OnlineLobbyScreen: React.FC<OnlineLobbyScreenProps> = ({
  profile,
  onMatchReady,
  onBack,
  onOpenCoinVault,
}) => {
  const [tab, setTab] = useState<'create' | 'join' | 'quick'>('create');
  const [boardSize, setBoardSize] = useState<BoardDimension>(4);
  const [inputCode, setInputCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    networkClient.connect({
      onRoomCreated: (data) => {
        setCreatedCode(data.roomCode);
        setStatusMessage('Waiting for opponent to join...');
      },
      onRoomJoined: (data) => {
        sounds.playBoxComplete();
        onMatchReady({
          roomCode: data.roomCode,
          role: data.role,
          boardSize: data.boardSize,
          opponent: data.opponent,
          gameState: data.gameState,
        });
      },
      onOpponentJoined: (data) => {
        sounds.playBoxComplete();
        if (createdCode) {
          onMatchReady({
            roomCode: createdCode,
            role: 'player1',
            boardSize,
            opponent: data.opponent,
            gameState: data.gameState,
          });
        }
      },
      onMatchFound: (data) => {
        sounds.playBoxComplete();
        setIsSearching(false);
        onMatchReady({
          roomCode: data.roomCode,
          role: data.role,
          boardSize: data.boardSize,
          opponent: data.opponent,
          gameState: data.gameState,
        });
      },
      onError: (msg) => {
        setErrorMessage(msg);
        setIsSearching(false);
      },
    });

    return () => {
      // Don't disconnect if navigating into match
    };
  }, [createdCode, boardSize, onMatchReady]);

  const handleCreateRoom = () => {
    sounds.playButtonClick();
    if (profile.coins < 100) {
      sounds.playError();
      setErrorMessage('Insufficient coins! 100 Coins required to enter match.');
      return;
    }
    setErrorMessage(null);
    networkClient.createRoom(
      profile.id,
      profile.username,
      profile.avatar,
      boardSize,
      profile.ratingElo
    );
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    sounds.playButtonClick();
    if (profile.coins < 100) {
      sounds.playError();
      setErrorMessage('Insufficient coins! 100 Coins required to enter match.');
      return;
    }
    setErrorMessage(null);
    networkClient.joinRoom(
      inputCode.trim().toUpperCase(),
      profile.id,
      profile.username,
      profile.avatar,
      profile.ratingElo
    );
  };

  const handleStartQueue = () => {
    sounds.playButtonClick();
    if (profile.coins < 100) {
      sounds.playError();
      setErrorMessage('Insufficient coins! 100 Coins required to enter match.');
      return;
    }
    setErrorMessage(null);
    setIsSearching(true);
    networkClient.joinQueue(
      profile.id,
      profile.username,
      profile.avatar,
      boardSize,
      profile.ratingElo
    );
  };

  const handleCancelQueue = () => {
    sounds.playButtonClick();
    setIsSearching(false);
    networkClient.leaveQueue();
  };

  const handleCopyCode = async () => {
    if (!createdCode) return;
    sounds.playButtonClick();
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleShareInvite = async () => {
    if (!createdCode) return;
    sounds.playButtonClick();
    const shareText = `Join my Dots & Boxes Pro online match! Room Code: ${createdCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dots & Boxes Pro Match Invitation',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // Fallback
      }
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 select-none overflow-y-auto">
      {/* Top Bar Navigation */}
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

        <h2 className="text-base font-black text-white tracking-tight">ONLINE MULTIPLAYER</h2>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            sounds.playButtonClick();
            setTab('create');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === 'create'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Room
        </button>
        <button
          onClick={() => {
            sounds.playButtonClick();
            setTab('join');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === 'join'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Join Code
        </button>
        <button
          onClick={() => {
            sounds.playButtonClick();
            setTab('quick');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === 'quick'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Matchmaking
        </button>
      </div>

      {/* Stakes & Balance Card */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🪙</span>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Ranked Stakes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">100 🪙</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold">
              Winner Takes 200 Coins Pot
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playCoinCollect();
            onOpenCoinVault?.();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-mono text-xs font-bold transition-colors"
        >
          <span>{profile.coins.toLocaleString()} 🪙</span>
          <span className="text-[10px] text-amber-400 font-black">+</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center justify-between">
          <span>{errorMessage}</span>
          {errorMessage.includes('Insufficient') && (
            <button
              onClick={() => {
                sounds.playCoinCollect();
                onOpenCoinVault?.();
              }}
              className="ml-2 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] shrink-0"
            >
              Get Free Coins
            </button>
          )}
        </div>
      )}

      {/* Tab 1: Create Room */}
      {tab === 'create' && (
        <div className="flex-1 flex flex-col space-y-4">
          {!createdCode ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Grid Size for Match
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([3, 4, 5, 6, 8, 10] as BoardDimension[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        sounds.playButtonClick();
                        setBoardSize(sz);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        boardSize === sz
                          ? 'bg-sky-950/80 border-cyan-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-sm font-black">{sz}×{sz}</div>
                      <div className="text-[9px] text-slate-400">{sz * sz} Boxes</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                Hosting a private room generates a secure 4-character code. Share the code with your friend to connect and play live!
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all"
              >
                <Users className="w-4 h-4" />
                <span>GENERATE PRIVATE ROOM</span>
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
                <Globe className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Room Created!</h3>
                <p className="text-xs text-slate-400 mt-1">Share this room code with your friend</p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-slate-900 border border-cyan-500/50 flex items-center justify-between">
                <span className="text-2xl font-black font-mono tracking-widest text-cyan-400">
                  {createdCode}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleShareInvite}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Share Room Invite"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Join Room */}
      {tab === 'join' && (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Enter 4-Digit Room Code
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. DOTS-7824"
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono text-lg font-bold text-white tracking-widest focus:outline-none focus:border-cyan-400 uppercase"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            Enter the code received from your friend or tournament coordinator to jump directly into their game board.
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!inputCode.trim()}
            className="w-full mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>JOIN MATCH NOW</span>
          </button>
        </div>
      )}

      {/* Tab 3: Quick Matchmaking */}
      {tab === 'quick' && (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Preferred Board Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([3, 4, 5, 6, 8, 10] as BoardDimension[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    sounds.playButtonClick();
                    setBoardSize(sz);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    boardSize === sz
                      ? 'bg-sky-950/80 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-black">{sz}×{sz}</div>
                  <div className="text-[10px] text-slate-400">{sz * sz} Boxes</div>
                </button>
              ))}
            </div>
          </div>

          {isSearching ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
              <div className="text-sm font-bold text-white">Searching for an online opponent...</div>
              <div className="text-xs text-slate-400 font-mono">
                Matching Elo around {profile.ratingElo} · {boardSize}×{boardSize}
              </div>

              <button
                onClick={handleCancelQueue}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel Search
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                Connects you automatically with an available human player in the matchmaking pool based on your chosen board size.
              </div>

              <button
                onClick={handleStartQueue}
                className="w-full mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>FIND OPPONENT NOW</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
