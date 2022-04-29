const BACKGROUND_COLOR = "lightblue";
var width = Math.min(window.innerWidth, window.innerHeight) - 50;
var height = width;

const TILE_COUNT = 9;
const TILE_FULL_COUNT = TILE_COUNT * TILE_COUNT;
const TILE_WIDTH = width / TILE_COUNT;
const TILE_HEIGHT = TILE_WIDTH;
const SNAKE_COLOR = "#202020";

const GRID_COLOR = "gray";
const GRIDLINE_WIDTH = 1;

const CHERRY_CODE = 1;
const CHERRY_COLOR = "red";
const CHERRY_RADIUS = Math.min(TILE_WIDTH, TILE_HEIGHT) / 4;
const CHERRY_MAX = 2;

const SNAKE_EYE_RADIUS = CHERRY_RADIUS / 2;
const SNAKE_MOUTH_COLOR = "	#FFC0CB";
const SNAKE_HEAD_CODE = 3;
const SNAKE_CODE = 2;
const UP = 1;
const DOWN = -1;
const RIGHT = 2;
const LEFT = -2;

const FPS = 60;
const FPS_INTERVAL = 1000 / FPS; 

const SPEED = 2 * TILE_COUNT / 3; // tiles per second
const SPEED_INTERVAL = FPS / SPEED;

// smooth animation of head and tail
const FRAMES_TO_RENDER_HEAD = FPS / SPEED;
const SIZEOF_EACH_HEAD_RENDER = TILE_WIDTH / FRAMES_TO_RENDER_HEAD;



var canvas = document.querySelector("#gameScreen");
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var board = [];
for (var i = 0; i < TILE_FULL_COUNT; ++i) {
    board.push(0);
}



var snake = {
    "body": [[1, 1]], 
    "direction": RIGHT,
    "dead": false,
    "updated": false,
    "grow": true,
}

for (var i = 0; i < snake.body.length; ++i) {
    board[snake.body[i][0] + snake.body[i][1] * TILE_COUNT] = SNAKE_CODE;
}
board[snake.body[0][0] + snake.body[0][1] * TILE_COUNT] = SNAKE_HEAD_CODE;

var cherry_count = 0;
var choose_cherries = [];
for (var i = 0; i < TILE_FULL_COUNT; ++i) {
    choose_cherries.push(i);
}


function clear() {
    let color = ctx.fillStyle;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = color;
}


function draw_grid() {
    ctx.beginPath();
    let color = ctx.strokeStyle;
    let line_width = ctx.lineWidth;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = GRIDLINE_WIDTH;
    for (var i = 0; i < TILE_COUNT * TILE_WIDTH; i += TILE_WIDTH) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
    }
    ctx.stroke()
    ctx.strokeStyle = color;
    ctx.lineWidth = line_width;
}

function draw_box(x_in, y_in, draw_color) {
    x = x_in * TILE_WIDTH;
    y = y_in * TILE_HEIGHT;
    let color = ctx.fillStyle;

    ctx.fillStyle = draw_color;
    ctx.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

    ctx.fillStyle = color;
}

