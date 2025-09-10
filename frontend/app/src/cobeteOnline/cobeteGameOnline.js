'use strict'

import { join, button, start, posXR, posYR, anguloR, posXB, posYB, anguloB,
motorROn, motorBOn, moveRedOn, moveBlueOn, weaponRedX, weaponRedY,
weaponBlueX, weaponBlueY, waitingAction, continueGame, connectSocket, closeSocket,
setWaitingAction } from "./comCobete.js";

import { createMap } from "./cobeteSetMapOnline.js"

let canvas;
let ctx;
let imageOn;
let gameLoopId;
let timeoutId;
let player1Points = 0;
let player2Points = 0;
export let wait;

export const displayName = {
    player1: "Red Cobete",
    player2: "Blue Cobete"
};

let left = false;
let right = false;
let motor = false;

let rectangleList = [];

const imgWaiting = new Image();
imgWaiting.src = 'img/waiting.jpg';

const imgReadyRed = new Image();
imgReadyRed.src = 'img/red_ready.jpg';

const imgReadyBlue = new Image();
imgReadyBlue.src = 'img/blue_ready.jpg';

const imgWaitingPress = new Image();
imgWaitingPress.src = 'img/waiting_press.jpg';

const cobeteR = new Image();
cobeteR.src = 'img/cR.png';

const cobeteRf = new Image();
cobeteRf.src = 'img/cRf.png';

const cobeteB = new Image();
cobeteB.src = 'img/cA.png';

const cobeteBf = new Image();
cobeteBf.src = 'img/cAf.png';

const cobeteRWin1  = new Image();
cobeteRWin1.src = 'img/cRg1.png';

const cobeteRWin2  = new Image();
cobeteRWin2.src = 'img/cRg2.png';

const cobeteBWin1  = new Image();
cobeteBWin1.src = 'img/cAg1.png';

const cobeteBWin2  = new Image();
cobeteBWin2.src = 'img/cAg2.png';

const skull = new Image()
skull.src = 'img/skull.png';

const redOnePoint = new Image()
redOnePoint.src = 'img/red_one_point.jpg';

const blueOnePoint = new Image()
blueOnePoint.src = 'img/blue_one_point.jpg';

const redWinner = new Image()
redWinner.src = 'img/win_red.jpg';

const blueWinner = new Image()
blueWinner.src = 'img/win_blue.jpg';

function handleKeydown(event) {
    if (event.key === 'a' && left === false) {
        button('leftOn');
        left = true;
    }
    if (event.key === 's' && right === false) {
        button('rightOn');
        right = true;
    }
    if (event.key === 'd' && motor === false) {
        button('motorOn');
        motor = true;
    }
    if (event.key === 'f') {
        button('fire');
    }
}

function handleKeyup(event) {
    if (event.key === 'a') {
        button('leftOff');
        left = false;
    }
    if (event.key === 's') {
        button('rightOff');
        right = false;
    }
    if (event.key === 'd') {
        button('motorOff');
        motor = false;
    }
}
export function initializeCobeteGameOnline() {
    const initializeWhenCanvasReady = () => {
        canvas = document.getElementById('pongCanvas');
        if (!canvas) {
            setTimeout(initializeWhenCanvasReady, 100);
            return;
        }
        ctx = canvas.getContext('2d');
        wait = true;
        imageOn = imgWaiting;
		setWaitingAction('waitForPlayer')
		//setTimeout(connectSocket, 4000)
        connectSocket();
		//setTimeout(join, 4000)
        join();
        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('keyup', handleKeyup);
		const h1Element = document.querySelector('#pong-container h1');
		h1Element.textContent = 'COBETE ONLINE MULTIPLAYER';
        gameLoop();
    };
    initializeWhenCanvasReady();
}

function degreesToRadians(grados) {
    return grados * (Math.PI / 180);
}

export function setMap(recivedMap)
{
	rectangleList = createMap(recivedMap);
	wait = false;
	refresh();
}

export function setImage(mesage)
{
	if (mesage === 'red')
		imageOn = imgReadyRed
	else if (mesage === 'blue')
		imageOn = imgReadyBlue
	else if (mesage == 'ready')
	{
		wait = true
		imageOn = imgWaitingPress
	}
	refresh();
}

async function pressSpace()
{
	console.log("PRESS SPACE mierda mucha")
	await new Promise((resolve) => {
		function onKeyPress(event) {
			if (event.code === "Space") {
				document.removeEventListener("keydown", onKeyPress);
				resolve();
			}
		}
		document.addEventListener("keydown", onKeyPress);
		const container = document.getElementById("spa-template-content");
		const observer = new MutationObserver(() => {
			document.removeEventListener("keydown", onKeyPress);
			observer.disconnect();
		});
		observer.observe(container, { childList: true });
	});
}

async function printImages()
{
	ctx.drawImage(imageOn, 0, 0);
}

