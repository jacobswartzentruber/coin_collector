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
    playing = true,
    currentFrame = 0,
    coinsCollected = 0,
    coinSpawnChance = 0.01,
    levelSpeed = 1,
    levelSpeedUp = 0.001,
    player = {
		  x : width/2,
		  y : height - 5,
		  width : 10,
		  height : 10,
		  speed: 4,
		  velX: 0,
		  velY: 0,
		  jumping : false,
		  grounded: false
		},
		keys = [],
		friction = 0.8,
		gravity = 0.3,
		maxBoxHeight = 50,
		minBoxHeight = 2,
		variableBoxHeight = minBoxHeight,
		maxBoxWidth = 100,
		minBoxWidth = 10,
		boxBuffer = 100,		//How far boxes go underneath canvas
		minStepSize = 2;

canvas.width = width;
canvas.height = height;

coinFrame = 0;
coinImg = new Image();
coinImg.src = "assets/coin_sprite.png";

//Adding background images to the level
var background = [];
background.push({x: 0, y: 0, img: new Image()},{x: 0, y: 0, img: new Image()},{x: 0, y: 0, img: new Image()});
background[0].img.src = "assets/sky.png";
background[1].img.src = "assets/mountains.png";
background[2].img.src = "assets/treeline.png";

//Adding terrain to the level
var boxes = [{x: 0, y: height - minBoxHeight, width: width, height: minBoxHeight + boxBuffer}];

//Adding coins to the level
var coins = [];
 
