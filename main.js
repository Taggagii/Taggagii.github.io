screen = document.getElementById("screen");
ctx = screen.getContext("2d");


var board_size;
function resize_board() {
    board_size = Math.min(window.innerWidth, window.innerHeight) - 100;
    screen.width = board_size;
    screen.height = board_size;
}
resize_board();

var TILE_COUNT = 16;
var TILE_SIZE = board_size / TILE_COUNT;

const MINE_CODE = -1;
const MARKED_MINE_CODE = -1;

var GAME_OVER = false;
var drawing = new Image();
drawing.src = "mine.png";

var board = [];
var reveal_board = [];
for (var i = 0; i < TILE_COUNT; ++i) {
    let temp = [];
    for (var ii = 0; ii < TILE_COUNT; ++ii) {
        temp.push(0);
    }
    board.push(temp);
    reveal_board.push([...temp]);
}


// randomly place bombs
let possible_random_values = []
for (var i = 0; i < TILE_COUNT; ++i) {
    for (var ii = 0; ii < TILE_COUNT; ++ii) {
        possible_random_values.push([ii, i]);
    }
}

function set_board(x, y) {
    if (x < 0 || x >= TILE_COUNT || y < 0 || y >= TILE_COUNT || board[y][x] == MINE_CODE) {
        return;
    }
    board[y][x] += 1;
}

let inital_bomb_count = 40;
for (var i = 0; i < inital_bomb_count; ++i) {
    let position = possible_random_values.splice(Math.floor(Math.random() * possible_random_values.length), 1)[0];
    let x = position[0];
    let y = position[1];
    board[y][x] = MINE_CODE;

    // set the proximity value for each mine placed
    set_board(x - 1, y);
    set_board(x + 1, y);
    set_board(x, y - 1);
    set_board(x, y + 1);
    set_board(x - 1, y - 1);
    set_board(x - 1, y + 1);
    set_board(x + 1, y - 1);
    set_board(x + 1, y + 1);

}

function board_at(x, y) {
    return board[y][x];
}

function reveal_board_at(x, y) {
    return reveal_board[y][x];
}



function render_grid() {
    ctx.beginPath()
    ctx.strokeStyle = "black";
    for (var i = 0; i < board_size; i += TILE_SIZE) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, board_size);
        ctx.moveTo(0, i);
        ctx.lineTo(board_size, i);
    }
    ctx.stroke();
}

function clear() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, board_size, board_size);
}

function box(x, y) {
    ctx.fillStyle = "orange";
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function render_board() {
    clear();
    render_grid();
    
    for (var i = 0; i < TILE_COUNT; ++i) {
        for (var ii = 0; ii < TILE_COUNT; ++ii) {
            
            if (!reveal_board_at(i, ii) && !GAME_OVER) {
                ctx.fillStyle = "gray";
                ctx.fillRect(i * TILE_SIZE, ii * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                continue;
            } 
            if (reveal_board_at(i, ii) == MARKED_MINE_CODE && !GAME_OVER) {
                ctx.fillStyle = "orange";
                ctx.fillRect(i * TILE_SIZE, ii * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                continue;
            }
            if (GAME_OVER || reveal_board_at(i, ii) == 1) {
                if (board_at(i, ii) == MINE_CODE) {
                    ctx.drawImage(drawing, i * TILE_SIZE, ii * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                } else if (board_at(i, ii) > 0) {
                    console.log("text rendering")
                    ctx.fillStyle = "gray";
                    ctx.font = `${TILE_SIZE / 2}px Arial`;
                    ctx.textAlign = "center";
                    console.log("testing things");
                    ctx.fillText(board_at(i, ii), i * TILE_SIZE + (TILE_SIZE / 2), (ii + 1) * TILE_SIZE - (TILE_SIZE / 3));
                }
                
            }

        }
    }

    if (GAME_OVER) return;

    setTimeout(() => {
        render_board();
    }, 50);

}

render_board();

var around = [
    [-1, 0],
    [1, 0],
    [0, -1], 
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
]
function cascading_clicking(x, y) {
    if (GAME_OVER || x < 0 || x >= TILE_COUNT || y < 0 || y >= TILE_COUNT) return;

    if (reveal_board_at(x, y) > 0) return;
    reveal_board[y][x] = 1;
    if (board_at(x, y) > 0) {
        return;
    }
    if (board_at(x, y) == MINE_CODE) {
        GAME_OVER = true;
        return;
    }
    let valuex, valuey;
    for (var i = 0; i < around.length; ++i) {
        valuex = x + around[i][1];
        valuey = y + around[i][0];
        
        cascading_clicking(valuex, valuey);
    }
}

// prevent context menu appearance on the canvas window
screen.addEventListener("contextmenu", (event) => { event.preventDefault() });


screen.addEventListener("mousedown", (event) => {
    console.log(event.button);
    let rect = screen.getBoundingClientRect();
        
    let x = Math.floor((event.x - rect.x) / TILE_SIZE);
    let y = Math.floor((event.y - rect.y) / TILE_SIZE);

    switch (event.button) {
        case 0:    
            cascading_clicking(x, y);
            break;
        case 2:
            // mark a bomb
            if (reveal_board_at(x, y) == 0) {
                reveal_board[y][x] = MARKED_MINE_CODE;
            } else if (reveal_board_at(x, y) == MARKED_MINE_CODE) {
                reveal_board[y][x] = 0;
            }
            
            break;

    }


    console.log("doing things");
    
});