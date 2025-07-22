import React from 'react';

const KEYS = "abcdefghijklmnopqrstuvwxyz".split("");

const Keyboard = ({ activeLetters, inactiveLetters, onSelectLetter, disabled }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: '.5rem', marginTop: '1em' }}>
      {KEYS.map(key => {
        const isActive = activeLetters.includes(key);
        const isInactive = inactiveLetters.includes(key);
        return (
          <button
            onClick={() => onSelectLetter(key)}
            className={`keyboard-btn w-full text-2xl p-2 font-bold uppercase border-2 border-black rounded-lg
              ${isActive ? 'keyboard-btn-active' : ''}
              ${isInactive ? 'keyboard-btn-inactive' : ''}
              hover:bg-indigo-200 focus:bg-indigo-300
            `}
            disabled={isInactive || isActive || disabled}
            key={key}
            style={{ minWidth: 0 }}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};

export default Keyboard; 