import { useState, useRef, useEffect } from 'react';
import Peer from 'simple-peer';
import pako from 'pako';
import './App.css';
import HostView from './components/HostView';
import JoinView from './components/JoinView';
import SetWord from './components/SetWord';
import Game from './components/Game';
import RoleSelect from './components/RoleSelect';
import NameInput from './components/NameInput';

// URL-safe base64 helpers
const toBase64Url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (str) => atob(str.replace(/-/g, '+').replace(/_/g, '/'));

// Helper functions to compress and decompress signal data
const encodeSignal = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(jsonString);
    const binaryString = Array.from(compressed).map(char => String.fromCharCode(char)).join('');
    return toBase64Url(binaryString);
  } catch (e) {
    console.error('Encoding error:', e);
    throw new Error('Failed to encode signal');
  }
};

const decodeSignal = (encoded) => {
  try {
    const binaryString = fromBase64Url(encoded);
    const compressed = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i);
    }
    const decompressed = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (e) {
    console.error('Decoding error:', e);
    throw new Error('Invalid signal format');
  }
};



function App() {
  const [mode, setMode] = useState(null);
  const [peer, setPeer] = useState(null);
  const [remoteSignal, setRemoteSignal] = useState('');
  const [connected, setConnected] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [hostSignal, setHostSignal] = useState('');
  const [joinSignal, setJoinSignal] = useState('');
  const [status, setStatus] = useState('');
  const [ICEStatus, setICEStatus] = useState('');
  const [gameState, setGameState] = useState({
    word: '',
    guessedLetters: [],
    turn: 'host',
    status: 'waiting',
  });
  const [role, setRole] = useState(null);
  const [roleLocked, setRoleLocked] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const peerRef = useRef();
  const connectionTimeoutRef = useRef();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  // Effect to determine who sets the word first
  useEffect(() => {
    if (connected && isInitiator && role) {
      const newGameState = {
        word: '',
        guessedLetters: [],
        wordGiver: role === 'giver' ? mode : (mode === 'host' ? 'join' : 'host'),
        guesser: role === 'giver' ? (mode === 'host' ? 'join' : 'host') : mode,
        turn: 'set_word',
        status: 'setting_word',
        round: 1,
        maxMistakes: 9,
      };
      setGameState(newGameState);
      sendGameState(newGameState);
    }
  }, [connected, isInitiator, role, mode]);

  const setupPeer = (isInitiator) => {

  if (peerRef.current) {
    peerRef.current.destroy();
    peerRef.current = null;
  }

  const p = new Peer({
    initiator: isInitiator,
    trickle: true,
    config: { 
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Add your TURN server here if needed:
        // { urls: 'turn:your.turn.server', username: 'user', credential: 'pass' }
      ]
    },
    // Optional: Configure SDP semantics for better compatibility
    sdpSemantics: 'unified-plan'
  });

  // Store peer reference
  setPeer(p);
  peerRef.current = p;

  // Track if peer is destroyed
  let isDestroyed = false;

  // Signal handler - only process offers and answers
  p.on('signal', (data) => {
    if (isDestroyed) return;
    console.log('Signal generated:', data);
    if (data.type === 'offer') {
      setHostSignal(encodeSignal(data));
      if (isInitiator) {
        setStatus('Offer created. Share this with the other player:');
      }
    } else if (data.type === 'answer') {
      setJoinSignal(encodeSignal(data));
      if (!isInitiator) {
        setStatus('Answer created. Share this with the host:');
      }
    }
    // Note: We intentionally ignore candidate signals here
  });

  // Connection established
  p.on('connect', () => {
    if (isDestroyed) return;
    console.log('Peer connection established');
    setConnected(true);
    setStatus('Connected! Starting game...');
    clearConnectionTimeout();
  });

  // Data channel message handler
  p.on('data', handleData);

  // Connection closed
  p.on('close', () => {
    isDestroyed = true;
    console.log('Peer connection closed');
    setConnected(false);
    setStatus('Connection closed');
    clearConnectionTimeout();
  });

  // Error handler
  p.on('error', (err) => {
    isDestroyed = true;
    console.error('Peer error:', err);
    setStatus(`Connection error: ${err.message}`);
    clearConnectionTimeout();
  });

  // ICE connection state changes
  p.on('iceStateChange', (state) => {
    console.log('ICE state changed:', state);
    setICEStatus(state);
    
    if (state === 'disconnected') {
      setStatus('Connection lost. Trying to reconnect...');
    } else if (state === 'failed') {
      setStatus('Connection failed. Please try again.');
      p.destroy();
    } else if (state === 'connected') {
      setStatus('Connected!');
    }
  });

  // Track ICE gathering state
  p.on('iceGatheringStateChange', (state) => {
    console.log('ICE gathering state:', state);
  });

  // Track signaling state
  p.on('signalingStateChange', (state) => {
    console.log('Signaling state:', state);
  });

  // Start connection timeout
  startConnectionTimeout(p);

  return p;
};

