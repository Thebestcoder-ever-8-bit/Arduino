// Main Game Engine
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.lastTime = 0;
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover
        this.currentChapter = 1;
        this.score = 0;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.particles = [];
        this.collectibles = [];
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        // World
        this.world = {
            width: 2000,
            height: 1000,
            gravity: 0.5
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize camera
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
        
        console.log('One Piece Wano Game initialized!');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }
    
    start() {
        this.running = true;
        this.state = 'playing';
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    pause() {
        this.state = 'paused';
    }
    
    resume() {
        this.state = 'playing';
    }
    
    gameLoop(currentTime = 0) {
        if (!this.running) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
            this.updateCamera();
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            if (this.player) {
                enemy.checkPlayerCollision(this.player);
            }
        });
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.alive);
        
        // Update particles
        this.particles.forEach(particle => particle.update(deltaTime));
        this.particles = this.particles.filter(particle => particle.alive);
        
        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update(deltaTime);
            if (this.player && this.checkCollision(this.player, collectible)) {
                this.collectItem(collectible);
            }
        });
        this.collectibles = this.collectibles.filter(collectible => collectible.alive);
        
        // Check win conditions
        this.checkWinConditions();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw world objects
        this.collectibles.forEach(collectible => collectible.render(this.ctx));
        
        // Draw player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Draw particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI (not affected by camera)
        this.drawUI();
    }
    
    drawBackground() {
        // Wano Country themed background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.3, '#98FB98'); // Light green
        gradient.addColorStop(1, '#8FBC8F'); // Dark sea green
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw ground
        this.drawGround();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Simple cloud shapes
        for (let i = 0; i < 5; i++) {
            const x = (i * 300 + 100 - this.camera.x * 0.5) % (this.canvas.width + 200);
            const y = 50 + Math.sin(Date.now() * 0.001 + i) * 20;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawGround() {
        const groundY = this.canvas.height - 100;
        
        // Ground gradient
        const gradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        gradient.addColorStop(0, '#8FBC8F');
        gradient.addColorStop(1, '#556B2F');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, 100);
        
        // Ground details
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < this.canvas.width; i += 50) {
            const x = i - (this.camera.x * 0.8) % 50;
            this.ctx.fillRect(x, groundY + 10, 20, 5);
        }
    }
    
    drawUI() {
        // Health bar and other UI elements are handled by ui.js
        // This method can be extended for additional game-specific UI
    }
    
    updateCamera() {
        if (!this.player) return;
        
        // Follow player with some offset
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Keep camera within world bounds
        this.camera.x = Math.max(0, Math.min(this.world.width - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.world.height - this.canvas.height, this.camera.y));
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    collectItem(collectible) {
        collectible.alive = false;
        this.score += collectible.value || 10;
        
        // Create collection effect
        this.createParticles(collectible.x, collectible.y, '#FFD700', 5);
        
        // Play sound effect
        this.playSound('collect');
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    spawnEnemy(type, x, y) {
        const enemy = new Enemy(type, x, y);
        this.enemies.push(enemy);
    }
    
    checkWinConditions() {
        // Check if all enemies are defeated
        if (this.enemies.length === 0 && this.state === 'playing') {
            this.completeChapter();
        }
    }
    
    completeChapter() {
        this.currentChapter++;
        console.log(`Chapter ${this.currentChapter - 1} completed!`);
        
        // Show chapter completion UI
        UI.showChapterComplete(this.currentChapter - 1);
        
        // Unlock new content based on chapter
        this.unlockContent();
    }
    
    unlockContent() {
        switch (this.currentChapter) {
            case 2:
                console.log('Unlocked: Zoro');
                break;
            case 3:
                console.log('Unlocked: Sanji, Flower Capital');
                break;
            case 4:
                console.log('Unlocked: Chopper, Usopp');
                break;
        }
    }
    
    playSound(soundName) {
        // Simple sound playing - can be expanded
        try {
            const audio = document.getElementById(soundName + 'Sound');
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
    
    reset() {
        this.player = null;
        this.enemies = [];
        this.particles = [];
        this.collectibles = [];
        this.currentChapter = 1;
        this.score = 0;
        this.camera.x = 0;
        this.camera.y = 0;
    }
}

// Particle class for visual effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10 - 5;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 5 + 2;
        this.alive = true;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // gravity
        this.life -= this.decay;
        
        if (this.life <= 0) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Global game instance
let game;