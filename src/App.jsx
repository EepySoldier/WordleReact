import { useState, useEffect, useRef } from "react";
import "./App.css";
import dictionary from "./five-letter-words.json";

function App() {
  const [inputArray, setInputArray] = useState(
    Array(6).fill(Array(5).fill(""))
  ); // 6 inputs with 5 cells each
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const [rowIndex, setRowIndex] = useState(0);
  const [cellIndex, setCellIndex] = useState(0);
  const guesses = useRef(0);
  const dictionaryIndex = Math.floor(Math.random() * 9079); // 9078 words in the dictionary + 1
  const wordToGuess = useRef(
    dictionary.fiveLetterWords[dictionaryIndex].toUpperCase().split("")
  );
  const [enterDisabled, setEnterDisabled] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message) => {
    // Function to display error message
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage("");
    }, 2000);
  };

  const restartGame = () => {
    // Function to restart the game, resetting all values
    setInputArray(Array(6).fill(Array(5).fill("")));
    setRowIndex(0);
    setCellIndex(0);
    guesses.current = 0;
    const newDictionaryIndex = Math.floor(Math.random() * 9079);
    wordToGuess.current = dictionary.fiveLetterWords[newDictionaryIndex]
      .toUpperCase()
      .split("");
    setEnterDisabled(false);
    setHasWon(false);
    setGameEnded(false);
    setErrorMessage("");

    for (let i = 0; i < 6; i++) {
      // Clear all input fields
      const children = document.getElementById(`childrenid${i}`);
      for (let j = 0; j < 5; j++) {
        children.children[j].value = "";
        children.children[j].style.backgroundColor = "";
      }
    }
  };

  const handleLetterClick = (letter, event) => {
    const children = document.getElementById(`childrenid${rowIndex}`);
    if (cellIndex < 5) {
      const newcellIndex = Math.min(5, cellIndex + 1);
      if (children.children[cellIndex].value == "")
        children.children[cellIndex].value = letter.toUpperCase();
      setCellIndex(newcellIndex);
    }

    event.target.blur();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Function to handle keydown events
      const { key } = event;
      const children = document.getElementById(`childrenid${rowIndex}`);

      if (key >= "a" && key <= "z" && cellIndex < 5) {
        const newcellIndex = Math.min(5, cellIndex + 1);
        if (children.children[cellIndex].value == "")
          children.children[cellIndex].value = key.toUpperCase();
        setCellIndex(newcellIndex);
      } else if (key == "Backspace") {
        const newcellIndex = Math.max(0, cellIndex - 1);
        if (children.children[newcellIndex].value != "")
          children.children[newcellIndex].value = "";
        setCellIndex(newcellIndex);
      } else if (key == "Enter" && !enterDisabled) {
        const playerInput = [];
        const inputLetters = Array(26).fill(0); // Array to store the letters of the input
        const wordLetters = Array(26).fill(0); // Array to store the letters of the word to guess

        for (let i = 0; i < 5; i++) {
          // Get the input from the user
          playerInput.push(children.children[i].value.toUpperCase());
        }

        if (playerInput.includes("")) {
          // Check if all fields are filled
          setEnterDisabled(true);
          showError("Only 5-letter words are allowed!");
          document
            .getElementById(`childrenid${rowIndex}`)
            .classList.add("shake");
          setTimeout(() => {
            document
              .getElementById(`childrenid${rowIndex}`)
              .classList.remove("shake");
          }, 300);

          setTimeout(() => {
            setEnterDisabled(false);
          }, 2050);

          return;
        }

        // Check if the word exists in the dictionary
        if (
          !dictionary.fiveLetterWords.includes(
            playerInput.join("").toLowerCase()
          )
        ) {
          setEnterDisabled(true);
          showError("This word does not exist in the (JSON) dictionary!");
          document
            .getElementById(`childrenid${rowIndex}`)
            .classList.add("shake");
          setTimeout(() => {
            document
              .getElementById(`childrenid${rowIndex}`)
              .classList.remove("shake");
          }, 300);

          setTimeout(() => {
            setEnterDisabled(false);
          }, 2050);

          return;
        }

        for (let i = 0; i < 5; i++) {
          // Each number corresponds to a letter, increment certain index for each letter in the input and the word to guess
          inputLetters[playerInput[i].charCodeAt() - "A".charCodeAt()]++;
          wordLetters[wordToGuess.current[i].charCodeAt() - "A".charCodeAt()]++;
        }

        for (let i = 0; i < 5; i++) {
          // Letter is in the right place
          let timesCorrect = 0;
          if (playerInput[i] === wordToGuess.current[i]) {
            children.children[i].style.backgroundColor = "#1df557";
            inputLetters[playerInput[i].charCodeAt() - "A".charCodeAt()]--;
            wordLetters[
              wordToGuess.current[i].charCodeAt() - "A".charCodeAt()
            ]--;
            timesCorrect++;
            if (timesCorrect === 5) {
              setHasWon(true);
              setGameEnded(true);
            }
          }
        }

        for (let i = 0; i < 5; i++) {
          if (playerInput[i] !== wordToGuess.current[i]) {
            if (
              // Letter is in the word, but not in the right place
              inputLetters[playerInput[i].charCodeAt() - "A".charCodeAt()] >
                0 &&
              wordLetters[playerInput[i].charCodeAt() - "A".charCodeAt()] > 0
            ) {
              children.children[i].style.backgroundColor = "#ffcc00";
              inputLetters[playerInput[i].charCodeAt() - "A".charCodeAt()]--;
              wordLetters[playerInput[i].charCodeAt() - "A".charCodeAt()]--;
            } else {
              // Letter is not in the word
              children.children[i].style.backgroundColor = "gray";
            }
          }
        }

        const newRowIndex = Math.min(5, rowIndex + 1);
        const newcellIndex = 0;
        setRowIndex(newRowIndex);
        setCellIndex(newcellIndex);
        guesses.current += 1;
        if (guesses.current === 6) {
          // If the user has made 6 guesses, the game ends
          setGameEnded(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <>
      <h1>Wordle with React!</h1>
      <div className="InputFields">
        {inputArray.map((row, IndexInArray) => (
          <div
            key={IndexInArray}
            id={`childrenid${IndexInArray}`}
            className="InputField"
          >
            {row.map((cell, IndexInRow) => (
              <input disabled key={IndexInRow} type="text" />
            ))}
          </div>
        ))}
      </div>
      <div className="errorBox">
        {errorMessage && <div>{errorMessage}</div>}
      </div>
      <div className={`resultBox ${gameEnded ? "gameEnded" : ""}`}>
        {gameEnded && (
          <div>
            <div>
              {hasWon
                ? "Congratulations, you have won!"
                : "You lost, better luck next time! The word was: " +
                  wordToGuess.current.join("")}
            </div>
            <button onClick={restartGame}>Restart</button>
          </div>
        )}
      </div>
      <div className="alphabetBox">
        {alphabet.map((letter, index) => (
          <button
            key={index}
            type="text"
            onClick={(event) => handleLetterClick(letter, event)}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>
    </>
  );
}

export default App;
