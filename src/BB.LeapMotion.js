/**
 * A module implementing LeapMotion Sensor
 * @module BB.LeapMotion
 */


// module to get x, y from leapmotion
// used leap-0.6.4.js as needed for the leapmotion to function
define(['./BB'],
function(BB){


    'use strict';

/**
* 
* @property minX
* @type {Number}
* @default 0
*/
var minX = 0; 
var outputminX = 0;
var xscale= 0;
var widthX =0;
var minY = 0;
var outputminY= 0;
var yscale= 0;
var heightY = 0;
var minZ = 0;
var outputminZ= 0;
var zscale= 0;
var depthZ = 0;

  /**
     * A module implementing LeapMotion Sensor.
     *
     * __Note:__ The constructor makes throws an Error if the LeapMotion library is not already loaded.
     * If the LeapMotion library is not imported "missing LeapMotion library "  should appear in the console,
     * check LeapMotion docs or LiBB examples to see how to import library from html.
     * Method  enables the LeapMotion module to start 
     * obtaining the X,Y values from the sensor, these values must be called if needed.
     * Method also allows to detect if a gesture has occured.
     * @class BB.LeapMotion
     * @param {Canvas} canvas The created canvas that must be given to the LeapMotion module if canX and canvasY variable want to be used.
     * @param {Boolean} getXY Boolean value to enable/disable access to the X,Y values from LeapMotion Sensor .
     * @param {Boolean} getGestures Boolean value to enable/disable access to the getGestures from LeapMotion Sensor.
     * @constructor
     */
  BB.LeapMotion = function(config){ 

    // create variables that can be accesed later on to be able to have the data
   // canvasX, canvasY each will contain a numeric value that represent the position.

        /**
         * The pointers X position as given by the LeapMotion Sensor
         * @property y
         * @type {Number}
         * @default 0
         */
   BB.LeapMotion.prototype.x = 0;
         /**
         * The pointers Y position as given by the LeapMotion Sensor
         * @property y
         * @type {Number}
         * @default 0
         */
   BB.LeapMotion.prototype.y = 0;
        /**
         * The pointers Z position as given by the LeapMotion Sensor
         * @property z
         * @type {Number}
         * @default 0
         */
   BB.LeapMotion.prototype.z = 0;
         /**
         * Boolean value corresponding to the grab gesture detected by the LeapMotion sensor.
         * @property grab
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.grab = false;
         /**
         * Boolean value corresponding to the pinch gesture detected by the LeapMotion sensor.
         * @property pinch
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.pinch = false;
        /**
         * Boolean value corresponding to the circle gesture detected by the LeapMotion sensor.
         * @property circle
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.circle = false;
        /**
         * Boolean value corresponding to the keytap gesture detected by the LeapMotion sensor.
         * @property keytap
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.keytap = false;
        /**
         * Boolean value corresponding to the screenTap gesture detected by the LeapMotion sensor.
         * @property screenTap
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.screenTap = false;
        /**
         * Boolean value corresponding to the swipe gesture detected by the LeapMotion sensor.
         * @property swipe
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.swipe = false;
    /**
         * Boolean value corresponding to the clockwise detected by the LeapMotion.
         * @property clockwise
         * @type {Gesture}
         * @default false
         */
   BB.LeapMotion.prototype.clockwise = false;
    /**
         * Double especifies the radius of the circle gesture in mm.
         * @property circleradius
         * @type {Number}
         * @default 0
         */
   BB.LeapMotion.prototype.circleradius = 0;
   /**
         * Boolean value indicating if the LeapMotion device is streaming data.
         * @property deviceStreaming
         * @type {Connection indicator}
         * @default false
         */
   BB.LeapMotion.prototype.deviceStreaming = false;
   /**
         * Objetc containing the values of the last frame registered by the leapmotion sensor.
         * @property lastFrame
         * @type {Object}
         * @default null
         */
   BB.LeapMotion.prototype.lastFrame = null;
 


       if(typeof Leap === 'undefined'){
         throw new Error(' missing LeapMotion library ');
       } 
   // using Leap. controller to create the connection to our sensor
        var controller = new Leap.Controller({enableGestures:true});
        var canvasGiven = false;

        // gets data from config
        var canvas = (config && typeof config.canvas === 'object') ? config.canvas : null; 
        var getGestures = (config && typeof config.gesturesEnabled === 'boolean') ? config.gesturesEnabled : false;
        var mapDimension = (config && typeof config.mapDimension === 'number') ? config.mapDimension : 2;

        if(canvas === null){
          console.log("No canvas given therefor x and y are only available setting mapX,mapY and mapZ if necessary");
          canvasGiven = false;
        }else{canvasGiven = true;}
        // the controller.on method lets us se what the sensor is telling us on each frame
        // frames are sent 200 frames per second
        controller.on("frame",function(frame){
         // allowing user to acces frame therefor access all the data from the sdk
         BB.LeapMotion.prototype.lastFrame = frame;
          // frame.pointables allows us to detect when a frame has a pointable.(hand,finger)

          if(frame.pointables.length>0){
                      var pointable = frame.pointables[0];
                      // creates and interaction box it provides normalized coordinates for hands, fingers, and tools within this box.
                      var interactionBox = frame.interactionBox;
                      // provides the stabalized tip position
                      var normalizedPosition = interactionBox.normalizePoint(pointable.stabilizedTipPosition, true);
              if(canvasGiven && mapDimension === 2){
                      // Convert the normalized coordinates to span the canvas
                      BB.LeapMotion.prototype.x = canvas.width * normalizedPosition[0];
                      BB.LeapMotion.prototype.y = canvas.height * (1 - normalizedPosition[1]);                    
              }
              if(!canvasGiven && mapDimension ===3){
                      // Convert the normalized coordinates to span the canvas
                      BB.LeapMotion.prototype.x = widthX *  normalizedPosition[0];
                      //BB.LeapMotion.prototype.x = outputminX + (normalizedPosition[0] - minX)* xscale;
                      BB.LeapMotion.prototype.y = heightY *  (1 - normalizedPosition[1]);
                      //BB.LeapMotion.prototype.y = -1 *(outputminY + (normalizedPosition[1] - minY)* yscale);
                      //BB.LeapMotion.prototype.z = depthZ * normalizedPosition[2] ;
                      BB.LeapMotion.prototype.z = depthZ * (outputminZ + (normalizedPosition[2] - minZ)* zscale);
              }
          }
                  
                  // make all vars false when no hand detected fromo the LeaMotion
                  if(frame.hands.length === 0){
                      BB.LeapMotion.prototype.grab = false;
                      BB.LeapMotion.prototype.pinch = false;
                      BB.LeapMotion.prototype.circle = false;
                      BB.LeapMotion.prototype.keytap = false;
                      BB.LeapMotion.prototype.screenTap = false;
                      BB.LeapMotion.prototype.swipe = false;
                  }
                  // detects hands and makes sure user wants to check for gestures.  
                  if(frame.hands.length > 0 && getGestures){
                    var hand = frame.hands[0];
                    var position = hand.palmPosition;
                    // when a frame detects a hand and gestures are wanted it will give true when gesture grab     
                    if(hand.grabStrength == 1){
                      BB.LeapMotion.prototype.grab = true;
                      BB.LeapMotion.prototype.pinch = false;
                      BB.LeapMotion.prototype.circle = false;
                      BB.LeapMotion.prototype.keytap = false;
                      BB.LeapMotion.prototype.screenTap = false;
                      BB.LeapMotion.prototype.swipe = false;
                    }else{
                      BB.LeapMotion.prototype.grab = false;
                    }
                    // when a frame detects a hand and gestures are wanted it will give true when gesture pinch     
                    if(hand.pinchStrength == 1){
                      BB.LeapMotion.prototype.grab = false;
                      BB.LeapMotion.prototype.pinch = true;
                      BB.LeapMotion.prototype.circle = false;
                      BB.LeapMotion.prototype.keytap = false;
                      BB.LeapMotion.prototype.screenTap = false;
                      BB.LeapMotion.prototype.swipe = false;
                   }else{
                      BB.LeapMotion.prototype.pinch = false;
                   }
                  } 
              // when no gestures are being detected all the pre loaded gestures are falsed. (circle,keytap,screenTap,swipe)    
              if(frame.valid && frame.gestures.length === 0){
                      BB.LeapMotion.prototype.circle = false;
                      BB.LeapMotion.prototype.keytap = false;
                      BB.LeapMotion.prototype.screenTap = false;
                      BB.LeapMotion.prototype.swipe = false;
              } 
            // when a gesture is detected it will take each gesture and set to true the var that corresponds to the gesture 
            // making the gesture available to the user  
            if(frame.valid && frame.gestures.length > 0){              
              frame.gestures.forEach(function(gesture){           
                  switch (gesture.type){
                      case "circle":
                          BB.LeapMotion.prototype.circle = true;
                          var pointableID = gesture.pointableIds[0];
                          var direction = frame.pointable(pointableID).direction;
                          var dotProduct = Leap.vec3.dot(direction, gesture.normal);
                          if(dotProduct > 0){
                          // detects if the circle gesture is clockwise and sets var.
                             BB.LeapMotion.prototype.clockwise = true;
                          }else{ BB.LeapMotion.prototype.clockwise = false;}
                          BB.LeapMotion.prototype.circleradius = gesture.radius.toFixed(1) ;
                          break;                     
                      case "keyTap":
                          BB.LeapMotion.prototype.keytap = true; 
                          break;
                      case "screenTap":
                          BB.LeapMotion.prototype.screenTap = true;
                          break;
                      case "swipe":
                          BB.LeapMotion.prototype.swipe = true;
                          break;
                  }
              });
            }                                   
        });
    // connecto to the leap motion sensor to get data
    controller.connect();
    controller.on('deviceStreaming', onStreaming);
      function onStreaming(){
        BB.LeapMotion.prototype.deviceStreaming = true;
      }
    controller.on('deviceStopped', onStopped);
      function onStopped(){
        BB.LeapMotion.prototype.deviceStreaming = false;
      }   
  };

  BB.LeapMotion.prototype.mapX = function(configX){ 
     //minX = (configX && typeof configX.minX === 'number') ? configX.minX : 0; 
     //var maxX = (configX && typeof configX.maxX === 'number') ? configX.maxX : 0; 
     widthX = (configX && typeof configX.widthX === 'number') ? configX.widthX : null;
    // outputminX = - widthX /2;
    //var outputmaxX = widthX /2;
     
    // if( outputminX !== null && outputmaxX !== null ){
   //  xscale = (outputmaxX - outputminX)/(maxX - minX);
   //  }
     if(widthX === null){
      console.log(" widthX parameter missing on mapX method (Not needed if a canvas is given)");
     }  
  };
  BB.LeapMotion.prototype.mapY = function(configY){ 
     //minY = (configY && typeof configY.minY === 'number') ? configY.minY : 0; 
     //var maxY = (configY && typeof configY.maxY === 'number') ? configY.maxY : 0; 
     heightY = (configY && typeof configY.heightY === 'number') ? configY.heightY : null;
     //outputminY = - heightY /2;
    // var outputmaxY = heightY /2;

    // if( outputminY !== null && outputmaxY !== null ){
    // yscale = (outputmaxY - outputminY)/(maxY - minY);
    // }
     if(heightY === null){
      console.log(" heightY parameter missing on mapY method (Not needed if a canvas is given)");
     }   
  };
  BB.LeapMotion.prototype.mapZ = function(configZ){ 
     minZ = (configZ && typeof configZ.minZ === 'number') ? configZ.minZ : 0; 
     var maxZ = (configZ && typeof configZ.maxZ === 'number') ? configZ.maxZ : 0; 
     depthZ = (configZ && typeof configZ.depthZ === 'number') ? configZ.depthZ : null;
     outputminZ = - depthZ /2;
     var outputmaxZ = depthZ /2;

     if( outputminZ !== null && outputmaxZ !== null ){
     zscale = (outputmaxZ - outputminZ)/(maxZ - minZ);
     }
     if(depthZ === null){
      console.log(" depthZ parameter missing on mapZ method (Must be present for 3D mapping)");
     } 
  };
  return BB.LeapMotion;
});
