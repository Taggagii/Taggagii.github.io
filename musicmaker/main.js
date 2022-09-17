// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

const AudioContext = window.AudioContext || window.webkitAudioContext;

const dingButton = document.querySelector('#ding');
const notes = document.querySelector('#notes');

class NotesWriter extends Array {
    push(item, ttl) {
        // get index to keep array sorted
        let low = 0;
        let high = this.length;
        while (low < high) {
            let mid = (low + high) >>> 1;
            if (this[mid] < item) { 
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        super.splice(low, 0, item);

        notes.innerHTML = 'frequencies:<br/>' + this.join('<br/>');
        setTimeout(() => {
            this.splice(this.indexOf(item), 1);
            notes.innerHTML = 'frequencies:<br/>' + this.join('<br/>');
        }, ttl);

        return this.length;
    }
};

let a4 = 440;

let notesWriter = new NotesWriter;

let divisions = 12;
const multiple = Math.pow(2, 1 / divisions);

let killTime = 10;

function randomizeA4() {
    a4 = Math.floor(Math.random() * 500 + 100)
}

function calculateFrequencyFromHalfstep(halfStep = 0, ttl = 5000) {
    // let note = Math.floor(a4 * Math.pow(multiple, halfStep) * 100) / 100;
    let note = Math.pow([0.5, 2][Math.floor(Math.random() * 2)], Math.floor(Math.random() * 3)) * (Math.floor(a4 * Math.pow(multiple, halfStep) * 100) / 100); // throwing in some randomness for fun
    notesWriter.push(note, ttl);
    return note;
}

function playNotes() {
    if (typeof arguments[0] === 'object') {
        playNotes(...arguments[0]);
        return;
    }
    let audioContext = new AudioContext();
    let gainNode = audioContext.createGain();

    gainNode.connect(audioContext.destination);

    let oscillators = [];

    let delay = 100;
    let ttl = ((killTime / 2) + (arguments.length * (delay / 1000))) * 1000;
    for (let i = 0; i < arguments.length; ++i) {
        let oscillatorNode = audioContext.createOscillator();
        oscillatorNode.type = 'triangle';
        oscillatorNode.frequency.setValueAtTime(calculateFrequencyFromHalfstep(arguments[i], ttl), audioContext.currentTime);
        oscillatorNode.connect(gainNode);
        oscillators.push(oscillatorNode);
    }   

    let currentTime = audioContext.currentTime;
    let timeToKill = currentTime + killTime + (oscillators.length * (delay / 1000));
    const loop = (oscillatorIndex = 0) => {
        if (oscillatorIndex == oscillators.length) {
            gainNode.gain.exponentialRampToValueAtTime(0.000001, timeToKill);
            return;
        };
        oscillators[oscillatorIndex].start(currentTime);
        oscillators[oscillatorIndex].stop(timeToKill);
        gainNode.gain.value = 1 / ++oscillatorIndex;
        setTimeout(() => {
            loop(oscillatorIndex)
        }, delay);
    };
    loop();
}

function playChord() {
    if (typeof arguments[0] === 'object') {
        playChord(...arguments[0]);
        return;
    }
    let audioContext = new AudioContext();
    let gainNode = audioContext.createGain();

    gainNode.connect(audioContext.destination);

    let oscillators = [];
    let ttl = killTime * 1000;
    for (let i = 0; i < arguments.length; ++i) {
        let oscillatorNode = audioContext.createOscillator();
        oscillatorNode.type = 'triangle';
        oscillatorNode.frequency.setValueAtTime(calculateFrequencyFromHalfstep(arguments[i], ttl), audioContext.currentTime);
        oscillatorNode.connect(gainNode);
        oscillators.push(oscillatorNode);
    }   

    gainNode.gain.value = 1 / oscillators.length;
    oscillators.forEach((oscillator) => {
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + killTime)
    });

    // gainNode.gain.exponentialRampToValueAtTime(0.000001, audioContext.currentTime + killTime);
}

let majorScale = [0, 2, 4, 5, 7, 9, 11, 12];
let minorScale = [0, 2, 3, 5, 7, 8, 10, 12];

let majorChord = [0, 4, 7];
let minorChord = [0, 3, 7];

dingButton.addEventListener('click', () => {
    let offset = 0;
    // randomizeA4();
    // playNotes(minorScale.concat(minorScale.map(x => x + divisions)).concat(minorScale.map(x => x + 2 * divisions)).concat(minorScale.map(x => x + 3 * divisions)));
    playChord(majorScale[Math.floor(Math.random() * majorScale.length)]);
}, false);

