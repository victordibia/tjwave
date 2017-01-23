/**
 * Simple app to wave your robot arm
 * and randomly change your LEDs at a given interval.
 * Uses raspi-soft-pwm library built with johnny-five
 */


var waveinterval = 1500;
var lightinterval = 500;

var mincycle = 500;
var maxcycle = 2300;
var dutycycle = mincycle;

// Init board, setup software PWM on pin 26.
var Gpio = require('pigpio').Gpio;
var motor = new Gpio(7, {
    mode: Gpio.OUTPUT
});

/**
 * Set a timer that waves the robot arm every X seconds
 * Alternate across two positions - mincylce and maxcycle.
 */
function launchWave() {
    setInterval(function() {
        dutycycle = dutycycle == mincycle ? maxcycle : mincycle;
        motor.servoWrite(dutycycle);
        console.log(dutycycle);
    }, waveinterval);
}

/**
 * Set a timer that waves the robot arm every X seconds
 * Set to max cylce each time but return to mincycle x seconds after
 */
launchWaveReturn()

function launchWaveReturn() {
    setInterval(function() {
        motor.servoWrite(maxcycle);
        console.log("set to", maxcycle);
        setTimeout(function() {
            console.log("reset to", mincycle)
            motor.servoWrite(mincycle);
        }, waveinterval / 3);
    }, waveinterval);
}


var ws281x = require('rpi-ws281x-native');
var NUM_LEDS = 1; // Number of LEDs
var color = new Uint32Array(NUM_LEDS); // array that stores colors for leds
var colorPalette = {
    "red": 0x00ff00,
    "green": 0xff0000,
    "blue": 0x0000ff,
    "purple": 0x008080,
    "yellow": 0xc1ff35,
    "magenta": 0x00ffff,
    "orange": 0xa5ff00,
    "aqua": 0xff00ff,
    "white": 0xffffff
}


launcLED();

function launcLED() {
    setInterval(function() {
        ws281x.init(NUM_LEDS); // initialize LEDs
        var colors = Object.keys(colorPalette);
        var randIdx = Math.floor(Math.random() * colors.length);
        var randColor = colors[randIdx];
        //console.log(randColor)
        color[0] = colorPalette[randColor];
        ws281x.render(color);
    }, lightinterval);
}


process.on('SIGINT', function() {
    ws281x.reset();
    process.nextTick(function() {
        process.exit(0);
    });
});
