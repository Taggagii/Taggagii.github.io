
const canvas = document.querySelector("#gameBoard");

/** @type {CanvasRenderingContext2D} */
const context = canvas.getContext("2d");

let constantSize = window.innerHeight;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

// drawAsteroid(500, 500, 150);
// drawAsteroid(800, 500, 85);
// drawAsteroid(1000, 500, 50);
// drawAsteroid(1100, 500, 25);
// drawAsteroid(1150, 500, 10);
var asteroidsData = {
    initalSize: 150, 
    150: 85,
    85: 50,
    50: 30,
    speedFinder: function(size){
        switch(size)
        {
            case 150:
                return 3;
            case 85: 
                return 4;
            case 50:
                return 6;
        }
        return 1.5;
    }
    
}

var blackhole = {alive: false};


function generateStartingAsteroids()
{
    return {
        x: random(0, canvas.width), 
        y: random(0, canvas.height),
        xVel: random(-1.5, 1.5),
        yVel: random(-1.5, 1.5),
        size: asteroidsData.initalSize,
        powSize: Math.pow(asteroidsData.initalSize, 2),
        alive: true,
    };
}


var deathSounds = [
    new Audio("asteroids/Death.mp3"),
    new Audio("asteroids/Death2.mp3"),
    new Audio("asteroids/Death5.mp3"),
    new Audio("asteroids/Death4.mp3"),
    new Audio("asteroids/Death3.mp3"),
];

var ship = {
    x: canvas.width / 2, 
    y: canvas.height / 2,
    xVelocity: 0, 
    yVelocity: 0,
    reloaded: true,
    lives: 5,
    alive: true,
    won: false,
    beingAbsorbed: false,
    absorptionTimer: 0,
    absorptionTime: 3,
    wonToFinishTimer: 0,
    wonToFinishTime: 0,
    colliding: false,
    immune: false,
    immuneTimer: 0,
    immuneTime: 3,
    show: true,
    fireRate: 0.25, //r second
    score: 0,
    bulletSpeed: 30,
    bulletLifeTime: 1,
    bulletSize: 4,
    bullets: [],
    crashed: false,
    deadTimer: 0,
    respawnTime: 1,
    collisionPenalty: 200,
    magazineSize: 5,
    acceleration: 0.3,
    rotation: -90,
    rotationSpeed: 6, 
    drag: 0.05, 
    velocityMin: 0.02, 
    velocityMax: 20,
    aliveColorDecreaseValue: 0,
    scaleFactor: 40,
    coordinatePath: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1.2, y: 0.5}]
}
ship.aliveColorDecreaseValue = Math.round(99 / Math.round(ship.lives - 1)) - 1;

var asteroids = [];
let count = 0;
let current = generateStartingAsteroids();
while (count < 2)
{
    while (checkAsteroidIntersection(current, ship.x, ship.y))
    {
        current = generateStartingAsteroids();
    }
    asteroids.unshift(current);
    count++
    current = generateStartingAsteroids()
}

var keys = {
    up: false, 
    down: false, 
    left: false, 
    right: false,
    space: false,
}

function clear()
{
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function clearBlack()
{
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function realMod(n, m)
{
    return ((n % m) + m) % m;
}

function getShipCoordinates(coord)
{
    return rotate(coord.x * ship.scaleFactor + ship.x, coord.y * ship.scaleFactor + ship.y, ship.rotation); 
}

function colorHandler()
{
    if (ship.immune)
    {
        return "green";
    }
    if (ship.won)
    {
        return "white";
    }
    let redValue = Math.round(99 - ship.aliveColorDecreaseValue * (ship.lives - 1)).toString().padStart(2, '0');
    if (redValue > 99)
        redValue = 99;
    return `#${redValue}0000`;
}


function drawShip()
{
    if (ship.dead) return;
    if (ship.immune)
    {
        ship.show ^= 1;
        if (!ship.show) return;
    }
    context.fillStyle = colorHandler();
    context.beginPath();

    let startCoord = getShipCoordinates(ship.coordinatePath[0]);
    if (blackhole.alive)
    {
        let distance = Math.sqrt(Math.pow(blackhole.x - startCoord.x, 2) + Math.pow(blackhole.y - startCoord.y, 2));
        let maxBlurAmount = 35;
        context.shadowColor = "white";
        distance *= (maxBlurAmount * 2 / Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)))
        context.shadowBlur = maxBlurAmount - distance;
    }
    context.moveTo(startCoord.x, startCoord.y)
    for (var coord of ship.coordinatePath)
    {
        coord = getShipCoordinates(coord);
        context.lineTo(coord.x, coord.y);
    }
    context.closePath();
    context.fill();
}

