# TJ Wave
<img src="/images/tj.jpg" width="100%">

> Control the arm of your TJ Bot (using the embedded servo)  

This module provides Node.js code to get control the arm on your TJ Bot via the servo motor. It uses [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html) to parse audio from the microphone, processes your commands and uses [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to "read" out this response!

**This will only run on the Raspberry Pi.**


## How It Works
- Listens for voice commands
- Sends audio from the microphone to the Watson Speech to Text Service - STT to transcribe [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html)
- Parses the text looking for the attention words and commands
- Once a command is recognized, an appropriate action is taken and TJ verbalizes this action as well using  [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to generate an audio file.
- The robot plays back the response through using the Alsa tools

##Hardware
Follow the instructions in instructable_Link_goes_here to prepare your system ready to run the code.

Note: You must have a servo motor connected to your Pi. Servo data pin must be connected to GPIO 18 as it works based on PWM.

- [Raspberry Pi 3](https://www.amazon.com/dp/B01C6Q2GSY/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1WPZOVL411972)
- [USB microphone](https://www.amazon.com/dp/B005BRET3G/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1C98I7HIFPNJE)
- [Speaker with 3.5mm audio jack](https://www.amazon.com/gp/product/B014SOKX1E/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1)
- [TJ Bot](http://ibm.biz/mytjbot) - You can 3D print or laser cut the robot
- [Servo Motor] (https://www.amazon.com/gp/product/B00JJZXRR0/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) -  TowerPro SG90 9G micro small servo motor

##Build
Get the sample code and go to the application folder.

    cd recipes/featured/tjwave

Install ALSA tools (required for recording audio on Raspberry Pi)

    sudo apt-get install alsa-base alsa-utils

Install Dependencies

    npm install

Set the audio output to your audio jack. For more audio channels, check the [config guide. ](https://www.raspberrypi.org/documentation/configuration/audio-config.md)

    amixer cset numid=3 1    
    // This sets the audio output to option 1 which is your Pi's Audio Jack. Option 0 = Auto, Option 2 = HDMI. An alternative is to type sudo raspi-config and change the audio to 3.5mm audio jack.

Rename the config_sample.js to config.js. Open config.js using your favorite text editor (e.g nano) and update it with your Bluemix credentials for the Watson services you use.

    cp config_sample.js config.js
    nano config.js
    # enter your watson usernames, passwords and versions.



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
- mic npm package : for reading audio input
- rpio npm package : i/o library to control raspberry pi gpio pins.
- web-audio-api : implementation (partial) of the HTML5 web audio api, used to decode sound files.
- underscorejs : Quick and dirty functions for data manipulation

## License

This library is licensed under Apache 2.0. Full license text is
available in [LICENSE](../../LICENSE).

## Contributing
See [CONTRIBUTING.md](../../CONTRIBUTING.md).
