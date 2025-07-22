import React, { useState } from 'react';

const NameInput = ({ onNameSet }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 max-w-sm w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Enter Your Name</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default NameInput; 