// The update function which calculates each animation frame
function update(){
	// check keys and update player velocity accordingly
	if (keys[38] || keys[32]) {
    // up arrow or space
	  if(!player.jumping && player.grounded){
	   player.jumping = true;
	   player.grounded = false;
	   player.velY = -player.speed*1.5;
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

	//Add box to end of level if needed
	var last_index = boxes.length-1;
	if(boxes[last_index].x + boxes[last_index].width <= width+minStepSize){
		var tempHeight = Math.floor(minBoxHeight+Math.random()*(boxes[last_index].height-boxBuffer+variableBoxHeight-minBoxHeight));
		if(boxes[last_index].y-tempHeight < player.height+5){
			tempHeight = player.height+5;
		}
		boxes.push({
			x: boxes[last_index].x + boxes[last_index].width,
	    y: height - tempHeight,
	    width: minBoxWidth+Math.floor(Math.random()*(maxBoxWidth-minBoxWidth)),
	    height: tempHeight + boxBuffer
		});
	}

	//Add coin to end of level randomly
	if(Math.random() < coinSpawnChance && boxes[boxes.length-1].x+boxes[boxes.length-1].width > width+12){
		coins.push({
			x: width,
			y: Math.random()*(boxes[boxes.length-1].y - coinImg.height),
			width: 12,
			height: coinImg.height
		})
	}

	//Adjust background, player, coin and box positions for scrolling effect
	//Background
	for(var i=0; i<background.length; i++){
		if(background[i].x <= -width*2){
			background[i].x = 0;
		}
		background[i].x -= 0.2*(i+levelSpeed);
	}
	//Player
	player.x -= levelSpeed;
	//Coin
	for(var i=0; i<coins.length; i++){
		coins[i].x -= levelSpeed;
		if(coins[i].x+coins[i].width < 0){
			coins.splice(i,1);
			i -= 1;
		}
	}
	//Box
	if(boxes[0].x+boxes[0].width < 0){
		boxes.splice(0,1);
	}
	for(var i=0; i<boxes.length; i++){
		boxes[i].x -= levelSpeed;
	}


	//Adjust player velocity in accordance with gravity and friction
	player.velX *= friction;
	player.velY += gravity;

	//If player hits left game edge, display game over and pause game
	if(player.x < 0){
		playing = false;
	}

  //Clear previous animation frame from canvas
  ctx.clearRect(0,0,width,height);

  //Draw the background
  for(var i=0; i<background.length; i++){
  	ctx.drawImage(background[i].img, background[i].x, background[i].y);
  	ctx.drawImage(background[i].img, background[i].x+width*2, background[i].y);
  }

  //Update player position based on velocities
  //If player is going past right hand side of screen, make them stand still for this frame
  if(player.x+player.width+player.velX > width){
  	player.velX = 0;
  }
  player.x += player.velX;
	player.y += player.velY;

  //Draw the terrain
  ctx.fillStyle = "#334C33";
	ctx.beginPath();
	player.grounded = false;
	for (var i = 0; i < boxes.length; i++) {
		var dir = colCheck(player, boxes[i]);
		if (dir === "l" || dir === "r") {
      player.velX = 0;
      player.jumping = false;
		} else if (dir === "b") {
			player.velY = 0;
		  player.grounded = true;
		  player.jumping = false;
		} else if (dir === "t") {
		  player.velY *= -1;
		}
	  ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
	}
	ctx.fill();

	//Draw coins and remove if player hits them
	for (var i = 0; i < coins.length; i++) {
		var dir = colCheck(player, coins[i]);
		if(dir !== null){
			coinsCollected += 1;
			coins.splice(i,1);
			i -= 1;
		}else{
			ctx.drawImage(coinImg, coinFrame*2+coinFrame*11, 0, 12, 14, coins[i].x, coins[i].y, 12, 14);
		}
	}
	if(currentFrame%6 === 0){
		coinFrame += 1;
		if(coinFrame > 4){coinFrame = 0;}
	}

	//Draw player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  //Draw coins collected text, game over screen and debug display information
	if(playing){
		ctx.fillStyle = "grey";
		ctx.font = "15px Arial";
		ctx.textAlign = "left";
		ctx.fillText("Player X:"+player.x+" Y:"+player.y,10,20);
		ctx.fillText("Vel X:"+player.velX.toFixed(2)+"Vel Y:"+player.velY.toFixed(2),10,40);
		ctx.fillText("Jumping:"+player.jumping+" Grounded:"+player.grounded,10,60);
		ctx.fillText("Level Speed:"+levelSpeed+" BoxHeight: "+variableBoxHeight,10,80);
		ctx.fillText("Coins Collected: "+coinsCollected,width-150,20);
	}else{
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = "grey";
		ctx.font = "25px Arial";
		ctx.textAlign = "center";
		ctx.fillText("Game Over",width/2,80);
		ctx.fillText("You collected "+coinsCollected+" coins!",width/2,120);
		ctx.font = "15px Arial";
		ctx.fillText("Press Enter to play again",width/2,160);

	}

  //Speed up level and player
  if(levelSpeed < player.speed*0.80){
  	levelSpeed += levelSpeedUp;
  }
  if(variableBoxHeight <= maxBoxHeight){
		variableBoxHeight += levelSpeedUp*10;
  }
  
  // run through the loop again
  if(playing){
  	currentFrame += 1;
  	requestAnimationFrame(update);
  }
}

function resetLevel(){
	coinsCollected = 0;
  levelSpeed = 1;
  currentFrame = 0;
  player = {
	  x : width/2,
	  y : height - 5,
	  width : 10,
	  height : 10,
	  speed: 4,
	  velX: 0,
	  velY: 0,
	  jumping : false,
	  grounded: false
	};
	variableBoxHeight = minBoxHeight,
	background[0].x = 0;
	background[1].x = 0;
	background[2].x = 0;
	boxes = [{x: 0, y: height - minBoxHeight, width: width, height: minBoxHeight + boxBuffer}];
	coins = [];
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
	if(key.which === 13 && !playing){
		playing = true; 
		resetLevel();
		update();
	}
});

$('body').keyup(function(key) {
	keys[key.which] = false;
});

//Call update() when document has finished loading to start animation
$(document).ready(function(){
	update();
});

/*Add box to end of level if needed HORIZONTAL STACKING!
	if(Math.random() < boxSpawnChance){
		var lastBoxY = height, lastBoxWidth = 0;
		//Find highest box on map edge to spawn
		for(var i=0; i<boxes.length; i++){
			if(boxes[i].x+boxes[i].width > width+minBoxWidth && boxes[i].y < lastBoxY){
				lastBoxY = boxes[i].y;
				lastBoxWidth = (boxes[i].x+boxes[i].width)-width;
			}
		}
		//Find height for box
		var tempY = lastBoxY - Math.floor(Math.random()*maxBoxHeight);
		if(tempY < 30){tempY = 30;}
		boxes.push({
	    x: width,
	    y: tempY,
	    width: minBoxWidth+Math.floor(Math.random()*(lastBoxWidth-minBoxWidth)),
	    height: lastBoxY-tempY
		});
	}*/