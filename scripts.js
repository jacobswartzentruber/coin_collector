//Shim to account for browsers that do not support requestAnimationFrame
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

//Define all game variables and parameters
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1000,
    height = 200,
    player = {
		  x : width/2,
		  y : height - 5,
		  width : 5,
		  height : 5,
		  speed: 3,
		  velX: 0,
		  velY: 0,
		  jumping : false
		},
		keys = [],
		friction = 0.8,
		gravity = 0.3;
 
canvas.width = width;
canvas.height = height;
 
// The update function which calculates each animation frame
function update(){
	// check keys and update player velocity accordingly
	if (keys[38] || keys[32]) {
    // up arrow or space
	  if(!player.jumping){
	   player.jumping = true;
	   player.velY = -player.speed*2;
	  }
	}
	if (keys[39]) {
		// right arrow
		if (player.velX < player.speed) {                         
		   player.velX++;                  
		}          
	}          
	if (keys[37]) {                 
		// left arrow                  
		if (player.velX > -player.speed) {
		   player.velX--;
		}
	}

	//Adjust player velocity in accordance with gravity and friction
	player.velX *= friction;
	player.velY += gravity;

	//Adjust player position determinate upon player velocity
  player.x += player.velX;
	player.y += player.velY;

	//Adjust player position if player out of bounds on the x-axis
	if (player.x >= width-player.width) {
    player.x = width-player.width;
	} else if (player.x <= 0) {
	    player.x = 0;
	}

	//Adjust player position if player out of bounds on the y-axis
	if(player.y >= height-player.height){
    player.y = height - player.height;
    player.jumping = false;
	}

  //Draw the player
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // run through the loop again
  requestAnimationFrame(update);
}

//Assign click handlers to body element and adjust "key" booleans accordingly
$('body').keydown(function(key) {
	keys[key.which] = true;
});

$('body').keyup(function(key) {
	keys[key.which] = false;
});

//Call update() when document has finished loading to start animation
$(document).ready(function(){
	update();
});