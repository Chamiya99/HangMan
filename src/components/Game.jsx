import React from "react";
import HangmanDrawing from "./HangmanDrawing";
import WordDisplay from "./WordDisplay";
import Keyboard from "./Keyboard";
import { FaHeart, FaUser } from "react-icons/fa";
import "../GameCustom.css";

const Game = ({
  gameState,
  onGuess,
  isMyTurn,
  onNextRound,
  canStartNextRound,
  playerName,
  opponentName,
}) => {
  const { word, guessedLetters, maxMistakes, wordGiver, round } =
    gameState;

  const incorrectGuesses = guessedLetters.filter(
    (letter) => !word.includes(letter)
  );
  const isWinner = word
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isLoser = incorrectGuesses.length >= maxMistakes;
  const isGameOver = isWinner || isLoser;

  const myRole =
    wordGiver === (canStartNextRound ? "host" : "join") ? "giver" : "guesser";
  const remainingGuesses = maxMistakes - incorrectGuesses.length;

  let endOfGameMessage;
  if (isWinner) {
    endOfGameMessage = `${
      myRole === "guesser" ? playerName : opponentName
    } Wins!`;
  } else if (isLoser) {
    endOfGameMessage = `${
      myRole === "guesser" ? playerName : opponentName
    } Loses!`;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full mx-auto p-4 bg-gradient-soft rounded-2xl shadow-xl animate-fade-in">
      <div className="lg:w-3/4 w-full mb-6 lg:mb-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 flex justify-around items-center animate-fade-in">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-gray-500">Round</span>
            <span className="text-black dark:text-white text-2xl">
              {round || 1}
            </span>
          </div>
          <div className="flex gap-2 w-full justify-center">
            <div
              className={`flex items-center gap-2 p-2 rounded bg-blue-100 dark:bg-blue-900`}
            >
              <FaUser className="text-blue-500" />
              <span className="font-bold">
                {myRole === "giver" ? playerName : opponentName}
              </span>
              <span className="text-xs text-gray-500">Word Giver</span>
            </div>
            <div
              className={`flex items-center gap-2 p-2 rounded "bg-green-100 dark:bg-green-900`}
            >
              <FaUser className="text-green-500" />
              <span className="font-bold">
                {myRole === "guesser" ? playerName : opponentName}
              </span>
              <span className="text-xs text-gray-500">Guesser</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <FaHeart className="text-red-500" />
            <span className="font-bold text-lg">{remainingGuesses}</span>
            <span className="text-xs text-gray-500">guesses left</span>
          </div>
        </div>
      </div>
      <div className=" flex  items-center justify-around gap-8 w-full mx-auto py-4  bg-gradient-soft rounded-2xl shadow-xl animate-fade-in">
        <div>
          <HangmanDrawing numberOfGuesses={incorrectGuesses.length}/>
        </div>
        {/* Word and Game Over message */}
        <div className="flex flex-col items-center gap-8 lg:w-2/4 w-full">
          {isGameOver && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl font-bold mb-2">{endOfGameMessage}</h2>
              <p className="mb-2">
                The word was:{" "}
                <span className="font-bold uppercase">{word}</span>
              </p>
              {canStartNextRound && (
                <button
                  onClick={onNextRound}
                  className="mt-4 bg-black dark:bg-white text-white dark:text-black font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 next-round-glow"
                >
                  Next Round
                </button>
              )}
            </div>
          )}
          {incorrectGuesses.length == 8 &&
          <div>
              <span className="text-red-400 animate-pulse font-semibold">Last one guess available! Ask Hint</span>
          </div>
          }
          <div className="w-full flex justify-center">
            <WordDisplay word={word} guessedLetters={guessedLetters} />
          </div>
          {!isGameOver && (
            <div className="text-center text-lg font-semibold mt-2">
              {isMyTurn ? (
                <span className="text-green-600">Your turn to guess!</span>
              ) : (
                <span className="text-blue-600 animate-pulse">Opponent turn to guess.</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Keyboard */}
        <div className="lg:w-1/4 w-full self-stretch">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 animate-fade-in">
            <Keyboard
              disabled={!isMyTurn || isGameOver}
              activeLetters={guessedLetters.filter((letter) =>
                word.includes(letter)
              )}
              inactiveLetters={guessedLetters}
              onSelectLetter={onGuess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
