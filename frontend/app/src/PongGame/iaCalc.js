'use strict'

let canvas;
let coord;


export function calculation(ballX, ballY, ballSpeedX, ballSpeedY)
{
    canvas = document.getElementById('pongCanvas');

	while(true){
		while (ballX > 10 && ballX < canvas.width - 10 && ballY > 0 + 10 && ballY + 10 < canvas.height)
		{
			ballX += ballSpeedX;
			ballY += ballSpeedY;
		}
		if (ballX >= canvas.width - 10)
		{
			coord = [ballX, ballY];
			return coord;
		}
		if(ballX <= 10)
		{
			ballSpeedX = -ballSpeedX;
			ballX += ballSpeedX;
			ballY += ballSpeedY;
			if(ballX <= 10)
				ballX = 11;
		}
		if (ballY - 10 <= 0 || ballY + 10 >= canvas.height)
		{
			ballSpeedY = -ballSpeedY;
			ballX += ballSpeedX;
			ballY += ballSpeedY;
		}
	}
}