/**
 * physics.js file: movement, collisions and related functions
 */

// Function for restoring the ball in the middle and towards scored-against player
export function resetBall(scoringDirection)
{
	const	centerX = 0.5; 
	const	centerY = 0.5;
	const	speed = 0.20;
	const	angleVariance = (Math.random() * 0.1) - 0.05;
	let		direction;

	if (scoringDirection === undefined)
		direction = Math.random() > 0.5 ? 1 : -1;
	else
		direction = scoringDirection === 'right' ? 1 : -1;
	
	this.state.ball = { 
		x: centerX, 
		y: centerY, 
		dx: (speed * this.ballSpeedMultiplier) * direction, 
		dy: (0.05 + angleVariance) * this.ballSpeedMultiplier
	};	
}

function clampAngle(angle, minDeg = 15, maxDeg = 165)
{
	const min = (minDeg * Math.PI) / 180;
	const max = (maxDeg * Math.PI) / 180;
	if (angle > Math.PI)
		angle -= 2 * Math.PI; // Normalize to [-PI, PI]
	if (angle < 0)
		angle = -angle; // Only need to clamp absolute value
	if (angle < min)
		angle = min;
	if (angle > max)
		angle = max;
	return (angle);
}

// Main function to check for paddle-ball collisions
// TODO: Reduce function size by getting some calculations out by using auxiliary functions
export function checkPaddleCollision(playerNumber)
{
	// Get paddle and ball position from the game state
	const paddle = this.state.paddles[playerNumber];
	const ball = this.state.ball;
	// Set paddle and ball dimensions relative to canvas size, using relative % units
	const paddleWidth = 0.025;
	const paddleHeight = 0.15;
	const ballRadius = 0.015;

	// Calculate paddel velocity (direction and speed), by storing last position before comparing to actual one
	if (!paddle.lastY)
		paddle.lastY = paddle.y;
	const paddleVelocity = paddle.y - paddle.lastY;
	paddle.lastY = paddle.y;
	
	// Calculate paddle position and dimensions (edges), again with relative units to canvas size
	const paddleX = playerNumber === 'player1' ? 0.03 : (0.97 - paddleWidth);
	const paddleTop = paddle.y - (paddleHeight / 2);
	const paddleBottom = paddle.y + (paddleHeight / 2);
	const collisionEdgeX = playerNumber === 'player1' ? paddleX + paddleWidth : paddleX;
	
	// Checks if ball is within paddle's vertical range and at the collision edge, this ends in booleans true/false
	const ballInYRange = (ball.y >= paddleTop) && (ball.y <= paddleBottom);
	let ballAtCollisionX = false;
	if (playerNumber === 'player1')
		ballAtCollisionX = ((ball.x - ballRadius) <= collisionEdgeX) && (ball.x >= paddleX);
	else
		ballAtCollisionX = ((ball.x + ballRadius) >= collisionEdgeX) && (ball.x <= (paddleX + paddleWidth));
	
	// If both bolean variables are true, then check for collision
	if (ballAtCollisionX && ballInYRange)
	{
		// Position adjustment to prevent penetration - adding a small offset
		if (playerNumber === 'player1')
			this.state.ball.x = collisionEdgeX + ballRadius + 0.001;
		else
			this.state.ball.x = collisionEdgeX - ballRadius - 0.001;
			
		// ATARI-STYLE BOUNCE PHYSICS + Ball Increasing Speed:
		// 1. Calculate relative position on paddle (from -1 at top to +1 at bottom)
		const hitPosition = (ball.y - paddle.y) / (paddleHeight / 2);
		// 2. Base angle change - more pronounced angle when hitting near the edges
		let angleEffect = hitPosition * 0.3;
		// 3. Pddle movement effect - if paddle is moving, it influences the ball direction
		const paddleMovementEffect = paddleVelocity * 3.0;
		angleEffect += paddleMovementEffect;
		// 4. Reverse horizontal direction with speed increase  
		this.state.ball.dx *= -1;
		// 5. Apply the combined angle effect
		this.state.ball.dy += angleEffect;
		// 6. Edge cases - hitting extreme top/bottom of paddle creates extreme angles
		if (Math.abs(hitPosition) > 0.8)
			this.state.ball.dy += (hitPosition > 0 ? 0.1 : -0.1);
		// 7. Increase ball speed
		let	speed = Math.sqrt(this.state.ball.dx ** 2 + this.state.ball.dy ** 2) * this.ballSpeedIncrease;
		// 8. Cap maximum speed to prevent the game from becoming unplayable
		if (speed > this.ballMaxSpeed)
			speed = this.ballMaxSpeed;
		// 9. Recalculate dx/dy with new speed but same direction
		const angle = Math.atan2(this.state.ball.dy, this.state.ball.dx);
		let newDx = Math.cos(angle) * speed;
		let newDy = Math.sin(angle) * speed;
		// 10. Prevent dx from being too small (e.g., < 0.1 * speed)
		const minDx = 0.1 * speed;
		if (Math.abs(newDx) < minDx)
		{
			newDx = (newDx < 0 ? -1 : 1) * minDx;
			newDy = (newDy < 0 ? -1 : 1) * Math.sqrt(speed ** 2 - minDx ** 2);
		}
		this.state.ball.dx = newDx;
		this.state.ball.dy = newDy;
	}
}
