/**


/************************************************************************
* Control a NeoPixel LED unit and servo motor connected to a Raspberry Pi pin through voice commands
* Must run with root-level protection
* sudo node wave.js


Follow the instructions in XXX to
get the system ready to run this code.
*/

/************************************************************************
* Step #1: Configuring your Bluemix Credentials
************************************************************************
In this step, the audio sample (pipe) is sent to "Watson Speech to Text" to transcribe.
The service converts the audio to text and saves the returned text in "textStream"
*/
var pigpio = require('pigpio')
pigpio.initialize();


var watson = require('watson-developer-cloud');
var config = require('./config');  // gets our username and passwords from the config.js files
var speech_to_text = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: config.version
});

var fs = require('fs');
var exec = require('child_process').exec;
var text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

var AudioContext = require('web-audio-api').AudioContext
context = new AudioContext
var _ = require('underscore');



/************************************************************************
* Step #2: Configuring the Microphone
************************************************************************
In this step, we configure your microphone to collect the audio samples as you talk.
See https://www.npmjs.com/package/mic for more information on
microphone input events e.g on error, startcomplete, pause, stopcomplete etc.
*/

// Initiate Microphone Instance to Get audio samples
var mic = require('mic');
var micInstance = mic({ 'rate': '44100', 'channels': '2', 'debug': false, 'exitOnSilence': 6 });
var micInputStream = micInstance.getAudioStream();

micInputStream.on('data', function(data) {
  //console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
  console.log("Error in Input Stream: " + err);
});

micInputStream.on('silence', function() {
  // detect silence.
});
micInstance.start();
console.log("TJ is listening, you may speak now.");

/************************************************************************
* Step #3: Converting your Speech Commands to Text
************************************************************************
In this step, the audio sample is sent (piped) to "Watson Speech to Text" to transcribe.
The service converts the audio to text and saves the returned text in "textStream"
*/
var textStream = micInputStream.pipe(
  speech_to_text.createRecognizeStream({
    content_type: 'audio/l16; rate=44100; channels=2'
  })
);

/*********************************************************************
* Step #4: Parsing the Text
*********************************************************************
In this step, we parse the text to look for commands such as "ON" or "OFF".
You can say any variations of "lights on", "turn the lights on", "turn on the lights", etc.
You would be able to create your own customized command, such as "good night" to turn the lights off.
What you need to do is to go to parseText function and modify the text.
*/

textStream.setEncoding('utf8');
textStream.on('data', function(str) {
  console.log(' ===== Speech to Text ===== : ' + str); // print each text we receive
  parseText(str);
});

textStream.on('error', function(err) {
  console.log(' === Watson Speech to Text : An Error has occurred ===== \nYou may have exceeded your payload quota.') ; // handle errors
  console.log(err + "\n Press <ctrl>+C to exit.") ;
});

function parseText(str){
  var containsWaveArm = (str.indexOf("raise") >= 0 || str.indexOf("weave") >= 0 || str.indexOf("wave") >= 0 || str.indexOf("leave") >= 0 ) && (  str.indexOf("arm") >= 0) ;
  var introduceYourself = str.indexOf("introduce") >= 0 && str.indexOf("yourself") >= 0  ;
  var whatisYourname = str.indexOf("what") >= 0 && str.indexOf("your") >= 0 && str.indexOf("name") >= 0  ;
  var canYouDance = str.indexOf("can") >= 0 && str.indexOf("you") >= 0 && str.indexOf("dance") >= 0  ;


  if (containsWaveArm) {
    speak("Ok, I will wave my arm. Just for you.");
    waveArm("wave") ;
  }else if (introduceYourself){
    speak(" Hi, my name is TJ. I'm an open source project designed to help you access Watson Services in a fun way. You can 3D print me or laser cut me, then use one of my recipes to bring me to life. I can't wait to see what we do together. ");
  }else if (whatisYourname){
    speak(" My name is TJ. You can call me TJ Bot");
  }else if (canYouDance){
    dance();
  }else{
    if (str.length > 10){
      speak("sorry, I haven't been taught to understand that.")
    }
  }


}

/*********************************************************************
* Step #5: Wave Arm
*********************************************************************
*/

var mincycle = 500; var maxcycle = 2300 ;
var dutycycle = mincycle;
var iswaving = false ;

// Setup software PWM on pin 26, GPIO7.

/**
* Wave the arm of your robot X times with an interval
* @return {[type]} [description]
*/
function waveArm(action) {
  iswaving = true ;
  var Gpio = pigpio.Gpio;
  var motor = new Gpio(7, {mode: Gpio.OUTPUT});
  //pigpio.terminate();
  var times =  8 ;
  var interval = 700 ;

  if (action == "wave") {
    var pulse = setInterval(function() {
      motor.servoWrite(maxcycle);
      setTimeout(function(){
        if (motor != null) {
          motor.servoWrite(mincycle);
        }
      }, interval/3);

      if (times-- === 0) {
        clearInterval(pulse);
        if (!isplaying) {
          setTimeout(function(){
            micInstance.resume();
            iswaving = false ;
          }, 500);
        }
        return;
      }
    }, interval);
  }else {
    motor.servoWrite(maxcycle);
    setTimeout(function(){
      motor.servoWrite(mincycle);
    }, 400);
  }
}


/*********************************************************************
* Step #6: Convert Text to Speech and Play
*********************************************************************
*/

var Sound = require('node-aplay');
var soundobject ;
//speak("testing speaking")
function speak(textstring){

  micInstance.pause(); // pause the microphone while playing
  var params = {
    text: textstring,
    voice: config.voice,
    accept: 'audio/wav'
  };
  text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {

    soundobject = new Sound("output.wav");
    soundobject.play();
    soundobject.on('complete', function () {
      console.log('Done with playback! for ' + textstring + " iswaving " + iswaving);
      if (!iswaving && !isplaying) {
        micInstance.resume();
      }

    });
  });

}

/*********************************************************************
* Piece #7: Play a Song and dance to the rythm!
*********************************************************************
*/
var pcmdata = [] ;
var samplerate ;
var soundfile = "sounds/club.wav"
var threshodld = 0 ;
//decodeSoundFile(soundfile);
function decodeSoundFile(soundfile){
  console.log("decoding mp3 file ", soundfile, " ..... ")
  fs.readFile(soundfile, function(err, buf) {
    if (err) throw err
    context.decodeAudioData(buf, function(audioBuffer) {
      console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration);
      pcmdata = (audioBuffer.getChannelData(0)) ;
      samplerate = audioBuffer.sampleRate;
      findPeaks(pcmdata, samplerate);
      playsound(soundfile);
    }, function(err) { throw err })
  })
}

//dance();
function dance(){
  speak("Sure. I am decoding a sound file that I will dance to. This may take a couple of seconds.") ;
  decodeSoundFile(soundfile);
}

var isplaying = false ;
function playsound(soundfile){
  isplaying = true ;
  music = new Sound(soundfile);
  music.play();
  music.on('complete', function () {
    console.log('Done with music playback!');
    isplaying = false;
  });
}

function findPeaks(pcmdata, samplerate, threshold){
  var interval = 0.05 * 1000 ; index = 0 ;
  var step = Math.round( samplerate * (interval/1000) );
  var max = 0 ;   var prevmax = 0 ;  var prevdiffthreshold = 0.3 ;

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
      waveArm("dance");
    }
    prevmax = max ; max = 0 ; index += step ;
  }, interval,pcmdata);
}



// ---- Stop PWM before exit
process.on('SIGINT', function () {
  pigpio.terminate();
  process.nextTick(function () { process.exit(0); });
});
