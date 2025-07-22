import React from 'react';
import { GiOverkill } from "react-icons/gi";

const HEAD = (
  <div key="head" style={{
    width: '50px',
    height: '50px',
    borderRadius: '100%',
    border: '10px solid black',
    position: 'absolute',
    top: '120px',
    right: '-20px',
  }} />
);

const BODY = (
  <div key="body" style={{
    width: '10px',
    height: '100px',
    background: 'black',
    position: 'absolute',
    top: '170px',
    right: 0,
  }} />
);

const RIGHT_ARM = (
  <div key="right-arm" style={{
    width: '100px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '190px',
    right: '-100px',
    rotate: '-30deg',
    transformOrigin: 'left bottom',
  }} />
);

const LEFT_ARM = (
  <div key="left-arm" style={{
    width: '100px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '190px',
    right: '10px',
    rotate: '30deg',
    transformOrigin: 'right bottom',
  }} />
);

const RIGHT_LEG = (
  <div key="right-leg" style={{
    width: '100px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '260px',
    right: '-90px',
    rotate: '60deg',
    transformOrigin: 'left bottom',
  }} />
);

const LEFT_LEG = (
  <div key="left-leg" style={{
    width: '100px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '260px',
    right: 0,
    rotate: '-60deg',
    transformOrigin: 'right bottom',
  }} />
);
const ROPE_1 = (
  <div key="rope-1" style={{ 
    width: '100px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '110px',
    right: "5px",
    rotate: '40deg',
    transformOrigin: 'right bottom',
  }} />
);
const ROPE_2 = (
  <div key="rope-2" style={{
    width: '60px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '105px',
    right: '10px',
    rotate: '90deg',
    transformOrigin: 'right bottom',
  }} />
);
const ROPE_3 = (
  <div key="rope-3" style={{ 
    width: '100px',
    height: '10px',
    background: 'black',
    position: 'absolute',
    top: '102px',
    right: "10px",
    rotate: '-220deg',
    transformOrigin: 'right bottom',
  }} />
);

  

const BODY_PARTS = [
  React.cloneElement(ROPE_1, { className: 'hangman-part' }),
  React.cloneElement(ROPE_2, { className: 'hangman-part' }),
  React.cloneElement(ROPE_3, { className: 'hangman-part' }),
  React.cloneElement(HEAD, { className: 'hangman-part' }),
  React.cloneElement(BODY, { className: 'hangman-part' }),
  React.cloneElement(RIGHT_ARM, { className: 'hangman-part' }),
  React.cloneElement(LEFT_ARM, { className: 'hangman-part' }),
  React.cloneElement(RIGHT_LEG, { className: 'hangman-part' }),
  React.cloneElement(LEFT_LEG, { className: 'hangman-part' }),
];

const HangmanDrawing = ({ numberOfGuesses }) => {
  return (
    <div style={{ position: 'relative' }}>
      {BODY_PARTS.slice(0, numberOfGuesses)}
      <div style={{ height: '50px', width: '10px', background: 'black', position: 'absolute', top: 0, right: 0 }} />
      <div style={{ height: '10px', width: '150px', background: 'black', position: 'absolute', top: 50, right: -71 }} />
      <div style={{ height: '10px', width: '200px', background: 'black', marginLeft: '120px' }} />
      <div style={{ height: '400px', width: '10px', background: 'black', marginLeft: '120px' }} />
      <div style={{ height: '10px', width: '250px', background: 'black' }} />
      {numberOfGuesses == 4 &&
      <span className="animate-pulse hangman-part" style={{ position: 'absolute', top:120, right: -65 , rotate: '-35deg'}}>hi..</span>
      }
      {numberOfGuesses == 8 && 
      <>
      <span className="animate-pulse hangman-part" style={{ position: 'absolute', top:120, right: -65 , rotate: '-35deg'}}>Help..</span>
      <span className="animate-pulse hangman-part" style={{ position: 'absolute', top:220, right: 65 , rotate: '-35deg'}}>Help..</span>
      <span className="animate-pulse hangman-part" style={{ position: 'absolute', top:200, right: -65 , rotate: '-35deg'}}>Help..</span>
      </>
      }
      {numberOfGuesses > 8 &&
      <>
      <GiOverkill className="text-5xl text-black" style={{ position: 'absolute', top:120, right: -20 }}/>
      <span className="animate-pulse hangman-part" style={{ position: 'absolute', top:120, right: -65 , rotate: '-35deg'}}>WTF!</span>
      </>
      }
    </div>
  );
};

export default HangmanDrawing; 