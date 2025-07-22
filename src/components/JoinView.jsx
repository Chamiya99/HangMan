import React from 'react';

const JoinView = ({ onRemoteSignalChange, onConnect, joinSignal, onCopyToClipboard, status }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 max-w-md w-full mx-auto">
      {!joinSignal ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Join Game</h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">Paste the invite code from your partner below.</p>
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-xs font-mono resize-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
            onChange={onRemoteSignalChange}
            rows={2}
            placeholder="Paste invite code here..."
          />
          <button
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
            onClick={onConnect}
          >
            Accept
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Almost Done!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Send this accept code back to your partner to complete the connection.</p>
          <button
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
            onClick={() => onCopyToClipboard(joinSignal)}
          >
            Copy Accept Code
          </button>
        </div>
      )}
      <div className="text-center mt-4 text-sm text-gray-500">Status: <span className="font-semibold text-black dark:text-white">{status}</span></div>
    </div>
  );
};

export default JoinView; 