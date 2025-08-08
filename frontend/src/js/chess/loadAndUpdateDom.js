import { showBoardOverlay } from './handleModals.js';
export function saveNotation() {
    const notationsItems = document.getElementById('notations-items');
    localStorage.setItem('notationHTML', notationsItems.innerHTML);
}
export function loadNotation() {
    const saved = localStorage.getItem('notationHTML');
    if (saved) {
        const notationsItems = document.getElementById('notations-items');
        if (notationsItems)
            notationsItems.innerHTML = saved;
    }
}
export function deleteNotation() {
    const notationsItems = document.getElementById('notations-items');
    if (notationsItems)
        notationsItems.innerHTML = '';
    localStorage.removeItem('notationHTML');
}
export function saveStatusGame(status) {
    localStorage.setItem('statusChessGame', status);
    loadStatusGame();
}
export function loadStatusGame() {
    const status = localStorage.getItem('statusChessGame');
    const buttons = document.getElementById('action-buttons');
    const resignButton = document.getElementById('resign');
    const drawButton = document.getElementById('draw');
    const returnButton = document.getElementById('return');
    if (status && status === 'hasEnded') {
        showBoardOverlay();
        buttons.classList.remove('hidden');
        resignButton.classList.add('hidden');
        drawButton.classList.add('hidden');
        returnButton.classList.remove('hidden');
    }
}
export function deleteStatusGame() {
    localStorage.removeItem('statusChessGame');
}
