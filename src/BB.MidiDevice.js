/**
 * A module for receiving midi messages via USB in the browser. Google Chrome
 * support only at the moment. See support for the Web MIDI API
 * (https://webaudio.github.io/web-midi-api/).
 * @module BB.Midi
 */
define(['./BB',
        './BB.BaseMidiInput', 
        './BB.MidiInputButton', 
        './BB.MidiInputKey', 
        './BB.MidiInputKnob', 
        './BB.MidiInputPad', 
        './BB.MidiInputSlider'], 
function(  BB,
           BaseMidiInput,
           MidiInputButton,
           MidiInputKey,
           MidiInputKnob,
           MidiInputPad,
           MidiInputSlider){

    'use strict';

    BB.BaseMidiInput   = BaseMidiInput;
    BB.MidiInputButton = MidiInputButton;
    BB.MidiInputKey    = MidiInputKey;
    BB.MidiInputKnob   = MidiInputKnob;
    BB.MidiInputPad    = MidiInputPad;
    BB.MidiInputSlider = MidiInputSlider;

    /**
     * A class for recieving input from Midi controllers in the browser using
     * the experimental Web MIDI API. This constructor returns true if browser
     * supports Midi and false if not.
     * 
     * <em>NOTE: This implementation of
     * BB.MidiDevice currently only supports using one MIDI device connected to
     * the browser at a time. More than one may work but you may run into note
     * clashing and other oddities.</em>
     * <br><br>
     * <img src="../../examples/assets/images/midi.png"/>
     * 
     * @class  BB.MidiDevice
     * @constructor
     * @param {Object} midiMap An object with array properties for knobs, sliders, buttons, keys, and pads.
     * @param {Function} success Function to return once MIDIAccess has been received successfully.
     * @param {Function} failure Function to return if MIDIAccess is not received successfully.
     */
    BB.MidiDevice = function(midiMap, success, failure) {
        
        if (typeof midiMap !== 'object') {
            throw new Error("BB.MidiDevice: midiMap parameter must be an object");
        } else if (typeof success !== 'function') {
            throw new Error("BB.MidiDevice: success parameter must be a function");
        } else if (typeof failure !== 'function') {
            throw new Error("BB.MidiDevice: failure parameter must be a function");
        }

        var self = this;

        /**
         * Dictionary of Midi input object arrays. Includes sliders, knobs,
         * buttons, pads, and keys (only if they are added in the midiMap passed
         * into the constructor).
         * @property inputs
         * @type {Object}
         */
        this.inputs = {
            sliders: [],
            knobs: [],
            buttons: [],
            pads: [],
            keys: []
        };

        this.keyboard = new Keyboard();

        /**
         * The Web MIDI API midiAccess object returned from navigator.requestMIDIAccess(...)
         * @property midiAccess
         * @type {MIDIAccess}
         * @default null
         */
        this.midiAccess = null;

        this._connectEvent = null;
        this._disconnectEvent = null;
        this._messageEvent = null;

        // note COME BACK
        var noteLUT = {}; // lookup table

        var input = null;

        var i = 0;
        var key = null;
        var note = null;
        
        // sliders
        if (typeof midiMap.sliders !== 'undefined' && midiMap.sliders instanceof Array) {
            for (i = 0; i < midiMap.sliders.length; i++) {
                input = new BB.MidiInputSlider(midiMap.sliders[i]);
                note = (typeof midiMap.sliders[i] === 'number') ? midiMap.sliders[i] : midiMap.sliders[i].note;
                key = 'key' + note;
                if (typeof noteLUT[key] === 'undefined') {
                    noteLUT[key] = [];
                }
                noteLUT[key].push([ input, i ]);
                self.inputs.sliders.push(input);
            }
        }

        // knobs
        if (typeof midiMap.knobs !== 'undefined' && midiMap.knobs instanceof Array) {
            for (i = 0; i < midiMap.knobs.length; i++) {
                input = new BB.MidiInputKnob(midiMap.knobs[i]);
                note = (typeof midiMap.knobs[i] === 'number') ? midiMap.knobs[i] : midiMap.knobs[i].note;
                key = 'key' + note;
                if (typeof noteLUT[key] === 'undefined') {
                    noteLUT[key] = [];
                }
                noteLUT[key].push([ input, i ]);
                self.inputs.knobs.push(input);
            }
        }

        // buttons
        if (typeof midiMap.buttons !== 'undefined' && midiMap.buttons instanceof Array) {
            for (i = 0; i < midiMap.buttons.length; i++) {
                input = new BB.MidiInputButton(midiMap.buttons[i]);
                note = (typeof midiMap.buttons[i] === 'number') ? midiMap.buttons[i] : midiMap.buttons[i].note;
                key = 'key' + note;
                if (typeof noteLUT[key] === 'undefined') {
                    noteLUT[key] = [];
                }
                noteLUT[key].push([ input, i ]);
                self.inputs.buttons.push(input);
            }
        }

        // pads
        if (typeof midiMap.pads !== 'undefined' && midiMap.pads instanceof Array) {
            for (i = 0; i < midiMap.pads.length; i++) {
                input = new BB.MidiInputPad(midiMap.pads[i]);
                note = (typeof midiMap.pads[i] === 'number') ? midiMap.pads[i] : midiMap.pads[i].note;
                key = 'key' + note;
                if (typeof noteLUT[key] === 'undefined') {
                    noteLUT[key] = [];
                }
                noteLUT[key].push([ input, i ]);
                self.inputs.pads.push(input);
            }
        }

        // keys
        if (typeof midiMap.keys !== 'undefined' && midiMap.keys instanceof Array) {
            for (i = 0; i < midiMap.keys.length; i++) {
                input = new BB.MidiInputKey(midiMap.keys[i]);
                note = (typeof midiMap.keys[i] === 'number') ? midiMap.keys[i] : midiMap.keys[i].note;
                key = 'key' + note;
                if (typeof noteLUT[key] === 'undefined') {
                    noteLUT[key] = [];
                }
                noteLUT[key].push([ input, i ]);
                self.inputs.keys.push(input);
            }
        }

        // request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({
                sysex: false
            }).then(onMIDISuccess, failure);
        } else {
            failure();
        }

        // midi functions
        function onMIDISuccess(midiAccess) {

            self.midiAccess = midiAccess;
            var inputs = self.midiAccess.inputs.values();
            // loop through all inputs
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                
                // listen for midi messages
                input.value.onmidimessage = onMIDIMessage;
                // this just lists our inputs in the console
            }
            // listen for connect/disconnect message
            self.midiAccess.onstatechange = onStateChange;
            success(midiAccess);
        }

        function onStateChange(event) {
            
            var port = event.port,
                state = port.state,
                name = port.name,
                type = port.type;

            if (state === 'connected' && self._connectEvent) {
                self._connectEvent(name, type, port);
            } else if (state === 'disconnected' && self._disconnectEvent) {
                self._disconnectEvent(name, type, port);
            }
        }

        function onMIDIMessage(event) {

            var data = event.data;
            var command = data[0] >> 4;
            var channel = data[0] & 0xf;
            var type = data[0] & 0xf0; // channel agnostic message type. Thanks, Phil Burk.
            var note = data[1];
            var velocity = data[2];
            // with pressure and tilt off
            // note off: 128, cmd: 8 
            // note on: 144, cmd: 9
            // pressure / tilt on
            // pressure: 176, cmd 11: 
            // bend: 224, cmd: 14

            if (self._messageEvent) {
                self._messageEvent({
                    command: command,
                    channel: channel,
                    type: type,
                    note: note,
                    velocity: velocity
                }, event);
            }

            var i = 0;
            var key = 'key' + note;

            // if note is in noteLUT
            if (key in noteLUT) {
                
                var input = null;
                var index = null;

                for (i = 0; i < noteLUT[key].length; i++) {
                    
                    if (noteLUT[key][i][0].command === command && 
                        noteLUT[key][i][0].channel === channel) {
                        input = noteLUT[key][i][0];
                        index = noteLUT[key][i][1];
                    } 
                }

                // if no command comparison match was found
                // use the first value in LUT
                if (input === null) {
                    input = noteLUT[key][0][0];
                    index = noteLUT[key][0][1];
                }

                // update input's values
                input.command      = command;
                input.channel      = channel;
                input.type         = type;
                input.velocity     = velocity;

                var changeEventArr = input.eventStack.change;

                var midiData = {}; // reset data

                // all
                for (i = 0; i < changeEventArr.length; i++) {
                    
                    midiData = {
                        velocity: velocity,
                        channel: channel,
                        command: command,
                        type: type,
                        note: note
                    };

                    changeEventArr[i](midiData, input.inputType, index); // fire change event
                }

                // slider and knob
                if (input.inputType == 'slider' || input.inputType == 'knob') {

                    // max
                    if (velocity == 127) {

                        var maxEventArr = input.eventStack.max;
                        for (i = 0; i < maxEventArr.length; i++) {

                            midiData = {
                                velocity: velocity,
                                channel: channel,
                                command: command,
                                type: type,
                                note: note
                            };

                            maxEventArr[i](midiData, input.inputType, index); // fire max event
                        }

                    // min
                    } else if (velocity === 0) { 

                        var minEventArr = input.eventStack.min;
                        for (i = 0; i < minEventArr.length; i++) {

                            midiData = {
                                velocity: velocity,
                                channel: channel,
                                command: command,
                                type: type,
                                note: note
                            };

                            minEventArr[i](midiData, input.inputType, index); // fire min event
                        }
                    }
                }

                // button
                if (input.inputType == 'button') {


                    // down
                    if (velocity == 127) {

                        var downEventArr = input.eventStack.down;
                        for (i = 0; i < downEventArr.length; i++) {

                            midiData = {
                                velocity: velocity,
                                channel: channel,
                                command: command,
                                type: type,
                                note: note
                            };

                            downEventArr[i](midiData, input.inputType, index); // fire down event
                        }

                    // up
                    } else if (velocity === 0) { 

                        var upEventArr = input.eventStack.up;
                        for (i = 0; i < upEventArr.length; i++) {

                            midiData = {
                                velocity: velocity,
                                channel: channel,
                                command: command,
                                type: type,
                                note: note
                            };

                            upEventArr[i](midiData, input.inputType, index); // fire up event
                        }
                    }
                }
            }

            var notes = [ 
                'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
                'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
                'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
                'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
                'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
                'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6',
                'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7',
                'C8', 'C#8', 'D8', 'D#8', 'E8', 'F8', 'F#8', 'G8', 'G#8', 'A8', 'A#8', 'B8',
                'C9', 'C#9', 'D9', 'D#9', 'E9', 'F9', 'F#9', 'G9', 'G#9', 'A9', 'A#9', 'B9',
                'C10', 'C#10', 'D10', 'D#10', 'E10', 'F10', 'F#10', 'G10', 'G#10', 'A10', 'A#10', 'B10'];

            i = 0;
           
            // keyboard note on
            if (type === 144 && note > -1 && note < 121 && self.keyboard.eventStack.noteOn.length > 0) {
                for (; i < self.keyboard.eventStack.noteOn.length; i++) {
                    self.keyboard.eventStack.noteOn[i](notes[note], {
                                velocity: velocity,
                                channel: channel,
                                command: command,
                                type: type,
                                note: note
                            });
                }
            } // keyboard note off
            else if (type === 128 && note > -1 && note < 121 && self.keyboard.eventStack.noteOff.length > 0) {
                for (; i < self.keyboard.eventStack.noteOff.length; i++) {
                    self.keyboard.eventStack.noteOff[i](notes[note], {
                                velocity: velocity,
                                channel: channel,
                                command: command,
                                type: type,
                                note: note
                            });
                }
            }
        } 
    };

    /**
     * Assigns event handler functions. Valid events include: connect, disconnect, message.
     * @method on
     * @param  {String}   name     Event name. Supports "connect", "disconnect", and "message".
     * @param  {Function} callback Function to run when event occurs.
     */
    BB.MidiDevice.prototype.on = function(name, callback) {
        
        if (typeof name !== 'string') {
            throw new Error("BB.MidiDevice.on: name parameter must be a string type");
        } else if (typeof callback !== 'function') {
            throw new Error("BB.MidiDevice.on: callback parameter must be a function type");
        }

        if (name === 'connect') {
            this._connectEvent = callback;
        } else if (name === 'disconnect') {
            this._disconnectEvent = callback;
        } else if (name === 'message') {
            this._messageEvent = callback;
        } else {
            throw new Error('BB.MidiDevice.on: ' + name + ' is not a valid event name');
        }
    };

    function Keyboard() {

        this.eventStack = {
            noteOn: [],
            noteOff: []
        };
    }

    Keyboard.prototype.on = function(name, callback) {

        if (name === 'noteOn') {
            this.eventStack.noteOn.push(callback);
        } else if (name === 'noteOff') {
            this.eventStack.noteOff.push(callback);
        } 
    };

    return BB.MidiDevice;
});
