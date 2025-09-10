'use strict'

import { setImage, setMap, waiting, displayName, wait } from "./cobeteGameOnline.js";
export let socket;
export let posXR;
export let posYR;
export let anguloR;
export let posXB;
export let posYB;
export let anguloB;
export let weaponRedX;
export let weaponRedY;
export let weaponBlueX;
export let weaponBlueY;
export let motorROn = false;
export let motorBOn = false;
export let moveRedOn = true;
export let moveBlueOn = true;
export let waitingAction = 'waitForPlayer';

export function setWaitingAction(state)
{
    waitingAction = state
}

export function connectSocket()
{
    socket = new WebSocket(`wss://${window.location.hostname}:49998/multiplayer_cobete/ws/game/`);
	socket.onopen = function(e) {};
    socket.onmessage = function(event) {
        const msg = JSON.parse(event.data);
        console.log ("Server wandema:", msg.type);
        console.log ("action:", msg.action);
		if (msg.type == 'refresh')
		{
			posXR = msg.player1X;
			posYR = msg.player1Y;
			anguloR = msg.player1Angle;
			posXB = msg.player2X;
			posYB = msg.player2Y;
			anguloB = msg.player2Angle;
			motorROn = msg.player1Motor;
			motorBOn = msg.player2Motor;
			moveRedOn = msg.player1Move;
			moveBlueOn = msg.player2Move;
			weaponRedX = msg.player1WeaponX;
			weaponRedY = msg.player1WeaponY;
			weaponBlueX = msg.player2WeaponX;
			weaponBlueY = msg.player2WeaponY;
		}
        else if(msg.type == 'waiting')
        {
            if (msg.name)
                displayName.player1 = msg.name;
            else if (msg.player1Name){
                displayName.player1 = msg.player1Name;
                displayName.player2 = msg.player2Name;
            }
            waitingAction = msg.action;
            if (msg.action == 'waitForPlayer' && wait == false)
                return;
            waiting(msg.name);
        }
        else if(msg.type == 'press_to_start')
        {
            setImage(msg.color)
        }
        else if (msg.type == 'map')
            setMap(msg);
    };
    socket.onclose = function(event) { console.log("WebSocket cobete cerrado") };
    socket.onerror = function(error) {};
}

export async function button(b)
{
    socket.send(JSON.stringify({
        type: 'move',
        action: b
    }));
}

export async function start()
{
    socket.send(JSON.stringify({
        type: 'start',
        token: localStorage.getItem('accessToken')        
    }));
}

export async function continueGame()
{
    socket.send(JSON.stringify({
        type: 'continueGame',
    }));
}

export function join() {

    console.log("Entra a join");
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "join_game",
            token: localStorage.getItem('accessToken')            
        }));
    } else {
        setTimeout(join, 100); 
    }
}

export function closeSocket() {
	if (socket && socket.readyState === WebSocket.OPEN)
		socket.close();
}
