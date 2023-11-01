import React, { useState, useEffect, createContext, useContext } from 'react';
import { AppContext } from '../App';
import Letter from './Letter';
import words7 from './SevenLetterWords.json'
import words6 from './SixLetterWords.json'
import words5 from './FiveLetterWords.json'
import words4 from './FourLetterWords.json'
import words3 from './ThreeLetterWords.json'

export const LetterboxContext = createContext();

function Letterbox() {
    const { matrixLength, wins, setWins } = useContext(AppContext);
    const [chosenWords, setChosenWords] = useState([]);
    const [wordSet, setWordSet] = useState(new Set());
    
    const createSquareMatrix = (length, defaultValue) => {
      const matrix = [];
      for (let i = 0; i < length; i++) {
        matrix[i] = [];
        for (let j = 0; j < length; j++) {
          matrix[i][j] = defaultValue;
        }
      }
      return matrix;
    }

    const [letterGrid, setLetterGrid] = useState(createSquareMatrix(matrixLength, ""));

    const [gridColors, setGridColors] = useState(createSquareMatrix(matrixLength, 0));

    const [swapIndex, setSwapIndex] = useState([]);

    const gameOver = async () => {
      setWins(prevWins => {
        let updatedWins = { ...prevWins }; // Create a copy of the current state
      
        if (matrixLength === 3) {
          updatedWins.three = (updatedWins.three || 0) + 1;
        } else if (matrixLength === 4) {
          updatedWins.four = (updatedWins.four || 0) + 1;
        } else if (matrixLength === 5) {
          updatedWins.five = (updatedWins.five || 0) + 1;
        } else if (matrixLength === 6) {
          updatedWins.six = (updatedWins.six || 0) + 1;
        } else if (matrixLength === 7) {
          updatedWins.seven = (updatedWins.seven || 0) + 1;
        }
      
        return updatedWins; // Return the updated state
      });
      const result = await generateChosenWords(wordSet);
      setChosenWords(result);
    }
  
    const swapLetters = (rowIndex, columnIndex) => {
      if (swapIndex.length === 2) {
        let updatedGrid = [...letterGrid];
        const temp = updatedGrid[rowIndex][columnIndex];
        updatedGrid[rowIndex][columnIndex] = updatedGrid[swapIndex[0]][swapIndex[1]];
        updatedGrid[swapIndex[0]][swapIndex[1]] = temp;

        // updatedGrid[rowIndex][columnIndex].animate = true;
        // updatedGrid[swapIndex[0]][swapIndex[1]].animate = true;

        setLetterGrid(updatedGrid);
        setSwapIndex([]); // Reset the swap index
      } else if (swapIndex.length === 0) {
        setSwapIndex([rowIndex, columnIndex]);
      }
    }

    const checkSolution = () => {
      let updatedColors = [...gridColors];
      let count = 0;
      for (let i = 0; i < letterGrid.length; i++) {
        if (wordSet.has(letterGrid[i].join('').toLowerCase())) {
          updatedColors[i] = Array(matrixLength).fill(1);
          count++;
        } else {
          updatedColors[i] = Array(matrixLength).fill(0);
        }
      }
      setGridColors(updatedColors);
      if (count === matrixLength) {
        gameOver();
      }
    }

    const generateWordSet = async () => {
      if (matrixLength === 7) {
        const sevenLetterWordSet = new Set(words7.words);
        return sevenLetterWordSet;
      } else if (matrixLength === 6) {
        const sixLetterWordSet = new Set(words6.words);
        return sixLetterWordSet;
      } else if (matrixLength === 5) {
        const fiveLetterWordSet = new Set(words5.words);
        return fiveLetterWordSet;
      } else if (matrixLength === 4) {
        const fourLetterWordSet = new Set(words4.words);
        return fourLetterWordSet;
      } else if (matrixLength === 3) {
        const threeLetterWordSet = new Set(words3.words);
        return threeLetterWordSet;
      }
        
    };
      
    const generateChosenWords = async (wordSet) => {
      const chosenWords = [];
      const wordArray = Array.from(wordSet);

      while (chosenWords.length < matrixLength) {
        const randomIndex = Math.floor(Math.random() * wordArray.length);
        const randomWord = wordArray[randomIndex]; 

        if (!chosenWords.includes(randomWord)) {
          chosenWords.push(randomWord);
          // Convert each letter to uppercase and add them to the lettersArray
        }
      }
      return chosenWords; // Return both the words and the uppercase letters
    };

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));
    
        // Swap array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const fetchData = async () => {
      const allWords = await generateWordSet();
      setWordSet(allWords);
      const result = await generateChosenWords(allWords);
      setChosenWords(result);
    };
      
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
      let letters = []
      for (const word of chosenWords) {
        for (const letter of word) {
          letters.push(letter.toUpperCase())
        }
      }

      shuffleArray(letters);
      const lettersCopy = [...letters];
      const newGrid = [];

      while (lettersCopy.length > 0) {
        newGrid.push(lettersCopy.splice(0, matrixLength));
      }
      setLetterGrid(newGrid);
    }, [chosenWords]);

    useEffect(() => {
      checkSolution();
    }, [letterGrid]);

    useEffect(() => {
      setLetterGrid(createSquareMatrix(matrixLength, ""));
      setGridColors(createSquareMatrix(matrixLength, 0));
      fetchData();
    }, [matrixLength]);

    return (
      <LetterboxContext.Provider 
                value={{
                  swapLetters,
                  setLetterGrid,
                  matrixLength
                }}>
        <div className="letterbox">
            <div className="grid-container" style={{ gridTemplateRows: `repeat(${matrixLength}, 1fr)`}}>
              {letterGrid.map((row, rowIndex) => (
                <div className="grid-row" style={{ gridTemplateColumns: `repeat(${matrixLength}, 1fr)`}} key={rowIndex}>
                  {row.map((letter, columnIndex) => (
                    <div className="grid-cell" key={columnIndex}>
                      <Letter letter = {letter} 
                      rowIndex = {rowIndex} columnIndex = {columnIndex} 
                      color = {gridColors[rowIndex][columnIndex]}
                      swap = {swapIndex[0] === rowIndex && swapIndex[1] === columnIndex}/>
                    </div>
                  ))}
                </div>
              ))}
            </div>
        </div>
        </LetterboxContext.Provider>
    )
}

export default Letterbox