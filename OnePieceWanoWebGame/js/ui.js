// UI Manager
class UIManager {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.selectedCharacter = CharacterTypes.LUFFY;
        this.unlockedCharacters = [CharacterTypes.LUFFY];
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Main menu buttons
        const playBtn = document.getElementById('playBtn');
        const charactersBtn = document.getElementById('charactersBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const creditsBtn = document.getElementById('creditsBtn');
        
        if (playBtn) playBtn.addEventListener('click', () => this.showCharacterMenu());
        if (charactersBtn) charactersBtn.addEventListener('click', () => this.showCharacterMenu());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettings());
        if (creditsBtn) creditsBtn.addEventListener('click', () => this.showCredits());
        
        // Character selection
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) startGameBtn.addEventListener('click', () => this.startGame());
        
        // Character cards
        this.setupCharacterCards();
    }
    
    setupCharacterCards() {
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                const character = card.dataset.character;
                if (this.isCharacterUnlocked(character)) {
                    this.selectCharacter(character);
                }
            });
        });
    }
    
    showMainMenu() {
        this.hideAllMenus();
        document.getElementById('mainMenu').classList.remove('hidden');
        this.currentScreen = 'mainMenu';
    }
    
    showCharacterMenu() {
        this.hideAllMenus();
        document.getElementById('characterMenu').classList.remove('hidden');
        this.currentScreen = 'characterMenu';
        this.updateCharacterCards();
    }
    
    showSettings() {
        // TODO: Implement settings menu
        console.log('Settings menu not implemented yet');
    }
    
    showCredits() {
        // TODO: Implement credits screen
        console.log('Credits screen not implemented yet');
    }
    
    showLoadingScreen() {
        this.hideAllMenus();
        document.getElementById('loadingScreen').style.display = 'flex';
        this.currentScreen = 'loading';
        
        // Simulate loading
        this.simulateLoading();
    }
    
    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
    }
    
    simulateLoading() {
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        const loadingSteps = [
            'Loading Wano Country...',
            'Preparing Straw Hat Pirates...',
            'Initializing Devil Fruit powers...',
            'Setting up Haki system...',
            'Loading Beast Pirates...',
            'Ready to sail!'
        ];
        
        let progress = 0;
        let stepIndex = 0;
        
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 20 + 5;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                
                setTimeout(() => {
                    this.hideLoadingScreen();
                    this.startGameplay();
                }, 500);
            }
            
            progressBar.style.width = progress + '%';
            
            if (stepIndex < loadingSteps.length - 1 && progress > (stepIndex + 1) * (100 / loadingSteps.length)) {
                stepIndex++;
            }
            
            loadingText.textContent = loadingSteps[stepIndex];
        }, 200);
    }
    
    hideAllMenus() {
        const menus = document.querySelectorAll('.menu');
        menus.forEach(menu => menu.classList.add('hidden'));
    }
    
    updateCharacterCards() {
        const characterCards = document.querySelectorAll('.character-card');
        
        characterCards.forEach(card => {
            const character = card.dataset.character;
            const isUnlocked = this.isCharacterUnlocked(character);
            const isSelected = character === this.selectedCharacter;
            
            // Update locked/unlocked state
            if (isUnlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
            } else {
                card.classList.add('locked');
                card.classList.remove('unlocked');
            }
            
            // Update selected state
            if (isSelected) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }
    
    selectCharacter(character) {
        if (this.isCharacterUnlocked(character)) {
            this.selectedCharacter = character;
            this.updateCharacterCards();
            
            // Update character info display
            this.updateCharacterInfo(character);
        }
    }
    
    updateCharacterInfo(character) {
        const characterData = this.getCharacterDisplayData(character);
        
        // Update UI elements if they exist
        const nameElement = document.getElementById('characterName');
        const fruitElement = document.getElementById('devilFruit');
        
        if (nameElement) nameElement.textContent = characterData.name;
        if (fruitElement) fruitElement.textContent = characterData.devilFruit;
    }
    
    getCharacterDisplayData(character) {
        const data = {
            [CharacterTypes.LUFFY]: {
                name: 'Monkey D. Luffy',
                devilFruit: 'Gomu Gomu no Mi'
            },
            [CharacterTypes.ZORO]: {
                name: 'Roronoa Zoro',
                devilFruit: 'Three Sword Style'
            },
            [CharacterTypes.SANJI]: {
                name: 'Vinsmoke Sanji',
                devilFruit: 'Black Leg Style'
            },
            [CharacterTypes.NAMI]: {
                name: 'Nami',
                devilFruit: 'Clima-Tact'
            }
        };
        
        return data[character] || data[CharacterTypes.LUFFY];
    }
    
    isCharacterUnlocked(character) {
        return this.unlockedCharacters.includes(character);
    }
    
    unlockCharacter(character) {
        if (!this.isCharacterUnlocked(character)) {
            this.unlockedCharacters.push(character);
            this.updateCharacterCards();
            
            // Show unlock notification
            this.showNotification(`${this.getCharacterDisplayData(character).name} unlocked!`);
        }
    }
    
    startGame() {
        this.showLoadingScreen();
    }
    
    startGameplay() {
        this.hideAllMenus();
        this.showGameUI();
        
        // Initialize game
        if (!game) {
            game = new Game();
        }
        
        // Create player character
        game.player = new Character(this.selectedCharacter, 100, game.canvas.height - 220);
        
        // Spawn enemies for chapter 1
        game.enemies = spawnEnemyWave(1);
        
        // Start game loop
        game.start();
        
        this.currentScreen = 'game';
    }
    
    showGameUI() {
        document.getElementById('gameUI').style.display = 'block';
        document.getElementById('mobileControls').style.display = 'block';
        
        // Update initial UI state
        if (game && game.player) {
            this.updateHealth(game.player.health, game.player.maxHealth);
            this.updateCharacterInfo(game.player.type);
            this.updateStoryInfo(1, 'Find allies in Wano Country');
        }
    }
    
    hideGameUI() {
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('mobileControls').style.display = 'none';
    }
    
    updateHealth(current, max) {
        const healthFill = document.getElementById('healthFill');
        const healthText = document.getElementById('healthText');
        
        if (healthFill) {
            const percentage = (current / max) * 100;
            healthFill.style.width = percentage + '%';
        }
        
        if (healthText) {
            healthText.textContent = `${Math.floor(current)}/${max}`;
        }
    }
    
    updateStoryInfo(chapter, mission) {
        const chapterElement = document.getElementById('currentChapter');
        const missionElement = document.getElementById('missionText');
        
        if (chapterElement) {
            chapterElement.textContent = `Chapter ${chapter}: ${this.getChapterName(chapter)}`;
        }
        
        if (missionElement) {
            missionElement.textContent = mission;
        }
    }
    
    getChapterName(chapter) {
        const chapterNames = {
            1: 'Arrival at Wano',
            2: 'Prison Break',
            3: 'Gathering Allies',
            4: 'Fire Festival Preparation',
            5: 'Onigashima Raid'
        };
        
        return chapterNames[chapter] || 'Unknown Chapter';
    }
    
    showChapterComplete(chapter) {
        const notification = document.createElement('div');
        notification.className = 'chapter-complete-notification';
        notification.innerHTML = `
            <h2>🎉 Chapter ${chapter} Complete! 🎉</h2>
            <p>New content unlocked!</p>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        // Unlock new characters based on chapter
        this.unlockContentForChapter(chapter);
    }
    
    unlockContentForChapter(chapter) {
        switch (chapter) {
            case 1:
                this.unlockCharacter(CharacterTypes.ZORO);
                break;
            case 2:
                this.unlockCharacter(CharacterTypes.SANJI);
                this.unlockCharacter(CharacterTypes.NAMI);
                break;
            case 3:
                this.unlockCharacter(CharacterTypes.USOPP);
                this.unlockCharacter(CharacterTypes.CHOPPER);
                break;
        }
    }
    
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #FFD700;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
    
    showGameOver() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h1>💀 Game Over 💀</h1>
                <p>Your adventure in Wano has ended...</p>
                <button id="restartBtn" class="menu-btn primary">Try Again</button>
                <button id="menuBtn" class="menu-btn">Main Menu</button>
            </div>
        `;
        
        gameOverScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(gameOverScreen);
        
        // Setup event listeners
        document.getElementById('restartBtn').addEventListener('click', () => {
            gameOverScreen.remove();
            this.restartGame();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            gameOverScreen.remove();
            this.returnToMainMenu();
        });
    }
    
    restartGame() {
        if (game) {
            game.reset();
            this.startGameplay();
        }
    }
    
    returnToMainMenu() {
        if (game) {
            game.stop();
        }
        
        this.hideGameUI();
        this.showMainMenu();
    }
    
    // Handle mobile controls visibility
    updateControlsForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const controls = document.getElementById('mobileControls');
        
        if (controls) {
            if (isLandscape && window.innerHeight < 500) {
                controls.style.height = '150px';
            } else {
                controls.style.height = '200px';
            }
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .game-over-content {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        color: white;
    }
    
    .game-over-content h1 {
        color: #FF6B6B;
        margin-bottom: 20px;
        font-size: 32px;
    }
    
    .game-over-content p {
        margin-bottom: 30px;
        font-size: 18px;
    }
    
    .game-over-content button {
        margin: 10px;
    }
`;
document.head.appendChild(style);

// Global UI manager instance
let UI;