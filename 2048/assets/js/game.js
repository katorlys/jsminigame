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
let stats = false;      // Whether the game is still running
let score = 0
const SCORE = document.getElementById("currentScore")
let highScore = localStorage.getItem("2048_highScore") || 0
const HIGHSCORE = document.getElementById("highScore")
HIGHSCORE.innerHTML = highScore.toString()
// Game board
let game
const MESSAGE = document.getElementById("message")
const BOARD = document.getElementById("board")
// Blocks with numbers
let blocks = {}
let blockValues = [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]
let blockColors = ["var(--black)", "var(--grey)", "var(--lime)", "var(--green)", "var(--cyan)", "var(--blue)", "var(--purple)", "var(--magenta)", "var(--pink)", "var(--yellow)", "var(--orange)", "var(--red)"]
for (let i in blockValues) {
    const EL = document.createElement("div")
    EL.classList.add("block")
    EL.style.backgroundColor = blockColors[i]
    EL.innerHTML = blockValues[i].toString()
    blocks[blockValues[i]] = EL
}

/**
 * Initialize (Reset) the game.
 *
 */
function init() {
    score = 0
    game = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
    generate()
    generate()
    render()
    stats = true
    focus()
}

/**
 * Generate "2" in a random spare cell.
 * This function also checks whether the player has won or lost.
 * 
 * @param moved {Boolean} Whether the blocks have moved last time.
 */
function generate(moved = true) {
    // Refresh current score
    SCORE.innerHTML = score.toString()
    let empty = []
    for (let i in game) {
        for (let j in game[i]) {
            if (game[i][j] === 0) empty.push({ i, j })
            else if (game[i][j] === 2048) win()
        }
    }
    if (empty.length) {
        // If there are spare space, generate a new block in random place
        if (moved) {
            let { i, j } = empty[Math.floor(Math.random() * empty.length)]
            game[i][j] = 2
        }
    } else {
        // If not, check whether there are blocks that can be merged but player didn't merge in this move
        for (let i in game) {
            for (let j = 1; j < game[i].length; j++) {
                if (game[i][j] === game[i][j - 1]) return
            }
        }
        for (let j in game[0]) {
            for (let i = 1; i < game.length; i++) {
                if (game[i][j] === game[i - 1][j]) return
            }
        }
        lose()
    }
}

/**
 * Check whether there is a zero before a non-zero number.
 * (From left to right)
 * 
 * @param array {number[]} The array to be checked.
 * @returns {boolean} e.g. '0010' returns true, '1000' returns false.
 */
function checkZeroBefore(array) {
    let hasZeroBefore = false
    for (let i in array) {
        if (array[i] === 0) hasZeroBefore = 1
        else if (hasZeroBefore) return true
    }
    return false
}

/**
 * Check whether there is a zero before a non-zero number.
 * (From right to left)
 *
 * @param array {number[]} The array to be checked.
 * @returns {boolean} e.g. '0010' returns true, '1000' returns false.
 */
function checkZeroBeforeReverse(array) {
    let hasZeroBefore = false
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] === 0) hasZeroBefore = 1
        else if (hasZeroBefore) return true
    }
    return false
}

/**
 * Merge blocks, from left to right.
 * 
 * @param array
 * @returns {{array, moved: boolean}} The array after merging, and whether the blocks have moved.
 */
function mergeBlocks(array) {
    let moved = false               // Whether the blocks have moved
    let last = 0
    for (let i = 1; i < array.length; i++) {
        if (array[i] === 0) continue
        else if (array[i] === array[last]) {
            array[last] *= 2
            score += array[last]
            array[i] = 0
            moved = true
        } else {
            last = i
        }
    }
    return { array, moved }
}

/**
 * Merge blocks, from right to left.
 *
 * @param array
 * @returns {{array, moved: boolean}} The array after merging, and whether the blocks have moved.
 */
function mergeBlocksReverse(array) {
    let moved = false
    let last = array.length - 1
    for (let i = array.length - 2; i >= 0; i--) {
        if (array[i] === 0) continue
        else if (array[i] === array[last]) {
            array[last] *= 2
            score += array[last]
            array[i] = 0
            moved = true
        } else {
            last = i
        }
    }
    return { array, moved }
}

