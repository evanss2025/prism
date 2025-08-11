
// --- Game UI Logic ---
let boardRows = 16;
let boardCols = 30;
let board = [];

// Color assignment: 0=empty, 1=red, 2=blue, 3=green
let colorNames = ['Empty', 'Red', 'Blue', 'Green'];
let colorClasses = ['', 'dot-red', 'dot-blue', 'dot-green'];
let colorHex = ['', '#ff0000', '#0000ff', '#00ff00'];

// Simulate 3 players/colors for demo
let playerColors = [1, 2, 3];
let playerNames = ['Red', 'Blue', 'Green'];
let playerName = '';

// Initialize colorResult and create proxy once

//colorresult comes from other js file but this needs to be fix since it doesnt think colorresult exists for some reason at first
//prob render issue
let colorResultObject = {'success': colorResult};

const handler = {
    set(target, property, value) {
        if (['success', 'color', 'dominant_color'].includes(property)) {
            console.log(`Property "${property}" changed from ${target[property]} to ${value}`);
        }
        target[property] = value;
        return true;
    }
};

const monitoredColorResult = new Proxy(colorResultObject, handler);

function renderBoard() {
    console.log('Current colorResult:', colorResult);
    console.log('Monitored object:', monitoredColorResult);
    
    const boardDiv = document.getElementById('game-board');
    boardDiv.innerHTML = '';
    for (let row = 0; row < boardRows; row++) {
        for (let col = 0; col < boardCols; col++) {
            const idx = row * boardCols + col;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = idx;
            if (board[idx]) {
                cell.classList.add('claimed');
                cell.style.background = colorHex[board[idx]];
            }
            cell.addEventListener('click', () => claimCell(idx));
            boardDiv.appendChild(cell);
        }
    }
    updateLeaderboard();
}

// Update the monitored object when colorResult changes
function updateColorResult(newValue) {
    colorResult = newValue;
    monitoredColorResult.success = newValue;
}

let nextColor = 1;
function claimCell(index) {
    if (!board[index]) {
        board[index] = nextColor;
        nextColor = (nextColor % 3) + 1;
        renderBoard();
    }
}

function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard-list');
    const victoryMsg = document.getElementById('victory-message');
    let counts = [0, 0, 0, 0];
    for (let i = 0; i < board.length; i++) {
        if (board[i]) counts[board[i]]++;
    }
    let total = boardRows * boardCols;
    let items = '';
    let winner = null;
    for (let i = 1; i <= 3; i++) {
        let percent = (counts[i] / total) * 100;
        items += `<li><span class="color-dot ${colorClasses[i]}"></span>${playerNames[i-1]}<span style="font-weight:bold;">${counts[i]} (${percent.toFixed(1)}%)</span></li>`;
        if (percent > 33.33) winner = playerNames[i-1];
    }
    leaderboard.innerHTML = items;
    if (winner) {
        victoryMsg.style.display = '';
        victoryMsg.textContent = `${winner} wins!`;
    } else {
        victoryMsg.style.display = 'none';
    }
}

// Initialize board
for (let i = 0; i < boardRows * boardCols; i++) {
    board[i] = '';
}
window.onload = renderBoard;