function drawBullet(x, y)
{
    context.fillStyle = "black";
    context.beginPath();
    context.arc(x, y, ship.bulletSize, 0, Math.PI * 2);
    context.closePath();
    context.fill()
}


function drawAsteroid(x, y, size)
{
    context.fillStyle = "black";
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.closePath();
    context.fill()
}


function drawBlackHole()
{
    if (blackhole.alive)
    {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(blackhole.x, blackhole.y, blackhole.size, 0, Math.PI * 2);
        context.shadowColor = "white";
        context.shadowBlur = 35;
        context.closePath();
        context.fill()
    }
}


function drawText()
{
    context.shadowColor = 'transparent';
    context.font = "30px Arial";
    context.fillStyle = 'green';
    context.textAlign = "left";
    context.fillText(`Score: ${ship.score}`, 70, 40)

    context.textAlign = "right";
    context.fillText(`Lives: ${ship.lives}`, canvas.width - 70, 40)
}


function blackHoleAbsorption()
{
    if (Math.sqrt(Math.pow(blackhole.x - ship.x, 2) + Math.pow(blackhole.y - ship.y, 2)) < blackhole.size)
    {
        blackhole.x = canvas.width / 2;
        blackhole.y = canvas.height / 2;
        ship.beingAbsorbed = true;
    }
    else
    {
        ship.beingAbsorbed = false;
        ship.absorptionTimer = 0;
    }
}

function checkAsteroidIntersection(asteroid, x, y)
{
    let distance = Math.pow(asteroid.x - x, 2) + Math.pow(asteroid.y - y, 2)
    if (distance < asteroid.powSize)
        return true;
    return false;
}

function runChecks()
{
    if (ship.alive && ship.lives <= 0)
    {
        ship.alive = false;
        return;
    }
    ship.x = realMod(ship.x, canvas.width);
    ship.y = realMod(ship.y, canvas.height);

    for (let i = 0; i < ship.bullets.length; i++)
    {
        ship.bullets[i].x = realMod(ship.bullets[i].x, canvas.width);
        ship.bullets[i].y = realMod(ship.bullets[i].y, canvas.height);
        
        //check if a bullet is in1rsecting a asteroid and move the asteroid
        for (let ii = 0; ii < asteroids.length; ii++)
        {
            if (!ship.bullets[i] || !asteroids[ii]) break;
            if (checkAsteroidIntersection(asteroids[ii], ship.bullets[i].x, ship.bullets[i].y))
            {
                ship.score += asteroids[ii].size;
                new Audio("asteroids/bang.wav").play();
                let asteroidMaxSpeed =  asteroidsData.speedFinder(asteroids[ii].size);
                let xv = random(-asteroidMaxSpeed, asteroidMaxSpeed), yv = random(-asteroidMaxSpeed, asteroidMaxSpeed)
                if (asteroids[ii].size in asteroidsData)
                {
                    asteroids.push(makeAsteroid(
                        asteroids[ii].x, 
                        asteroids[ii].y,
                        xv,
                        yv,
                        asteroidsData[asteroids[ii].size]
                        ));  
                    asteroids.push(makeAsteroid(
                        asteroids[ii].x, 
                        asteroids[ii].y,
                        -xv,
                        -yv,
                        asteroidsData[asteroids[ii].size]
                        )); 
                    asteroids.splice(ii, 1);
                    ship.bullets.splice(i, 1);
                    ii -= 2;
                }
                else
                {
                    asteroids.splice(ii, 1);
                    ship.bullets.splice(i, 1);
                    ii -= 1;
                }


                
                
            }
        }
    }
    let shipPoints = [getShipCoordinates(ship.coordinatePath[0]), getShipCoordinates(ship.coordinatePath[1]), getShipCoordinates(ship.coordinatePath[2])];

    for (let i = 0; i < asteroids.length; i++)
    {
        asteroids[i].x = realMod(asteroids[i].x, canvas.width + asteroids[i].size / 2);
        asteroids[i].y = realMod(asteroids[i].y, canvas.height - asteroids[i].size / 2);
        if (!ship.colliding && !ship.immune)
        {
            for (let point of shipPoints)
            {
                let value = checkAsteroidIntersection(asteroids[i], point.x, point.y);
                if (value)
                {
                    ship.score -= ship.collisionPenalty;
                    ship.colliding = true;
                    break;
                }
            }
        }   
    }
    if (ship.colliding)
    {
        ship.colliding = false;
        ship.dead = true;
        let sound = deathSounds[5 - ship.lives]
        sound.play();
        ship.immune = true;
        ship.lives -= 1;
    }

    if (Math.abs(ship.xVelocity - 0) <= ship.velocityMin)
        ship.xVelocity = 0;
    if (Math.abs(ship.yVelocity - 0) <= ship.velocityMin)
        ship.yVelocity = 0;

    let hypontenuse = Math.sqrt(Math.pow(ship.xVelocity, 2) + Math.pow(ship.yVelocity, 2));
    if (hypontenuse > ship.velocityMax)
    {
        let x = ship.velocityMax / hypontenuse;

        ship.xVelocity *= x;
        ship.yVelocity *= x;
    }
}

