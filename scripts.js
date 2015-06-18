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
		  jumping : false,
		  grounded: false
		},
		keys = [],
		friction = 0.8,
		gravity = 0.3;
 
canvas.width = width;
canvas.height = height;

//Adding obstacles to our level
var boxes = [];
boxes.push({
    x: 0,
    y: 0,
    width: 10,
    height: height
});
boxes.push({
    x: 0,
    y: height - 2,
    width: width,
    height: 50
});
boxes.push({
    x: width - 10,
    y: 0,
    width: 50,
    height: height
});
boxes.push({
    x: 120,
    y: 10,
    width: 80,
    height: 80
});
boxes.push({
    x: 170,
    y: 50,
    width: 80,
    height: 80
});
boxes.push({
    x: 220,
    y: 100,
    width: 80,
    height: 80
});
boxes.push({
    x: 270,
    y: 150,
    width: 40,
    height: 40
});
 
// The update function which calculates each animation frame
function update(){
	// check keys and update player velocity accordingly
	if (keys[38] || keys[32]) {
    // up arrow or space
	  if(!player.jumping && player.grounded){
	   player.jumping = true;
	   player.grounded = false;
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

  //Clear previous animation frame from canvas
  ctx.clearRect(0,0,width,height);

  //Draw our obstacles
  ctx.fillStyle = "black";
	ctx.beginPath();
	player.grounded = false;
	for (var i = 0; i < boxes.length; i++) {
		var dir = colCheck(player, boxes[i]);
		if (dir === "l" || dir === "r") {
      player.velX = 0;
      player.jumping = false;
		} else if (dir === "b") {
		  player.grounded = true;
		  player.jumping = false;
		} else if (dir === "t") {
		  player.velY *= -1;
		}
	  ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
	}
	ctx.fill();

	if(player.grounded){
    player.velY = 0;
	}
	player.x += player.velX;
	player.y += player.velY;

	//Draw player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // run through the loop again
  requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB) {
  // get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
	    vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
	    // add the half widths and half heights of the objects
	    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
	    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
	    colDir = null;

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
  	// figures out on which side we are colliding (top, bottom, left, or right)
  	var oX = hWidths - Math.abs(vX),
  			oY = hHeights - Math.abs(vY);
		if (oX >= oY) {
		  if (vY > 0) {
		    colDir = "t";
		    shapeA.y += oY;
		  } else {
		    colDir = "b";
		    shapeA.y -= oY;
		  }
		} else {
		  if (vX > 0) {
		    colDir = "l";
		    shapeA.x += oX;
		  } else {
		    colDir = "r";
		    shapeA.x -= oX;
		  }
		}
	}
  return colDir;
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