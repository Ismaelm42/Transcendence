import { GameConnection } from "../game/GameConnection.js";
import Game from "../game/Game.js";
import { showMessage } from "../modal/showMessage.js";

export let onlineSocket: WebSocket | null = null;

export function initOnlineSocket() {
	if (!onlineSocket || onlineSocket.readyState === WebSocket.CLOSED) {
		onlineSocket = new WebSocket(`wss://${window.location.host}/back/ws/online`);
		
		onlineSocket.onopen = () => {
		};

		onlineSocket.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			switch (data.type) {
				case "onlineUsers":
					sessionStorage.setItem("userConnected", JSON.stringify(data.users));
					window.dispatchEvent(new Event("onlineUsersUpdated"));
					break;
				case "error":
					showMessage(data.message, 3000);
					setTimeout(() => {
						window.location.hash = "#logout";
					}, 3000);
					break;
				case "refreshRelations":
					window.dispatchEvent(new Event("onlineUsersUpdated"));
					break;
				case "incomingChallenge": {
					const { fromUsername, challengeId } = data;
					showChallengeNotification(fromUsername, challengeId);
					break;
				}
				case "goToGame": {
					const roomId: string = data.roomId;
					const youAre: 'player1'|'player2'|undefined = data.youAre;

					const { SPA } = await import('../spa/spa.js');
					const spa = SPA.getInstance();
					await spa.navigate('game-lobby');
					await waitForGameReady();

					const gc = spa.currentGame?.getGameConnection?.();
					if (!gc?.socket || gc.socket.readyState !== WebSocket.OPEN) {
						break;
					}

					if (youAre === 'player1') {
						// Host: igual que ahora
						gc.socket.send(JSON.stringify({
							type: 'JOIN_GAME',
							roomId,
							youAre,
							mode: 'remote'
						}));
						showMessage('Joining game as player 1...', null);
                    } else if (youAre === 'player2') {
                        // Invitado: replicar botón Join del lobby (GameUI.updateLobby)
                        // Equivalente a:
                        //   this.game.setGameIsHost(false);
                        //   this.game.getGameConnection().joinGame(gameId);
                        try {
                            spa.currentGame?.setGameIsHost?.(false);
                            spa.currentGame?.getGameConnection?.().joinGame(roomId);
                            showMessage('Joining game as player 2...', null);
                        } catch (e) {
                        }
                    } else {
						// Sin rol: fallback al join directo
						spa.currentGame?.getGameConnection?.().joinGame(roomId);
					}
					break;
				}
				default:
					// noop
					break;
			}
		};

		onlineSocket.onclose = () => {
			onlineSocket = null;
		};

		onlineSocket.onerror = (err) => {
		};
	}
}

export function closeOnlineSocket() {
	if (onlineSocket) {
		onlineSocket.close();
		onlineSocket = null;
	}
}

export function showChallengeNotification(fromUsername: string, challengeId: string) {
   let modal = document.getElementById('challenge-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'challenge-modal';
        modal.className = 'challenge-modal'; // Usa clase para estilos
        modal.innerHTML = `
            <div class="modal-content">
                <p id="challenge-text"></p>
                <div class="modal-buttons">
                    <button id="accept-btn" class="btn-accept">Aceptar</button>
                    <button id="reject-btn" class="btn-reject">Rechazar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Añade estilos CSS dinámicamente (o mejor, agrégalo a tu CSS global)
        const style = document.createElement('style');
        style.textContent = `
            .challenge-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000; /* Alto z-index */
            }
            .modal-content {
                background: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                text-align: center;
                max-width: 300px;
                width: 90%;
            }
            #challenge-text {
                margin-bottom: 20px;
                font-size: 16px;
                color: #333;
            }
            .modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            .btn-accept, .btn-reject {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            .btn-accept {
                background: #4CAF50;
                color: white;
            }
            .btn-accept:hover {
                background: #45a049;
            }
            .btn-reject {
                background: #f44336;
                color: white;
            }
            .btn-reject:hover {
                background: #da190b;
            }
        `;
        document.head.appendChild(style);
    }

    // Actualiza el texto
    const text = document.getElementById('challenge-text');
    if (text) {
        text.textContent = `${fromUsername} challenges you to a game. Accept?`;
    }

    // Maneja los botones
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');
    if (acceptBtn && rejectBtn) {
        acceptBtn.onclick = () => {
            onlineSocket?.send(JSON.stringify({ type: "acceptChallenge", challengeId }));
            modal.style.display = 'none';
        };
        rejectBtn.onclick = () => {
            onlineSocket?.send(JSON.stringify({ type: "rejectChallenge", challengeId }));
            modal.style.display = 'none';
        };
    }

    // Muestra el modal
    modal.style.display = 'flex';
}

async function waitForGameReady(timeoutMs = 8000): Promise<void> {
    const { SPA } = await import('../spa/spa.js');
    const spa = SPA.getInstance();
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const tick = () => {
            const gc = spa.currentGame?.getGameConnection?.();
            if (gc?.socket && gc.socket.readyState === WebSocket.OPEN) return resolve();
            if (Date.now() - start > timeoutMs) return reject(new Error('timeout esperando WS de juego'));
            setTimeout(tick, 100);
        };
        tick();
    });
}