function drag()
{
    ship.xVelocity -= Math.sign(ship.xVelocity) * ship.drag;
    ship.yVelocity -= Math.sign(ship.yVelocity) * ship.drag;
}

function trackMovement()
{
    //ship's movement
    if (keys.up)
    {
        ship.xVelocity += ship.acceleration * Math.cos(toRad(ship.rotation));
        ship.yVelocity -= ship.acceleration * Math.sin(toRad(ship.rotation));
    }

    if (keys.right) 
        ship.rotation -= ship.rotationSpeed;
    if (keys.left)
        ship.rotation += ship.rotationSpeed;


    ship.x += ship.xVelocity
    ship.y += ship.yVelocity

    //bullet's movement
    for (var bullet of ship.bullets)
    {
        bullet.x += bullet.xVel;
        bullet.y -= bullet.yVel;
        drawBullet(bullet.x, bullet.y);
    }

    //asteroids movement
    for (var asteroid of asteroids)
    {
        asteroid.x += asteroid.xVel;
        asteroid.y += asteroid.yVel;
        drawAsteroid(asteroid.x, asteroid.y, asteroid.size);
    }
}

function addBullet()
{
    if (!(ship.bullets.length < ship.magazineSize) || ship.immune) return false;
    
    //bullet object
    //x, y, xVel, yVel, lifeTime
    var coord = getShipCoordinates(ship.coordinatePath[2]);

    ship.bullets.unshift({
        x: coord.x,
        y: coord.y,
        xVel: ship.bulletSpeed * Math.cos(toRad(ship.rotation)),
        yVel: ship.bulletSpeed * Math.sin(toRad(ship.rotation)),
        lifeTime: ship.bulletLifeTime
    });
    return true;
}


function makeAsteroid(x, y, xVel, yVel, size)
{
    return {
                x: x, 
                y: y,
                xVel: xVel,
                yVel: yVel,
                size: size,
                powSize: Math.pow(size, 2),
                alive: true,
            }
}


function shoot()
{
    if (!keys.space || !ship.reloaded) return;
    keys.space = false;
    let addedBullet = addBullet();
    if (addedBullet)
    {
        var sound = new Audio("asteroids/laser.mp3");
        sound.play();
    }
    ship.reloaded = false;
}


//helpers

function random(min, max)
{
    return Math.random() * (max - min) + min;
}

function toDeg(value)
{
    return value * (180 / Math.PI)
}