const startConnectionTimeout = (peer) => {
  connectionTimeoutRef.current = setTimeout(() => {
    if (!connected && peer && !peer.destroyed) {
      setStatus('Connection timed out. Please try again.');
      peer.destroy();
    }
  }, 1500000);
};

const clearConnectionTimeout = () => {
  if (connectionTimeoutRef.current) {
    clearTimeout(connectionTimeoutRef.current);
    connectionTimeoutRef.current = null;
  }
};

  // Modified startHost and startJoin
const startHost = () => {
  setIsInitiator(true);
  setMode('host');
  setupPeer(true);
  setStatus('Host started. Share your offer code with the other player.');
};

const startJoin = () => {
  setIsInitiator(false);
  setMode('join');
  setupPeer(false);
  setStatus('Join started. Enter the host\'s offer code.');
};

  // Handle role selection and sync
  const handleRoleSelect = (selectedRole) => {
    if (roleLocked) return;
    setRole(selectedRole);
    setRoleLocked(true);
    if (peerRef.current && peerRef.current.connected) {
      peerRef.current.send(JSON.stringify({ type: 'role', role: selectedRole }));
    }
  };

  // Handle incoming data
  const handleData = (data) => {
    try {
      const msg = JSON.parse(data);
      console.log('Received message:', msg);
      
      if (msg.type === 'gameState') {
        setGameState(msg.state);
      } else if (msg.type === 'role') {
        setRole(msg.role === 'giver' ? 'guesser' : 'giver');
        setRoleLocked(true);
      } else if (msg.type === 'name') {
        setOpponentName(msg.name);
      }
    } catch (e) {
      console.error("Failed to parse incoming data:", e);
    }
  };

  // When user provides a signal code
  const handleSignal = () => {
  try {

    if (!peerRef.current || peerRef.current.destroyed) {
      throw new Error('Connection is not active. Please start a new connection.');
    }

    const signalToUse = mode === 'host' ? remoteSignal : hostSignal;
    if (!signalToUse?.trim()) {
      throw new Error('Please provide the connection code');
    }

    console.log('Processing signal:', signalToUse);
    const decodedSignal = decodeSignal(signalToUse.trim());
    console.log('Decoded signal:', decodedSignal);

    if (!peerRef.current) {
      throw new Error('Peer connection not initialized');
    }

    // Accept all valid signal types (offer, answer, candidate)
    const validTypes = ['offer', 'answer', 'candidate'];
    if (!decodedSignal.type || !validTypes.includes(decodedSignal.type)) {
      throw new Error(`Invalid signal type: ${decodedSignal.type}`);
    }

    peerRef.current.signal(decodedSignal);
    setStatus('Signal accepted, establishing connection...');

  } catch (e) {
    console.error('Signal handling error:', e);
    setStatus(`Error: ${e.message}`);
    
    // Reset connection if error occurs
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setConnected(false);
  }
};

  // Send game state to peer
  const sendGameState = (state) => {
    if (peerRef.current && peerRef.current.connected) {
      try {
        peerRef.current.send(JSON.stringify({ type: 'gameState', state }));
      } catch (e) {
        console.error('Error sending game state:', e);
      }
    }
  };

  // Send player name
  const sendPlayerName = (name) => {
    if (peerRef.current && peerRef.current.connected) {
      try {
        peerRef.current.send(JSON.stringify({ type: 'name', name }));
      } catch (e) {
        console.error('Error sending player name:', e);
      }
    }
  };

  // Set player name and proceed
  const handleNameSet = (name) => {
    setPlayerName(name);
  };

  // When connection is established, exchange names
  useEffect(() => {
    if (connected && playerName) {
      sendPlayerName(playerName);
    }
  }, [connected, playerName]);

  // Player sets the secret word
  const handleSetWord = (word) => {
    const newState = {
      ...gameState,
      word: word,
      guessedLetters: [],
      status: 'playing',
      turn: 'guess',
    };
    setGameState(newState);
    sendGameState(newState);
  };

  // Player makes a guess
  const handleGuess = (letter) => {
    if (gameState.guessedLetters.includes(letter) || gameState.status !== 'playing') return;

    const newGuessedLetters = [...gameState.guessedLetters, letter];
    const isWinner = gameState.word.split('').every(l => newGuessedLetters.includes(l));
    const incorrectCount = newGuessedLetters.filter(l => !gameState.word.includes(l)).length;
    const isLoser = incorrectCount >= (gameState.maxMistakes || 9);

    let newState = {
      ...gameState,
      guessedLetters: newGuessedLetters,
      status: isWinner || isLoser ? 'finished' : 'playing',
      turn: isWinner || isLoser ? 'finished' : 'guess',
    };

    setGameState(newState);
    sendGameState(newState);
  };

  // Starts the next round of the game with swapped roles
  const handleNextRound = () => {
    // Swap roles
    const nextWordGiver = gameState.guesser;
    const nextGuesser = gameState.wordGiver;
    
    const nextState = {
      ...gameState,
      word: '',
      guessedLetters: [],
      wordGiver: nextWordGiver,
      guesser: nextGuesser,
      status: 'setting_word',
      turn: 'set_word',
      round: (gameState.round || 1) + 1,
    };
    setGameState(nextState);
    sendGameState(nextState);
  };

  // Render the current game screen
  const renderGame = () => {
    if (!role) {
      return <RoleSelect onSelect={handleRoleSelect} disabled={roleLocked} />;
    }
    const isWordGiver = gameState.wordGiver === mode;
    const isGuesser = gameState.guesser === mode;
    if (gameState.status === 'setting_word' && isWordGiver) {
      return <SetWord onWordSet={handleSetWord} />;
    }
    if ((gameState.status === 'playing' || gameState.status === 'finished') && (isWordGiver || isGuesser)) {
      return <Game
        gameState={gameState}
        onGuess={isGuesser ? handleGuess : () => {}}
        isMyTurn={isGuesser && gameState.status === 'playing'}
        onNextRound={handleNextRound}
        canStartNextRound={isInitiator} // Only the original host can start the next round
        playerName={playerName}
        opponentName={opponentName}
      />;
    }
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold animate-pulse">Waiting for other player...</h2>
      </div>
    );
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied to clipboard!');
    } catch {
      setStatus('Failed to copy. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-4">
      <span className=' absolute top-1 right-3 text-slate-700 font-semibold'>V1.00.01</span>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Hangman SAGA</h1>
        <p className="text-gray-500 dark:text-gray-600">A 2-Player P2P Game</p>
      </div>

      {!playerName ? (
        <NameInput onNameSet={handleNameSet} />
      ) : (
        <>
          {!connected && !mode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 max-w-sm w-full mx-auto">
              <div className="flex flex-col gap-4">
                <button
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
                  onClick={startHost}
                >
                  Host Game
                </button>
                <button
                  className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  onClick={startJoin}
                >
                  Join Game
                </button>
              </div>
            </div>
          )}

          {!connected && mode === 'host' && (
            <HostView
              hostSignal={hostSignal}
              onCopyToClipboard={copyToClipboard}
              remoteSignal={remoteSignal}
              onRemoteSignalChange={e => setRemoteSignal(e.target.value)}
              onConnect={handleSignal}
              status={status}
            />
          )}
          
          {!connected && mode === 'join' && (
            <JoinView
              onRemoteSignalChange={e => setHostSignal(e.target.value)}
              onConnect={handleSignal}
              joinSignal={joinSignal}
              onCopyToClipboard={copyToClipboard}
              status={status}
            />
          )}

          {connected && renderGame()}
        </>
      )}

      {/* Debug Panel */}
      <div className="fixed bottom-0 left-0 w-full bg-black bg-opacity-90 text-green-300 text-xs p-2 font-mono z-50">
        <div className="flex justify-between items-center">
          <span className="font-bold">DEBUG PANEL</span>
          <span>mode: {JSON.stringify(mode)} | connected: {JSON.stringify(connected)} | status: {JSON.stringify(status) } | ICE_state: {JSON.stringify(ICEStatus)} </span>
        </div>
      </div>
    </div>
  );
}

export default App;
