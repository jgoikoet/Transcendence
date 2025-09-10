'use strict'

import { join, button, game_state, ballx, bally, Player1Y, Player2Y,
screen_message, color, Player1Points, Player2Points, serverTime,
speedx, speedy, Player1Name, Player2Name, Player1Id, Player2Id, closeSocket,
spacePressed, connectSocket, resetGame,setGameNotBlocked, gameType, setGameState } from "./com.js";

import { rejectMatch } from '../User_Management/Chat.js'

const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;

//Game variables
let canvas;
let ctx;
let player1Up, player1Down;
let player2Up, player2Down;
let gameLoopId;
let timeoutId;
let player1Score;
let player2Score;
let latency;
let fX;
let fY;
let waiting_state = "none";

export function onlineInitializeGameFriends() {
	localStorage.setItem("tournament", "FRIENDS");
	onlineInitializeGame();
}

export function onlineInitializeGameIndividual() {
	localStorage.setItem("tournament", "INDIVIDUAL");
    localStorage.setItem("tournament_id", "0");
	onlineInitializeGame();
}

export function onlineInitializeGameSemifinal() {
	localStorage.setItem("tournament", "SEMIFINAL");
    localStorage.setItem("tournament_id", "0");
	onlineInitializeGame();
}

const imageIntro1 = new Image();
imageIntro1.src = 'src/PongGame/images_pong/image_two_online_intro_1.jpg';

const imageIntro2 = new Image();
imageIntro2.src = 'src/PongGame/images_pong/image_two_online_intro_2.jpg';


const imagepressToStart = new Image();
imagepressToStart.src = 'src/PongGame/images_pong/image_two_online_start.jpg';

const imageOtherPressToStart = new Image();
imageOtherPressToStart.src = 'src/PongGame/images_pong/image_two_online_other_press.jpg';

const imagePressToStartFinal = new Image();
imagePressToStartFinal.src = 'src/PongGame/images_pong/image_press_start_final.jpg';

const imagePressToStartOtherFinal = new Image();
imagePressToStartOtherFinal.src = 'src/PongGame/images_pong/image_press_start_other_final.jpg';

const imageTournamentWinner = new Image();
imageTournamentWinner.src = 'src/PongGame/images_pong/image_tournament_winner.jpg';

function onlineInitializeGame() {
	const cancelButton = document.getElementById('cancel-button-onlineFriends');
	if (window.location.pathname === "/OnlineFriends")
	{
		cancelButton.style.display = '';
		const recipient = Number(localStorage.getItem('idToFind'));
		cancelButton.addEventListener('click', () => rejectMatch(recipient));
	}
	else
		cancelButton.style.display = 'none';

	canvas = document.getElementById('pongCanvas');
	ctx = canvas.getContext('2d');
	player1Up = false;
	player1Down = false;
	player2Up = false;
	player2Down = false;
	resetGame();
	document.addEventListener('keydown', handleKeyDownPongOnline);
    document.addEventListener('keyup', handleKeyUpPongOnline);
	const h1Element = document.querySelector('#pong-container h1');
	h1Element.textContent = localStorage.getItem("tournament");

	if (localStorage.getItem("tournament") === "SEMIFINAL")
		{
			const h1Element = document.querySelector('#pong-container h1');
			h1Element.textContent = "Tournament";
		}
	

	waiting_state = "waiting_player";

	connectSocket();
	join();
	updateScore();
    gameLoop();
}

async function waitingPlayer()
{
	ctx.drawImage(imageIntro1, 0, 0);
	await new Promise((resolve) => setTimeout(resolve, 150));
	ctx.drawImage(imageIntro2, 0, 0);
	await new Promise((resolve) => setTimeout(resolve, 150));
}

export function setWaitingState(state)	
{
	waiting_state = state;
}

async function pressSpace()
{
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
			console.log("Se quita el listener PONG ONLINE");
			observer.disconnect();
		});
		observer.observe(contenedor, { childList: true });
	});
}

