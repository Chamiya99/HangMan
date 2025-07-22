import React from 'react';

const WordDisplay = ({ word, guessedLetters }) => {
  return (
    <div style={{
  display: 'flex',
  gap: '.25em',
  fontSize: '3rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
  letterSpacing: '0.1em',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '1rem',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.07)',
  padding: '0.5em 1em',
  margin: '0.5em 0',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)'
}}>
      {word.split('').map((letter, index) => (
        <span style={{ borderBottom: '.1rem solid black' }} key={index}>
          <span style={{ visibility: guessedLetters.includes(letter) ? 'visible' : 'hidden' }}>
            {letter}
          </span>
        </span>
      ))}
    </div>
  );
};

export default WordDisplay; 