/**
 * Move the blocks in the board.
 * 
 * @param direction {String} The direction to move, valid arguments: `left`, `up`, `right`, `down`.
 */
function move(direction) {
    // If the game is not running, do nothing
    if (!stats) return
    // Whether the blocks have moved
    let moved = false
    // Check the direction to merge: from left to right, or from right to left
    let mergeFunction = direction === "left" || direction === "up" ? mergeBlocks : mergeBlocksReverse
    let checkFunction = direction === "left" || direction === "up" ? checkZeroBefore : checkZeroBeforeReverse
    let isHorizontal = direction === "left" || direction === "right"
    
    // Loop for every lines
    for (let i in game) {
        // Check whether the line is horizontal or vertical
        let line = isHorizontal ? game[i] : game.map(row => row[i])
        // Merge the line
        let merge = mergeFunction(line)
        // Get the new line after merging
        let newLine = merge.array
        // Check if the blocks are moved during the merge, or they fill up the empty blocks before them
        // Use `if(!moved)` to prevent the variable from being overwritten
        if (!moved) moved = merge.moved || checkFunction(newLine)

        // Remove all zeros, to make blocks fill up the empty blocks before them
        newLine = newLine.filter((el) => el !== 0)
        // Fill the rest of the line with zeros
        while (newLine.length < 4) {
            if (direction === "left" || direction === "up") newLine.push(0)
            else newLine.unshift(0)
        }
        // Apply the new line to the board
        if (isHorizontal) game[i] = newLine
        else for (let j in game) game[j][i] = newLine[j]
    }
    // Generate a new block
    generate(moved)
    // Update the board
    render()
}

/**
 * Apply blocks to the board.
 *
 */
function render() {
    BOARD.innerHTML = ""    // Clears the board first
    for (let i in game) {
        for (let j in game[i]) {
            BOARD.appendChild(blocks[game[i][j]].cloneNode(true))
        }
    }
}

function checkHighScore() {
    if (score > highScore) {
        highScore = score
        localStorage.setItem("2048_highScore", highScore)
        HIGHSCORE.innerHTML = highScore.toString()
    }
}

/**
 * When player loses.
 *
 */
function lose() {
    stats = false
    showMessage(false)
    checkHighScore()
}

/**
 * When player wins.
 *
 */
function win() {
    stats = false
    showMessage(true)
    checkHighScore()
}

/**
 * Auto-select #board for users to play.
 *
 */
function focus() {
    BOARD.setAttribute("tabindex", "0")
    BOARD.focus()
}

/**
 * Message to show after player win or lose.
 * 
 * @param win {Boolean} Whether the player wins.
 */
function showMessage(win) {
    MESSAGE.innerHTML = "You " + (win ? "win" : "lose") + "!<br>Click to play again"
    MESSAGE.style.display = "flex"
}

/**
 * Message to click to play again after player win or lose.
 * 
 */
MESSAGE.addEventListener("click", async function () {
    MESSAGE.style.display = "none"
    init()
})

BOARD.addEventListener("keydown", function (e) {
    // Prevent page scroll when users use arrow keys on amplified pages
    e.preventDefault()
    switch (e.key) {
        case "ArrowLeft":
        case "a":
            move("left")
            break
        case "ArrowUp":
        case "w":
            move("up")
            break
        case "ArrowRight":
        case "d":
            move("right")
            break
        case "ArrowDown":
        case "s":
            move("down")
            break
    }
})

/* Swipe event for Mobiles */
BOARD.addEventListener("swipe", function (e) {
    switch (e.detail.dir) {
        case "left":
            move("left")
            break
        case "up":
            move("up")
            break
        case "right":
            move("right")
            break
        case "down":
            move("down")
            break
    }
})

/* Prevents page scroll when users swipe in #board on touch-based devices. */
BOARD.addEventListener("touchmove", function (e) {
    e.preventDefault()
})
