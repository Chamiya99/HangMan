import React from 'react';

const RoleSelect = ({ onSelect, disabled }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 max-w-md w-full mx-auto flex flex-col gap-6 items-center">
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Choose Your Role</h2>
    <button
      className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
      onClick={() => onSelect('giver')}
      disabled={disabled}
    >
      I want to give the word
    </button>
    <button
      className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-semibold py-3 rounded-lg transition-colors"
      onClick={() => onSelect('guesser')}
      disabled={disabled}
    >
      I want to guess the word
    </button>
    {disabled && <p className="text-gray-500 mt-4">Waiting for the other player to choose...</p>}
  </div>
);

export default RoleSelect; 