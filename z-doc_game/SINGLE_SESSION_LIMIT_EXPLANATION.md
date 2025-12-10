# Single User Session Limit Implementation

This document details the changes made to enforce a strict "one active session per user" policy and provides scenarios for testing to ensure correctness and stability.

## Overview of Changes

The goal was to prevent a user from being logged in and active on multiple devices or browsers simultaneously. The solution involves checks at both the authentication level (Login) and the WebSocket connection level (Online Status).

### 1. Backend Changes

*   **`backend/websockets/online/onlineUsers.js`**:
    *   Exported a helper function `isUserOnline(userId)` to check if a user is currently in the `onlineUsers` map.
    *   Modified the `configureOnlineSocket` handler. Before accepting a new WebSocket connection, it now checks if the `userId` is already present in `onlineUsers`.
    *   If the user is already online, the server sends a JSON error message: `{ type: 'error', message: 'You are already logged in from another location.' }` and closes the socket.

*   **`backend/auth/user.js`**:
    *   Updated `authenticateUser` (used by the `/auth/login` route).
    *   Added a check using `isUserOnline(user.id)`.
    *   If the user is online, the login request is rejected immediately with a `403 Forbidden` status and the message "User already logged in from another location". This prevents a new session token from being issued.

### 2. Frontend Changes

*   **`frontend/src/ts/friends/onlineUsersSocket.ts`**:
    *   Added a handler for the `error` message type in the WebSocket `onmessage` event.
    *   When this specific error is received, the application:
        1.  Displays the error message in a modal.
        2.  Waits 3 seconds.
        3.  Redirects the user to the `#logout` route.

*   **`frontend/src/ts/login/logoutRender.ts`**:
    *   Ensured `closeOnlineSocket()` is called during the logout process. This guarantees that the user is removed from the server's `onlineUsers` map immediately upon voluntary logout, allowing them to log in elsewhere without delay.

---

## Testing Scenarios

Please verify the following scenarios to ensure the feature works as intended and does not introduce regressions.

### 1. Basic Double Login (Different Browsers/Incognito)
*   **Action**:
    1.  Open **Browser A** and log in as `User1`.
    2.  Open **Browser B** (or an Incognito window) and attempt to log in as `User1`.
*   **Expected Behavior**:
    *   **Browser A**: Remains logged in and functional.
    *   **Browser B**: The login form should display an error (e.g., "User already logged in from another location") and **not** proceed to the home page.

### 2. Concurrent Session Attempt (Token Reuse/Race Condition)
*   **Action**:
    1.  Open **Browser A** and log in as `User1`.
    2.  (Advanced) If you have a valid session token saved or restored in **Browser B** (bypassing the login form), navigate to the app.
*   **Expected Behavior**:
    *   **Browser B**: The app will load, but as soon as it attempts to connect to the Online WebSocket, it will receive the error. A modal will appear saying "You are already logged in...", and after 3 seconds, the app will force a logout (redirect to login).

### 3. Multiple Tabs (Strict Single Session)
*   **Action**:
    1.  Open **Tab 1** and log in.
    2.  Open **Tab 2** and navigate to the same URL (or duplicate the tab).
*   **Expected Behavior**:
    *   **Tab 2**: Will fail to connect to the socket, show the error, and force a logout.
    *   **Note**: Since the session cookie is shared, the logout on Tab 2 will clear the cookie. **Tab 1** will eventually fail or require re-login upon navigation. This confirms the policy is strict: *one active connection only*.

### 4. Logout and Re-login
*   **Action**:
    1.  Log in on **Browser A**.
    2.  Click "Logout".
    3.  Immediately try to log in on **Browser B**.
*   **Expected Behavior**:
    *   Login on Browser B should succeed immediately. This confirms that `closeOnlineSocket()` correctly cleaned up the state on the server.

### 5. Page Refresh (Edge Case)
*   **Action**:
    1.  Log in.
    2.  Press F5 or Reload the page.
*   **Expected Behavior**:
    *   The user should remain logged in.
    *   **Technical Note**: There is a tiny race condition window where the old socket disconnects and the new one connects. If the server hasn't processed the disconnect yet, the new connection might be rejected.
    *   **Mitigation**: If this happens, the user will see the error and be logged out. In practice, the socket close event usually processes fast enough.

---

## Regression Checks (Features to Verify)

Ensure these features still work, as they rely on the WebSocket connection:

1.  **Online Status**: Verify that the user list (right sidebar or friends list) correctly shows users as "Online" (green).
2.  **Game Invitations**:
    *   Send a game invite from User A to User B.
    *   Verify User B receives the notification.
    *   This confirms the socket connection is fully established and functional for the single allowed session.
3.  **Chat**:
    *   Verify that chat messages can be sent and received.
    *   (Note: Chat uses a separate socket `/ws/chat`, but often relies on the online status for UI indicators).

