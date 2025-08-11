// Simple grid-based color territory game logic and rendering

const GRID_SIZE = 10;
const COLORS = ['red', 'blue', 'green'];
let board = [];
let players = [
    { color: 'red', name: 'Red Player' },
    { color: 'blue', name: 'Blue Player' },
    { color: 'green', name: 'Green Player' }
];
let currentPlayer = 0;

function initBoard() {
    board = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        let row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            row.push({ color: null });
        }
        board.push(row);
    }
    // Place initial player positions
    board[0][0].color = 'red';
    board[0][GRID_SIZE-1].color = 'blue';
    board[GRID_SIZE-1][0].color = 'green';
}

function renderBoard() {
    const boardDiv = document.getElementById('game-board');
    boardDiv.innerHTML = '';
    for (let y = 0; y < GRID_SIZE; y++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = board[y][x];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            if (cell.color) {
                cellDiv.style.background = cell.color;
            }
            cellDiv.dataset.x = x;
            cellDiv.dataset.y = y;
            cellDiv.onclick = () => handleCellClick(x, y);
            rowDiv.appendChild(cellDiv);
        }
        boardDiv.appendChild(rowDiv);
    }
}

function handleCellClick(x, y) {
    const player = players[currentPlayer];
    if (canClaim(x, y, player.color)) {
        board[y][x].color = player.color;
        spreadTerritory(x, y, player.color);
        currentPlayer = (currentPlayer + 1) % players.length;
        renderBoard();
        renderPlayerInfo();
    }
}

function canClaim(x, y, color) {
    // Can claim if adjacent to own color
    const dirs = [ [0,1], [1,0], [0,-1], [-1,0] ];
    for (let [dx, dy] of dirs) {
        let nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            if (board[ny][nx].color === color) return true;
        }
    }
    return false;
}

function spreadTerritory(x, y, color) {
    // Optionally, implement territory spreading logic here
    // For now, just claim the clicked cell
}

function renderPlayerInfo() {
    const infoDiv = document.getElementById('player-info');
    infoDiv.innerHTML = `<b>Current Turn:</b> <span style="color:${players[currentPlayer].color}">${players[currentPlayer].name}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
    initBoard();
    renderBoard();
    renderPlayerInfo();
});
