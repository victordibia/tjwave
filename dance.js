/**
 *  Author: Victor Dibia
 *  description - move robot arm to the beats of a music.
 */

var AudioContext = require('web-audio-api').AudioContext
var context = new AudioContext
var fs = require('fs')
var exec = require('child_process').exec;
var music ;
var _ = require('underscore');
var Sound = require('node-aplay');



var pcmdata = [] ;
var soundfile = "sounds/club.wav"
var threshodld = 0 ;
// Decode sound file
decodeSoundFile(soundfile);


function dance(){
  playsound(soundfile);
  findPeaks(pcmdata, samplerate);
}

/**
 * [decodeSoundFile Use web-audio-api to convert audio file to a buffer of pcm data]
 * @return {[type]} [description]
 */
function decodeSoundFile(soundfile){
  console.log("decoding mp3 file ", soundfile, " ..... ")
  fs.readFile(soundfile, function(err, buf) {
    if (err) throw err
    context.decodeAudioData(buf, function(audioBuffer) {
      console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration);
      pcmdata = (audioBuffer.getChannelData(0)) ;
      samplerate = audioBuffer.sampleRate;
      maxvals = [] ; max = 0 ;
      dance();
    }, function(err) { throw err })
  })
}


/**
 * [findPeaks Naive algo to identify peaks in the audio data, and wave]
 * @param  {[type]} pcmdata    [description]
 * @param  {[type]} samplerate [description]
 * @return {[type]}            [description]
 */
function findPeaks(pcmdata, samplerate){
  var interval = 0.05 * 1000 ; index = 0 ;
  var step = Math.round( samplerate * (interval/1000) );
  var max = 0 ;
  var prevmax = 0 ;
  var prevdiffthreshold = 0.3 ;

  //loop through song in time with sample rate
  var samplesound = setInterval(function() {
    if (index >= pcmdata.length) {
      clearInterval(samplesound);
      console.log("finished sampling sound")
      return;
    }

    for(var i = index; i < index + step ; i++){
      max = pcmdata[i] > max ? pcmdata[i].toFixed(1)  : max ;
    }

    // Spot a significant increase? Wave Arm
    if(max-prevmax >= prevdiffthreshold){
      waveArm();
    }

    // Print out mini equalizer on commandline
    console.log(getbars(max), max )
    prevmax = max ; max = 0 ; index += step ;
  }, interval,pcmdata);
}


/*********************************************************************
* Step #: Wave Arm
*********************************************************************
*/

var mincycle = 500; var maxcycle = 2300 ;
var dutycycle = mincycle;

// Setup software PWM on pin 26, GPIO7.
var Gpio = require('pigpio').Gpio;
var motor = new Gpio(7, {mode: Gpio.OUTPUT});

function waveArm() {
  motor.servoWrite(maxcycle);
  setTimeout(function(){
    motor.servoWrite(mincycle);
  }, 400);
}

// Hardware PWM used for LED "sometimes" conflicts with audio, you can uncomment and try it.
// var ws281x = require('rpi-ws281x-native');
// var NUM_LEDS = 1;        // Number of LEDs
// var colorPalette = {
//     "red": 0x00ff00,
//     "read": 0x00ff00, // sometimes, STT hears "read" instead of "red"
//     "green": 0xff0000,
//     "blue": 0x0000ff,
//     "purple": 0x008080,
//     "yellow": 0xc1ff35,
//     "magenta": 0x00ffff,
//     "orange": 0xa5ff00,
//     "aqua": 0xff00ff,
//     "white": 0xffffff,
//     "on": 0xffffff
// }

function setLED(val){
  // ws281x.init(NUM_LEDS);   // initialize LEDs
  // var color = new Uint32Array(NUM_LEDS);  // array that stores colors for leds
  // var colors = Object.keys(colorPalette);
  // var randIdx = Math.floor(Math.random() * colors.length);
  // var randColor = colors[randIdx];
  // //console.log(randColor)
  // color[0] = colorPalette[randColor];
  // ws281x.render(color);
  // ws281x.setBrightness(val * 255)
}




// Visualize image sound bars
function getbars(val){
  bars = ""
  for (var i = 0 ; i < val*50 + 2 ; i++){
    bars= bars + "|";
  }
  return bars ;
}

function playsound(soundfile){
  music = new Sound(soundfile);
  music.play();
  music.on('complete', function () {
    console.log('Done with playback!');
  });
}

// ---- Stop PWM before exit
process.on('SIGINT', function () {
  music.pause()
  music.stop()
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});
