export class GameAI {
    constructor(game) {
        this.intervalId = null;
        this.errorFactor = 0.08;
        this.game = game;
    }
    start() {
        this.intervalId = window.setInterval(() => this.update(), 16);
    }
    stop() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    update() {
        var _a, _b, _c, _d, _e, _f, _g;
        const gameState = this.game.getGameRender().gameState;
        if (!gameState || !this.game.getGameConnection().socket)
            return;
        if (((_a = this.game.getGameLog().config) === null || _a === void 0 ? void 0 : _a.difficulty) === 'easy')
            this.errorFactor = 0.09;
        else if (((_b = this.game.getGameLog().config) === null || _b === void 0 ? void 0 : _b.difficulty) === 'hard')
            this.errorFactor = 0.06;
        const ballY = (_d = (_c = gameState.ball) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0.5;
        const paddleY = (_f = (_e = gameState.paddles.player2) === null || _e === void 0 ? void 0 : _e.y) !== null && _f !== void 0 ? _f : 0.5;
        let up = false, down = false;
        if (ballY < paddleY - this.errorFactor)
            up = true;
        else if (ballY > paddleY + this.errorFactor)
            down = true;
        (_g = this.game.getGameConnection().socket) === null || _g === void 0 ? void 0 : _g.send(JSON.stringify({
            type: 'PLAYER_INPUT',
            input: {
                player: 'player2',
                up,
                down
            }
        }));
    }
}
