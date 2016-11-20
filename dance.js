var AudioContext = require('web-audio-api').AudioContext
var context = new AudioContext
var fs = require('fs')
var exec = require('child_process').exec;
var music ;
var _ = require('underscore');
var Sound = require('node-aplay');

var raspi = require('raspi-io');
var five = require('johnny-five');
var SoftPWM = require('raspi-soft-pwm').SoftPWM;
var board = new five.Board({
  io: new raspi()
});
var softPWM ;
initServo();

var pcmdata = [] ;
var soundfile = "sounds/club.wav"
var threshodld = 0 ;
var mincycle = 10; var maxcycle = 60 ;
var armcycle = mincycle ;
// Decode sound file
decodeSoundFile();


function dance(){
  playsound(soundfile);
  findPeaks(pcmdata, samplerate, threshold);
}

function decodeSoundFile(){
  console.log("decoding mp3 file ", soundfile, " ..... ")
  fs.readFile(soundfile, function(err, buf) {
    if (err) throw err
    context.decodeAudioData(buf, function(audioBuffer) {
      console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration);
      pcmdata = (audioBuffer.getChannelData(0)) ;
      samplerate = audioBuffer.sampleRate;
      maxvals = [] ; max = 0 ;

      for (var i = 0; i < pcmdata.length ; i += samplerate* 0.05) {
        for(var j = i; j < i + samplerate ; j++){
          max = pcmdata[j] > max ? pcmdata[j]  : max ;
        }
        maxvals.push(max.toFixed(1))
        max = 0 ;
      }

      console.log("maxvals " + maxvals.length)

      var maxhist = _.chain(maxvals).countBy().pairs().sortBy(function(arr){ return -arr[1]; }).first(10);
      console.log(maxhist._wrapped)
      threshold = maxhist._wrapped[0][0] - 0.15 ;
      dance();

    }, function(err) { throw err })
  })
}




function findPeaks(pcmdata, samplerate, threshold){
  var above= 0 ;
  var interval = 0.05 * 1000 ; index = 0 ; var timetaken = 0 ; avg = 0 ; avgall = 0;
  var step = Math.round( samplerate * (interval/1000) );

  var samplesound = setInterval(function() {
    timetaken += interval;
    if (index >= pcmdata.length) {
      clearInterval(samplesound);
      console.log("finished sampling sound")
      return;
    }
    for(var i = index; i < index + step ; i++){
      above += pcmdata[i] > threshold ? 1 : 0 ;
      avg += pcmdata[i] > threshold? pcmdata[i] : 0 ;
      avgall += pcmdata[i] ;
    }
    if (above > 0) {
      console.log(getbars((avg/above).toFixed(2)), (avg/above).toFixed(2));
      waveArm() ;
      setLED((avg/above).toFixed(2))
    }else{
      console.log(getbars((avgall/step).toFixed(2)) );
      waveArm() ;
      setLED((avgall/step).toFixed(2))
    }

    above = 0 ; avg = 0; avgall = 0;
    index += step ;
  }, interval,pcmdata);
}


function initServo(){
  board.on('ready', function() {
    softPWM = new SoftPWM({pin: 'P1-26', range: 100, frequency: 200});
    console.log("servo initialized");

    this.on("exit", function() {
      console.log(" boarding exiting kill stuff")
      music.pause();
      music.stop();
    });
  });
}

function waveArm() {
  armcycle = armcycle == mincycle ? maxcycle : mincycle ;
  softPWM.write(armcycle);
}

var ws281x = require('rpi-ws281x-native');
var NUM_LEDS = 1;        // Number of LEDs
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
    "on": 0xffffff
}

function setLED(val){
    ws281x.init(NUM_LEDS);   // initialize LEDs
    var color = new Uint32Array(NUM_LEDS);  // array that stores colors for leds
    var colors = Object.keys(colorPalette);
    var randIdx = Math.floor(Math.random() * colors.length);
    var randColor = colors[randIdx];
    //console.log(randColor)
    color[0] = colorPalette[randColor];
    ws281x.render(color);
    ws281x.setBrightness(val * 255)
}


function smoothArray( values, smoothing ){
  var value = values[0]; // start with the first input
  for (var i=1, len=values.length; i<len; ++i){
    var currentValue = values[i];
    value += (currentValue - value) / smoothing;
    values[i] = value;
  }

  return values
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
