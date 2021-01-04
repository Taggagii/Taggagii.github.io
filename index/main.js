
const ball = document.querySelector("div#ball");
const pixelsMovedPerRefresh = 10;

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
        //happens every milisecond so gets the distance travelled per milisecond
        if (currentY != previousY)
            dy = currentY - previousY;
        if (currentX != previousX)
            dx = currentX - previousX;

        //refreshes the previous cords before the current changes
        previousY = currentY;
        previousX = currentX;
    }

    setTimeout(velocityCalculator, 1);
}

function drag()  //currently broken, needs to be fixed
{
    if (!zeroDrag)
    {
        //sorta cheating but it works and is easier then doing the more complex math
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


ball.addEventListener("mousedown", function(event) {
    if (event.buttons == 1)
    {
        //with this the ball won't launch if clicked and unclicked without movement
        previousX = currentX; 
        previousY = currentY;

        elementIsClicked = true;
        
        //the ball has stopped when you hold it, therefore, it's not moving *mind blown* (so no velocity)
        dy = 0;
        dx = 0;
    }
});

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