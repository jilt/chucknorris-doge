var canvas = document.querySelector("canvas");

var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function vect2(x, y){
	
	return({x: x, y: y});
}

const keyPressed = [];

const KEY_UP = 38;
const KEY_DOWN = 40;
let anim = false;

window.addEventListener("keydown", function(e){
	keyPressed[e.keyCode] = true;
});

window.addEventListener("keyup", function(e){
	keyPressed[e.keyCode] = false;
});


// loading pixelart

var chuck = new Image();
chuck.src = "chuck-sprite.png";


var shiba = new Image();
shiba.src = "doge-sprite.png";

function ball(pos, velocity, radius){

	this.pos = pos;
	this.velocity = velocity;
	this.radius = radius;

	this.update = function(){
	  this.pos.x += this.velocity.x;
	  this.pos.y += this.velocity.y;

	};
	
	this.draw = function(){
	  ctx.beginPath();
	  ctx.arc(this.pos.x, this.pos.y, this.radius , 0, Math.PI * 2);
	  ctx.fillStyle = "#ffe866";
	  ctx.fill();
	};
	

}

function Paddle(pos, velocity, width, height, img){
	this.pos = pos;
	this.velocity = velocity;
	this.width = width;
	this.height = height;
	this.img = img;
	this.score = 0;
	this.shift = 0;
	this.currentFrame = 0;

	this.update = function(){
	
	  if(keyPressed[KEY_UP]){
	    this.pos.y -= this.velocity.y;
	  }
	  if(keyPressed[KEY_DOWN]){
	    this.pos.y += this.velocity.y;
	  }

	};
	
	this.draw = function(){
		ctx.drawImage(this.img, this.shift, 0, this.width, this.height, this.pos.x, this.pos.y, this.width, this.height);
	};

	this.reset = function(data){
		ctx.clearRect(data.pos.x, data.pos.y, data.width, data.height);
		data.shift = 0;
		ctx.drawImage(data.img, data.shift, 0, data.width, data.height, data.pos.x, data.pos.y, data.width, data.height);
		anim = false;
	}

	this.animation = function(){
		this.shift = 0;
		ctx.clearRect(this.pos.x, this.pos.y, this.width, this.height);
		this.shift += this.width + 1;
		ctx.drawImage(this.img, this.shift, 0, this.width, this.height, this.pos.x, this.pos.y, this.width, this.height);
		anim = true;
		setTimeout(this.reset, 1000, this);
	};

	this.getHalfWidth = function(){
	  return this.width / 2;
	};

	this.getHalfHeight = function(){
	  return this.height / 2;
	};
	
	this.getCenter = function(){
	  return vect2(
	  this.pos.x + this.getHalfWidth(),
	  this.pos.y + this.getHalfHeight(),
	  )
	};
}

function paddleCollisionWithTheEdges(paddle){
	if(paddle.pos.y <= 0){
	  paddle.pos.y = 0;
	}

	if(paddle.pos.y + paddle.height >= canvas.height){
	  paddle.pos.y = canvas.height - paddle.height;
	}
}

function ballCollisionWithTheEdges(ball){

	if(ball.pos.y + ball.radius >= canvas.height) {

	ball.velocity.y *= -1;
	}

	if(ball.pos.y - ball.radius <= 0) {

	ball.velocity.y *= -1;
	}

	//if(ball.pos.x + ball.radius >= canvas.width) {

	//ball.velocity.x *= -1;
	//}

	//if(ball.pos.x - ball.radius <= 0) {

	//ball.velocity.x *= -1;
	//}

}

function ballPaddleCollision(ball, paddle){
	// make sure values are always positive
	let dx = Math.abs(ball.pos.x - paddle.getCenter().x);
	let dy = Math.abs(ball.pos.y - paddle.getCenter().y);

	if(dx <= (ball.radius + paddle.getHalfWidth()) && dy <=(paddle.getHalfHeight() + ball.radius)){
	ball.velocity.x *= -1;
	paddle.animation();
	}
}

function paddle2AI(ball, paddle){

	if(ball.velocity.x > 0){
		if(ball.pos.y > paddle.pos.y){
			paddle.pos.y += paddle.velocity.y;
			if(paddle.pos.y + paddle.height >= canvas.height){
				paddle.pos.y = canvas.height - paddle.height;
			}
		}
		if(ball.pos.y < paddle.pos.y){
			paddle.pos.y -= paddle.velocity.y;
			if(paddle.pos.y <= 0){
				paddle.pos.y = 0;
			}
		}
	}
}

function respawnBall(ball){
	if(ball.velocity.x > 0){
		ball.pos.x = canvas.width - 150;
		ball.pos.y = (Math.random() * (canvas.height - 200)) + 100;
	}
	if(ball.velocity.x < 0){
		ball.pos.x = 150;
		ball.pos.y = (Math.random() * (canvas.height - 200)) + 100;
	}
	ball.velocity.x *= -1
	ball.velocity.y *= -1

}

function increaseScore(ball, paddle1, paddle2){
	if(ball.pos.x <= -ball.radius){
		paddle2.score += 1;
		document.getElementById("player2score").innerHTML = paddle2.score;
		if (paddle2.score < 6){
			respawnBall(ball);
		} else { 
			document.getElementById("player2score").innerHTML = "Chuck Norris Wins";
			document.getElementById("player2score").style = "right: 25%;";
			document.getElementById("player1score").innerHTML = "";
		}
	}
	if(ball.pos.x >= canvas.width + ball.radius){
		paddle1.score += 1;
		document.getElementById("player1score").innerHTML = paddle1.score;
		if (paddle1.score < 6){
			respawnBall(ball);
		} else{
			document.getElementById("player1score").innerHTML = "You Win";
			document.getElementById("player2score").innerHTML = "";
		}
	}
}

const Ball = new ball(vect2(200, 200), vect2(8, 8), 20);
const paddle1 = new Paddle(vect2(0, 50), vect2(12, 12), 40, 60, shiba);
const paddle2 = new Paddle(vect2(canvas.width - 40, 50), vect2(12, 12), 40, 60, chuck);


//simple drawing
//ctx.beginPath();
//ctx.arc(200, 200, 50 , 0, Math.PI * 2);
//ctx.fillStyle = "#ffe866";
//ctx.strokeStyle = "#ff00ff";
//ctx.fill();
//ctx.stroke();

function gameUpdate(){

	Ball.update();
	paddle1.update();
	paddleCollisionWithTheEdges(paddle1); 
	ballCollisionWithTheEdges(Ball);
	paddle2AI(Ball, paddle2);
	ballPaddleCollision(Ball, paddle1);
	ballPaddleCollision(Ball, paddle2);
	increaseScore(Ball, paddle1, paddle2);

}

function gameDraw(){

	Ball.draw();
	paddle1.draw();
	paddle2.draw();


}

function gameLoop(){
	
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgba(0, 0, 0, .2)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	window.requestAnimationFrame(gameLoop);

	gameUpdate();
	gameDraw();

}

gameLoop();