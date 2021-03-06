

var Ball = function(name, x = 0, y = 0, radius = 45)
{
    this.element = document.querySelector(`div#ball${name}`);
    this.name = name;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    //this.radius = parseInt(getComputedStyle(this.element).width) / 2;
    this.radius = radius;
    this.element.style.width = radius * 2 + "px";
    this.element.style.height = radius * 2 + "px";
    this.mass = this.radius * 10;
    var elementIsClicked = false;
    this.element.addEventListener("mousedown", function(event) {
        if (event.buttons == 1)
        {
            ballClick(name - 1);
        }
    });
    this.element.addEventListener("touchstart", function(event) {
        
        ballClick(name - 1);
    });
    return this;
}


let balls = [new Ball("1", window.innerWidth / 2, window.innerHeight/2, 120),
             new Ball("2", window.innerWidth / 2.81, window.innerHeight/1.6, 30)]
let ballCount = 2;

function RandomNumber(lowest, hightest) {
    return Math.floor(Math.random() * (hightest - lowest)) + lowest;
}


const pixelsMovedPerRefresh = 10;
const metersPerPixel = 5;

let physicsUpdatesPerFrame = 4;



var GravityController = document.getElementById("Gravity");
var CollisionsController = document.getElementById("Collisions");
var addBallController = document.getElementById("addBall");

GravityController.addEventListener("mousedown", function(event) {
    zeroGravity = !zeroGravity;
    if (zeroGravity)
        GravityController.innerHTML = "Hello Gravity?";
    else
        GravityController.innerHTML = "Goodbye Gravity?";
});

CollisionsController.addEventListener("mousedown", function(event) {
    zeroCollisions = !zeroCollisions;
    if (zeroCollisions)
        CollisionsController.innerHTML = "Hello Collisions?";
    else
        CollisionsController.innerHTML = "Goodbye Collisions?";
})

addBallController.addEventListener("mousedown", function(event) {
    addBall(RandomNumber(0, window.innerWidth), RandomNumber(0, window.innerHeight), RandomNumber(10, 70));
})

//mouse location information
var currentX = 0;
var currentY = 0;
var previousX = 0;
var previousY = 0;
let startX = Date.now();
let startY = Date.now();

let stationaryTimeout = 100;

let dragAmount = 0.005;
let bounceVelocityLossAmount = 1.4;
let ballTeminalVelocity = 57;

let zeroGravity = true;
let zeroDrag = false;
let zeroFriction = false;
let zeroVelocity = false;
let zeroCollisions = false;

if (zeroGravity)
    GravityController.innerHTML = "Hello Gravity?";
else
    GravityController.innerHTML = "Goodbye Gravity?";
if (zeroCollisions)
    CollisionsController.innerHTML = "Hello Collisions?";
else
    CollisionsController.innerHTML = "Goodbye Collisions?";

let log = false;
let logMouse = false;


animate();
gravity();
velocityCalculator();
drag();
logger();

function logger()
{
    if (log)
    {
        console.log(balls);
    }
    setTimeout(logger, 1000);
}

function ballClick(index)
{
    //so the ball doesn't launch when clicked without mouse movement
    previousX = currentX; 
    previousY = currentY;
    
    balls[index].elementIsClicked = true;
}

function addBall(x, y, radius)
{
    balls[ballCount - 1].element.insertAdjacentHTML('afterend', `<div class = "ball" id = 'ball${++ballCount}'></div>`);
    balls.push(new Ball(ballCount, x, y, radius));
    var ball = balls[ballCount - 1];
    
}

function ballCollisions()
{
    if (!zeroCollisions)
    {
        for (var i = 0; i < physicsUpdatesPerFrame; i++)
        {
            for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
            {
                var ball = balls[ballIndex];
                for (var ballIndex2 = 0; ballIndex2 < ballCount; ballIndex2++)
                {
                    if (ballIndex == ballIndex2) continue;
                    var target = balls[ballIndex2];
                    let distanceX = ball.x - target.x;
                    let distanceY = ball.y - target.y;
                    
                    var checkDistance = Math.abs(distanceX * distanceX + distanceY * distanceY);
                    var maxAmount = ball.radius + target.radius;
                    if (checkDistance <= maxAmount * maxAmount)
                    {
                        //overlapping
                        var distance = Math.sqrt(checkDistance);
                        var overlap = 0.5 * (distance - maxAmount);
                        if (distance == 0)
                            distance = -1;
                        
                        var xVector = overlap * (ball.x - target.x) / distance;
                        var yVector = overlap * (ball.y - target.y) / distance;
                       
                        if (ball.elementIsClicked)
                        {
                            target.y += yVector * 2;
                            target.x += xVector * 2;
                        }
                        else if (target.elementIsClicked)
                        {
                            ball.y -= yVector * 2;
                            ball.x -= xVector * 2;
                        }
                        else 
                        {
                            ball.x -= xVector;
                            ball.y -= yVector;
                            target.y += yVector;
                            target.x += xVector;
                        }
                        

                        //collision
                        distanceX /= distance;
                        distanceY /= distance;

                        
                        //tangent
                        var tangentX = -distanceY;
                        var tangentY = distanceX;

                        
                        var dpTangentOne = ball.vx * tangentX + ball.vy * tangentY;
                        var dpTangentTwo = target.vx * tangentX + target.vy * tangentY;

                        
                        var dpNormalOne = ball.vx * distanceX + ball.vy * distanceY;
                        var dpNormalTwo = target.vx * distanceX + target.vy * distanceY;

                        
                        var momentumOne = (dpNormalOne * (ball.mass - target.mass) + 2 * target.mass * dpNormalTwo) / (ball.mass + target.mass);
                        var momentumTwo = (dpNormalTwo * (target.mass - ball.mass) + 2 * ball.mass * dpNormalOne) / (ball.mass + target.mass);

                        
                        ball.vx = tangentX * dpTangentOne + distanceX * momentumOne;
                        ball.vy = tangentY * dpTangentOne + distanceY * momentumOne;
                        target.vx = tangentX * dpTangentTwo + distanceX * momentumTwo;
                        target.vy = tangentY * dpTangentTwo + distanceY * momentumTwo;
        
                    }
                }
            }
        }
    }
}


