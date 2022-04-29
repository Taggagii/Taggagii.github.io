const FPS = 144;
const FPS_INTERVAL = 1000 / FPS;

const DRAG_ON = false;
const GRAVITY_ON = false;
const RENDER_VELOCITY_LINES = false;

const FORCE_OF_GRAVITY = 0.001;
const DRAG_COEFF = 0.05
const DENSITY_OF_AIR = 0.40;
const DRAG_MULTIPLE = 2 * DRAG_COEFF * DENSITY_OF_AIR;

var screen = document.querySelector("#screen");
screen.width = window.innerWidth;
screen.height = window.innerHeight;
var context = screen.getContext("2d");

function random_number(min, max) {
    return Math.floor((Math.random() * max) + min);
}

// mouse info
var mouse = {"x": 0, "y": 0, "px": 0, "py": 0, "clicked": false};

var balls = []
var selected_ball = -1;

function add_ball(x, y, xvel, yvel, radius) {
    balls.push({"x": x, "y": y, "xvel": xvel, "yvel": yvel, "radius": radius});
}

// let ball_count_temp = 20;
// for (var i = 0; i < ball_count_temp; ++i) {
//     add_ball(random_number(0, screen.width), random_number(0, screen.height), 0, 0, random_number(10, 40));
// }

for (var i = 0; i < 500; ++i) {
    add_ball(random_number(0, screen.width), random_number(0, screen.height), 0, 0, 5);
}
add_ball(random_number(0, screen.width), random_number(0, screen.height), 0, 0, 50);



function draw_line(x1, y1, x2, y2, given_color = "red") {
    context.beginPath();
    let color = context.fillStyle;
    context.strokeStyle = given_color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.fillStyle = color;
}

function draw_ball(x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    let color = context.fillStyle;
    context.fillStyle = "black";
    context.fill();
    context.fillStyle = color;
}

function clear() {
    let color = context.fillStyle;
    context.fillStyle = "white";
    context.fillRect(0, 0, screen.width, screen.height);
    context.fillStyle = color;
}



function check_for_collisions() {
    var colliding_pairs = [];
    for (var i = 0; i < balls.length; ++i) {
        for (var ii = i; ii < balls.length; ++ii) {
            if (i == ii) continue;
            

            var distance = Math.sqrt(Math.pow(balls[i].x - balls[ii].x, 2) + Math.pow(balls[i].y - balls[ii].y, 2));
            var overlap =  (distance - balls[i].radius - balls[ii].radius) / 2;

            

            if (Math.pow(balls[i].x - balls[ii].x, 2) + Math.pow(balls[i].y - balls[ii].y, 2) < Math.pow(balls[i].radius + balls[ii].radius, 2)) {
                colliding_pairs.push([i, ii, distance]);

                // move the balls away from one another
                var xdir =  Math.sign((balls[i].x - balls[ii].x));
                var ydir = Math.sign((balls[i].y - balls[ii].y));
                balls[i].x -= overlap * xdir;
                balls[i].y -= overlap * ydir;

                balls[ii].x += overlap * xdir;
                balls[ii].y += overlap * ydir;
            } 
        }
    }
    let done = [];

    // physics collisions
    for (var i = 0; i < colliding_pairs.length; ++i) {
        let index1 = colliding_pairs[i][0];
        let index2 = colliding_pairs[i][1];

        done.push(index1);
        done.push(index2); 

        // let mass == radius / 10
        let mass1 = balls[index1].radius / 100;
        let mass2 = balls[index2].radius / 100

        var constant = (2 * ((balls[index1].x - balls[index2].x) * (balls[index1].xvel - balls[index2].xvel) + 
                       (balls[index1].y - balls[index2].y) * (balls[index1].yvel - balls[index2].yvel))) / 
                       ((mass1 + mass2) * (Math.pow(balls[index1].x - balls[index2].x, 2) + Math.pow(balls[index1].y - balls[index2].y, 2)));
        if (isNaN(constant)) continue;
        let n = 0.75;
                                                                                        // attempting to have deformation
        balls[index1].xvel -= (mass2 * constant * (balls[index1].x - balls[index2].x))  * n;
        balls[index1].yvel -= (mass2 * constant * (balls[index1].y - balls[index2].y))  * n;
        balls[index2].xvel -= (mass1 * constant * (balls[index2].x - balls[index1].x))  * n;
        balls[index2].yvel -= (mass1 * constant * (balls[index2].y - balls[index1].y))  * n;
        

    }
}


