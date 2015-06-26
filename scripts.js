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
    coinsCollected = 0,
    coinSpawnChance = 0.01,
    levelSpeed = 1,
    levelSpeedUp = 0.001,
    maxSpeedPercent = 0.73,
    player = {
    	img : new Image(),
		  x : width/2,
		  y : height - 20,
		  width : 44,
		  height : 35,
		  speed: 4,
		  velX: 0,
		  velY: 0,
		  jumping : false,
		  doubleJump: false,
		  grounded: false,
		  action: "idleRight",
		  dirFacing: "R",
		  frame : 0
		},
		keys = [],
		friction = 0.8,
		gravity = 0.3,
		maxBoxHeight = 90,
		minBoxHeight = 10,
		variableBoxHeight = minBoxHeight,
		maxBoxWidth = 100,
		minBoxWidth = player.width,
		boxBuffer = 100,		//How far boxes go underneath canvas
		minStepSize = 2,
		numImagesLoaded = 0;

var animationKey = {
	//Each animation hash holds x position, y position, spriteSheet width, spriteSheet height, number of frames and delay between frames
	coin: {spinning:{x:0,y:0,width:72,height:14,numFrames:6,frameDelay:6}},
	taylor: {eating:{x:0,y:0,width:80,height:25,numFrames:4,frameDelay:6}},
	fox: {
		runningRight:{x:0,y:0,width:176,height:35,numFrames:4,frameDelay:7},
		runningLeft: {x:0,y:35,width:176,height:35,numFrames:4,frameDelay:7},
		jumpingRight: {x:0,y:70,width:44,height:35,numFrames:1,frameDelay:6},
		jumpingLeft: {x:44,y:70,width:44,height:35,numFrames:1,frameDelay:6},
		jumpingIdleRight: {x:88,y:0,width:44,height:35,numFrames:1,frameDelay:6},
		jumpingIdleLeft: {x:44,y:35,width:44,height:35,numFrames:1,frameDelay:6},
		fallingRight: {x:132,y:0,width:44,height:35,numFrames:1,frameDelay:6},
		fallingLeft: {x:0,y:35,width:44,height:35,numFrames:1,frameDelay:6},
		idleRight: {x:0,y:0,width:44,height:35,numFrames:1,frameDelay:6},
		idleLeft: {x:132,y:35,width:44,height:35,numFrames:1,frameDelay:6}
	}
}

canvas.width = width;
canvas.height = height;

player.img.src = "assets/fox_sprite.png";
player.img.onload = updateLoading;
console.log(player.height + " " + player.width);

coinImg = new Image();
coinImg.src = "assets/coin_sprite.png";
coinImg.onload = updateLoading;

//Adding background images to the level
var background = [];
background.push(
	{x: 0, y: 0, img: new Image()},
	{x: 0, y: 0, img: new Image()},
	{x: 0, y: 0, img: new Image()},
	{x: 0, y: 0, img: new Image()}
);
background[0].img.src = "assets/sky.png";
background[0].img.onload = updateLoading;
background[1].img.src = "assets/mountains.png";
background[1].img.onload = updateLoading;
background[2].img.src = "assets/treeline.png";
background[2].img.onload = updateLoading;
background[3].img.src = "assets/terrain.jpg";
background[3].img.onload = updateLoading;

var foreground = {x: 0, y: 0, img: new Image()};
foreground.img.src = "";

var grass = new Image();
grass.src = "assets/grass.png";
grass.onload = updateLoading;

//Adding terrain to the level
var boxes = [{x: 0, y: height - minBoxHeight, width: width, height: minBoxHeight + boxBuffer}];

//Adding coins to the level
var coins = [];
 
//Update the loading screen progress bar
function updateLoading(){
  numImagesLoaded++;
  console.log(numImagesLoaded);
  $('#loadingBar').css("width",(7/numImagesLoaded)*700);
  if(numImagesLoaded == 7){
    $('#game').css("display","block");
		$('#loadingScreen').css("display","none");
  } 
}