export async function waiting()
{
	if (waiting_state === 'waiting_player')
		await waitingPlayer();
	else if (waiting_state === 'pressToStart')
	{
		if (gameType === 'FINAL')
			ctx.drawImage(imagePressToStartFinal, 0, 0);
		else
			ctx.drawImage(imagepressToStart, 0, 0);
		await pressSpace();
		spacePressed();
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	else if (waiting_state === 'waitingOtherPress')
	{
		if (gameType === 'FINAL')
			ctx.drawImage(imagePressToStartOtherFinal, 0, 0);
		else
			ctx.drawImage(imageOtherPressToStart, 0, 0);
	}
	else if (waiting_state === 'finished')
	{
		await new Promise((resolve) => setTimeout(resolve, 150));
		updateScore();
        showMessage(screen_message, color);
		await pressSpace();
		terminateGame();
		onlineInitializeGame();
	}
	else if (waiting_state === 'finished_semifinal')
	{
		await new Promise((resolve) => setTimeout(resolve, 150));
		updateScore();
		if (color === 'red')
        	showMessage("YOU LOSE!\nSTAY TUNED IF YOU WANNA KNOW THE WINNER", color);
		else
			showMessage("YOU WIN!\nWAITING FOR THE OTHER SEMIFINAL FINISH TO PLAY FINAL", color);
		//await pressSpace();
		terminateGame();
	}
	else if (waiting_state === 'finished_final')
	{
		await new Promise((resolve) => setTimeout(resolve, 150));
		updateScore();
		if (color === 'red')
        	showMessage(screen_message, 'palegreen');
		else
			ctx.drawImage(imageTournamentWinner, 0, 0);
		//await pressSpace();
		terminateGame();
	}
	else if (waiting_state === 'disconnect')
	{ 
		console.log("Disconnect-----")
		await new Promise((resolve) => setTimeout(resolve, 150));
		showMessage(screen_message, color);
		resetGame();
		terminateGame();
	}
	else if (waiting_state === 'disconnect_friend')
	{
		await new Promise((resolve) => setTimeout(resolve, 150));
		showMessage(screen_message, color);
		await new Promise((resolve) => setTimeout(resolve, 2800));
		showMessage('MAYBE HES NOT AS GOOD A FRIEND AS YOU THOUGHT', 'red');
		resetGame();
		terminateGame();
		waiting_state = 'None';
	}
	else if (waiting_state === 'disconnect_semifinal')
	{
		await new Promise((resolve) => setTimeout(resolve, 150));
		showMessage(screen_message, color);
		await new Promise((resolve) => setTimeout(resolve, 2800));
		showMessage('YOU WIN!, PREPARE FOR FINAL!', 'palegreen');
		await new Promise((resolve) => setTimeout(resolve, 1000));
		resetGame();
		terminateGame();
		setGameNotBlocked(true)
	}
	else if (waiting_state === 'duplicated')
	{
		console.log("DUPLICATEEEE-------")
		await new Promise((resolve) => setTimeout(resolve, 150));
		showMessage(screen_message, color);
	}
	else
		console.log("MIERDA");
	refresh();
}

function handleKeyDownPongOnline(event)
{
	if (event.key === 'w' && player1Up == false)
	{
		button("upOn");
		player1Up = true;
	}
	if (event.key === 's' && player1Down == false)
	{
		button("downOn");
		player1Down = true;
	} 
}

function handleKeyUpPongOnline(event)
{
	if (event.key === 'w')
	{
		button("upOff");
		player1Up = false;
	}
	if (event.key === 's')
	{
		button("downOff");
		player1Down = false;
	}	
}

function gameLoop() {
	
	if(game_state == "playing")
	{
		cleanCanva();
		drawCanva();
		refresh();
	}
	else if (game_state == "waiting"){
		waiting();
	}	
}

function drawRect(x, y) {
	ctx.fillStyle = 'white';
	ctx.fillRect(x, y, 10, 100);
}

function drawBall() {
	ctx.fillStyle = 'yellow';
	ctx.beginPath();
	
	latency = (Date.now() / 1000) - serverTime;
	fX = ballx + speedx * latency;
	fY = bally + speedy * latency;
	
	ctx.arc(fX, fY, 10, 0, 6.28318);
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
	drawRect(0, Player1Y);
	drawRect(590, Player2Y);
	drawDashedLine();
	drawBall();
}

export function updateScore() {
	const avatar1 = document.getElementById('player1-avatar');
	if (avatar1)
		avatar1.src = `${baseUrl}/user_management/api/users/avatar/${Player1Id}/`;
	const player1NameAndScore = document.getElementById('player1-name-score');
	if (player1NameAndScore)
			player1NameAndScore.textContent = Player1Name + ": " + Player1Points;
	const avatar2 = document.getElementById('player2-avatar');
	if (avatar2)
		avatar2.src = `${baseUrl}/user_management/api/users/avatar/${Player2Id}/`;
	const player2NameAndScore = document.getElementById('player2-name-score');
	if (player2NameAndScore)
		player2NameAndScore.textContent = Player2Name + ": " + Player2Points;
}

export function refresh() {
	if (gameLoopId)
		cancelAnimationFrame(gameLoopId);
	gameLoopId = requestAnimationFrame(gameLoop);
}

export function terminateGame() {
	document.removeEventListener('keydown', gameLoop);

	if (gameLoopId)
		cancelAnimationFrame(gameLoopId);
	if (timeoutId)
		clearTimeout(timeoutId);
}

export function showMessage(message, color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = 'bold 17px Arial';
    ctx.textAlign = 'center';

    const lines = message.split('\n');
    
    lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index * 40));
    });
}


export function disposePongOnline()
{
	document.removeEventListener('keydown', handleKeyDownPongOnline);
	document.removeEventListener('keyup', handleKeyUpPongOnline);
	closeSocket();
}
