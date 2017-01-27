# TJ Wave
<img src="/images/wave.gif" width="100%">

> Control the arm of your TJ Bot (using the embedded servo)  

Video [demo here](https://youtu.be/Wks9-9V7eMY).

This module provides Node.js code to get control the arm on your TJ Bot via the servo motor. It uses [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html) to parse audio from the microphone, processes your commands (e.g command your bot to wave its arm, or dance to a song) and uses [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to "read" out a text response!

**This is designed to run on a Pi with a servo motor attached. See [Wiring Servo](#wiring-your-servo-motor) for how to connect your servo motor**
Before you start, it is recommended you become familiar with setting up your TJBot/Raspberry Pi by looking at [the instructions here.](http://www.instructables.com/member/TJBot/)


## How It Works
- Listens for voice commands. See [**Running**](#running) for a list of voice commands supported in this sample.
- Sends audio from the microphone to the [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html) Service - STT to transcribe audio to text.
- Parses the text looking for commands
- Once a command is recognized, an appropriate action (e.g wave arm) is taken and TJ verbalizes this action as well using  [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to generate an audio file.
- The robot plays back the response through using the Alsa tools

##Hardware
Follow the full set of instructions on [instructables](http://www.instructables.com/id/Build-a-Waving-Robot-Using-Watson-Services/) to prepare your TJBot ready to run the code.

Note: You must have a servo motor connected to your Pi.  

- [Raspberry Pi 3](https://www.amazon.com/dp/B01C6Q2GSY/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1WPZOVL411972)
- [USB microphone](https://www.amazon.com/dp/B005BRET3G/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1C98I7HIFPNJE)
- [Speaker with 3.5mm audio jack](https://www.amazon.com/gp/product/B014SOKX1E/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1)
- [TJ Bot](http://ibm.biz/mytjbot) - You can 3D print or laser cut the robot
- [Servo Motor] (https://www.amazon.com/gp/product/B00JJZXRR0/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) -  TowerPro SG90 9G micro small servo motor
- [Neopixel RGB LED](https://www.adafruit.com/products/1734) - Optional led.

##Wiring Your Servo Motor

Your servo motor has three wires -  Power, Ground and Data in. In this recipe I use the Tower Pro servo motor and the wires are as follows - Red (Power), Brown (Ground), Yellow (Data in). For this recipe, a software PWM library is used to control the servo motor, and I wire my setup as follows.

- Red (+5v, Pin 2)
- Brown (Ground, Pin 14)
- Yellow (Data in, Pin 26, GPIO7 )

Note: In the code, you can always change the pins used.

<img src="/images/tjwave_bb.jpg" width="100%">



##Build
Get the sample code (download or clone) and go to the application folder.

    git clone git@github.com:victordibia/tjwave.git
    cd tjwave

Update your Raspberry Pi. Please see the guide [here to setup network and also update your nodejs] (http://www.instructables.com/id/Make-Your-Robot-Respond-to-Emotions-Using-Watson/step2/Set-up-your-Pi/) installation
    sudo apt-get update
    sudo apt-get upgrade
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs

Note : Raspberry pi comes with a really old version of nodejs and npm (0.10), hence the need to upgrade it to the latest version.

Install ALSA tools (required for recording audio on Raspberry Pi). (Some of the sample code integrate voice commands)

    sudo apt-get install alsa-base alsa-utils
    sudo apt-get install libasound2-dev


Install Dependencies

    npm install

if you run into errors installing dependencies, try

    sudo rm -rf node_modules
    sudo npm install --unsafe-perm

Set the audio output to your audio jack. For more audio channels, check the [config guide. ](https://www.raspberrypi.org/documentation/configuration/audio-config.md)

    amixer cset numid=3 1    
    // This sets the audio output to option 1 which is your Pi's Audio Jack. Option 0 = Auto, Option 2 = HDMI. An alternative is to type sudo raspi-config and change the audio to 3.5mm audio jack.

Create config.js

    # On your local machine rename the config.default.js file to config.js.
    cp config.default.js config.js

    Open config.js using your favorite text editor # (e.g // nano) and update it with your Bluemix credentials for the Watson services you use.
    nano config.js

Note: do not add your credentials to the config.default.js file.

Test Your Servo

Before running the main code (voice + wave + dance etc), you may test your LED setup and your Servo motor to make sure the connections are correct and the library is properly installed. When you run the test module, it should turn your LED to different colors and wave your robot arm at intervals.


    sudo node wavetest.js


If the LED does not light up, you can try moving the power from 3.3 to 5 volts.  If neither the 3.3v or 5v pins work, you will need a 1N4001 diode. The diode is inserted between the power pin of the LED (the shorter of the two middle pins) and the 5v pin on the Raspberry Pi.


If your robot arm does not respond, kindly confirm you have connected it correctly. See the [PIN diagram here](https://github.com/nebrius/raspi-io/wiki/Pin-Information) for more information on raspberry pi PINS.



##Running

Start the application. (Note: you need sudo access)

    sudo node wave.js     

Then you should be able to speak to the microphone.
Sample utterances are

    TJ can you raise your arm ?
    TJ can you introduce yourself ?
    TJ What is your name ?
    TJ can you dance ?

For the dance command, your robot processes wav files in the sounds folder. Please ensure you have a .wav file there and set that as your sound file.

# Known Issues
There are known conflicts between using hardware PWM pin on a pi and audio, hence you cannot use both at the same time. For example, our LED library (ws281x) uses hardware PWM and will not work correctly when audio is enabled. To disable audio, you will need to blacklist the Broadcom audio kernel module by creating a file /etc/modprobe.d/snd-blacklist.conf with

    blacklist snd_bcm2835

If audio is needed, you can use a USB audio device instead.

## Whats Next

There are a few things you can do .. and ways to take your robot forward!
- Use Watson Conversation to improve intent detection. Leverage machine learning capabilities within Watson conversation to better match intents even when recognized text is not accurate.
- Animate robot interactions using arm movements + lights (e.g wave when your robot speaks or laughs etc)
- Correlate additional data to robot arm movements ... e.g control your robot arm using an app, a wearable/smartwatch etc.

##update
- I implemented a watson conversation based version where the conversation api is used to detect intent from a spoken command.
  ```
  sudo node wave_conversation.js
  ```
  - You will need to set up your watson conversation flow and set up a workspace. More on that [here](http://www.instructables.com/id/Build-a-Talking-Robot-With-Watson-and-Raspberry-Pi/#step6) .
  - You import sample conversation flow in the folder (workspace.json) to get you started. This creates intents for actions like "hello" , "see" , "wave" , "introduce" etc
  - Finally, this sample (wave_conversation.js) uses both audio and LED. These two hardware devices [are known to conflict](https://github.com/jgarff/rpi_ws281x#limitations) - a workaround is to disable onboard audio and use USB audio on your Pi.

## Contributing and Issues

To contribute, please feel free to fork the repo and send in a pull request.
Also, if you find any issues (bugs, etc) or have questions, please feel free to open up a [github issue](https://github.com/victordibia/tjwave/issues/new).

# Dependencies List

- Watson Developer Cloud : [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html), [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html), and [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html).
- [mic](https://www.npmjs.com/package/mic) npm package : for reading audio input
- [pigpio](https://www.npmjs.com/package/pigpio) npm package : Fast (software) GPIO, PWM, servo control, state change notification, and interrupt handling on the Raspberry Pi.
- [web-audio-api](https://www.npmjs.com/package/web-audio-api) : implementation (partial) of the HTML5 web audio api, used to decode sound files.
- [underscorejs](https://www.npmjs.com/package/underscore) : functional programming helper library for data manipulation.
- [node-aplay](https://www.npmjs.com/package/node-aplay) : Simple nodejs wrapper for aplay.
- [rpi-ws281x-native] (https://www.npmjs.com/package/rpi-ws281x-native): basic set of functions to write data to a strip of ws2811/ws2812 LEDs.

## License

MIT License
