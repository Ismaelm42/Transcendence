export class Clock {

	constructor() {
		this.startTime = null;
		this.elapsedTime = 0;
		this.running = false;
		this.interval = null;
	}

	start(chessboard) {

		if (!this.running) {
			
			this.running = true;
			if (chessboard.getTurn() === chessboard.hostColor)
				chessboard.hostTime += chessboard.timeIncrement;
			else
				chessboard.guestTime += chessboard.timeIncrement;

			this.interval = setInterval(() => {

				if (chessboard.gameOver || chessboard.hostTime <= 0 || chessboard.guestTime <= 0) {
					chessboard.gameOver = true;
					console.log("I AM HERE. STOPPED")
					this.stop();
					return;
				}
				if (chessboard.getTurn() === chessboard.hostColor)
					chessboard.hostTime -= 200;
				else
					chessboard.guestTime -= 200;
			}, 200);
		}
	}

	stop() {

		if (this.running) {
			this.running = false;
			this.elapsedTime = 0;
			this.startTime = null;
			if (this.interval !== null) {
				clearInterval(this.interval);
				this.interval = null;
			}
		}
	}
}
