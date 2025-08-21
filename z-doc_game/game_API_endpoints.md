### Client-Server API Message Flow

| Phase | Client → Server (Frontend) | Server → Client (Backend) | Description |
| :--- | :--- | :--- | :--- |
| **Connection & Lobby** | `PING` | `PONG` | Heartbeat to check connection latency and health. |
| | `SHOW_GAMES` | `GAMES_LIST` | Client requests a list of available **remote** games to join; server sends it. |
| | `GET_USER` | `USER_INFO` | Client requests data for a specific user (currently used to set match.playerDetails) |
| | | `SERVER_TEST` | Server sends a test message (likely for debugging or connection testing). |
| **Game Setup** | `JOIN_GAME` | `GAME_INIT` | Client requests to enter a game; server responds with initial game data. |
| | `CLIENT_READY` | `READY_STATE` | Client signals it is loaded and ready to play; server confirms or broadcasts the ready state of all players. |
| **Core Game Loop** | `PLAYER_INPUT` | `GAME_STATE` | Client sends a player's action (e.g., move, play card). Server validates it, updates the game state, and broadcasts the new state to all clients. |
| **Game Management** | `PAUSE_GAME` | `GAME_PAUSED` | Client requests to pause the match; server confirms the pause and notifies all clients. |
| | `RESUME_GAME` | `GAME_RESUMED` | Client requests to resume the match; server confirms the resume and notifies all clients. |
| | `GAME_ACTIVITY` | | Client might send a periodic "I'm still here" signal to prevent being flagged as AFK. |
| `INSPECT_GAMES`| `GAMES_DETAILS` | | Client request active game sessions when steping into game-match. |
| **Game Conclusion** | `END_GAME` | `GAME_END` | Server declares the game is over and sends the final result (win/loss/draw). |
| | `RESTART_GAME` | `GAME_INIT` | Client requests to play another round; server sets up a new game and sends the new initial data. |
| **Other** | | `ERROR` | Server sends an error message for any invalid request or game rule violation. |