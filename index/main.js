
const ball = document.querySelector("div#ball");
const pixelsMovedPerRefresh = 10;

const W = 87
const A = 65;
const S = 83;
const D = 68;

const ARROWUP = 38;
const ARROWLEFT = 37;
const ARROWDOWN = 40;
const ARROWRIGHT = 39;


let ballX = window.innerWidth / 2;
let ballY = 0;

let ballTeminalVelocity = 57;

let dy = 0;
let dx = 0;

let metersPerPixel = 5;

let start = Date.now();
let previousX = 0;
let previousY = 0;
let currentX = 0;
let currentY = 0;

let logMouse = false;

let dragAmount = 0.005;
let bounceVelocityLossAmount = 1.4;

let zeroGravity = false;
let zeroDrag = false;
let zeroFriction = false;
let log = false;




animate();
gravity();
velocityCalculator();
drag();
logger();

function logger()
{
    if (log)
    {
        console.log(dx, dy);
        
    }
    setTimeout(logger, 1);
}


function velocityCalculator()
{
    if (elementIsClicked)
    {
        if (currentY != previousY)
            dy = currentY - previousY;
        if (currentX != previousX)
            dx = currentX - previousX;
        previousY = currentY;
        previousX = currentX;
    }

    setTimeout(velocityCalculator, 1);
}

function drag()  //currently broken, needs to be fixed
{
    if (!zeroDrag)
    {
        dx /= dragAmount + 1; 
        dy /= dragAmount + 1; 
    }
    setTimeout(drag, 1);
}


function gravity() 
{
    if (!zeroGravity)
    {
        if (dy < ballTeminalVelocity && !elementIsClicked)
            dy += 0.009807 * metersPerPixel;
    }   
    setTimeout(gravity, 1); 
} 

function animate() 
{
    //console.log(ballX, ballY);
    if (!elementIsClicked)
    {

        ballY += dy;
        ballX += dx;
    }

    if (ballY > window.innerHeight)
    {
        ballY = window.innerHeight;
        dy /= -bounceVelocityLossAmount;
        if (!zeroFriction)
            dx /= 1.02;
        
    }
    if (ballY < 0)
    {
        ballY = 0;
        dy /= -bounceVelocityLossAmount;
        if (!zeroFriction)
            dx /= 1.02;
    }
    if (ballX < 0)
    {
        ballX = 0;
        if (!zeroFriction)
            dy /= 1.02;
        dx /= -bounceVelocityLossAmount;
    }
    if (ballX > window.innerWidth)
    {
        ballX = window.innerWidth;
        if (!zeroFriction)
            dy /= 1.02;
        dx /= -bounceVelocityLossAmount;
    }

    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";

    requestAnimationFrame(animate); //this is what does the smooth thing in a normal game you fuckin idiot
}



var elementIsClicked = false;
function pressHandler(event) {
    previousX = currentX;
    previousY = currentY;
    elementIsClicked = true;
    dy = 0;
    dx = 0;
}

ball.addEventListener("mousedown", pressHandler.bind(event));

document.addEventListener("mouseup", function(event) {
    elementIsClicked = false;
});

document.addEventListener("mousemove", function(event)
{

    currentX = event.x;
    currentY = event.y;
    if (elementIsClicked)
    {
        ballX = event.x;
        ballY = event.y;
    }
});