function update_balls(elapsed) {
    for (var i = 0; i < balls.length; ++i) {
        if (i != selected_ball) {
            // gravity
            if (GRAVITY_ON) {
                balls[i].yvel += FORCE_OF_GRAVITY * elapsed;
            }
            

            // drag
            if (DRAG_ON) {
                balls[i].xvel -= DRAG_MULTIPLE * balls[i].xvel;
                balls[i].yvel -= DRAG_MULTIPLE * balls[i].yvel;
            }
            

            // move location
            
            let newx = (balls[i].x + balls[i].xvel * elapsed);
            let newy = (balls[i].y + balls[i].yvel * elapsed);

            if (newx - balls[i].radius < 0) {
                newx = balls[i].radius;
                balls[i].xvel *= -1;
            } else if (newx + balls[i].radius > screen.width) {
                newx = screen.width - balls[i].radius
                balls[i].xvel *= -1;
            } 
            if (newy - balls[i].radius < 0) {
                newy = balls[i].radius;
                balls[i].yvel *= -1
            } else if (newy + balls[i].radius > screen.height) {
                newy = screen.height - balls[i].radius;
                balls[i].yvel *= -1
            } 
    
            balls[i].x = newx;
            balls[i].y = newy;
            
        } else {
            if (mouse.x - balls[i].radius > 0 && mouse.x + balls[i].radius < screen.width) {
                balls[i].x = mouse.x;
                
            }
            if (mouse.y - balls[i].radius > 0 && mouse.y + balls[i].radius < screen.height) {
                balls[i].y = mouse.y;
            }
            

            let xvel = (mouse.x - mouse.px) / elapsed;
            let yvel = (mouse.y - mouse.py) / elapsed;

            balls[i].xvel = xvel;
            balls[i].yvel = yvel;

            mouse.px = mouse.x;
            mouse.py = mouse.y;
            
        }           
    }
}

function render_balls() {
    //console.log(balls[0]);
    for (var i = 0; i < balls.length; ++i) {
        draw_ball(balls[i].x, balls[i].y, balls[i].radius);
        if (RENDER_VELOCITY_LINES) {
            let angle = Math.atan(Math.abs(balls[i].yvel / balls[i].xvel));
            let nx = Math.sign(balls[i].xvel);
            let ny = Math.sign(balls[i].yvel);
            draw_line(balls[i].x, balls[i].y, balls[i].x + nx * balls[i].radius * Math.cos(angle), balls[i].y + ny * balls[i].radius * Math.sin(angle), "red")
        }
        
    }
    
}


var now;
var then = Date.now();
var elapsed;
function game_loop() {
    now = Date.now();
    elapsed = now - then;
    if (elapsed >= FPS_INTERVAL) {
        then = now - (elapsed % FPS_INTERVAL); 

        // render
        clear();
        
        render_balls();
    }
    update_balls(elapsed);
    check_for_collisions();
    
    requestAnimationFrame(game_loop);
}
game_loop();


document.addEventListener("mousedown", (event) => {
    mouse.clicked = true;
    for (var i = 0; i < balls.length; ++i) {
        if (Math.abs(balls[i].x - event.x) < balls[i].radius && 
            Math.abs(balls[i].y - event.y) < balls[i].radius) {
                selected_ball = i;
                break;
            }
    }

    if (selected_ball + 1) {
        console.log("selected:", selected_ball);
        mouse.px = event.x;
        mouse.py = event.y;
        balls[selected_ball].xvel = 0;
        balls[selected_ball].yvel = 0;
    }

});



document.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;

    // // update the selected ball
    // if (selected_ball + 1) {
    //     // location
    //     balls[selected_ball].x = event.x;
    //     balls[selected_ball].y = event.y;
    // }
})

document.addEventListener("mouseup", (event) => {
    selected_ball = -1;
    mouse.clicked = false;
    
});