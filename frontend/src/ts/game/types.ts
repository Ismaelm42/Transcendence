/**
 * types.ts file is to have interface type (if needed)
 */

// Game state refers to the current values/positions of the game elements
export interface    GameState
{
	ball?: { x: number; y: number };
	paddles: {
		player1?: { y: number };
		player2?: { y: number };
	};
	scores: [number, number];
}

// GameData refers later to gameLogs on backend
export interface	GameData
{
	id: string;
	mode: string;
	playerDetails: {
		player1?: GamePlayer | null;
		player2?: GamePlayer | null;
	};
	startTime: number;
	config?: GameConfig;
	result?: {
		winner: string;
		loser: string;
		score: [number, number];
		endReason: string;
	};
	duration?: number;
	tournamentId?: number | null;
	readyState: boolean;
}

// Basic game configuration settings, may need to add more later
export interface	GameConfig
{
	scoreLimit: number;
	difficulty: 'easy' | 'medium' | 'hard';
}

// Player data object, not using it much in front yet, 
// but keeping it similar to backend just in case
export interface GamePlayer
{
	id: number;
	username: string;
	tournamentUsername: string;
	email: string;
	avatarPath: string;
}
