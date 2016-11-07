var raspi = require('raspi-io');
var five = require('johnny-five');
var SoftPWM = require('raspi-soft-pwm').SoftPWM;
var board = new five.Board({
  io: new raspi()
});

var ws281x = require('rpi-ws281x-native');
var NUM_LEDS = 1;        // Number of LEDs



board.on('ready', function() {
  var softPWM = new SoftPWM({pin: 'P1-26', range: 100, frequency: 200});
  var mincycle = 10; var maxcycle = 60 ;
 dutyCycle = mincycle;

  setInterval(function () {
    dutyCycle = dutyCycle == mincycle ? maxcycle:mincycle ;
    softPWM.write(dutyCycle);
    console.log(dutyCycle);
    // dutyCycle += 10;
    // if (dutyCycle > 50) {
    //   dutyCycle = 0;
    // }
  }, 500);
});

                   // default to white

var colorPalette = {
    "red": 0x00ff00,
    "read": 0x00ff00, // sometimes, STT hears "read" instead of "red"
    "green": 0xff0000,
    "blue": 0x0000ff,
    "purple": 0x008080,
    "yellow": 0xc1ff35,
    "magenta": 0x00ffff,
    "orange": 0xa5ff00,
    "aqua": 0xff00ff,
    "white": 0xffffff,
    "off": 0x000000,
    "on": 0xffffff
}
// color[0] = colorPalette["orange"];
// ws281x.render(color) ;

launcLED();

function launcLED(){
  setInterval(function () {
    ws281x.init(NUM_LEDS);   // initialize LEDs
    var color = new Uint32Array(NUM_LEDS);  // array that stores colors for leds

    var colors = Object.keys(colorPalette);
    var randIdx = Math.floor(Math.random() * colors.length);
    var randColor = colors[randIdx];
    //console.log(randColor)
    color[0] = colorPalette[randColor];
    ws281x.render(color);

  }, 500);
}


process.on('SIGINT', function () {
    ws281x.reset();
    process.nextTick(function () { process.exit(0); });
});