function draw_cherry(x_in, y_in) {
    x = (x_in * TILE_WIDTH) + (TILE_WIDTH / 2);
    y = (y_in * TILE_HEIGHT) + (TILE_HEIGHT / 2);

    let color = ctx.fillStyle;
    let line_color = ctx.strokeStyle;
    ctx.fillStyle = CHERRY_COLOR;
    ctx.strokeStyle = CHERRY_COLOR;
    
    ctx.beginPath();
    ctx.arc(x, y, CHERRY_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.strokeStyle = line_color;
}

function draw_board() {
    for (var i = 0; i < TILE_FULL_COUNT; ++i) {
        switch (board[i]) {
            case CHERRY_CODE:
                draw_cherry(i % TILE_COUNT, Math.floor(i / TILE_COUNT));
                break;
            case SNAKE_CODE: 
                draw_box(i % TILE_COUNT, Math.floor(i / TILE_COUNT), SNAKE_COLOR);
                break;
            case SNAKE_HEAD_CODE:
                let x_in = i % TILE_COUNT;
                let y_in = Math.floor(i / TILE_COUNT);

                draw_box(x_in, y_in, SNAKE_COLOR);
                x = (x_in * TILE_WIDTH) + (TILE_WIDTH / 2);
                y = (y_in * TILE_HEIGHT) + (TILE_HEIGHT / 2);

                let color = ctx.fillStyle;
                let line_color = ctx.strokeStyle;
                ctx.fillStyle = CHERRY_COLOR;
                ctx.strokeStyle = CHERRY_COLOR;
                switch (snake.direction) { // rendering the head
                    case UP:
                        ctx.beginPath();
                        ctx.arc(x + TILE_WIDTH / 4, y, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(x - TILE_WIDTH / 4, y, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke(); 

                        ctx.fillStyle = SNAKE_MOUTH_COLOR;
                        ctx.strokeStyle = SNAKE_MOUTH_COLOR;
                        ctx.beginPath();
                        ctx.arc(x, y - TILE_HEIGHT / 2, CHERRY_RADIUS, 0, Math.PI);
                        ctx.fill();
                        ctx.stroke(); 
                        break;
                    case DOWN: 
                        ctx.beginPath();
                        ctx.arc(x + TILE_WIDTH / 4, y, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(x - TILE_WIDTH / 4, y, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke(); 

                        ctx.fillStyle = SNAKE_MOUTH_COLOR;
                        ctx.strokeStyle = SNAKE_MOUTH_COLOR;
                        ctx.beginPath();
                        ctx.arc(x, y + TILE_HEIGHT / 2, CHERRY_RADIUS, Math.PI, 2 * Math.PI );
                        ctx.fill();
                        ctx.stroke(); 
                        break;
                    case RIGHT:
                        ctx.beginPath();
                        ctx.arc(x, y + TILE_HEIGHT / 4, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(x, y - TILE_HEIGHT / 4, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke(); 

                        ctx.fillStyle = SNAKE_MOUTH_COLOR;
                        ctx.strokeStyle = SNAKE_MOUTH_COLOR;
                        ctx.beginPath();
                        ctx.arc(x + TILE_HEIGHT / 2, y, CHERRY_RADIUS, Math.PI / 2, 3 * Math.PI / 2, false);
                        ctx.fill();
                        ctx.stroke(); 
                        break;
                    case LEFT:
                        ctx.beginPath();
                        ctx.arc(x, y + TILE_HEIGHT / 4, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(x, y - TILE_HEIGHT / 4, SNAKE_EYE_RADIUS, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke(); 

                        ctx.fillStyle = SNAKE_MOUTH_COLOR;
                        ctx.strokeStyle = SNAKE_MOUTH_COLOR;
                        ctx.beginPath();
                        ctx.arc(x - TILE_HEIGHT / 2, y, CHERRY_RADIUS, Math.PI / 2, 3 * Math.PI / 2, true);
                        ctx.fill();
                        ctx.stroke(); 
                        break;

                }
                ctx.fillStyle = color;
                ctx.strokeStyle = line_color;
            
                ctx.fillStyle = color;
                ctx.strokeStyle = line_color;
                
        }
    }
}


function move_snake() {
    board[snake.body[0][0] + snake.body[0][1] * TILE_COUNT] = SNAKE_CODE; // because we're rendering the head differently
    let new_head = [snake.body[0][0], snake.body[0][1]];

    switch(snake.direction) {
        case UP:
            new_head[1] -= 1;
            break;
        case DOWN:
            new_head[1] += 1;
            break;
        case RIGHT:
            new_head[0] += 1;
            break;
        case LEFT:
            new_head[0] -= 1;
            break;
        
    } 

    let ind = new_head[0] + TILE_COUNT * new_head[1];


    // collision with wall
    if (new_head[0] < 0 || new_head[1] < 0 || new_head[0] >= TILE_COUNT || new_head[1] >= TILE_COUNT) {
        snake.dead = true;
    }

    // collision with self and cherries
    if (!snake.dead) {
            switch (board[ind]) {
                case CHERRY_CODE: // we've eaten a cherry when the new head placement is on a cherry or ...
                    snake.grow = true;
                    // we wan't to be able to choose cherry locations more than once
                    choose_cherries.push(ind);
                    --cherry_count;
                    break;
                case SNAKE_CODE: 
                    snake.dead = true; // we've hit ourself
                    break;
                //case SNAKE_HEAD_CODE: 
                    // this isn't possible ... right?
                    
            }
        }
    
    
    board[ind] = SNAKE_HEAD_CODE;

    if (!snake.grow) { // if we're growing then we return the last element of the tail which we removed
        // snake.body.push(end);
        let end = snake.body.pop();
        board[end[0] + end[1] * TILE_COUNT] = 0;
    } 

    snake.body.unshift(new_head);
    snake.updated = true;
    snake.grow = false;
}


function generate_cherries() {
    while (cherry_count < CHERRY_MAX) {
        let random_index = Math.round(Math.floor(Math.random() * choose_cherries.length));

        while (board[choose_cherries[random_index]]) {
            random_index = Math.round(Math.floor(Math.random() * choose_cherries.length));
        }
    
        board[choose_cherries[random_index]] = CHERRY_CODE;
        choose_cherries.splice(random_index, 1);
        ++cherry_count;
    }
}


function game_over() {
    ctx.font = "5vh Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over. Press Space to restart", (TILE_COUNT / 2) * TILE_WIDTH, (TILE_COUNT / 2) * TILE_HEIGHT);
}

let count = 0;
let now;
let then = Date.now();
let elapsed = 0;
let other = 0;
function game_loop() {
    if (snake.dead) {
        game_over(); 
        return;
    };

    generate_cherries();
    clear();
    draw_grid();
    draw_board();

    now = Date.now();
    elapsed = now - then;
    
    
    if (elapsed > FPS_INTERVAL) {
        
        if ((++count) > SPEED_INTERVAL) {
            move_snake();
            count = 0;
        }

        //                   incase elapsed is much more than FPS_INTERVAL
        then = Date.now() - (elapsed % FPS_INTERVAL); 
    }
    
    
    
    requestAnimationFrame(game_loop);
}
game_loop();





document.addEventListener("keydown", function(event) {
    if (!snake.updated && !snake.dead) return;
    console.log("testing if running");
    let new_direction = 0;
    switch(event.key) {
        case "ArrowUp": 
            new_direction = UP;
            event.preventDefault();
            break;
        case "ArrowDown": 
            new_direction = DOWN;
            event.preventDefault();
            break;
        case "ArrowRight": 
            new_direction = RIGHT;
            event.preventDefault();
            break;
        case "ArrowLeft": 
            new_direction = LEFT;
            event.preventDefault();
            break;
        case " ":
            console.log("leaving the page")
            if (snake.dead) this.location.reload();
            break;
            
        
    }
    if (new_direction && new_direction + snake.direction) {
        snake.direction = new_direction;
        snake.updated = false;
    }
});