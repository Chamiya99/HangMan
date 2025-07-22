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
  const jsonString = JSON.stringify(data);
  const compressed = pako.deflate(jsonString);
  // Convert Uint8Array to a binary string
  const binaryString = String.fromCharCode.apply(null, compressed);
  return toBase64Url(binaryString);
};

const decodeSignal = (encoded) => {
  const binaryString = fromBase64Url(encoded);
  // Convert binary string back to Uint8Array
  const compressed = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    compressed[i] = binaryString.charCodeAt(i);
  }
  const decompressed = pako.inflate(compressed, { to: 'string' });
  return JSON.parse(decompressed);
};

function App() {
  const [mode, setMode] = useState(null); // 'host' or 'join'
  const [peer, setPeer] = useState(null);
  const [remoteSignal, setRemoteSignal] = useState('');
  const [connected, setConnected] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [hostSignal, setHostSignal] = useState(''); // Host's initial offer
  const [joinSignal, setJoinSignal] = useState(''); // Joiner's final answer
  const [status, setStatus] = useState('');
  const [gameState, setGameState] = useState({
    word: '',
    guessedLetters: [],
    turn: 'host', // 'host' or 'join'
    status: 'waiting', // 'waiting', 'setting_word', 'playing', 'finished'
  });
  const [role, setRole] = useState(null); // 'giver' or 'guesser'
  const [roleLocked, setRoleLocked] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const peerRef = useRef();
  console.log(peer);
  // Effect to determine who sets the word first
  useEffect(() => {
    if (connected && isInitiator && role) {
      // Only the initiator and after role selection
      const newGameState = {
        word: '',
        guessedLetters: [],
        wordGiver: role === 'giver' ? mode : (mode === 'host' ? 'join' : 'host'),
        guesser: role === 'giver' ? (mode === 'host' ? 'join' : 'host') : mode,
        turn: 'set_word', // 'set_word', 'guess', 'finished'
        status: 'setting_word',
        round: 1,
        maxMistakes: 9,
      };
      setGameState(newGameState);
      sendGameState(newGameState);
    }
    // eslint-disable-next-line
  }, [connected, isInitiator, role]);

  // Host: create peer and generate offer
  const startHost = () => {
    setIsInitiator(true);
    setMode('host');
    const p = new Peer({ initiator: true, trickle: false });
    setPeer(p);
    peerRef.current = p;
    p.on('signal', data => {
      setHostSignal(encodeSignal(data));
    });
    p.on('connect', () => {
      setConnected(true);
      setStatus('Connected!');
    });
    p.on('data', handleData);
    p.on('close', () => setConnected(false));
  };

  // Join: create peer and wait for offer
  const startJoin = () => {
    setIsInitiator(false);
    setMode('join');
    const p = new Peer({ initiator: false, trickle: false });
    setPeer(p);
    peerRef.current = p;
    p.on('signal', data => {
      setJoinSignal(encodeSignal(data));
    });
    p.on('connect', () => {
      setConnected(true);
      setStatus('Connected!');
    });
    p.on('data', handleData);
    p.on('close', () => setConnected(false));
  };

  // Handle role selection and sync
  const handleRoleSelect = (selectedRole) => {
    if (roleLocked) return;
    setRole(selectedRole);
    setRoleLocked(true);
    // Send role selection to peer
    if (peerRef.current && peerRef.current.connected) {
      peerRef.current.send(JSON.stringify({ type: 'role', role: selectedRole }));
    }
  };

  // Handle incoming data (game state, moves, etc.)
  function handleData(data) {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'gameState') {
        setGameState(msg.state);
      } else if (msg.type === 'role') {
        // Lock in the opposite role
        setRole(msg.role === 'giver' ? 'guesser' : 'giver');
        setRoleLocked(true);
      } else if (msg.type === 'name') {
        setOpponentName(msg.name);
      }
    } catch (e) {
      console.error("Failed to parse incoming data:", e);
    }
  }

  // When user provides a signal code
  const handleSignal = () => {
    if ((mode === 'host' && !remoteSignal.trim()) || (mode === 'join' && !hostSignal.trim())) {
      setStatus('Please provide the connection code.');
      return;
    }

    try {
      const signalToUse = mode === 'host' ? remoteSignal : hostSignal;
      const decodedSignal = decodeSignal(signalToUse.trim());
      peerRef.current.signal(decodedSignal);
      setStatus('Signal accepted, establishing connection...');
    } catch (e) {
      console.error(e);
      setStatus('That signal code is not valid. Please try again.');
    }
  };

  // Send game state to peer
  const sendGameState = (state) => {
    if (peerRef.current && peerRef.current.connected) {
      peerRef.current.send(JSON.stringify({ type: 'gameState', state }));
    }
  };

  // Send player name
  const sendPlayerName = (name) => {
    if (peerRef.current && peerRef.current.connected) {
      peerRef.current.send(JSON.stringify({ type: 'name', name }));
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
          <span>mode: {JSON.stringify(mode)} | connected: {JSON.stringify(connected)} | status: {JSON.stringify(status)}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
