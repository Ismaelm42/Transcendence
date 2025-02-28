class SPA {
    private container: HTMLElement;
    private routes: { [key: string]: string } = {
        'login': 'login.js',
        'register': 'register.js',
        'play-pong': 'playPong.js',
        'play-tournament': 'playTournament.js',
        'friends': 'friends.js',
        'chat': 'chat.js',
        'stats': 'stats.js'
    };
    
    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        window.onpopstate = () => this.loadStep();
        this.loadStep();
    }
    
    navigate(step: string) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }
    
    async loadStep() {
        const step = location.hash.replace('#', '') || 'login';
        const modulePath = this.routes[step];
        if (modulePath) {
            const module = await import(`./${modulePath}`);
            this.container.innerHTML = module.render();
        } else {
            this.container.innerHTML = '<div>Step not found</div>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new SPA('app-container'));