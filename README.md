# TJ Wave
<img src="/images/wave.gif" width="100%">

> Control the arm of your TJ Bot (using the embedded servo)  

This module provides Node.js code to get control the arm on your TJ Bot via the servo motor. It uses [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html) to parse audio from the microphone, processes your commands (e.g command your bot to wave its arm, or dance to a song) and uses [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to "read" out a text response!

**This will only run on the Raspberry Pi.**


## How It Works
- Listens for voice commands
- Sends audio from the microphone to the Watson Speech to Text Service - STT to transcribe [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html)
- Parses the text looking for the attention words and commands
- Once a command is recognized, an appropriate action (e.g wave arm) is taken and TJ verbalizes this action as well using  [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to generate an audio file.
- The robot plays back the response through using the Alsa tools

##Hardware
Follow the instructions in instructable_Link_goes_here to prepare your system ready to run the code.

Note: You must have a servo motor connected to your Pi. Servo data pin must be connected to GPIO 18 as it works based on PWM.

- [Raspberry Pi 3](https://www.amazon.com/dp/B01C6Q2GSY/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1WPZOVL411972)
- [USB microphone](https://www.amazon.com/dp/B005BRET3G/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1C98I7HIFPNJE)
- [Speaker with 3.5mm audio jack](https://www.amazon.com/gp/product/B014SOKX1E/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1)
- [TJ Bot](http://ibm.biz/mytjbot) - You can 3D print or laser cut the robot
- [Servo Motor] (https://www.amazon.com/gp/product/B00JJZXRR0/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) -  TowerPro SG90 9G micro small servo motor

##Wiring Your Servo Motor

Your servo motor has three wires -  Power, Ground and Data in. In this recipe I use the Tower Pro servo motor and the wires are as follows - Red (Power), Brown (Ground), Yellow (Data in). For this recipe, a software PWN library is used to control the servo motor, and I wire my setup as follows.

- Red (+5v, Pin 2)
- Brown (Ground, Pin 14)
- Yellow (Data in, Pin 26, GPIO7 )

Note: In the code, you can always change the pins used.

<img src="/images/tjwave_bb.jpg" width="100%">



##Build
Get the sample code (download or clone) and go to the application folder.

    git clone git@github.com:victordibia/tjwave.git
    cd tjwave

Install ALSA tools (required for recording audio on Raspberry Pi). (Some of the sample code integrate voice commands)

    sudo apt-get install alsa-base alsa-utils

Install Dependencies

    npm install
    # try 'sudo rm -rf node_modules'  and 'sudo npm install --unsafe-perm' if you run into errors installing dependencies

Set the audio output to your audio jack. For more audio channels, check the [config guide. ](https://www.raspberrypi.org/documentation/configuration/audio-config.md)

    amixer cset numid=3 1    
    // This sets the audio output to option 1 which is your Pi's Audio Jack. Option 0 = Auto, Option 2 = HDMI. An alternative is to type sudo raspi-config and change the audio to 3.5mm audio jack.

Rename and update config.js

    cp config_sample.js config.js
    nano config.js

    # Rename the config_sample.js file to config.js. Open config.js using your favorite text editor # (e.g // nano) and update it with your Bluemix credentials for the Watson services you use.

Test Your Servo

Before running the code, you may test your LED setup and your Servo motor to make sure the connections are correct and the library is properly installed. When you run the test module, it should turn your LED to different colors and wave your robot arm at intervals.


    sudo node wave_test.js


If the LED does not light up, you can try moving the power from 3.3 to 5 volts.  If neither the 3.3v or 5v pins work, you will need a 1N4001 diode. The diode is inserted between the power pin of the LED (the shorter of the two middle pins) and the 5v pin on the Raspberry Pi.


If your robot arm does not respond, kindly confirm you have connected it correctly. See the [PIN diagram here](https://github.com/nebrius/raspi-io/wiki/Pin-Information) for more information on raspberry pi PINS.


If you have problems with the setup, please refer to Adafruit's Neopixel on Raspbeery Pi guide to troubleshoot.

##Running

Start the application. (Note: you need sudo access)

    sudo node wave.js     

Then you should be able to speak to the microphone.
Sample utterances are

    TJ can you raise your arm ?
    TJ can you introduce yourself ?
    TJ What is your name ?
    TJ can you dance ?


# Dependencies List

- Watson Developer Cloud - [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html), [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html), and [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html).
- [mic](https://www.npmjs.com/package/mic) npm package : for reading audio input
- [raspi-soft-pwm](https://www.npmjs.com/package/raspi-soft-pwm) npm package : Provides access to Soft PWM on the Raspberry Pi.
- [web-audio-api](https://www.npmjs.com/package/web-audio-api) : implementation (partial) of the HTML5 web audio api, used to decode sound files.
- [underscorejs](https://www.npmjs.com/package/underscore) : functional programming helper library for data manipulation.

## License

MIT License
