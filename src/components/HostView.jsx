import React from 'react';

const HostView = ({ hostSignal, onCopyToClipboard, remoteSignal, onRemoteSignalChange, onConnect, status }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 max-w-md w-full mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Host a Game</h2>
      
      {!hostSignal ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Generating your invite code...</p>
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">1. Send Your Invite Code</label>
            <button
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg transition-transform transform hover:scale-105"
              onClick={() => onCopyToClipboard(hostSignal)}
            >
              Copy Invite Code
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">2. Paste Partner's Accept Code</label>
            <textarea
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-xs font-mono resize-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
              value={remoteSignal}
              onChange={onRemoteSignalChange}
              rows={2}
              placeholder="Paste final code here..."
            />
          </div>

          <button
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
            onClick={onConnect}
          >
            Connect
          </button>
        </div>
      )}
      
      <div className="text-center mt-4 text-sm text-gray-500">Status: <span className="font-semibold text-black dark:text-white">{status}</span></div>
    </div>
  );
};

export default HostView; 