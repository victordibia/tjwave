var child_process = require('child_process');

var interval = 1000 ;
var minangle = 400;
maxangle = 896 ;
var angle = maxangle ;


setInterval(function(){
  angle = angle == maxangle ? angle = minangle : angle = maxangle ;
  console.log("setting servo angle ", angle);
  setAngle(angle);
}, interval);

var rpio = require('rpio');
var pin = 12;           /* P12/GPIO18 */
var range = 1024;       /* LEDs can quickly hit max brightness, so only use */
var max = 128;          /*   the bottom 8th of a larger scale */
var clockdiv =64;       /* Clock divider (PWM refresh rate), 8 == 2.4MHz */

/*
 * Enable PWM on the chosen pin and set the clock and range.
 */
rpio.open(pin, rpio.PWM);
rpio.pwmSetClockDivider(clockdiv);
rpio.pwmSetRange(pin, range);



function setAngle(angle){
   rpio.pwmSetData(pin, angle);
}

// ---- Stop PWM before exit
process.on('SIGINT', function () {
    rpio.open(pin, rpio.INPUT);
    process.nextTick(function () { process.exit(0); });
});
