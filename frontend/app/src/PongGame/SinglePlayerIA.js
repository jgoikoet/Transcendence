'use strict'

import { calculation } from "./iaCalc.js"

//Game variables
let canvas;
let ctx;
let player1Y, player2Y;
let ballX, ballY;

let ballIAX, ballIAY;

let ballSpeedX, ballSpeedY;
let player1Up, player1Down;
let player2Up, player2Down;
let gameLoopId;
let timeoutId;
let player1Score;
let player2Score;
let wait;
let init;
let finish;
let imageOn;

//constants  
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_DIR_RIGHT = '+';
const BALL_DIR_LEFT = '-';
const BALL_DIR_UP = '-';
const BALL_DIR_DOWN = '+';
const SPEED_INC = 0.15;
const ANGLE_INC = 0.4;

const imageIntro = new Image();
imageIntro.src = 'src/PongGame/images_pong/image_intro_ia.jpg';

export function initializeGameIA() {
	canvas = document.getElementById('pongCanvas');
	ctx = canvas.getContext('2d');
	setBallSpeed();
	player1Up = false;
	player1Down = false;
	player2Up = false;
	player2Down = false;
	player1Score = 0;
	player2Score = 0;
	init = true;
	finish = false;
	wait = true;
	imageOn = imageIntro;

    player1Y = (canvas.height - PADDLE_HEIGHT) / 2;
    player2Y = (canvas.height - PADDLE_HEIGHT) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;

	ballIAX = ballX;
	ballIAY = ballY;

    document.addEventListener('keydown', handleKeyDownIA);
	document.addEventListener('keyup', handleKeyUpIA);
	
	if (!window.aiInterval) {
		window.aiInterval = setInterval(() => {
		  let coor = calculation(ballX, ballY, ballSpeedX, ballSpeedY);
		  ballIAX = coor[0];
		  ballIAY = coor[1];
		}, 1000);
	  }

	const h1Element = document.querySelector('#pong-container h1');
	h1Element.textContent = 'PONG SINGLE PLAYER AGAINST I.A.';
	
	deactivateKeydown();
	updateScore();
    refresh();
}

function handleKeyDownIA(event)
{
	if (event.key === 'w') player1Up = true;
	if (event.key === 's') player1Down = true;
}

function handleKeyUpIA(event)
{
	if (event.key === 'w') player1Up = false;
	if (event.key === 's') player1Down = false;
}

async function makeCountDown() {
    // Hacer algo asíncrono
	showWinMessage("3");
    await new Promise((resolve) => setTimeout(resolve, 800));
	showWinMessage("2");
	await new Promise((resolve) => setTimeout(resolve, 800));
	showWinMessage("1");
	await new Promise((resolve) => setTimeout(resolve, 800));
}

async function callCountDown() {
    await makeCountDown();
	wait = false;
    refresh();
}

function handleSpacePress(event) {
    if (event.key === ' ') {
        initializeGameIA();
    }
}

async function printImages()
{
	ctx.drawImage(imageOn, 0, 0);

	await new Promise((resolve) => {
		function onKeyPress(event) {
			if (event.code === "Space") {
				document.removeEventListener("keydown", onKeyPress);
				resolve();
			}
		}
	
		document.addEventListener("keydown", onKeyPress);
	
		const contenedor = document.getElementById("spa-template-content");
	
		const observer = new MutationObserver(() => {
			document.removeEventListener("keydown", onKeyPress);
			observer.disconnect();
		});
	
		observer.observe(contenedor, { childList: true });
	});
}

async function sendImage()
{
	await printImages();
	wait = false;
	init = false;
	refresh();
}

function deactivateKeydown() {
	document.removeEventListener('keydown', handleSpacePress);
}

function gameLoop() {
	cleanCanva();
	drawCanva();
	updatePlayerAndBall();
	checkLowerAndUpperCollision();
	checkLeftAndRightCollision();
	moveAI();
	if (wait == true)
	{
		if (finish) {
            terminateGameIA();
            document.addEventListener('keydown', handleSpacePress);
        }
		else if (init)
			sendImage();
		else
			callCountDown();
	}
	else
		refresh();
}

