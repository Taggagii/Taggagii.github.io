// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

const AudioContext = window.AudioContext || window.webkitAudioContext;

let audioContext = new AudioContext();
let gainNode = audioContext.createGain();

/** @type {HTMLCanvasElement} */
const noteSelector = document.querySelector('#noteSelector');
const context = noteSelector.getContext('2d');
const frequencyDisplayer = document.querySelector('#frequencyDisplayer');
const volumeSlider = document.querySelector('#volumeSlider');
const stopButton = document.querySelector('#stopButton');
const mouseoverFreqDisplayer = document.querySelector('#mouseoverFreqDisplayer');
const mouseoverNoteDisplayer = document.querySelector('#mouseoverNoteDisplayer');


let mouseButtonPressed = 0; // one higher than the actual button for 0 === false comparison

// removing the context menu
document.oncontextmenu = () => {
    return false;
};

// rendering information
const nodeRadius = 10;
const nodeRadiusSquared = Math.pow(nodeRadius, 2);
function clear() {
    context.fillStyle = 'white';
    context.fillRect(0, 0, noteSelector.width, noteSelector.height);
}

// music information

let a4 = 110;
let divisions = 12;
const multiple = Math.pow(2, 1 / divisions);

function calculateFrequencyFromHalfstep(halfStep = 0, octave = 0) {
    let note = a4 * Math.pow(multiple, halfStep + (12 * octave))
    return note;
}

let majorScale = [0, 2, 4, 5, 7, 9, 11, 12];
let minorScale = [0, 2, 3, 5, 7, 8, 10, 12];

let majorChord = [0, 4, 7];
let minorChord = [0, 3, 7];


let musicNotes = [];
musicNotes.display = function () {
    frequencyDisplayer.innerHTML = JSON.stringify(this.map((musicNote) => musicNote.freq)) + JSON.stringify(this.map((musicNote) => musicNote.note))
    clear();
    for (let i = 0; i < this.length; ++i) {
        this[i].draw();
    }
}
musicNotes.push = function () {
    const returnValue = Array.prototype.push.apply(this, arguments);
    this.display();
    return returnValue;
}
musicNotes.splice = function () {
    const returnValue = Array.prototype.splice.apply(this, arguments);
    this.display();
    return returnValue;
} 
musicNotes.remove = function () {
    if (arguments[0] > this.length) {
        return Error('You cannot remove elements past the end of the array');
    } else {
        return this.splice(arguments[0], 1)[0];
    }
}


// note finder
const baseFreqs = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 30.87];
const baseNotes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'b'];

function freqToNote(freq) {
    let min = undefined;
    let minIndex = undefined
    let minOctave = undefined;
    for (let i = 0; i < baseFreqs.length; ++i) {
        const octave = Math.log2(freq / baseFreqs[i]);
        const octaveRounded = Math.round(octave);
        const difference = Math.abs(octave - octaveRounded);
        if (difference <= min || min === undefined) {
            min = difference;
            minIndex = i;
            minOctave = octaveRounded;
        }
    }
    return baseNotes[minIndex] + minOctave.toString();
}

// MusicNote object containing an oscillator and where it appears on the screen

function calculateFreq(x, y) {
    const freq = (x + (noteSelector.height - y)); // sum
    // const freq = Math.log(x + (noteSelector.height - y)) / Math.log(1.004); // logarithmic
    return Math.round((freq + baseFreqs[0]) * 100) / 100;
}

class MusicNote {
    constructor(x, y, freq = undefined, type = 'sine') {
        this.x = x;
        this.y = y;
        this.freq = freq ?? calculateFreq(x, y);
        this.note = freqToNote(this.freq);
        // if (musicNotes.find((musicNote) => musicNote.note === this.note)) return;
        if (musicNotes.find((musicNote) => musicNote.freq === this.freq) + 1) return;

        this.oscillatorNode = audioContext.createOscillator();
        this.oscillatorNode.type = type;
        this.oscillatorNode.frequency.setValueAtTime(this.freq, audioContext.currentTime);
        this.oscillatorNode.connect(gainNode);

        // initalize the oscillator across the program
        musicNotes.push(this);
        gainNode.connect(audioContext.destination) 
        this.play();
        this.draw();
    }

    play() {
        if (!this.playing) {
            this.oscillatorNode.start(audioContext.currentTime);
            gainNode.gain.value = suggestedGainValue();
            this.playing = true;
        }
    }

    stop(index = undefined) {
        musicNotes.remove(index ?? musicNotes.indexOf(this)).oscillatorNode.stop(audioContext.currentTime);
        gainNode.gain.value = suggestedGainValue();
    }

    draw() {
        context.beginPath();
        context.fillStyle = 'black';
        context.arc(this.x, this.y, nodeRadius, 0, 2 * Math.PI);
        context.fill();
    }
}

// handling oscillators

let baseVolume = volumeSlider.value / 10;
const suggestedGainValue = () => {
    let value = (musicNotes.length) ? (baseVolume / musicNotes.length) : baseVolume;
    return value;
};

function stopOscillators() {
    let length = musicNotes.length;
    for (let i = 0; i < length; ++i) {
        musicNotes[0].stop(0);
    }
}

function getMusicNoteFromCoord(x, y) {
    for (let i = 0; i < musicNotes.length; ++i) {
        if (Math.pow(x - musicNotes[i].x, 2) + Math.pow(y - musicNotes[i].y, 2) <= nodeRadiusSquared) {
            return {musicNote: musicNotes[i], index: i};
        }
    }    
    return false;   
}

function handleMouseEvent(event) {
    const boundingRect = noteSelector.getBoundingClientRect();
    let x = Math.floor(event.x - boundingRect.x);
    let y = Math.floor(event.y - boundingRect.y);

    event.preventDefault();
    switch (mouseButtonPressed) {
        case 1: // left mouse
            new MusicNote(x, y)
            break;
        case 3: // right mouse     
            // find the musicNote that you're clicking and stop it
            const { musicNote, index } = getMusicNoteFromCoord(x, y);
            musicNote && musicNote.stop(index)
            musicNotes.display();
    }  
    return {x, y}
}


noteSelector.addEventListener('mousedown', (event) => {
    mouseButtonPressed = event.button + 1;
    handleMouseEvent(event);
});

noteSelector.addEventListener('mouseup', (event) => {
    mouseButtonPressed = 0;
    mousePressed = false;
})

noteSelector.addEventListener('mousemove', (event) => {
    const {x, y} = handleMouseEvent(event);
    const freq = calculateFreq(x, y);
    console.log(freq);
    const note = freqToNote(freq);
    mouseoverFreqDisplayer.innerHTML = freq;
    mouseoverNoteDisplayer.innerHTML = note
});

noteSelector.addEventListener('mouseout', (event) => {
    mouseButtonPressed = 0;
    mouseoverFreqDisplayer.innerHTML = '';
})

volumeSlider.addEventListener('input', () => {
    baseVolume = volumeSlider.value / 10;
    gainNode.gain.value = suggestedGainValue();
})

stopButton.addEventListener('click', () => {
    stopOscillators();
    context.fillStyle = 'white';
    context.fillRect(0, 0, noteSelector.width, noteSelector.height);
});


