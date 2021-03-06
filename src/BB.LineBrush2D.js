/**
 * A 2D brush module for drawing contiguous lines in a stamp-like fashion.
 * @module BB.LineBrush2D
 * @extends BB.BaseBrush2D
 */
define(['./BB', './BB.BaseBrush2D', './BB.Color', "./BB.MathUtils"], 
function(  BB,        BaseBrush2D,        Color,        MathUtils){

    'use strict';

    BB.BaseBrush2D = BaseBrush2D;
    BB.Color       = Color;
    BB.MathUtils   = MathUtils;

    var justReset = false;
    var controllerModuleHasIsDown = false;

    /**
     * A 2D brush module for drawing contiguous lines in a stamp-like fashion.
     * What makes BB.LineBrush2D fundamentally different from BB.BaseBrush
     * is that each new drawing instance is influenced by the previous position of
     * the brush (usually to adjust for drawing angle or brush width).
     * @class BB.LineBrush2D
     * @constructor
     * @extends BB.BaseBrush2D
     * @param {Object} [config] A optional config hash to initialize any of
     * BB.LineBrush2D's public properties.
     * @example <code class="code prettyprint">&nbsp; var lineBrush = new BB.LineBrush2D({ width: 100,
     * height: 100, variant: "soft" }); </code>
     */
    BB.LineBrush2D = function(config) {

        BB.BaseBrush2D.call(this, config);

        /**
         * The brush's previous x position. This property is unique to
         * BB.LineBrush.
         * @property prevX
         * @type Number
         * @default null
         */
        this.prevX = null;

        /**
         * The brush's previous y position. This property is unique to
         * BB.LineBrush.
         * @property prevY
         * @type Number
         * @default null
         */
        this.prevY = null;

        /**
         * The type of brush. This property should be treated as read-only.
         * @property type
         * @type String
         * @default "line"
         */
        this.type = "line";

        /**
         * The current brush variant.
         * @property variant
         * @type String
         * @default solid
         */
        this.variant = "solid";

        /**
         * The brush's line weight.
         * @property weight
         * @type Number
         * @default 1
         */
        this.weight = 1;
        this.delta = 0;

        /**
         * An array of all supported variants.
         * @property variants
         * @type Array
         */
        this.variants = [
            'solid',
            'ink', 
            'ink-osc',
            'soft',
            'lines',
            'calligraphy'
        ];

        /**
         * Keeps track of wether or not the controllerModule passed into update
         * was made active (for instance if it was pressed) this frame.
         * @property variants
         * @protected
         * @type Boolean
         */
        this._lineStartedThisFrame = !this.hidden;

        if (config) {

            if (typeof config.variant === 'string') this.variant = config.variant;
            if (typeof config.weight === 'number') this.weight = config.weight;
        }   
    };

    BB.LineBrush2D.prototype = Object.create(BB.BaseBrush2D.prototype);
    BB.LineBrush2D.prototype.constructor = BB.LineBrush2D;

    /**
     * Update method. Usually called once per animation frame.
     * @method update
     * @param {Object} controllerModule An object with x and y properties and
     * optionally an isDown boolean (used for beginning and ending
     * strokeds/marks).
     * @example <code class="code prettyprint">
     * &nbsp;var mouseInput = new BB.MouseInput(document.getElementById('canvas'));<br>
     * &nbsp;var pointer = new BB.Pointer(mouseInput);<br>
     * &nbsp;var brush = new BB.LineBrush2D();<br>
     * <br>
     * &nbsp; // called once per animation frame (from somewhere else in your app)<br>
     * &nbsp;function update() {<br>
     * &nbsp;&nbsp;&nbsp;&nbsp;mouseInput.update();<br>
     * &nbsp;&nbsp;&nbsp;&nbsp;pointer.update();<br>
     * &nbsp;&nbsp;&nbsp;&nbsp;brush.update(pointer); // update the brush using the pointer<br>
     * &nbsp;}
     * </code>
     */
    BB.LineBrush2D.prototype.update = function(controllerModule) {
        
        BB.BaseBrush2D.prototype.update.call(this, controllerModule);

        if (controllerModule.hasOwnProperty('isDown')) {
            controllerModuleHasIsDown = true;
            this.hidden = (controllerModule.isDown === false);
        } else {
            controllerModuleHasIsDown = false;
        }
    };

    /**
     * Draws the brush to the context. Usually called once per animation frame.
     * @method draw
     * @param {Object} context The HTML5 canvas context you would like to draw
     * to.
     */
    BB.LineBrush2D.prototype.draw = function(context) {
        

        context = BB.BaseBrush2D.prototype.draw.call(this, context);

        context.save();

        context.lineJoin = "round";
        context.lineCap = "round";

        if (typeof this.variant !== 'string' ||
            this.variants.indexOf(this.variant) === -1) {
            throw new Error("BB.LineBrush2D.draw: " + this.variant + " is not a valid variant for BB.LineBrush2D");
        }      

        // draw down here...
        if (!this.hidden) {

            if (controllerModuleHasIsDown) {
                
                if (this._lineStartedThisFrame) {
                    
                    context.beginPath();
                    context.moveTo(this.x, this.y);

                    this._lineStartedThisFrame = false;

                } else { // we are in the middle of the line

                    var r, g, b, alphaFloat;
                    if (this.color && this.color instanceof BB.Color) {
                        r = this.color.r;
                        g = this.color.g;
                        b = this.color.b;
                        alphaFloat = BB.MathUtils.map(this.color.a, 0, 255, 0.0, 1.0);
                    } else {
                        r = 255;
                        g = 255;
                        b = 255;
                        alphaFloat = 1.0;
                    }

                    if(this.variant == 'solid'){


                        context.lineWidth = this.weight;
                        context.lineTo(this.x, this.y);
                        context.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alphaFloat + ")";
                        context.stroke();
                        context.closePath();
                        context.beginPath();
                        context.moveTo(this.x, this.y);


                    } else if(this.variant == 'ink'){

                        // var dx2 = (this.prevX > this.x) ? this.prevX - this.x : this.x - this.prevX;
                        // var dy2 = (this.prevY > this.y) ? this.prevY - this.y : this.y - this.prevY;

                        // this.weight = Math.abs(dx2 - dy2);

                        // if( this.weight > 100){ this.weight = 100; }

                        // context.lineWidth = BB.MathUtils.map(this.weight, 0, 100, this.width / 2.5, this.width * 2.5);
                        // context.lineTo(this.x, this.y);
                        // context.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alphaFloat + ")";
                        // context.stroke();
                        // context.closePath();
                        // context.beginPath();
                        // context.moveTo(this.x, this.y);

                        var dx = (this.prevX > this.x) ? this.prevX - this.x : this.x - this.prevX;
                        var dy = (this.prevY > this.y) ? this.prevY - this.y : this.y - this.prevY;
                        this.delta = Math.abs(dx - dy);
                        if(this.delta > this.weight){
                            this.weight+=4;
                            if(this.weight>=this.delta) this.weight = this.delta;
                        } else {
                            this.weight--;
                            if(this.weight<=this.delta) this.weight = this.delta;
                        }
                        if(this.weight > 100) this.weight=100;
                        else if(this.weight<2) this.weight=2;
                        context.lineWidth = BB.MathUtils.map(this.weight, 2, 100, this.width / 4, this.width * 4);
  
                        context.lineTo(this.x, this.y);
                        context.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alphaFloat + ")";
                        context.stroke();
                        context.closePath();
                        context.beginPath();
                        context.moveTo(this.x, this.y);

                    } else if(this.variant == 'ink-osc'){

                        this.weight = 2 + Math.abs( Math.sin( Date.now() * 0.003 ) * 50 );
                        context.lineWidth = BB.MathUtils.map(this.weight, 2, 52, this.width / 2, this.width * 2);
                        context.lineTo(this.x, this.y);
                        context.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alphaFloat + ")";
                        context.stroke();
                        context.closePath();
                        context.beginPath();
                        context.moveTo(this.x, this.y);


                    } else if(this.variant == 'soft'){
                        
                        var dist = BB.MathUtils.dist(this.prevX, this.prevY, this.x, this.y);
                        var angle = BB.MathUtils.angleBtw(this.prevX, this.prevY, this.x, this.y);
                        for (var i = 0; i < dist; i++) {
                            var x = this.prevX + (Math.sin(angle) * i);
                            var y = this.prevY + (Math.cos(angle) * i);
                            var gradient = context.createRadialGradient(x, y, this.width/6, x, y, this.width/2);
                            gradient.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ', 0.1)');
                            gradient.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ', 0)');
                            context.fillStyle = gradient;
                            context.fillRect(x - this.width/2, y - this.width/2, this.width, this.width);
                        }

                    } else if(this.variant == 'lines' || this.variant == 'calligraphy'){

                        if(this.variant == 'lines'){ context.lineWidth = (this.width < 1) ? 1 : this.width * 0.05; }
                        if(this.variant == 'calligraphy'){ context.lineWidth = this.width * 0.25; }

                        context.strokeStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        context.moveTo(this.prevX, this.prevY);
                        context.lineTo(this.x, this.y);
                        context.stroke();
                        context.moveTo(this.prevX - this.width * 0.2, this.prevY - this.width * 0.2);
                        context.lineTo(this.x - this.width * 0.2, this.y - this.width * 0.2);
                        context.stroke();
                        context.moveTo(this.prevX - this.width * 0.1, this.prevY - this.width * 0.1);
                        context.lineTo(this.x - this.width * 0.1, this.y - this.width * 0.1);
                        context.stroke();
                        context.moveTo(this.prevX + this.width * 0.1, this.prevY + this.width * 0.1);
                        context.lineTo(this.x + this.width * 0.1, this.y + this.width * 0.1);
                        context.stroke();
                        context.moveTo(this.prevX + this.width * 0.2, this.prevY + this.width * 0.2);
                        context.lineTo(this.x + this.width * 0.2, this.y + this.width * 0.2);
                        context.stroke();
                    }
                }

            } else { // this controller has no "button", so assume it is always pressed
                
            }

        } else {
            this._lineStartedThisFrame = true;
        }

        context.restore();

        this.prevX = this.x;
        this.prevY = this.y;
    };

    return BB.LineBrush2D;
});
