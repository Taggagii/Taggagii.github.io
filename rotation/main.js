var canvas = document.getElementById("gameArea");
var context = canvas.getContext("2d");

var cellSize = 10;
var directionalCells = 250;

var cellWidth = cellSize;
var cellHeight = cellSize;
var numberOfCells = directionalCells ** 2;

context.canvas.width = cellWidth * directionalCells;
context.canvas.height = cellHeight * directionalCells;



var cells = Array(numberOfCells).fill(0);

var checkingRules = false;

var clickingleft = false;
var clickingright = false

function checkRules()
{
    if (!checkingRules) return;
    let newCells = cells.slice();
    for (var i = 0; i < numberOfCells; i++)
    {
        let values = getSurroundingCells(i);
        let liveNeighbours = 0;
        for (var ii = 0; ii < values.length; ii++)
        {
            if (cells[values[[ii]]]) liveNeighbours++;
        }
        
        if (cells[i] && liveNeighbours < 2 || liveNeighbours > 3)
        {
            newCells[i] = 0;
        }
        if (!cells[i] && liveNeighbours == 3)
        {
            newCells[i] = 1;
        }
    }
    cells = newCells
    drawGrid();
    updateCells();
    setTimeout(checkRules, 0);
}

function resetCells()
{
    cells = Array(numberOfCells).fill(0);
    drawGrid();
    updateCells();
}


function getSurroundingCells(index)
{
    let x = index % directionalCells;
    let y = (index - x) / directionalCells;
    let surroundingLocations = [
        [x - 1, y - 1],
        [x - 1, y], 
        [x - 1, y + 1],
        [x, y - 1],
        [x, y + 1],
        [x + 1, y + 1],
        [x + 1, y], 
        [x + 1, y - 1]
    ];
    for (let i = 0; i < surroundingLocations.length; i++)
    {
        if (surroundingLocations[i][0] < 0 || surroundingLocations[i][0] >= directionalCells || surroundingLocations[i][1] < 0 || surroundingLocations[i][1] >= directionalCells)
        {
            surroundingLocations.splice(i, 1);
            i--;
        }
        else 
        {
            surroundingLocations[i] = surroundingLocations[i][0] + surroundingLocations[i][1] * directionalCells;
        }
    }
    return surroundingLocations;
}


drawGrid();
updateCells();
function drawGrid()
{

    context.beginPath();
    context.rect(0, 0, canvas.clientWidth, canvas.clientHeight);
    context.fillStyle = "black";
    context.fill();

    // context.beginPath();
    // context.strokeStyle = "white";
    // for (var i = 0; i < directionalCells; i++)
    // {
    //     var startX = i * cellWidth;
    //     context.moveTo(startX, 0);
    //     context.lineTo(startX, canvas.clientHeight);
    //     var startY = i * cellHeight;
    //     context.moveTo(0, startY);
    //     context.lineTo(canvas.clientWidth, startY);
    // }
    // context.stroke();
}

function updateCells()
{
    drawGrid();
    let x = 0;
    let y = 0;
    let endWidth = canvas.clientWidth - cellWidth;
    for (var i = 0; i < cells.length; i++)
    {
        if (cells[i])
        {
            drawBox(x, y, cellWidth, cellHeight);
        }
        if (x == endWidth)
        {
            x = 0;
            y += cellHeight;
        }
        else
        {
            x += cellWidth;
        }
        
    }
}

function changeAtTo(x, y, value)
{
    if (x >= canvas.clientWidth || y >= canvas.clientHeight) return;
    let cellX = Math.floor(x / cellWidth);
    let cellY = Math.floor(y / cellHeight);
    let cellsIndex = cellX + cellY * directionalCells;
    cells[cellsIndex] = value;
}

function drawBox(startX, startY, endX, endY, color = "white")
{
    context.beginPath();
    context.rect(startX, startY, endX, endY);
    context.fillStyle = color;
    context.fill();
}

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener("mousedown", (e) => {
    if (e.button === 0)
    {
        
        clickingleft = true;
        changeAtTo(e.offsetX, e.offsetY, true);
        drawGrid();
        updateCells();
    }
    if (e.button === 2)
    {
        e.preventDefault();
        clickingright = true;
        changeAtTo(e.offsetX, e.offsetY, false);
        drawGrid();
        updateCells();
    }

})

document.addEventListener("mouseup", (e) => {
    if (e.button === 0)
    {
        clickingleft = false;
    }
    if (e.button === 2)
    {
        clickingright = false;
    }
})

document.addEventListener("mousemove", (e) =>
{
    if (clickingleft)
    {
        changeAtTo(e.offsetX, e.offsetY, true);
        drawGrid();
        updateCells();
    }
    if (clickingright)
    {
        changeAtTo(e.offsetX, e.offsetY, false);
        drawGrid();
        updateCells();
    }
})

document.addEventListener("keydown", (e) => {
    if (e.key === "r")
    {
        checkingRules ^= 1;
        checkRules();
    }
    if (e.key === "c")
    {
        resetCells();
    }
})




