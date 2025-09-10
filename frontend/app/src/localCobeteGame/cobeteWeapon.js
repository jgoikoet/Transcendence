'use strict'

import { ctx } from "./cobeteGame.js"
import { posXR, posYR, angleR, posXB, posYB, angleB, degreesToRadians } from "./cobeteDraw.js"
import { redWeaponHit, blueWeaponHit } from "./cobeteCheckColision.js"

let speed = 10;
let speedRedX;
let speedRedY;
let speedBlueX;
let speedBlueY;

export let posWepRedX;
export let posWepRedY;
export let posWepBlueX;
export let posWepBlueY;
export let weaponROn = false;
export let weaponBOn = false;

export function weaponR()
{
    if (weaponROn == false)
    {
        weaponROn = true;
        posWepRedX = posXR;
        posWepRedY = posYR;
        speedRedX = speed * (Math.sin(degreesToRadians(angleR)));
        speedRedY = speed * (- Math.cos(degreesToRadians(angleR)));
    }
}

export function drawWeaponR()
{
    if (redWeaponHit == false)
    {
        ctx.fillStyle = "white"; 
        ctx.fillRect(posWepRedX, posWepRedY, 4, 4);
        posWepRedX += speedRedX;
        posWepRedY += speedRedY;
    }
    else
    {
        weaponROn = false;
        posWepRedX = 0;
        posWepRedY = 0;
        speedRedX = 0;
        speedRedY = 0;
    }
}

export function weaponB()
{
    if (weaponBOn == false)
    {
        weaponBOn = true;
        posWepBlueX = posXB;
        posWepBlueY = posYB;
        speedBlueX = speed * (Math.sin(degreesToRadians(angleB)));
        speedBlueY = speed * (- Math.cos(degreesToRadians(angleB)));
    }
}

export function drawWeaponB()
{
    if (blueWeaponHit == false)
    {
        ctx.fillStyle = "white"; 
        ctx.fillRect(posWepBlueX, posWepBlueY, 4, 4);1
        posWepBlueX += speedBlueX;
        posWepBlueY += speedBlueY;
    }
    else
    {
        weaponBOn = false;
        posWepBlueX = 0;
        posWepBlueY = 0;
        speedBlueX = 0;
        speedBlueY = 0;
    }
}
