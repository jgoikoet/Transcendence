'use strict'

import { player1Score, player2Score, ctx, canvas, rotateLeftR, rotateRightR, rotateLeftA, rotateRightA, fireR, fireB, updateScore } from "./cobeteGame.js"
import { redCobeteCrash, blueCobeteCrash, redCobeteGoal, blueCobeteGoal, resetColision } from "./cobeteCheckColision.js"
export let angleR = 0;
export let angleB = 0;
export let posXR = 40;
export let posYR = 570;
export let posXB = 660;
export let posYB = 570;
export let moveRed = true;
export let moveBlue = true;

let speedXR = 0;
let speedYR = 0;
let speedXB = 0; 
let speedYB = 0;
let speedIncrement = 0.1;
let resetTimeR = 0;
let resetTimeB = 0;

const cobeteR = new Image();
cobeteR.src = 'src/localCobeteGame/images/cR.png';
const cobeteRf = new Image();
cobeteRf.src = 'src/localCobeteGame/images/cRf.png';

const CobeteRGoal1  = new Image();
CobeteRGoal1.src = 'src/localCobeteGame/images/cRg1.png';
const CobeteRGoal2  = new Image();
CobeteRGoal2.src = 'src/localCobeteGame/images/cRg2.png';

const cobeteA = new Image();
cobeteA.src = 'src/localCobeteGame/images/cA.png'; 
const cobeteAf = new Image();
cobeteAf.src = 'src/localCobeteGame/images/cAf.png';

const CobeteBGoal1  = new Image();
CobeteBGoal1.src = 'src/localCobeteGame/images/cAg1.png';
const CobeteBGoal2  = new Image();
CobeteBGoal2.src = 'src/localCobeteGame/images/cAg2.png';

const skull = new Image();
skull.src = 'src/localCobeteGame/images/skull.png';

export function degreesToRadians(grades) {
    return grades * (Math.PI / 180);
}

export function resetGame(){
    moveRed = true;
    moveBlue = true;
    resetTimeR = 0;
    resetTimeB = 0;
    posXR = 40;
    posYR = 570;
    angleR = 0;
    posXB = 660;
    posYB = 570;
    angleB = 0;
    speedXR = 0;
    speedYR = 0;
    speedXB = 0; 
    speedYB = 0;
}

export function rotateMove()
{
    if (rotateLeftR && moveRed) 
        angleR -= 5; 
    if (rotateRightR && moveRed) 
        angleR += 5;
    if (rotateLeftA && moveBlue) 
        angleB -= 5;
    if (rotateRightA && moveBlue)
        angleB += 5; 

    if (fireR && moveRed)
    {
        speedXR += (Math.sin(degreesToRadians(angleR))) * speedIncrement;
        speedYR += (- Math.cos(degreesToRadians(angleR))) * speedIncrement;
    }

    if (fireB && moveBlue)
    {
        speedXB += (Math.sin(degreesToRadians(angleB))) * speedIncrement;
        speedYB += (- Math.cos(degreesToRadians(angleB))) * speedIncrement;
    }
    posXR += speedXR;
    posYR += speedYR;
    posXB += speedXB;
    posYB += speedYB;
}

function resetRedCobete()
{
    if (resetTimeR < 200)
    {
        ctx.drawImage(skull, posXR - 13, posYR -18);
        resetTimeR += 1;
        return;
    }
    moveRed = true;
    resetTimeR = 0;
    posXR = 40;
    posYR = 570;
    angleR = 0;    
}

function redCobeteWin()
{
    moveRed = false;
    moveBlue = false;
    speedXR = 0;
    speedYR = 0;
    speedXB = 0;
    speedYB = 0;
    if (resetTimeR < 50)
    {
        ctx.drawImage(CobeteRGoal1, posXR - 13, posYR -18);
        resetTimeR += 1;
        return;
    }
    else if(resetTimeR < 100)
    {
        ctx.drawImage(CobeteRGoal2, posXR - 13, posYR -18);
        resetTimeR += 1;
        return;
    }
    updateScore('Red');
    resetColision();
    resetTimeR = 0;
    posXR = 40;
    posYR = 570;
    angleR = 0;
    posXB = 660;
    posYB = 570;
    angleB = 0;
    if (player1Score < 2 && player2Score < 2)
    {
        moveRed = true;
        moveBlue = true;
    }
}

function resetBlueCobete()
{
    if (resetTimeB < 200)
    {
        ctx.drawImage(skull, posXB - 13, posYB -18);
        resetTimeB += 1;
        return;
    }
    moveBlue = true;
    resetTimeB = 0;
    posXB = 660;
    posYB = 570;
    angleB = 0;
    
}

function blueCobeteWin()
{
    moveRed = false;
    moveBlue = false;
    speedXR = 0;
    speedYR = 0;
    speedXB = 0;
    speedYB = 0;
    if (resetTimeB < 50)
    {
        ctx.drawImage(CobeteBGoal1, posXB - 13, posYB -18);
        resetTimeB += 1;
        return;
    }
    else if(resetTimeB < 100)
    {
        ctx.drawImage(CobeteBGoal2, posXB - 13, posYB -18);
        resetTimeB += 1;
        return;
    }
    updateScore('Blue');
    resetColision();
    resetTimeB = 0;
    posXB = 660;
    posYB = 570;
    angleB = 0;
    posXR = 40;
    posYR = 570;
    angleR = 0;
    if (player1Score < 2 && player2Score < 2)
    {
        moveRed = true;
        moveBlue = true;
    }
}

export function drawCobeteR() {
    if (redCobeteCrash)
    {
        moveRed = false
        speedXR = 0;
        speedYR = 0;
        angleR = 90;
        resetRedCobete();
        return;
    }
    else if (redCobeteGoal)
    {
        redCobeteWin();
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(posXR, posYR);
    ctx.rotate(degreesToRadians(angleR));
    ctx.drawImage(cobeteR, -cobeteR.width / 2, -cobeteR.height / 2);
    ctx.restore();
}

export function drawCobeteRFire() {

    if (redCobeteCrash)
    {
        moveRed = false
        speedXR = 0;
        speedYR = 0;
        resetRedCobete();
        return;
    }
    else if (redCobeteGoal)
    {
        redCobeteWin();
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(posXR, posYR);
    ctx.rotate(degreesToRadians(angleR));
    ctx.drawImage(cobeteRf, -cobeteRf.width / 2, -cobeteRf.height / 2);
    ctx.restore();
}

export function drawCobeteB() {
    
    if (blueCobeteCrash)
    {
        moveBlue = false
        speedXB = 0;
        speedYB = 0;
        angleB = 90;
        resetBlueCobete();
        return;
    }
    else if (blueCobeteGoal)
    {
        blueCobeteWin();
        return;
    }
    ctx.save();
    ctx.translate(posXB, posYB);
    ctx.rotate(degreesToRadians(angleB));
    ctx.drawImage(cobeteA, -cobeteA.width / 2, -cobeteA.height / 2);
    ctx.restore();
}

export function drawCobeteBFire() {

    if (blueCobeteCrash)
    {
        moveBlue = false
        speedXB = 0;
        speedYB = 0;
        resetBlueCobete();
        return;
    }
    else if (blueCobeteGoal)
    {
        blueCobeteWin();
        return;
    }
    ctx.save();
    ctx.translate(posXB, posYB);
    ctx.rotate(degreesToRadians(angleB));
    ctx.drawImage(cobeteAf, -cobeteAf.width / 2, -cobeteAf.height / 2);
    ctx.restore();
}
