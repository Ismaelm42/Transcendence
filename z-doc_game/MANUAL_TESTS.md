# Manual Testing Guide for Transcendence

This document lists comprehensive manual tests to ensure the robustness, stability, and user experience of the Transcendence application, with a strong focus on the Game module.

## 1. General SPA & Navigation Behavior
*These tests ensure the Single Page Application (SPA) handles navigation correctly without losing state unexpectedly or crashing.*

- [ ] **Browser Navigation during Game**:
    - Start a game (Local or Remote).
    - Click the browser's "Back" button. -> *Expectation: Game should end/forfeit cleanly, user returns to previous screen.*
    - Click the browser's "Forward" button. -> *Expectation: Should not re-enter the dead game session; should redirect to home or lobby.*
- [ ] **Browser Reload (F5/Cmd+R)**:
    - **During Matchmaking**: Reload while searching for a remote opponent. -> *Expectation: Request cancelled, user stays on page or redirected to home.*
    - **During Countdown**: Reload while the 3-2-1 countdown is active. -> *Expectation: Game cancelled, no ghost session left.*
    - **During Gameplay**: Reload while the ball is moving. -> *Expectation: Game forfeited (if remote) or reset (if local). User redirected to home/lobby.*
    - **During Tournament**: Reload in the tournament lobby or bracket view. -> *Expectation: Tournament state persists (if implemented) or clean exit with warning.*
- [ ] **URL Manipulation**:
    - Manually type the URL for the game page (`/game`) without joining a match. -> *Expectation: Redirect to home or error message (should not show empty game canvas).*
    - Manually type a non-existent URL. -> *Expectation: 404 Page or redirect to Home.*

## 2. User Authentication & Session
- [ ] **Login/Logout**:
    - Log out while in a game. -> *Expectation: Game ends immediately, user redirected to login.*
    - Log in from a second tab/browser while playing in the first. -> *Expectation: First session might disconnect or handle it gracefully (depending on policy).*
- [ ] **Multiple Tabs**:
    - Open the app in two tabs. Start a game in Tab A. Try to start a game in Tab B. -> *Expectation: Should prevent multiple active games or switch focus.*

## 3. Game Modes & Setup

### A. Local 1v1
- [ ] **Controls**:
    - Test Player 1 controls (e.g., W/S).
    - Test Player 2 controls (e.g., Arrows).
    - Press keys for both players simultaneously. -> *Expectation: Both paddles move smoothly without locking.*
- [ ] **Customization**:
    - Change paddle colors/skins (if available).
    - Change map/background.

### B. Local 1vAI
- [ ] **Difficulty Levels**:
    - Play on **Easy**: AI should make mistakes or move slowly.
    - Play on **Medium**: AI should be decent.
    - Play on **Hard**: AI should be near perfect or very fast.
- [ ] **AI Behavior**:
    - Test if AI gets stuck against walls.
    - Test if AI jitters when the ball is idle.

### C. Remote 1v1 (Online)
- [ ] **Matchmaking**:
    - User A joins queue. User B joins queue. -> *Expectation: They get matched.*
    - User A joins queue. User A cancels. -> *Expectation: User A removed from queue.*
- [ ] **Latency/Lag**:
    - Simulate network lag (using browser DevTools > Network > Throttling). -> *Expectation: Game should not crash; interpolation should smooth movement if implemented.*
- [ ] **Disconnection**:
    - Close the tab of Player A mid-game. -> *Expectation: Player B receives a "Win by Forfeit" or "Opponent Disconnected" message.*

### D. Tournament (Local)
- [ ] **Setup Flow**:
    - Add 3 players (requires a "Bye" or AI filler?).
    - Add 4 players (Standard semi-finals).
    - Mix Registered Users and "Guest" aliases.
- [ ] **Progression**:
    - Play Match 1. Ensure winner advances in bracket.
    - Play Match 2. Ensure winner advances.
    - Play Final. Ensure correct winners from previous matches face off.
- [ ] **Navigation in Tournament**:
    - Navigate between "Bracket View" and "Game View".
    - Try to start a match that isn't ready (e.g., Final before Semis are done). -> *Expectation: Button disabled.*
- [ ] **Tournament Interruption**:
    - Reload page during a tournament match. -> *Expectation: Warning message, or tournament state recovery.*

## 4. In-Game Mechanics & Physics
- [ ] **Scoring**:
    - Verify score updates immediately when ball passes paddle.
    - Verify game ends exactly at the score limit (e.g., 11 points).
- [ ] **Collisions**:
    - Ball hits top/bottom walls -> Bounces correctly.
    - Ball hits paddle edges -> Bounces with appropriate angle changes.
    - Ball hits paddle corners -> Should not get stuck or glitch through.
- [ ] **Pause/Resume** (if implemented):
    - Pause game. -> *Expectation: Ball freezes, input ignored.*
    - Resume game. -> *Expectation: Countdown 3-2-1 before ball moves.*

## 5. UI/UX & Responsiveness
- [ ] **Window Resizing**:
    - Resize browser window during game. -> *Expectation: Canvas scales or centers; game remains playable.*
    - Switch to Mobile View (DevTools). -> *Expectation: Layout adapts; warning if screen is too small for gameplay.*
- [ ] **Visual Feedback**:
    - Score animations.
    - Win/Loss screens (Victory/Defeat messages).
    - Countdown visibility.

## 6. Security & Edge Cases
- [ ] **Input Sanitization**:
    - Enter a tournament alias with HTML/JS code (`<script>alert(1)</script>`). -> *Expectation: Text displayed as string, script NOT executed.*
    - Enter a very long username. -> *Expectation: Truncated or handled UI-wise.*
- [ ] **Simultaneous Actions**:
    - Spam "Join Game" button. -> *Expectation: Should not send multiple join requests.*
    - Spam "Pause" button.

## 7. Chat & Social (While Playing)
- [ ] **Receive Message**:
    - Receive a DM while in-game. -> *Expectation: Notification appears (non-intrusive) or chat bubble updates.*
- [ ] **Send Message**:
    - Try to type in chat while playing (if allowed). -> *Expectation: Game controls shouldn't trigger chat, or chat focus should disable game controls.*
- [ ] **Block User**:
    - Block opponent during game (if UI allows). -> *Expectation: Chat messages stop; game continues.*

## 8. Performance
- [ ] **Long Play Session**:
    - Play 5 games in a row. -> *Expectation: No frame rate drop (memory leak check).*
- [ ] **Asset Loading**:
    - Clear cache and load game. -> *Expectation: Assets (images/sounds) load without delay or visual stutter.*
