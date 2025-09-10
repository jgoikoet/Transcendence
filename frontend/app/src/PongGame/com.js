'use strict'

import { updateScore, setWaitingState, showMessage, terminateGame, refresh } from "./game4.js";

const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;

export let game_state = "waiting";
export let screen_message = "WAITING ANOTHER PLAYER TO JOIN THE GAME";
export let color = '#00FF00';
export let ballx;
export let bally;
export let Player1Y;
export let Player2Y;
export let speedx;
export let speedy;
export let Player1Points = 0;
export let Player2Points = 0;
export let Player1Name  = "Player 1";
export let Player2Name  = "Player 2";
export let Player1Id  = "1";
export let Player2Id  = "1";
export let serverTime;
export let gameType = 'INDIVIDUAL';
let socket;
let gameNotBlocked = true;

export function setGameState(state)
{
    game_state = state;
}

export function setGameNotBlocked(state)
{
    gameNotBlocked = state
}

export function resetGame()
{
    game_state = "waiting";
    Player1Points = 0;
    Player2Points = 0;
}

export function connectSocket()
{
    const contenedor = document.getElementById("spa-template-content");
	const observer = new MutationObserver(() => {

		if (socket.readyState === WebSocket.OPEN)
            socket.close();
        terminateGame();
        game_state = 'None'
		observer.disconnect();
	});
	observer.observe(contenedor, { childList: true });
    

    socket = new WebSocket(`${baseUrl.replace('http', 'ws')}/multiplayer/ws/game/`);

    socket.onopen = function(e) {
        const gameType = localStorage.getItem("tournament") || "INDIVIDUAL";
        const gameId = localStorage.getItem("tournament_id") || "0";
    };
    
    socket.onmessage = function(event) {
        const mensaje = JSON.parse(event.data);

        if(mensaje.type == "game_state_update")
        {
            ballx = mensaje.ballX;
            bally = mensaje.ballY;
            Player1Y = mensaje.player1Y;
            Player2Y = mensaje.player2Y;
            serverTime = mensaje.time;
            speedx = mensaje.speedX;
            speedy = mensaje.speedY;
        }
        else if (mensaje.type =="match_found")
        {
            gameType = mensaje.game_type;
            setWaitingState('pressToStart');
            refresh();
        }
        else if (mensaje.type == "waiting_other_press")
        {
            setWaitingState('waitingOtherPress');
        }
        else if (mensaje.type == "start_playing")
        {
            setWaitingState('None');
            game_state = 'playing';
        }
        else if (mensaje.type =="new_message")
        {
            game_state = "waiting";
            screen_message = mensaje.message;
            color = mensaje.color;
            showMessage(screen_message, color);
        }
        else if (mensaje.type =="finish")
        {
            screen_message = mensaje.message;
            color = mensaje.color;
            Player1Points = mensaje.player1Points;
            Player2Points = mensaje.player2Points;
            if (mensaje.game_type === 'INDIVIDUAL'|| mensaje.game_type === 'FRIENDS')
            {
                if (socket.readyState === WebSocket.OPEN)
                    socket.close();
                game_state = "waiting";
                setWaitingState('finished'); 
            }
            else if (mensaje.game_type === 'SEMIFINAL')
            {
                game_state = "waiting";
                setWaitingState('finished_semifinal'); 
            }
        }
        else if (mensaje.type == 'finish_tournament')
        {
            if (socket.readyState === WebSocket.OPEN)
                socket.close();
            screen_message = 'THE WINNER IS: ' + mensaje.winner_name;

            if (mensaje.winner_player == 'player1')
                Player1Points = 3;
            else
                Player2Points = 3;

            if (mensaje.message == 'WINNER')
                color = 'green';
            else
                color = 'red';
            game_state = "waiting";

            setWaitingState('finished_final'); 
        }
        else if (mensaje.type =="disconnect")
        {
            console.log (mensaje.game_type);
            gameNotBlocked = false;
            screen_message = mensaje.message;
            color = mensaje.color;
            game_state = "waiting";
            if (mensaje.game_type === 'INDIVIDUAL')
            {
                if (socket.readyState === WebSocket.OPEN)
                    socket.close();
                gameNotBlocked = true;
                setWaitingState('disconnect');
            }
            else if (mensaje.game_type === 'FRIENDS')
            {
                if (socket.readyState === WebSocket.OPEN)
                    socket.close();
                gameNotBlocked = true;
                setWaitingState('disconnect_friend');
            }
            else if (mensaje.game_type === 'SEMIFINAL')
                setWaitingState('disconnect_semifinal');
            else if (mensaje.game_type === 'destroy')
            {
                if (socket.readyState === WebSocket.OPEN)
                    socket.close();
                gameNotBlocked = true;
                setWaitingState('disconnect');
            }
        }
        else if (mensaje.type =="update")
        {
            Player1Points = mensaje.player1Points;
            Player2Points = mensaje.player2Points;
            updateScore();
        }
        else if (mensaje.type =="duplicated")
        {   if (socket.readyState === WebSocket.OPEN)
                socket.close();
            screen_message = mensaje.message;
            color = mensaje.color;
            game_state = "waiting";
            setWaitingState('duplicated');
        }
        else if(mensaje.type == "setName")
        {
            Player1Points = 0;
            Player2Points = 0;
            Player1Name = mensaje.player1DisplayName;
            Player2Name = mensaje.player2DisplayName;
            Player1Id = mensaje.player1Id;
            Player2Id = mensaje.player2Id;        
    
            document.getElementById('player1-avatar').src = `${baseUrl}/user_management/api/users/avatar/${Player1Id}/`;
            document.getElementById('player1-name-score').textContent = Player1Name + ": " + Player1Points;
            
            document.getElementById('player2-avatar').src = `${baseUrl}/user_management/api/users/avatar/${Player2Id}/`;
            document.getElementById('player2-name-score').textContent = Player2Name + ": " + Player2Points;        
        }
    };
    
    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`PONG Conectión closed ok: ${event.code}, reason: ${event.reason}`);
        } else {
            console.log("PONG Conectión finished");
        }
    };
    
    socket.onerror = function(error) {
        console.log("Error en el WebSocket", error);
    };
}

export async function button(b)
{
    socket.send(JSON.stringify({
        type: 'move',
        action: b
    }));

}

export async function spacePressed()
{
    socket.send(JSON.stringify({
        type: 'spacePressed',
    }));

}

export async function join()
{
    const gameType = localStorage.getItem("tournament") || "INDIVIDUAL";
    const gameId = localStorage.getItem("tournament_id") || "0";

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
                            type: "join_game",
                            game_type: gameType,
                            game_id: gameId,
                            token: localStorage.getItem('accessToken')
                        }));
    }
    else {
        setTimeout(join, 100);  // Try reconnect after 100ms
    }

    document.getElementById('player1-avatar').src = 'src/PongGame/images_pong/image_two_online_intro_1.jpg';
    document.getElementById('player1-name-score').textContent = "Pairing...";    
    document.getElementById('player2-avatar').src = 'src/PongGame/images_pong/image_two_online_intro_1.jpg';
    document.getElementById('player2-name-score').textContent = "Pairing...";
                                                                    
}

export function closeSocket() {
	if (socket && socket.readyState === WebSocket.OPEN)
		socket.close();
}       