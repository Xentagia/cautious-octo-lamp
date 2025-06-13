const startDate = new Date('2025-06-01');
const today = new Date();
const dayNumber = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
const targetWord = wordList[dayNumber % wordList.length].toUpperCase();
const maxGuesses = 6;
const guesses = [];
let currentGuess = "";

const inputTiles = [...document.querySelectorAll('.input-tile')];
const guessButton = document.getElementById('guessButton');
const guessHistory = document.getElementById('guessHistory');
const resultDiv = document.getElementById('result');
const hiddenInput = document.getElementById('hiddenInput');
const tapToType = document.getElementById('tapToType');

function updateInputTiles() {
  for (let i = 0; i < 5; i++) {
    inputTiles[i].textContent = currentGuess[i] || "";
  }
  guessButton.disabled = currentGuess.length !== 5;
}

function colorizeGuess(guess) {
  // Color logic: green = correct letter+pos; yellow = letter in word but elsewhere;
  // handle duplicates correctly: first mark greens, then yellows for remaining
  const colors = Array(5).fill('grey');
  const targetChars = targetWord.split('');
  const guessChars = guess.split('');

  // First pass: mark greens
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      colors[i] = 'green';
      targetChars[i] = null; // mark as used
      guessChars[i] = null;
    }
  }
  // Second pass: mark yellows
  for (let i = 0; i < 5; i++) {
    if (guessChars[i]) {
      const idx = targetChars.indexOf(guessChars[i]);
      if (idx !== -1) {
        colors[i] = 'yellow';
        targetChars[idx] = null; // mark as used
      }
    }
  }
  return colors;
}

function addGuessToHistory(guess, colors) {
  const row = document.createElement('div');
  row.classList.add('guess-row');
  for (let i = 0; i < 5; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile', colors[i]);
    tile.textContent = guess[i];
    row.appendChild(tile);
  }
  guessHistory.appendChild(row);
}

function endGame(win) {
  guessButton.disabled = true;
  hiddenInput.disabled = true;
  tapToType.style.display = 'none';
  if (win) {
    resultDiv.textContent = `Congratulations! You guessed the word: ${targetWord}`;
  } else {
    resultDiv.textContent = `Game over! The word was: ${targetWord}`;
  }
  localStorage.setItem('wordlePlayed-' + dayNumber, 'true');
  localStorage.setItem('wordleResult-' + dayNumber, guessHistory.innerHTML + resultDiv.textContent);

  const shareCode = generateShareCode(guessesResults);
  localStorage.setItem('wordleShareCode-' + dayNumber, shareCode);
  document.getElementById('shareCode').innerText = shareCode;
}


function submitGuess() {
  if (currentGuess.length !== 5) return;
  const guessUpper = currentGuess.toUpperCase();

  guesses.push(guessUpper);
  const colors = colorizeGuess(guessUpper);
  addGuessToHistory(guessUpper, colors);

  if (guessUpper === targetWord) {
    endGame(true);
  } else if (guesses.length >= maxGuesses) {
    endGame(false);
  } else {
    currentGuess = "";
    updateInputTiles();
  }
}

function handleInput(e) {
  const val = e.target.value.toUpperCase();
  if (val.match(/^[A-Z]$/)) {
    if (currentGuess.length < 5) {
      currentGuess += val;
      updateInputTiles();
    }
  }
  e.target.value = ''; // clear input so only one char processed
}

function handleKeyDown(e) {
  if (e.key === "Backspace" && currentGuess.length > 0) {
    currentGuess = currentGuess.slice(0, -1);
    updateInputTiles();
    e.preventDefault();
  } else if (e.key === "Enter" && currentGuess.length === 5) {
    submitGuess();
    e.preventDefault();
  }
}

function generateShareCode(guessesResults) {
  if (!guessesResults || guessesResults.length === 0) return '';

  const colorMap = {
    'grey': '⚪',
    'yellow': '🟡',
    'green': '🟢'
  };

  return guessesResults.map(row =>
    row.map(color => colorMap[color] || '⚪').join('')
  ).join('\n');
}

function loadPrevious() {
  if (localStorage.getItem('wordlePlayed-' + dayNumber)) {
    guessHistory.innerHTML = localStorage.getItem('wordleResult-' + dayNumber);
    guessButton.disabled = true;
    hiddenInput.disabled = true;
    tapToType.style.display = 'none';
    resultDiv.textContent = "You already played today's word!";
  }
}

window.onload = function () {
  hiddenInput.focus();
  hiddenInput.addEventListener('input', handleInput);
  hiddenInput.addEventListener('keydown', handleKeyDown);

  // Focus input on tap anywhere on the game div (for mobile)
  document.getElementById('game').addEventListener('click', () => {
    if (!hiddenInput.disabled) {
      hiddenInput.focus();
    }
  });

  tapToType.addEventListener('click', () => {
    if (!hiddenInput.disabled) {
      hiddenInput.focus();
    }
  });

  updateInputTiles();
  loadPrevious();
  const shareCode = localStorage.getItem('wordleShareCode-' + dayNumber);
  if (shareCode) {
    document.getElementById('shareCode').innerText = shareCode;
  }
};