// /home/alfofern/TR7/frontend/src/ts/handlePlaygame.ts
export const setupSlider = () => {
    const slider = document.getElementById('slider');
    const btnSolo = document.getElementById('btn-solo');
    const btnMulti = document.getElementById('btn-multiplayer');
    const btnBack = document.getElementById('btn-back-center-right');
    const btnBackSolo = document.getElementById('btn-back-center-left');
    btnBack === null || btnBack === void 0 ? void 0 : btnBack.addEventListener('click', resetSlider);
    btnBackSolo === null || btnBackSolo === void 0 ? void 0 : btnBackSolo.addEventListener('click', resetSlider);
    // Mostrar la sección central (segunda)
    if (!slider || !btnSolo || !btnMulti) {
        console.error('One or more elements are missing in the DOM.');
        return;
    }
    btnMulti.addEventListener('click', () => {
        // Mostrar la sección derecha (tercera)
        slider.style.transform = 'translateX(-200vw)';
    });
    btnSolo.addEventListener('click', () => {
        // Mostrar la sección izquierda (primera)
        slider.style.transform = 'translateX(0vw)';
    });
};
export const resetSlider = () => {
    const slider = document.getElementById('slider');
    if (!slider) {
        console.error('Slider element is missing in the DOM.');
        return;
    }
    slider.style.transform = 'translateX(-100vw)';
};
