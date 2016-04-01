        if ( window.innerWidth === 0 ) { window.innerWidth = parent.innerWidth; window.innerHeight = parent.innerHeight; }
			var canvas     = document.createElement('canvas');
			var ctx        = canvas.getContext('2d');
			document.body.appendChild(canvas);
			document.body.className = "radial-grey";
			var X = 0; // var obtained from leapMotion that will give an X coordinate
			var Y = 0; // var obtained from leapMotion that will give an Y coordinate
			var Z = 0;
			// canvasX and CanvasY will replace point.x and pointer.y 
			var logo       = new logo(ctx); // toys object
			var gravity    = new BB.Vector2(); // default 0
			var leapMotion;
			var WIDTH, HEIGHT, ball,
		    prevX = prevY = 0 ,
			spin = 0.01;

		function setup() {
				// creates an instance of the LeapMotion module created for liBB library
				leapMotion = new BB.LeapMotion({
				canvas : canvas,
			    mapDimension:2 ,
				gesturesEnabled: false
				});// creates an instance of the LeapMotion module created for liBB library
	
				window.onresize = function() {
				  WIDTH = canvas.width = window.innerWidth ;
			      HEIGHT = canvas.height = window.innerHeight;		  
			    }
			    window.onresize();
			    ball = new BB.Particle2D({
			        position: new BB.Vector2( Math.random()*WIDTH, Math.random()*HEIGHT ),
			        radius: 30,
			        friction: 0.9 //gui -name friction -max 1 -step 0.05
			    });
    	}

		function update() {

				X = leapMotion.x; // puts the value obtained from sensor to the var created.
				Y = leapMotion.y; // puts the value obtained from sensor to the var created.

			    requestAnimationFrame(update);
			    ball.spring({
			    	position: new BB.Vector2(X,Y),// now assigns the X,Y values to the position
			    	k:0.01,
			    	length: 100
			    });
			    gravity.y = 0; //gui -name gravity.y -min 0.0 -max 1.0 -steps 0.1
			    ball.applyForce( gravity );
			    ball.update();
			    // animate logo spin
			    if( BB.MathUtils.dist(ball.position.x, ball.position.y, prevX, prevY ) > 10 ){
			        spin = ( spin >= 0.3 ) ? 0.3 : spin+=0.005;
			    } else {
			        spin = ( spin <= 0 ) ? 0 : spin-=0.005;
			    }
			    logo.rotation += spin;
			    logo.update( ball );
			    prevX = ball.position.x;
			    prevY = ball.position.y;
			    draw();
		}
        // canvasX and CanvasY will replace point.x and pointer.y 
		function draw() {
			    ctx.clearRect(0,0,WIDTH,HEIGHT);
			    // draw string
			    var distance = BB.MathUtils.dist( X, Y, ball.position.x, ball.position.y );
			    if(distance>500) distance = 500;
			    ctx.lineWidth = BB.MathUtils.map( distance, 0, 500, 5, 1);
			    ctx.beginPath();
			    ctx.moveTo(X,Y);// assigns the values so that now the object moves using data from leapmotion sensor
			    ctx.lineTo( ball.position.x, ball.position.y );
			    ctx.closePath();
			    ctx.stroke();
			    // draw logo
			    logo.draw();
		}
			setup();
			update();
