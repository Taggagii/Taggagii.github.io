var canvas = document.getElementById("gameArea");
var context = canvas.getContext("2d");

var directionalCells = 100;
var numberOfCells = directionalCells ** 2;

var cellWidth = canvas.clientWidth / directionalCells;
var cellHeight = canvas.clientHeight / directionalCells

var cells = Array(numberOfCells).fill(0);

var checkingRules = false;

var clicking = false;

function checkRules()
{
    if (!checkingRules) return;
    let newCells = cells.slice();
    for (var i = 0; i < numberOfCells; i++)
    {
        //underpopulation
        //Any cell with fewer than two live neighbours dies
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
    setTimeout(checkRules, 10);
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
    context.rect(0, 0, innerWidth, innerHeight);
    context.fillStyle = "black";
    context.fill();

    context.beginPath();
    context.strokeStyle = "white";
    for (var i = 0; i < directionalCells; i++)
    {
        var startX = i * cellWidth;
        context.moveTo(startX, 0);
        context.lineTo(startX, canvas.clientHeight);
        var startY = i * cellHeight;
        context.moveTo(0, startY);
        context.lineTo(canvas.clientWidth, startY);
    }
    context.stroke();
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

function drawBox(startX, startY, endX, endY, color = "white")
{
    context.beginPath();
    context.rect(startX, startY, endX, endY);
    context.fillStyle = color;
    context.fill();
}


document.addEventListener("mousedown", (e) => {
    clicking = true;
    if (e.x >= canvas.clientWidth || e.y >= canvas.clientHeight) return;
    let cellX = Math.floor(e.x / cellWidth);
    let cellY = Math.floor(e.y / cellHeight);
    let cellsIndex = cellX + cellY * directionalCells;
    cells[cellsIndex] ^= 1;
    let values = getSurroundingCells(cellsIndex);
    //console.log(values);
    let liveNeighbours = 0;
    for (var ii = 0; ii < values.length; ii++)
    {
        if (cells[values[[ii]]]) liveNeighbours++;
    }
    //console.log(liveNeighbours);
    drawGrid();
    updateCells();
})

document.addEventListener("mouseup", (e) => {
    clicking = false;
})

document.addEventListener("mousemove", (e) =>
{
    if (clicking)
    {
        if (e.x >= canvas.clientWidth || e.y >= canvas.clientHeight) return;
        let cellX = Math.floor(e.x / cellWidth);
        let cellY = Math.floor(e.y / cellHeight);
        let cellsIndex = cellX + cellY * directionalCells;
        cells[cellsIndex] ^= 1;
        let values = getSurroundingCells(cellsIndex);
        //console.log(values);
        let liveNeighbours = 0;
        for (var ii = 0; ii < values.length; ii++)
        {
            if (cells[values[[ii]]]) liveNeighbours++;
        }
        //console.log(liveNeighbours);
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
})




