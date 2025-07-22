import React, { useState } from 'react';

const SetWord = ({ onWordSet }) => {
  const [word, setWord] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim()) {
      onWordSet(word.toLowerCase().trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Set the Secret Word</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter secret word..."
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          Set Word & Start Game
        </button>
      </form>
    </div>
  );
};

export default SetWord; 