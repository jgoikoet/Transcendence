'use strict'

import { posXR, posYR, posXB, posYB, angleR, angleB, moveBlue, moveRed } from "./cobeteDraw.js"
import { posWepRedX, posWepRedY, weaponROn, posWepBlueX, posWepBlueY, weaponBOn} from "./cobeteWeapon.js"
export let redCobeteCrash = false;
export let blueCobeteCrash = false;
export let redCobeteGoal = false;
export let blueCobeteGoal = false;
export let redWeaponHit = false;
export let blueWeaponHit = false;

export function resetColision()
{
    redCobeteGoal = false;
    blueCobeteGoal = false;
}

function degreesToRadians(grades) {
    return grades * (Math.PI / 180);
}

export function checkColision(rectangleList)
{
    if (moveRed)
        redCobeteCrash = false;
    if (moveBlue)
        blueCobeteCrash = false;

    if (weaponROn == false)
        redWeaponHit = false;
    if (weaponBOn == false)
        blueWeaponHit = false;

    if (blueCobeteCrash == false &&
        posXB -13 < posWepRedX + 4 &&
        posXB + 13 > posWepRedX &&
        posYB - 18 < posWepRedY + 4 &&
        posYB + 20 > posWepRedY)
        {
            blueCobeteCrash = true;
            redWeaponHit = true;
        }

    if (redCobeteCrash == false &&
        posXR -13 < posWepBlueX + 4 &&
        posXR + 13 > posWepBlueX &&
        posYR - 18 < posWepBlueY + 4 &&
        posYR + 20 > posWepBlueY)
        {
            redCobeteCrash = true;
            blueWeaponHit = true;
        }

    if (redWeaponHit == false &&
        (posWepRedX < 0 ||
        posWepRedX > 700 ||
        posWepRedY < 0 ||
        posWepRedY > 600))
            redWeaponHit = true;
    
    if (blueWeaponHit == false &&
        (posWepBlueX < 0 ||
        posWepBlueX > 700 ||
        posWepBlueY < 0 ||
        posWepBlueY > 600))
            blueWeaponHit = true;

    for (let i = 0; i < rectangleList.length; i++)
    {
        if (redWeaponHit == false &&
            posWepRedX < rectangleList[i].x + rectangleList[i].width &&
            posWepRedX + 4 > rectangleList[i].x &&
            posWepRedY < rectangleList[i].y + rectangleList[i].height &&
            posWepRedY + 4 > rectangleList[i].y)
                redWeaponHit = true;

        if (blueWeaponHit == false &&
            posWepBlueX < rectangleList[i].x + rectangleList[i].width &&
            posWepBlueX + 4 > rectangleList[i].x &&
            posWepBlueY < rectangleList[i].y + rectangleList[i].height &&
            posWepBlueY + 4 > rectangleList[i].y)
                blueWeaponHit = true;

        if (redCobeteCrash == false &&
            posXR -13 < rectangleList[i].x + rectangleList[i].width &&
            posXR + 13 > rectangleList[i].x &&
            posYR - 18 < rectangleList[i].y + rectangleList[i].height &&
            posYR + 20 > rectangleList[i].y)
        {
            redCobeteCrash = true;
        }
        if (blueCobeteCrash == false &&
            posXB -13 < rectangleList[i].x + rectangleList[i].width &&
            posXB + 13 > rectangleList[i].x &&
            posYB - 18 < rectangleList[i].y + rectangleList[i].height &&
            posYB + 20 > rectangleList[i].y)
        {
            blueCobeteCrash = true;
        }
    }
    
	if (redCobeteCrash == false &&
        (posXR -13 < 0 ||
		posXR -13 + 26 > 700 ||
		posYR - 18 < 0 ||
		posYR - 18 + 38 > 600))
    {
        redCobeteCrash = true;
    }
    
    if (blueCobeteCrash == false &&
        (posXB -13 < 0 ||
		posXB -13 + 26 > 700 ||
		posYB - 18 < 0 ||
		posYB - 18 + 38 > 600))
    {
        blueCobeteCrash = true;
    }

    if(posXR - 13 > 379 &&
    posXR - 13 < 424 &&
    posYR - 18 > 552 &&
    Math.sin(degreesToRadians(angleR)) > -0.15 &&
    Math.sin(degreesToRadians(angleR)) < 0.15 &&
    Math.cos(degreesToRadians(angleR)) > 0)
        redCobeteGoal = true;

    
    if(posXB - 13 > 249 &&
    posXB - 13 < 294 &&
    posYB - 18 > 552 &&
    Math.sin(degreesToRadians(angleB)) > -0.15 &&
    Math.sin(degreesToRadians(angleB)) < 0.15 &&
    Math.cos(degreesToRadians(angleB)) > 0)
        blueCobeteGoal = true;
}