function stopInterval() {
	if (window.aiInterval) {
	  clearInterval(window.aiInterval);
	  window.aiInterval = null;
	}
  }

function drawRect(x, y, w, h, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.PI * 2);
	ctx.fill();
}

function drawIABall(x, y, size, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.PI * 2);
	ctx.fill();
}

function drawDashedLine() {
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
}

function cleanCanva()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanva()
{
	drawRect(0, player1Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
	drawRect(canvas.width - PADDLE_WIDTH, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
	drawDashedLine();
	drawBall(ballX, ballY, BALL_SIZE, 'yellow');
	//drawIABall(ballIAX, ballIAY, BALL_SIZE, 'green');
}

function updatePlayerAndBall()
{
	if (player1Up && player1Y > 0)
		player1Y -= PADDLE_SPEED;
	if (player1Down && player1Y < canvas.height -PADDLE_HEIGHT)
		player1Y += PADDLE_SPEED;
	if (player2Up && player2Y > 0)
		player2Y -= PADDLE_SPEED;
	if (player2Down && player2Y < canvas.height - PADDLE_HEIGHT)
		player2Y += PADDLE_SPEED;
	ballX += ballSpeedX;
	ballY += ballSpeedY;
}

function checkLowerAndUpperCollision()
{
	if (ballY - BALL_SIZE <= 0 || ballY + BALL_SIZE >= canvas.height)
		ballSpeedY = -ballSpeedY;
}

function leftCollision()
{
	if (ballX <= PADDLE_WIDTH) {
		if (ballY > player1Y && ballY < player1Y + (PADDLE_HEIGHT / 3))
		{
			ballSpeedX = -ballSpeedX;
			ballX += 0.5;
			if (ballSpeedY <= 0)
			{
				if (Math.abs(ballSpeedY) < Math.abs(ballSpeedX))
				{
					ballSpeedY = ballSpeedY - ANGLE_INC;
					ballSpeedX = ballSpeedX - ANGLE_INC;
				}
			}
			else
			{
				ballSpeedY = ballSpeedY - ANGLE_INC;
				ballSpeedX = ballSpeedX + ANGLE_INC;
			}
		}
		else if (ballY > player1Y +  (PADDLE_HEIGHT / 3) && ballY < player1Y + ((PADDLE_HEIGHT / 3) * 2))
		{
			ballSpeedX = -ballSpeedX;
		}
		else if (ballY > player1Y + ((PADDLE_HEIGHT / 3) * 2) && ballY < player1Y + PADDLE_HEIGHT)
		{
			ballSpeedX = -ballSpeedX;
			ballX += 0.5;
			if (ballSpeedY <= 0)
			{
				ballSpeedY = ballSpeedY + ANGLE_INC;
				ballSpeedX = ballSpeedX + ANGLE_INC;
			}
			else
			{
				if(Math.abs(ballSpeedY) < Math.abs(ballSpeedX))
				{
					ballSpeedY = ballSpeedY + ANGLE_INC;
					ballSpeedX = ballSpeedX - ANGLE_INC;
				}
			}
		}
		else
		{
			player2Score++;
			if(player2Score == 3)
			{
				showWinMessage("YOU LOSE MOTHERFUCKER!\nPUSH SPACE TO PLAY AGAIN");
				finish = true;
			}
			updateScore();
			resetBall();
			resetPlayerPositions();
			wait = true;
			return;
		}
		ballSpeedX += SPEED_INC;
		if(ballSpeedY <= 0)
			ballSpeedY -= SPEED_INC;
		else
			ballSpeedY += SPEED_INC;
	}
}

function rightCollision()
{
	if (ballX >= canvas.width - PADDLE_WIDTH) {
		if (ballY > player2Y && ballY < player2Y + (PADDLE_HEIGHT / 3))
		{
			ballSpeedX = -ballSpeedX;
			ballX -= 0.5;
			if (ballSpeedY <= 0)
			{
				if(Math.abs(ballSpeedY) < Math.abs(ballSpeedX))
				{
					ballSpeedY = ballSpeedY - ANGLE_INC;
					ballSpeedX = ballSpeedX + ANGLE_INC;
				}
			}
			else
			{
				ballSpeedY = ballSpeedY - ANGLE_INC;
				ballSpeedX = ballSpeedX - ANGLE_INC;	
			}
		}
		else if (ballY > player2Y + (PADDLE_HEIGHT / 3) && ballY < player2Y + ((PADDLE_HEIGHT / 3) * 2))
		{
			ballSpeedX = -ballSpeedX;
		}
		else if (ballY > player2Y + ((PADDLE_HEIGHT / 3) * 2) && ballY < player2Y + PADDLE_HEIGHT)
		{
			ballSpeedX = -ballSpeedX;
			ballX -= 0.5;
			if (ballSpeedY <= 0)
			{
				ballSpeedY = ballSpeedY + ANGLE_INC;
				ballSpeedX = ballSpeedX - ANGLE_INC;
			}
			else
			{
				if (Math.abs(ballSpeedY) < Math.abs(ballSpeedX))
				{
					ballSpeedY = ballSpeedY + ANGLE_INC;
					ballSpeedX = ballSpeedX + ANGLE_INC;
				}
			}
		}
		else
		{
			player1Score++;
			if(player1Score == 3)
			{
				showWinMessage("You win!\nPush space to play again");
				finish = true;
			}
			updateScore();
			resetBall();
			resetPlayerPositions();
			wait = true;
			
			return;
		}
		ballSpeedX -= SPEED_INC;
		if(ballSpeedY <= 0)
			ballSpeedY -= SPEED_INC;
		else
			ballSpeedY += SPEED_INC;
	}
}

function checkLeftAndRightCollision()
{
	leftCollision();
	rightCollision();  
}

export function terminateGameIA() {
	document.removeEventListener('keydown', gameLoop);
	if (gameLoopId)
		cancelAnimationFrame(gameLoopId);
	if (timeoutId)
		clearTimeout(timeoutId);

	stopInterval();	
}

function showWinMessage(message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';

    const lines = message.split('\n');
    
    lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index * 40));
    });
}

