//Two circles will touch if the distance between their centres, , is equal to the sum of their radii, or the difference between their radii.

let clicked = false;

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
    return this;
}


/* this.element.addEventListener("mousedown", function(event) {
    if (event.buttons == 1)
    {
        console.log(`you're touching ball ${name}`);
        //with this the ball won't launch if clicked and unclicked without movement
        previousX = currentX; 
        previousY = currentY;

        this.elementIsClicked = false;
        //the ball has stopped when you hold it, therefore, it's not moving *mind blown* (so no velocity)
        vy = 0;
        vx = 0;
    }
}); */


let balls = [new Ball("1", window.innerWidth / 2, 0),
             new Ball("2", window.innerWidth / 3, 50)]
let ballCount = 2;


const pixelsMovedPerRefresh = 10;
const metersPerPixel = 5;

let start = Date.now();


//mouse location information
this.currentX = 0;
this.currentY = 0;
this.previousX = 0;
this.previousY = 0;


let dragAmount = 0.005;
let bounceVelocityLossAmount = 1.4;
let ballTeminalVelocity = 57;

let zeroGravity = false;
let zeroDrag = false;
let zeroFriction = false;
let zeroVelocity = false;

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
    previousX = currentX; 
    previousY = currentY;
    balls[index].elementIsClicked = true;
}

function addBall(x, y)
{
    balls[ballCount - 1].element.insertAdjacentHTML('afterend', `<div class = "ball" id = 'ball${++ballCount}'></div>`);
    console.log();
    balls.push(new Ball(ballCount, x, y, Math.floor(Math.random() * 80) + 10));
    var ball = balls[ballCount - 1];
    
}

function ballCollisions()
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
            var checkDistance = (distanceX * distanceX + distanceY * distanceY);
            var maxAmount = ball.radius + target.radius;
            if (checkDistance <= maxAmount * maxAmount)
            {
                //overlapping
                var distance = Math.sqrt(checkDistance);
                var overlap = 0.5 * (distance - 180);

                var xVector = overlap * (ball.x - target.x) / window.innerWidth ;
                var yVector = overlap * (ball.y - target.y) / window.innerHeight;
                if (!ball.elementIsClicked)
                {
                    ball.x -= xVector;
                    ball.y -= yVector;
                }
                if (!target.elementIsClicked)
                {
                    target.x += xVector;
                    target.y += yVector;
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
                    ball.vy = currentY - previousY;
                if (currentX != previousX)
                    ball.vx = currentX - previousX;

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
        addBall(event.x, event.y);
    }
    
})





document.addEventListener("mouseup", function(event) {
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