function velocityCalculator()
{
    if (!zeroVelocity)
    {
        for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
        {
            var ball = balls[ballIndex];
            if (ball.elementIsClicked)
            {
                //happens every milisecond so gets the distance travelled per milisecond
                if (currentY != previousY)
                    startY = Date.now();
                if (currentX != previousX)
                    startX = Date.now();
                
                //if statements make the ball move even if the velocity should technically be 0
                //this looks smoother and more correct
                if (currentY != previousY)
                    ball.vy = currentY - previousY;
                else if (Date.now() - startY > stationaryTimeout)
                    ball.vy = 0;

                if (currentX != previousX)
                    ball.vx = currentX - previousX;
                else if (Date.now() - startX > stationaryTimeout)
                    ball.vx = 0;

                //refreshes the previous cords before the current changes
                previousY = currentY;
                previousX = currentX;
                break;
            }
        }
    }
    setTimeout(velocityCalculator, 1);
}

function drag()  //currently broken, needs to be fixed
{
    if (!zeroDrag)
    {
        for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
        {
            var ball = balls[ballIndex];

            //I could also more dragamount of ball's velocity in the opposite direction, but I like this more
            ball.vx /= 1 + dragAmount; 
            ball.vy /= 1 + dragAmount; 

        }
    }
    setTimeout(drag, 1);
}


function gravity() 
{
    if (!zeroGravity)
    {
        for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
        {
            var ball = balls[ballIndex];
            if (ball.vy < ballTeminalVelocity && !ball.elementIsClicked)
                ball.vy += 0.009807 * metersPerPixel;
        }
    }
    setTimeout(gravity, 1); 
}

function animate(recall = true) 
{
    ballCollisions();
    for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
    {
        var ball = balls[ballIndex];
        
        if (!ball.elementIsClicked)
        {
            ball.y += ball.vy;
            ball.x += ball.vx;
        }

        if (ball.y > window.innerHeight)
        {
            ball.y = window.innerHeight;
            ball.vy /= -bounceVelocityLossAmount;
            if (!zeroFriction)
                ball.vx /= 1.02;
            
        }
        if (ball.y < 0)
        {
            ball.y = 0;
            ball.vy /= -bounceVelocityLossAmount;
            if (!zeroFriction)
                ball.vx /= 1.02;
        }
        if (ball.x < 0)
        {
            ball.x = 0;
            if (!zeroFriction)
                ball.vy /= 1.02;
            ball.vx /= -bounceVelocityLossAmount;
        }
        if (ball.x > window.innerWidth)
        {
            ball.x = window.innerWidth;
            if (!zeroFriction)
                ball.vy /= 1.02;
            ball.vx /= -bounceVelocityLossAmount;
        }

        ball.element.style.left = ball.x + "px";
        ball.element.style.top = ball.y + "px";
    }
    if (recall)
        requestAnimationFrame(animate); //this is what does the smooth thing in a normal game you fuckin idiot
}


document.addEventListener("mousedown", function(event) {
    if (event.buttons == 4)
    {
        event.preventDefault();
        addBall(event.x, event.y, RandomNumber(10, 70));
    }
    
})


document.addEventListener("mouseup", function(event) {
    for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
    {
        var ball = balls[ballIndex];
        ball.elementIsClicked = false;
    }
});

document.addEventListener("touchend", function(event) {
    for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
    {
        var ball = balls[ballIndex];
        ball.elementIsClicked = false;
    }
});


document.addEventListener("mousemove", function(event)
{
    currentX = event.x;
    currentY = event.y;
    for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
    {
        var ball = balls[ballIndex];
        if (ball.elementIsClicked)
        {
            ball.x = event.x;
            ball.y = event.y;
            break;
        }
    }
});

document.addEventListener("touchmove", function(event)
{
    currentX = event.touches[0].pageX;
    currentY = event.touches[0].pageY;
    for (var ballIndex = 0; ballIndex < ballCount; ballIndex++)
    {
        var ball = balls[ballIndex];
        if (ball.elementIsClicked)
        {
            ball.x = currentX;
            ball.y = currentY;
            break;
        }
    }
});