// The update function which calculates each animation frame
function update(){
	// check keys and update player velocity accordingly
	if (keys[38] || keys[32]) {
    // up arrow or space
	  if(!player.jumping && player.grounded){
	   player.jumping = true;
	   player.grounded = false;
	   player.velY = -player.speed*1.5;
	  }else if(player.velY>0 && !player.doubleJump){
	  	player.velY = -player.speed*1.3;
	  	player.doubleJump = true;
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
			height: coinImg.height,
			frame: 0
		})
	}

	//Adjust background, player, coin and box positions for scrolling effect
	//Background
	for(var i=0; i<background.length; i++){
		if(background[i].x <= -width*2){
			background[i].x = 0;
		}
		background[i].x -= levelSpeed/(3/i);
	}
	//Foreground
	if(foreground.x <= -width*2){
		foreground.x = 0;
	}
	foreground.x -= levelSpeed*1.30;
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
  for(var i=0; i<background.length-1; i++){
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

	//Update which way player is facing
	if(player.velX > 0){player.dirFacing = "R";}
	else if(player.velX < 0){player.dirFacing = "L";}

	//Update player animation depending on context
	var oldAction = player.action;
	if(player.grounded){
		if(player.velX < -0.5){player.action = "runningLeft";}
		else if(player.velX > 0.5){player.action = "runningRight";}
		else{
			if(player.dirFacing === "R"){player.action = "idleRight";}
			else{player.action = "idleLeft";}
		}
	}
	else{
		if(player.dirFacing === "R"){
			if(player.velY < -1){player.action = "jumpingRight";}
			else if(player.velY > 1){player.action = "fallingRight";}
			else{player.action = "jumpingIdleRight";}
		}else{
			if(player.velY < -1){player.action = "jumpingLeft";}
			else if(player.velY > 1.){player.action = "fallingLeft";}
			else{player.action = "jumpingIdleLeft";}
		}
	}

	//If new action is different than previous frame, set player.frame to zero
	if(player.action !== oldAction){player.frame = 0;}

	//Draw player
	drawAnimationFrame(player, "fox", player.action, player.img, ctx);

  //Draw the terrain
  ctx.fillStyle = "#334C33";
	ctx.beginPath();
	player.grounded = false;

	ctx.save();
	ctx.beginPath();
	for (var i = 0; i < boxes.length; i++) {
		var dir = colCheck(player, boxes[i]);
		if (dir === "l" || dir === "r") {
      player.velX = 0;
      player.jumping = false;
		} else if (dir === "b") {
			player.velY = 0;
		  player.grounded = true;
		  player.jumping = false;
		  player.doubleJump = false;
		} else if (dir === "t") {
		  player.velY *= -1;
		}
	  ctx.lineTo(boxes[i].x, boxes[i].y);
	  ctx.lineTo(boxes[i].x+boxes[i].width, boxes[i].y);
	  ctx.drawImage(grass, 0, 0, boxes[i].width, grass.height, boxes[i].x, boxes[i].y-grass.height, boxes[i].width, grass.height);
	}
	ctx.lineTo(width, height);
	ctx.lineTo(0,height);
	ctx.closePath();
	/// define this Path as clipping mask
	ctx.clip();
	/// draw the image
	ctx.drawImage(background[3].img,background[3].x,background[3].y);
	ctx.drawImage(background[3].img, background[3].x+width*2, background[3].y);
	/// reset clip to default
	ctx.restore();
	

	//Draw coins and remove if player hits them
	for (var i = 0; i < coins.length; i++) {
		var dir = colCheck(player, coins[i]);
		if(dir !== null){
			coinsCollected += 1;
			coins.splice(i,1);
			i -= 1;
		}else{
			drawAnimationFrame(coins[i], "coin", "spinning", coinImg, ctx);
		}
	}

	//Draw foreground
	ctx.drawImage(foreground.img, foreground.x, foreground.y);
	ctx.drawImage(foreground.img, foreground.x+width*2, foreground.y);

  //Draw coins collected text, game over screen and debug display information
	if(playing){
		ctx.fillStyle = "grey";
		ctx.font = "15px Arial";
		ctx.textAlign = "left";
		ctx.fillText("Player X:"+player.x+" Y:"+player.y,10,20);
		ctx.fillText("Vel X:"+player.velX.toFixed(2)+"Vel Y:"+player.velY.toFixed(2),10,40);
		ctx.fillText("Jumping:"+player.jumping+"DoubleJump:"+player.doubleJump+" Grounded:"+player.grounded,10,60);
		ctx.fillText("Level Speed:"+levelSpeed+" BoxHeight: "+variableBoxHeight,10,80);
		ctx.fillText("Coins Collected: "+coinsCollected,width-150,20);
	}else{
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = "white";
		ctx.font = "25px Arial";
		ctx.textAlign = "center";
		ctx.fillText("Game Over",width/2,80);
		ctx.fillText("You collected "+coinsCollected+" coins!",width/2,120);
		ctx.font = "15px Arial";
		ctx.fillText("Press Enter to play again",width/2,160);

	}

  //Speed up level and player
  if(levelSpeed < player.speed*maxSpeedPercent){
  	levelSpeed += levelSpeedUp;
  }
  if(variableBoxHeight <= maxBoxHeight){
		variableBoxHeight += levelSpeedUp*10;
  }
  
  // run through the loop again
  if(playing){
  	requestAnimationFrame(update);
  }
}

function resetLevel(){
	coinsCollected = 0;
  levelSpeed = 1;
  player = {
	  img : player.img,
	  x : width/2,
	  y : height - 20,
	  width : 44,
	  height : 35,
	  speed: 4,
	  velX: 0,
	  velY: 0,
	  jumping : false,
	  doubleJump: false,
	  grounded: false,
	  action: "idleRight",
	  dirFacing: "R",
	  frame : 0
	};
	variableBoxHeight = minBoxHeight;
	background[0].x = 0;
	background[1].x = 0;
	background[2].x = 0;
	boxes = [{x: 0, y: height - minBoxHeight, width: width, height: minBoxHeight + boxBuffer}];
	coins = [];
}

//Function to get correct animation frame for a specific object doing a specific action
function drawAnimationFrame(object, key, action, spriteSheet, canvas){
	var aKey = animationKey[key][action];
	var frameWidth = aKey.width/aKey.numFrames;
	if(object.frame >= aKey.numFrames*aKey.frameDelay){
		object.frame = 0;
	}
	canvas.drawImage(spriteSheet, aKey.x+Math.floor(object.frame/aKey.frameDelay)*frameWidth, aKey.y, frameWidth, aKey.height, object.x, object.y, frameWidth, aKey.height);
	object.frame += 1;
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
$(window).load(function(){
	update();
});