export async function waiting()
{
	wait = true;
	if (waitingAction == 'waitForPlayer')
	{
		displayName.player2 = 'BLUE COBETE'
		updateScore();
		printImages();
		refresh();
	}
	else if (waitingAction == 'red')
	{
		updateScore();
		imageOn = imgReadyRed;
		printImages();
		await pressSpace();
		start();
		//refresh();
	}
	else if (waitingAction == 'blue')
	{
		updateScore();
		imageOn = imgReadyBlue;
		printImages();
		await pressSpace();
		start();
	}
	else if (waitingAction == 'ready')
	{
		imageOn = imgWaitingPress;
		printImages();
		refresh();
	}
	else if (waitingAction == 'redPoint1')
	{
		player1Points =+ 1;
		updateScore();
		ctx.clearRect(posXR - 18, posYR - 25, 40, 50);
		ctx.drawImage(cobeteRWin1, posXR - 13, posYR - 18);
		drawMap();
	}
	else if (waitingAction == 'redPoint2')
	{
		ctx.clearRect(posXR - 18, posYR - 25, 40, 50);
		ctx.drawImage(cobeteRWin2, posXR - 13, posYR - 18);
		drawMap();
	}
	else if (waitingAction == 'redPoint3')
	{
		imageOn = redOnePoint;
		printImages();
		await pressSpace();
		continueGame();
	}
	else if (waitingAction == 'bluePoint1')
	{
		player2Points =+ 1;
		updateScore();
		ctx.clearRect(posXB - 18, posYB - 25, 40, 50);
		ctx.drawImage(cobeteBWin1, posXB - 13, posYB - 18);
		drawMap();
	}
	else if (waitingAction == 'bluePoint2')
	{
		ctx.clearRect(posXB - 18, posYB - 25, 40, 50);
		ctx.drawImage(cobeteBWin2, posXB - 13, posYB - 18);
		drawMap();
	}
	else if (waitingAction == 'bluePoint3')
	{
		imageOn = blueOnePoint;
		printImages();
		await pressSpace();
		continueGame();
	}
	else if (waitingAction == 'redWinGame')
	{	
		player1Points += 1;
		updateScore();
		imageOn = redWinner;
		printImages();
		player1Points = 0;
		player2Points = 0;
		await pressSpace();
		start();
		updateScore();
	}
	else if (waitingAction == 'blueWinGame')
	{
		player2Points =+ 1;
		updateScore();
		imageOn = blueWinner;
		printImages();
		player1Points = 0;
		player2Points = 0;
		await pressSpace();
		start();
		updateScore();
	}
	else if (waitingAction == 'otherPlayerDisconnect')
	{
		//wait = true
		showMessage('Error: THE OTHER PLAYER HAS DISCONNECTED\n(MAYBE DEAD, MAYBE TOMANDO CAÑAS)', 'red');
		player1Points = 0;
		player2Points = 0;
		imageOn = imgWaiting;
		terminateCobeteGameOnline();
		closeSocket();
	}
	else if (waitingAction == 'duplicated')
	{
		closeSocket();
		showMessage('Error: DUPLICATED USER\nGO AWAY MAMARRACHA', 'red');
		terminateCobeteGameOnline();
	}
}

function gameLoop() {
	
	cleanCanva();
	drawCanva();
	if (wait == true)
		waiting();
	else
		refresh();
}

export function refresh() {
	gameLoopId = requestAnimationFrame(gameLoop);
}

function cleanCanva()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanva()
{
	if (moveRedOn == false)
		drawCobeteR(skull);	
	else if (motorROn)
		drawCobeteR(cobeteRf);
	else
		drawCobeteR(cobeteR);

	if (moveBlueOn == false)
		drawCobeteB(skull);
	else if(motorBOn)
		drawCobeteB(cobeteBf);
	else
		drawCobeteB(cobeteB);
	drawMap();

	if (weaponRedX  != 0)
		drawWeaponRed();
	if (weaponBlueY  != 0)
		drawWeaponBlue();
}

function drawWeaponBlue()
{
	ctx.fillStyle = "white"; 
    ctx.fillRect(weaponBlueX,weaponBlueY, 4, 4);
}

function drawWeaponRed()
{
	ctx.fillStyle = "white"; 
    ctx.fillRect(weaponRedX,weaponRedY, 4, 4);
}

export function drawCobeteB(img) {
    ctx.save();
    ctx.translate(posXB, posYB);
    ctx.rotate(degreesToRadians(anguloB));
    ctx.drawImage(img, -cobeteB.width / 2, -cobeteB.height / 2);
    ctx.restore();
}

export function drawCobeteR(img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(posXR, posYR);
    ctx.rotate(degreesToRadians(anguloR));
    ctx.drawImage(img, -cobeteR.width / 2, -cobeteR.height / 2);
    ctx.restore();
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

export function updateScore()
{
	const scorePlayer1 = document.getElementById('player1-score');
	if (scorePlayer1)
		scorePlayer1.textContent = displayName.player1 + ': ' + player1Points;
	const scorePlayer2 = document.getElementById('player2-score');
	if (scorePlayer2)
		scorePlayer2.textContent = displayName.player2 + ': ' + player2Points;
}

export function terminateCobeteGameOnline() {
	document.removeEventListener('keydown', gameLoop);
	if (gameLoopId)
		cancelAnimationFrame(gameLoopId);
	if (timeoutId)
		clearTimeout(timeoutId);
}

function showMessage(message, color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    const lines = message.split('\n');
     lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index * 40)); 
    });
}

export function disposeCobeteGameOnline() {
	window.removeEventListener('keydown', handleKeydown);
	window.removeEventListener('keyup', handleKeyup);
	closeSocket();
}
