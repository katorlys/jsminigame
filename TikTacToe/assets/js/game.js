/**
 * Display loading screen while page is loading.
 */
document.addEventListener("DOMContentLoaded", async function () {
    const LOADER = document.getElementById("loader")
    LOADER.style.opacity = "0"
    await new Promise(r => setTimeout(r, 200))
    LOADER.style.display = "none"
    
    init()
})


// Statistics
let stats = false               // Whether the game is still running
let playerTurn = true           // Whether it's the player's turn
let playerScore = localStorage.getItem("TikTacToe_playerScore") || 0
let computerScore = localStorage.getItem("TikTacToe_computerScore") || 0
const PLAYER_SCORE = document.getElementById("playerScore")
const COMPUTER_SCORE = document.getElementById("computerScore")
PLAYER_SCORE.innerHTML = playerScore.toString()
COMPUTER_SCORE.innerHTML = computerScore.toString()
// Game board
let game
const MESSAGE = document.getElementById("message")
const BOARD = document.getElementById("board")
const PLAYER = "cross"
const COMPUTER = "circle"
// Winning combinations
const WIN_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]
// 10% chance for computer to make a false move
const RANDOM_CHANCE = 0.1

/**
 * Initialize (Reset) the game.
 *
 */
function init() {
    game = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ]
    playerTurn = true
    render()
    stats = true
}

/**
 * Get the best move using Minimax algorithm.
 * 
 * @returns {{row: number, col: number}|null} The best move
 */
function getBestMove() {
    // Get all empty cells
    let emptyCells = []
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (game[i][j] === "") {
                emptyCells.push({ row: i, col: j })
            }
        }
    }
    // Computer has a RANDOM_CHANCE to make a random move, instead of the best one
    if (Math.random() < RANDOM_CHANCE && emptyCells.length > 1) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)]
    }
    
    // Otherwise, use Minimax to find the best move
    let bestScore = -Infinity
    let bestMove = null
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (game[i][j] === "") {
                game[i][j] = COMPUTER
                let score = minimax(game, 0, false)
                game[i][j] = ""
                
                if (score > bestScore) {
                    bestScore = score
                    bestMove = { row: i, col: j }
                }
            }
        }
    }
    
    return bestMove
}

/**
 * Minimax algorithm for the best move.
 * 
 * @param board {Array} Current game board
 * @param depth {number} Current depth in the game tree
 * @param isMaximizing {boolean} Whether it's the maximizing player's turn
 * @returns {number} The score of the board
 */
function minimax(board, depth, isMaximizing) {
    // Check terminal states
    if (checkWin(COMPUTER)) return 10 - depth
    if (checkWin(PLAYER)) return depth - 10
    if (checkDraw()) return 0
    
    if (isMaximizing) {
        let bestScore = -Infinity
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === "") {
                    board[i][j] = COMPUTER
                    let score = minimax(board, depth + 1, false)
                    board[i][j] = ""
                    bestScore = Math.max(score, bestScore)
                }
            }
        }
        return bestScore
    } else {
        let bestScore = Infinity
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === "") {
                    board[i][j] = PLAYER
                    let score = minimax(board, depth + 1, true)
                    board[i][j] = ""
                    bestScore = Math.min(score, bestScore)
                }
            }
        }
        return bestScore
    }
}

/**
 * Player places a mark.
 * 
 * @param row {number} Row index (0-2)
 * @param col {number} Column index (0-2)
 */
function playerMove(row, col) {
    // If the game is not running, or is not player's turn, do nothing
    if (!stats || !playerTurn) return
    // If the cell is already occupied, do nothing
    if (game[row][col] !== "") return
    // Place the player's mark
    game[row][col] = PLAYER
    render()

    // Check whether player wins or draws
    if (checkWin(PLAYER)) {
        win(PLAYER)
        return
    }
    if (checkDraw()) {
        draw()
        return
    }
    // Switch to computer's turn
    playerTurn = false
    setTimeout(computerMove, 500)
}

/**
 * Computer places a mark.
 *
 */
function computerMove() {
    // If the game is not running, do nothing
    if (!stats) return
    // Get the best move using Minimax algorithm
    const bestMove = getBestMove()
    if (bestMove) {
        game[bestMove.row][bestMove.col] = COMPUTER
        render()

        // Check whether computer wins or draws
        if (checkWin(COMPUTER)) {
            win(COMPUTER)
            return
        }
        if (checkDraw()) {
            draw()
            return
        }
        // Switch back to player's turn
        playerTurn = true
    }
}

/**
 * Check if anyone has won.
 * 
 * @param player {string} The player (cross) or computer (circle) to check
 * @returns {boolean} Whether the player has won
 */
function checkWin(player) {
    // Flatten the 2D game array to 1D for easier checking
    const flatGame = game.flat()
    return WIN_COMBINATIONS.some(combination => {
        return combination.every(index => flatGame[index] === player)
    })
}

/**
 * Check if it's a draw.
 * 
 * @returns {boolean} Whether the game is a draw
 */
function checkDraw() {
    return game.flat().every(cell => cell !== "")
}

/**
 * Apply cells to the board.
 *
 */
function render() {
    BOARD.innerHTML = ""    // Clears the board first
    for (let i in game) {
        for (let j in game[i]) {
            const cell = document.createElement("div")
            cell.classList.add("cell")
            if (game[i][j] !== "") {
                cell.classList.add(game[i][j])
            }
            cell.dataset.row = i
            cell.dataset.col = j
            cell.addEventListener("click", cellClickHandler)
            BOARD.appendChild(cell)
        }
    }
}

/**
 * Handle cell click event.
 * 
 * @param e {Event} Click event
 */
function cellClickHandler(e) {
    const row = parseInt(e.target.dataset.row)
    const col = parseInt(e.target.dataset.col)
    playerMove(row, col)
}

/**
 * When player/computer wins.
 * 
 * @param player {string} The winning player
 */
function win(player) {
    stats = false
    if (player === PLAYER) {
        playerScore++
        localStorage.setItem("TikTacToe_playerScore", playerScore)
        PLAYER_SCORE.innerHTML = playerScore.toString()
    } else {
        computerScore++
        localStorage.setItem("TikTacToe_computerScore", computerScore)
        COMPUTER_SCORE.innerHTML = computerScore.toString()
    }
    showMessage(player)
}

/**
 * When the game is a draw.
 *
 */
function draw() {
    stats = false
    showMessage("draw")
}

/**
 * Message to show after game ends.
 * 
 * @param result {string} "cross", "circle", or "draw"
 */
function showMessage(result) {
    if (result === "draw") {
        MESSAGE.innerHTML = "It's a draw!<br>Click to play again"
    } else {
        MESSAGE.innerHTML = "You " + (result === PLAYER ? "win" : "lose") + "!<br>Click to play again"
    }
    MESSAGE.style.display = "flex"
}

/**
 * Message click to play again after game ends.
 * 
 */
MESSAGE.addEventListener("click", async function () {
    MESSAGE.style.display = "none"
    init()
})
