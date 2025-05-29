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
// TODO: Implement GameID - join, rematch... 
export interface	GameData
{
	mode: string;
	player1: any;
	player2: any;
	startTime: number;
	config?: GameConfig;
	result?: {
		winner: string;
		loser: string;
		score: [number, number];
	};
	duration?: number;
	tournamentId?: number | null;
}

// Basic game configuration settings, may need to add more later
export interface	GameConfig
{
	scoreLimit: number;
	difficulty: 'easy' | 'medium' | 'hard';
}

