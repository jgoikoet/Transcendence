'use strict'

import { drawCobeteR, drawCobeteRFire, drawCobeteB, drawCobeteBFire, rotateMove, posXR, posYR, moveRed, moveBlue, resetGame} from "./cobeteDraw.js"
import { addRectangles1, rectangleList1 } from "./cobeteSetMap1.js"
import { addRectangles2, rectangleList2 } from "./cobeteSetMap2.js"
import { addRectangles3, rectangleList3 } from "./cobeteSetMap3.js"
import { checkColision } from "./cobeteCheckColision.js"
import { weaponR, drawWeaponR, weaponROn, weaponB, drawWeaponB, weaponBOn } from "./cobeteWeapon.js"

export let canvas;
export let ctx;
export let player1Score;
export let player2Score;
export let rotateLeftR = false;
export let rotateRightR = false;
export let fireR = false;
export let rotateLeftA = false;
export let rotateRightA = false;
export let fireB = false;

let wait;
let gameLoopId;
let timeoutId;
let finish;

const imageIntro = new Image();
imageIntro.src = 'src/localCobeteGame/images/intro.jpg';

const imageRedPoint = new Image();
imageRedPoint.src = 'src/localCobeteGame/images/red_one_point.jpg';

const imageBluePoint = new Image();
imageBluePoint.src = 'src/localCobeteGame/images/blue_one_point.jpg';

const imageRedWin = new Image();
imageRedWin.src = 'src/localCobeteGame/images/win_red.jpg';

const imageBlueWin = new Image();
imageBlueWin.src = 'src/localCobeteGame/images/win_blue.jpg';

let imageOn = imageIntro;
let rectangleList;

export function initializeCobeteGame() {
	canvas = document.getElementById('pongCanvas');
	ctx = canvas.getContext('2d');
	player1Score = 0;
	player2Score = 0;
	wait = true;
	finish = false;
	document.getElementById('player1-score').textContent = 'Red Cobete: ' + player1Score;
	document.getElementById('player2-score').textContent = 'Blue Cobete: ' + player2Score;
	resetGame();
    window.addEventListener('keydown', handleKeyDownLocal);
	window.addEventListener('keyup', handleKeyUpLocal);
	addRectangles1();
	rectangleList = rectangleList1;
	const h1Element = document.querySelector('#pong-container h1');
	h1Element.textContent = 'COBETE LOCAL MULTIPLAYER';
	refresh()
}

function handleKeyDownLocal(event)
{
	if (event.key === 'a') {
		rotateLeftR = true;
	}
	if (event.key === 's') {
		rotateRightR = true;
	}
	if (event.key === 'd') {
		fireR = true;
	}
	if (event.key === 'f') {
		if(moveRed)
			weaponR();
	}
	if (event.key === '1') {
		rotateLeftA = true;
	}
	if (event.key === '2') {
		rotateRightA = true;
	}
	if (event.key === '3') {
		fireB = true;
	}
	if (event.key === 'Enter') {
		if (moveBlue)
			weaponB();
	}
}

function handleKeyUpLocal(event)
{
	if (event.key === 'a') {
		rotateLeftR = false;
	}
	if (event.key === 's') {
		rotateRightR = false;
	}
	if (event.key === 'd') {
		fireR = false;
	}
	if (event.key === '1') {
		rotateLeftA = false;
	}
	if (event.key === '2') {
		rotateRightA = false;
	}
	if (event.key === '3') {
		fireB = false;
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
	if (finish)
		initializeCobeteGame();
}

async function sendImage()
{
	await printImages();
	wait = false;
	if (finish)
		terminateCobeteGame();
	else
		refresh();
}

function gameLoop() {
	cleanCanva();
	drawCanva();
	checkColision(rectangleList);
	if (wait == true)
		sendImage();
	else
		refresh();
}

function drawMap()
{
	for (let i = 0; i < rectangleList.length; i++)
	{
		ctx.fillStyle = rectangleList[i].color; 
        ctx.fillRect(rectangleList[i].x, rectangleList[i].y, rectangleList[i].width, rectangleList[i].height);
    }
	ctx.fillStyle = 'deepskyblue';
	ctx.fillRect(250, 590, 70, 10);
	ctx.fillStyle = 'red';
	ctx.fillRect(380, 590, 70, 10);
}

function cleanCanva()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanva()
{
	rotateMove();
	if (fireR == false)
		drawCobeteR();
	else
	drawCobeteRFire();

	if (fireB == false)
		drawCobeteB();
	else
		drawCobeteBFire();

	if(weaponROn)
		drawWeaponR();

	if(weaponBOn)
		drawWeaponB();
	drawMap();
}

export function terminateCobeteGame() {
	document.removeEventListener('keydown', gameLoop);
	if (gameLoopId)
		cancelAnimationFrame(gameLoopId);
	if (timeoutId)
		clearTimeout(timeoutId);
	player1Score = 0;
	player2Score = 0;
	imageOn = imageIntro;
	resetGame();
}

export function updateScore(player)
{
	if (player == 'Red')
	{
		player1Score += 1;
		if (player1Score != 2)
			imageOn = imageRedPoint;
		else
			imageOn = imageRedWin;
	}
	else
	{
		player2Score += 1;
		if (player2Score != 2)
			imageOn = imageBluePoint;
		else
			imageOn = imageBlueWin;
	}
	document.getElementById('player1-score').textContent = 'Red Cobete: ' + player1Score;
	document.getElementById('player2-score').textContent = 'Blue Cobete: ' + player2Score;
	if (player1Score < 2 && player2Score < 2)
	{
		if (rectangleList == rectangleList1)
		{
			addRectangles2();
			rectangleList = rectangleList2;
		}
		else
		{
			addRectangles3();
			rectangleList = rectangleList3;
		}
	}
	else
		finish = true;

	wait = true;
	cancelAnimationFrame(gameLoopId);
}

function refresh() 
{
	cancelAnimationFrame(gameLoopId);
	gameLoopId = requestAnimationFrame(gameLoop);
}

export function disposeCobeteGame()
{
	window.removeEventListener('keydown', handleKeyDownLocal);
	window.removeEventListener('keyup', handleKeyUpLocal);
}

