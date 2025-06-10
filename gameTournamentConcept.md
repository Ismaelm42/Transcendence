- **Tournament Step**:
    - Handles tournament config, player assignment, and bracket UI.
    - When a match is to be played, it creates a new Game instance, passes the relevant config/players, Game.connection does the API communitacion with server to JOIN - INIT - START and then finally navigates to the game-match step where render happens, still using Game.connection to communicate with the server via socket.
    - When the match ends, results are returned to the `Tournament`, which updates the bracket and enables the next match. (Beside Tournament object instance, we can use local/session storage for the tournament state managment)
    - The Tournament class will be independent to Game, but we can import many methods from Game class and its component classes to make all the config and managment

### 1. **Tournament Step Structure**

- **Tournament Config Panel:**
    - Select number of players (dropdown or input)
    - Set score per match
    - Choose difficulty
    - "Next" button to proceed
- **Player Assignment Panel:**
    - For each player slot, choose:
        - Registered user (login)
        - Guest (enter name)
        - AI (auto-assign)
    - "Next" button after all slots filled
- **Tournament Bracket Panel:**
    - Display tournament tree (single/double elimination, etc.)
    - Show matchups and order
    - Highlight current/next match
    - "Start Match" button for each available match

### 2. **Flow**

1. **Config:** User sets up tournament parameters.
2. **Player Assignment:** User fills all player slots.
3. **Bracket Generation:** App generates and displays the bracket.
4. **Match Launch:** User selects a match to play; navigates to `game-match` step.
5. **Result Update:** On match end, update bracket with results.
6. **Progression:** Enable next match(es) as per bracket logic.
7. **Completion:** When all matches are done, display winner and stats.

### 3. **State Management**

- Store tournament state (config, players, bracket, results) in a central object (could be in SPA instance or a dedicated Tournament class).
- Persist state in localStorage/sessionStorage if needed for reloads.

### 4. **Navigation**

- Use SPA navigation to switch between steps (`tournament`, `game-match`, etc.).
- Pass necessary state (current match, players, etc.) when launching a match.

### 5. **Bracket Logic**

- On config completion, generate bracket (random or seeded).
- Track match dependencies (e.g., winner of Match 1 vs winner of Match 2).
- Only allow matches to be played when prerequisites are met.

### 6. **UI/UX**

- Use panels or modals to guide user through each phase.
- Disable/enable buttons based on state (e.g., can't start next match until previous is done).
- Show progress and results clearly.