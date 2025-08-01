// Main initialization and game loop integration
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏴‍☠️ One Piece: Wano Arc Adventure Loading... 🏴‍☠️');
    
    // Initialize all systems
    initializeGame();
});

function initializeGame() {
    try {
        // Initialize UI Manager
        UI = new UIManager();
        console.log('✅ UI Manager initialized');
        
        // Initialize Input Manager
        inputManager = new InputManager();
        console.log('✅ Input Manager initialized');
        
        // Initialize Game Engine
        game = new Game();
        console.log('✅ Game Engine initialized');
        
        // Setup orientation change handler
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleResize);
        
        // Setup game loop integration with input
        setupGameInputIntegration();
        
        // Hide loading screen and show main menu
        setTimeout(() => {
            UI.hideLoadingScreen();
            UI.showMainMenu();
        }, 1000);
        
        console.log('🎮 One Piece Wano Game Ready!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to load the game. Please refresh the page.');
    }
}

function setupGameInputIntegration() {
    // Override the game's update method to include input handling
    const originalUpdate = game.update.bind(game);
    
    game.update = function(deltaTime) {
        // Handle player input
        if (this.player && this.state === 'playing') {
            handlePlayerInput(this.player);
        }
        
        // Call original update
        originalUpdate(deltaTime);
    };
}

function handlePlayerInput(player) {
    if (!inputManager) return;
    
    const movement = inputManager.getMovementInput();
    
    // Handle horizontal movement
    if (Math.abs(movement.x) > 0.1) {
        if (movement.x > 0) {
            player.moveRight();
        } else {
            player.moveLeft();
        }
    } else {
        player.stopMoving();
    }
    
    // Handle vertical movement (for special abilities or air control)
    if (Math.abs(movement.y) > 0.1) {
        // Could be used for special movement abilities
        // For now, just used for air control when jumping
        if (!player.onGround && Math.abs(movement.x) > 0.1) {
            player.vx += movement.x * 0.5; // Air control
        }
    }
}

function handleOrientationChange() {
    setTimeout(() => {
        if (game) {
            game.resizeCanvas();
        }
        if (UI) {
            UI.updateControlsForOrientation();
        }
    }, 100);
}

function handleResize() {
    if (game) {
        game.resizeCanvas();
    }
    if (UI) {
        UI.updateControlsForOrientation();
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        ">
            <h2>⚠️ Error</h2>
            <p>${message}</p>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #ff4444;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Reload Game</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Prevent context menu on long press (iOS)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent scrolling and bouncing (iOS Safari)
document.body.addEventListener('touchstart', function(e) {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchend', function(e) {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchmove', function(e) {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

// Service Worker for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('SW registered: ', registration);
        }).catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// Add some debug functions for development
window.debugGame = {
    unlockAllCharacters: function() {
        if (UI) {
            Object.values(CharacterTypes).forEach(character => {
                UI.unlockCharacter(character);
            });
            console.log('All characters unlocked!');
        }
    },
    
    setPlayerHealth: function(health) {
        if (game && game.player) {
            game.player.health = health;
            UI.updateHealth(game.player.health, game.player.maxHealth);
            console.log(`Player health set to ${health}`);
        }
    },
    
    spawnEnemy: function(type = 'beast_pirate') {
        if (game && game.player) {
            const enemy = createEnemy(type, game.player.x + 200, game.player.y);
            game.enemies.push(enemy);
            console.log(`Spawned ${type} enemy`);
        }
    },
    
    completeChapter: function(chapter) {
        if (game) {
            game.currentChapter = chapter;
            game.completeChapter();
        }
    },
    
    toggleGodMode: function() {
        if (game && game.player) {
            if (game.player.maxHealth === 999999) {
                game.player.maxHealth = 1000;
                game.player.health = 1000;
                console.log('God mode disabled');
            } else {
                game.player.maxHealth = 999999;
                game.player.health = 999999;
                console.log('God mode enabled');
            }
            UI.updateHealth(game.player.health, game.player.maxHealth);
        }
    }
};

// Add performance monitoring
let performanceStats = {
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0
};

function updatePerformanceStats() {
    performanceStats.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - performanceStats.lastTime >= 1000) {
        performanceStats.fps = performanceStats.frameCount;
        performanceStats.frameCount = 0;
        performanceStats.lastTime = currentTime;
        
        // Log FPS every 5 seconds in debug mode
        if (window.location.hash === '#debug') {
            console.log(`FPS: ${performanceStats.fps}`);
        }
    }
    
    requestAnimationFrame(updatePerformanceStats);
}

// Start performance monitoring
requestAnimationFrame(updatePerformanceStats);

// Add touch feedback for buttons
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('action-btn') || e.target.classList.contains('menu-btn')) {
        e.target.style.transform = 'scale(0.95)';
    }
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('action-btn') || e.target.classList.contains('menu-btn')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
}, { passive: true });

// Console welcome message
console.log(`
🏴‍☠️ ONE PIECE: WANO ARC ADVENTURE 🏴‍☠️

Welcome to the Wano Country!
Join Luffy and the Straw Hat Pirates in their greatest adventure yet!

🎮 Controls:
- Virtual joystick: Move character
- ⚔️ Attack button: Basic attacks
- 🔥 Special button: Devil Fruit powers
- ⚡ Haki button: Activate Haki
- 🦘 Jump button: Jump and air control

🎯 Features:
- Multiple playable characters (unlock by progressing)
- Unique Devil Fruit abilities and Haki powers
- Epic boss battles against Kaido and Beast Pirates
- Story mode following the Wano arc
- Mobile-optimized touch controls

Debug commands available in window.debugGame
Enjoy your adventure! 🌟
`);

// Export for global access
window.OnePieceGame = {
    game,
    UI,
    inputManager,
    debugGame: window.debugGame
};