function resetBall()
{
	ballX = canvas.width / 2;
	ballY = canvas.height / 2;
	setBallSpeed();
}

function resetPlayerPositions()
{
	player1Y = (canvas.height - PADDLE_HEIGHT) / 2;
    player2Y = (canvas.height - PADDLE_HEIGHT) / 2;
	player2Down = false;
	player2Up = false;
}

function updateScore()
{
	const scorePlayer1 = document.getElementById('player1-score');
	if (scorePlayer1)
		scorePlayer1.textContent = 'Player 1: ' + player1Score;
	const scorePlayer2 = document.getElementById('player2-score');
	if (scorePlayer2)
		scorePlayer2.textContent = 'IA: ' + player2Score;
}

function refresh() {
	cancelAnimationFrame(gameLoopId);
	gameLoopId = requestAnimationFrame(gameLoop);
}

function getDirectionSideForBall()
{
	return Math.random() < 0.5 ? BALL_DIR_RIGHT : BALL_DIR_LEFT;
}

function getDirectionUpOrDownBall()
{
	return Math.random() < 0.5 ? BALL_DIR_UP : BALL_DIR_DOWN;
}

function setBallSpeed()
{
	let ballDirSideways = getDirectionSideForBall();
	let ballDirUpOrDown = getDirectionUpOrDownBall();
	ballSpeedX = 6;
	if (ballDirSideways == BALL_DIR_LEFT)
		ballSpeedX = (-1) * ballSpeedX;
	ballSpeedY = 2;
	if (ballDirUpOrDown == BALL_DIR_UP)
		ballSpeedY = (-1) * ballSpeedY;
}

function moveAI()
{
	if (player2Y < ballIAY - 80)// - 80 -90
	{
		player2Up = false;
		player2Down = true;
	}
	if (player2Y > ballIAY - 10)// - 10
	{
		player2Down = false;
		player2Up = true;
	}
}

export function disposeIAGame()
{
	document.removeEventListener('keydown', handleKeyDownIA);
	document.removeEventListener('keyup', handleKeyUpIA);
	document.removeEventListener('keydown', handleSpacePress);
}
        