function toRad(value)
{
    return value * (Math.PI / 180);
}

function rotate(x, y, angle, relativeX, relativeY) {
    if (relativeX === undefined)
        relativeX = ship.x;
    if (relativeY === undefined)
        relativeY = ship.y;

    var radians = (Math.PI / 180) * angle,
        cy = relativeY + (ship.scaleFactor / 2);
        cx = relativeX + (ship.scaleFactor / 2);
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {
        x: nx, 
        y: ny
    };
}

setInterval(() => {
    if (ship.beingAbsorbed)
    {
        ship.absorptionTimer++;
        if (ship.absorptionTimer > ship.absorptionTime)
        {
            finale();
        }
    }
    if (ship.won)
    {
        ship.wonToFinishTimer += 1;
        if (ship.wonToFinishTimer > ship.wonToFinishTime)
        {
            if (!blackhole.alive)
            {
                blackhole = {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    size: 200,
                    alive: true
                }
            }
        }
    }
    
    for (let i = 0; i < ship.bullets.length; i++)
    {
        ship.bullets[i].lifeTime -= 1;
        if (ship.bullets[i].lifeTime < 1)
        {
            ship.bullets.splice(i, 1);
        }
    }
    if (ship.dead)
    {
        ship.deadTimer++;
        if (ship.deadTimer > ship.respawnTime)
        {
            ship.deadTimer = 0;
            ship.dead = false;
            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.xVelocity = 0;
            ship.yVelocity = 0;
        }
    }
    else if (ship.immune)
    {
        ship.immuneTimer += 1;
        if (ship.immuneTimer >= ship.immuneTime)
        {
            ship.immune = false;
            ship.immuneTimer = 0;
        }
    }


}, 1000);



//
// Main Loop
//

function gameLoop()
{
    clear();
    trackMovement();
    runChecks();
    drag();
    shoot();
    drawShip();
    drawText();
    if (!asteroids.length)
    {
        ship.won = true;
        gameWin();
        return;
    }
    if (ship.alive)
        window.requestAnimationFrame(gameLoop);
    else
        gameOver(3, 2);
}
window.requestAnimationFrame(gameLoop);

function gameWin()
{
    clearBlack();
    trackMovement();
    blackHoleAbsorption();
    runChecks();
    drag();
    drawShip();
    drawBlackHole();
    drawText();
    window.requestAnimationFrame(gameWin);
}

function gameOver(time, showTime)
{
    clear();
    context.font = "100px Arial";
    context.fillStyle = "red";
    context.textAlign = 'center';
    if (showTime)
        context.fillText(`Game Over`, window.innerWidth / 2, window.innerHeight / 2);
    else
        context.fillText(`Restarting in ${time}`, window.innerWidth / 2, window.innerHeight / 2);
    setTimeout(() => {
        if (showTime > 0)
        {
            gameOver(time, showTime - 1)
        }
        else if (time > 1)
            gameOver(time - 1, 0)
        else
            location.reload();
    }, 1000);
}

function finale()
{
    window.location.href = "https://taggagii.github.io/"
}

//
//Listeners
//

document.addEventListener("keydown", (event) => {
    var code = event.code;

    switch (code)
    {
        case "ArrowDown":
            keys.down = true;
            event.preventDefault();
            break;
        case "ArrowUp":
            keys.up = true;
            event.preventDefault();
            break;
        case "ArrowLeft":
            keys.left = true;
            event.preventDefault();
            break;
        case "ArrowRight":
            keys.right = true;
            event.preventDefault();
            break;
        case "Space":
            keys.space = true;
            event.preventDefault();
            break;
        
    }
})
document.addEventListener("keyup", (event) => {
    var code = event.code;
    switch (code)
    {
        case "ArrowDown":
            keys.down = false;
            break;
        case "ArrowUp":
            keys.up = false;
            break;
        case "ArrowLeft":
            keys.left = false;
            break;
        case "ArrowRight":
            keys.right = false;
            break;
        case "Space":
            ship.reloaded = true;
            break;
    }
})


function resizeCanvas()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resizeCanvas;

