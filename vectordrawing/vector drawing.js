var screen = document.getElementById("screen");
var context = screen.getContext("2d");

var screenSize = Math.min(window.innerHeight, window.innerWidth);
screen.width = screenSize / 1.5;
screen.height = screenSize / 1.5;

function clear() {
    context.fillStyle = "white";
    context.fillRect(0, 0, screen.width, screen.height);
}

function reduce(numerator, denominator){
    let ns = Math.sign(numerator);
    let ds = Math.sign(denominator);
    numerator = Math.abs(numerator);
    denominator = Math.abs(denominator);
    if (!numerator && !denominator) return [0, 0];
    if (!numerator) return [0, ds];
    if (!denominator) return [ns, 0];
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(numerator, denominator);
    return [ns * numerator/gcd, ds * denominator/gcd];
  }

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Image {
    constructor(points = [], color = "black", thickness = 1) {
        this.points = [];
        for (var i = 0; i < points.length; ++i) {
            this.addPoint(points[i][0], points[i][1]);
        }
        this.thickness = thickness;
        this.color = color;
    }

    addPoint(x, y) {
        this.points.push(new Point(x, y));
    }
    
    addRandomPoint() {
        this.points.push(new Point(Math.floor(Math.random() * screen.width), Math.floor(Math.random() * screen.height)));
    }

    render() {
        if (!this.points.length) return;
        let color = context.strokeStyle;
        let thickness = context.lineWidth;
        context.strokeStyle = this.color;
        context.lineWidth = this.thickness;
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 1; i < this.points.length; ++i) {
            context.lineTo(this.points[i].x, this.points[i].y);
            context.moveTo(this.points[i].x, this.points[i].y);
        }
        context.stroke();
        context.strokeStyle = color;
        context.thickness = thickness;
    }
}

function colorToRGB(color) {
    let d = document.createElement("div");
    d.style.color = color;
    document.body.appendChild(d);
    let rgbColor = window.getComputedStyle(d).color;
    d.remove();
    return rgbColor;
}

var translating = false;

function transition(imageOne, imageTwo, delay = 10) {
    if (translating) return;
    console.log(translating);
    translating = true;
    let framesForRender = 1000;
    // if (imageOne.points.length != imageTwo.points.length) {
    //     console.log("one: ", imageOne.points.length);
    //     console.log("two: ", imageTwo.points.length);
    //     console.log("this function does not work with different sized objects yet");
    //     return;
    // }

    let finalPoints = [];
    for (var i = 0; i < imageTwo.points.length; ++i) {
        finalPoints.push([imageTwo.points[i].x, imageTwo.points[i].y]);
    }

    let finalImage = new Image(finalPoints, imageTwo.color, imageTwo.thickness);

    let startCount = imageOne.points.length;
    let endCount = finalImage.points.length;

    let points = [];
    for (var i = 0; i < imageOne.points.length; ++i) {
        points.push([imageOne.points[i].x, imageOne.points[i].y]);
    }
    let translationImage = new Image(points, "blue", imageOne.thickness); 

    if (startCount <= endCount) {
        while (true) {
            for (var i = 0; i < translationImage.points.length - 1; i += 2) {
                if (startCount == endCount) break;
    
                translationImage.points.splice(i + 1, 0, new Point((translationImage.points[i].x + translationImage.points[i + 1].x) / 2, 
                                                               (translationImage.points[i].y + translationImage.points[i + 1].y) / 2));
    
                ++startCount;
            }
            if (startCount == endCount) break;        
        }
    } else {
        while (true) {
            for (var i = 0; i < finalImage.points.length - 1; i += 2) {
                if (endCount == startCount) break;
    
                finalImage.points.splice(i + 1, 0, new Point((finalImage.points[i].x + finalImage.points[i + 1].x) / 2, 
                                                         (finalImage.points[i].y + finalImage.points[i + 1].y) / 2));
    
                ++endCount;
            }
            if (endCount == startCount) break;        
        }
    }

    console.log(finalImage);

    

    let dx = [];
    let dy = [];
    for (var i = 0; i < translationImage.points.length; ++i) {
        dx.push((finalImage.points[i].x - translationImage.points[i].x) / framesForRender);
        dy.push((finalImage.points[i].y - translationImage.points[i].y) / framesForRender);
    }

    

    
    function move(frame = 0) {
        clear();
        translationImage.render();
        

        for (var ii = 0; ii < dx.length; ++ii) {
            stillGoing = true;

            translationImage.points[ii].x += dx[ii];
            translationImage.points[ii].y += dy[ii];

            // if (translationImage.points[ii].x == finalImage.points[ii].x && 
            //     translationImage.points[ii].y == finalImage.points[ii].y) {
            //         todo[ii] = 0;
            //     }
        }

        if (frame == framesForRender) {
            imageOne.render();
            imageTwo.render();
            return;
        };
        setTimeout(() => {
            move(frame + 1);
        }, delay);
    }
    move();
    translating = false;
}

// let one = new Image([[100, 100], [200, 200], [100, 200], [200, 100]], "black", 2);
// let two = new Image([[100, 500], [200, 140], [100, 200], [200, 100]], "red", 2);

function wait() {
    one.render();
    two.render();
    setTimeout(() => {
        transition(one, two, 0);
    }, 2000);
}

// wait();

let one = new Image([], "black", 2);
let two = new Image([], "red", 2);

screen.addEventListener("mousedown", (event) => {
    let rect = screen.getBoundingClientRect();
    let x = event.x - rect.x;
    let y = event.y - rect.y;

    switch (event.button) {
        case 0:
            one.addPoint(x, y);
            one.render();
            break;
        case 2:
            two.addPoint(x, y);
            two.render();
            break;
    }
});

document.addEventListener("keypress", (event) => {
    console.log(event.key);
    if (event.key == "t") {
        transition(one, two, 0);
        
    }
    if (event.key == "c") {
        reset();
        
    }
});

window.onload = clear;


function reset() {
    one.points = [];
    two.points = [];
    clear();
}