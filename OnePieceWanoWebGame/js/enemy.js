// Enemy Types
const EnemyTypes = {
    BEAST_PIRATE: 'beast_pirate',
    SAMURAI: 'samurai',
    NINJA: 'ninja',
    GIFTER: 'gifter',
    HEADLINER: 'headliner',
    KAIDO: 'kaido'
};

class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 55;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = 2;
        this.onGround = false;
        this.facing = -1; // Start facing left
        
        // AI
        this.state = 'patrol'; // patrol, chase, attack, stunned
        this.detectionRange = 200;
        this.attackRange = 50;
        this.patrolDistance = 100;
        this.patrolCenter = x;
        this.patrolDirection = 1;
        this.lastStateChange = 0;
        this.stateChangeDelay = 1000;
        
        // Combat
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.attackPower = 25;
        this.defense = 10;
        this.alive = true;
        this.attackCooldown = 0;
        this.stunDuration = 0;
        
        // Effects
        this.burnDuration = 0;
        this.burnDamage = 5;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        
        // Initialize enemy-specific properties
        this.initializeEnemy();
    }
    
    initializeEnemy() {
        const enemyData = this.getEnemyData();
        
        this.name = enemyData.name;
        this.maxHealth = enemyData.maxHealth;
        this.health = this.maxHealth;
        this.attackPower = enemyData.attackPower;
        this.defense = enemyData.defense;
        this.speed = enemyData.speed;
        this.color = enemyData.color;
        this.detectionRange = enemyData.detectionRange;
        this.attackRange = enemyData.attackRange;
    }
    
    getEnemyData() {
        const data = {
            [EnemyTypes.BEAST_PIRATE]: {
                name: 'Beast Pirate',
                maxHealth: 150,
                attackPower: 30,
                defense: 15,
                speed: 2,
                color: '#8B4513',
                detectionRange: 180,
                attackRange: 45
            },
            [EnemyTypes.SAMURAI]: {
                name: 'Wano Samurai',
                maxHealth: 200,
                attackPower: 45,
                defense: 25,
                speed: 2.5,
                color: '#4169E1',
                detectionRange: 220,
                attackRange: 55
            },
            [EnemyTypes.NINJA]: {
                name: 'Wano Ninja',
                maxHealth: 120,
                attackPower: 35,
                defense: 10,
                speed: 4,
                color: '#2F4F4F',
                detectionRange: 250,
                attackRange: 40
            },
            [EnemyTypes.GIFTER]: {
                name: 'SMILE Gifter',
                maxHealth: 300,
                attackPower: 60,
                defense: 30,
                speed: 1.5,
                color: '#9932CC',
                detectionRange: 200,
                attackRange: 60
            },
            [EnemyTypes.HEADLINER]: {
                name: 'Beast Pirates Headliner',
                maxHealth: 500,
                attackPower: 80,
                defense: 40,
                speed: 2,
                color: '#B22222',
                detectionRange: 250,
                attackRange: 70
            },
            [EnemyTypes.KAIDO]: {
                name: 'Kaido of the Beasts',
                maxHealth: 2000,
                attackPower: 200,
                defense: 100,
                speed: 3,
                color: '#8B0000',
                detectionRange: 400,
                attackRange: 100
            }
        };
        
        return data[this.type] || data[EnemyTypes.BEAST_PIRATE];
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        // Update cooldowns and effects
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.stunDuration > 0) {
            this.stunDuration -= deltaTime;
            if (this.stunDuration <= 0) {
                this.state = 'patrol';
            }
        }
        
        // Burn effect
        if (this.burnDuration > 0) {
            this.burnDuration -= deltaTime;
            if (this.burnDuration % 500 < deltaTime) { // Damage every 500ms
                this.takeDamage(this.burnDamage);
            }
        }
        
        // AI behavior
        if (this.stunDuration <= 0) {
            this.updateAI();
        }
        
        // Apply gravity
        this.vy += game.world.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Ground collision
        const groundY = game.canvas.height - 160;
        if (this.y + this.height > groundY) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
        
        // World boundaries
        this.x = Math.max(0, Math.min(game.world.width - this.width, this.x));
        
        // Update animation
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }
    
    updateAI() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastStateChange < this.stateChangeDelay) {
            return;
        }
        
        const player = game.player;
        if (!player || !player.alive) {
            this.state = 'patrol';
            return;
        }
        
        const distanceToPlayer = Math.abs(this.x - player.x);
        
        switch (this.state) {
            case 'patrol':
                this.patrol();
                
                // Check if player is in detection range
                if (distanceToPlayer < this.detectionRange) {
                    this.state = 'chase';
                    this.lastStateChange = currentTime;
                }
                break;
                
            case 'chase':
                this.chasePlayer(player);
                
                // Check if in attack range
                if (distanceToPlayer < this.attackRange) {
                    this.state = 'attack';
                    this.lastStateChange = currentTime;
                }
                // Check if lost player
                else if (distanceToPlayer > this.detectionRange * 1.5) {
                    this.state = 'patrol';
                    this.lastStateChange = currentTime;
                }
                break;
                
            case 'attack':
                this.attackPlayer(player);
                
                // Check if player moved away
                if (distanceToPlayer > this.attackRange * 1.2) {
                    this.state = 'chase';
                    this.lastStateChange = currentTime;
                }
                break;
        }
    }
    
    patrol() {
        // Simple patrol behavior
        const distanceFromCenter = this.x - this.patrolCenter;
        
        if (Math.abs(distanceFromCenter) > this.patrolDistance) {
            this.patrolDirection *= -1;
        }
        
        this.vx = this.patrolDirection * this.speed * 0.5;
        this.facing = this.patrolDirection;
    }
    
    chasePlayer(player) {
        const direction = player.x > this.x ? 1 : -1;
        this.vx = direction * this.speed;
        this.facing = direction;
    }
    
    attackPlayer(player) {
        if (this.attackCooldown > 0) {
            this.vx = 0;
            return;
        }
        
        this.vx = 0;
        this.attackCooldown = 1500; // 1.5 second cooldown
        
        // Check if player is still in range
        const distance = Math.abs(this.x - player.x);
        if (distance < this.attackRange) {
            player.takeDamage(this.attackPower);
            game.createParticles(player.x, player.y, '#FF0000', 3);
            
            console.log(`${this.name} attacks ${player.name}!`);
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Flip sprite if facing left
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x - this.width, 0);
        }
        
        // Draw enemy
        this.drawEnemy(ctx);
        
        // Draw effects
        if (this.stunDuration > 0) {
            this.drawStunEffect(ctx);
        }
        if (this.burnDuration > 0) {
            this.drawBurnEffect(ctx);
        }
        
        ctx.restore();
        
        // Draw health bar
        this.drawHealthBar(ctx);
    }
    
    drawEnemy(ctx) {
        // Base enemy shape
        ctx.fillStyle = this.color;
        
        // Body
        ctx.fillRect(this.x + 8, this.y + 18, 18, 25);
        
        // Head
        ctx.beginPath();
        ctx.arc(this.x + 17, this.y + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.fillRect(this.x + 3, this.y + 22, 6, 15);
        ctx.fillRect(this.x + 26, this.y + 22, 6, 15);
        
        // Legs
        ctx.fillRect(this.x + 10, this.y + 43, 5, 12);
        ctx.fillRect(this.x + 20, this.y + 43, 5, 12);
        
        // Enemy-specific details
        this.drawEnemyDetails(ctx);
    }
    
    drawEnemyDetails(ctx) {
        switch (this.type) {
            case EnemyTypes.BEAST_PIRATE:
                // Horns
                ctx.fillStyle = '#654321';
                ctx.fillRect(this.x + 12, this.y + 2, 3, 8);
                ctx.fillRect(this.x + 20, this.y + 2, 3, 8);
                // Club
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + 32, this.y + 15, 4, 20);
                ctx.fillRect(this.x + 30, this.y + 12, 8, 6);
                break;
                
            case EnemyTypes.SAMURAI:
                // Katana
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + 32, this.y + 10);
                ctx.lineTo(this.x + 32, this.y + 35);
                ctx.stroke();
                // Armor details
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x + 8, this.y + 18, 18, 25);
                break;
                
            case EnemyTypes.NINJA:
                // Mask
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x + 12, this.y + 8, 10, 8);
                // Shuriken
                ctx.fillStyle = '#C0C0C0';
                ctx.save();
                ctx.translate(this.x + 30, this.y + 20);
                ctx.rotate(Date.now() * 0.01);
                ctx.fillRect(-3, -1, 6, 2);
                ctx.fillRect(-1, -3, 2, 6);
                ctx.restore();
                break;
                
            case EnemyTypes.KAIDO:
                // Dragon scales
                ctx.fillStyle = '#4B0082';
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 2; j++) {
                        ctx.fillRect(this.x + 10 + i * 5, this.y + 20 + j * 8, 3, 3);
                    }
                }
                // Horns
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x + 10, this.y, 4, 12);
                ctx.fillRect(this.x + 21, this.y, 4, 12);
                break;
        }
    }
    
    drawStunEffect(ctx) {
        // Stars spinning around head
        const time = Date.now() * 0.01;
        for (let i = 0; i < 3; i++) {
            const angle = time + (i * Math.PI * 2) / 3;
            const x = this.x + 17 + Math.cos(angle) * 20;
            const y = this.y + 12 + Math.sin(angle) * 15;
            
            ctx.fillStyle = '#FFD700';
            ctx.font = '16px Arial';
            ctx.fillText('★', x, y);
        }
    }
    
    drawBurnEffect(ctx) {
        // Fire particles
        for (let i = 0; i < 5; i++) {
            const x = this.x + Math.random() * this.width;
            const y = this.y + Math.random() * this.height;
            const size = Math.random() * 3 + 1;
            
            ctx.fillStyle = Math.random() > 0.5 ? '#FF4500' : '#FF6347';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawHealthBar(ctx) {
        const barWidth = 40;
        const barHeight = 4;
        const barX = this.x - 2;
        const barY = this.y - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health fill
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    checkPlayerCollision(player) {
        if (!player || !player.alive) return;
        
        const distance = Math.abs(this.x - player.x);
        if (distance < this.width && Math.abs(this.y - player.y) < this.height) {
            // Collision with player - deal contact damage
            if (this.attackCooldown <= 0) {
                player.takeDamage(this.attackPower * 0.3); // Reduced contact damage
                this.attackCooldown = 1000;
            }
        }
    }
    
    takeDamage(damage) {
        const finalDamage = Math.max(1, damage - this.defense);
        this.health -= finalDamage;
        
        // Knockback effect
        this.vx += (Math.random() - 0.5) * 5;
        
        if (this.health <= 0) {
            this.die();
        }
        
        console.log(`${this.name} takes ${finalDamage} damage! Health: ${this.health}/${this.maxHealth}`);
    }
    
    knockback(vx, vy) {
        this.vx += vx;
        this.vy += vy;
    }
    
    applyBurnEffect(duration) {
        this.burnDuration = Math.max(this.burnDuration, duration);
    }
    
    stun(duration) {
        this.stunDuration = duration;
        this.state = 'stunned';
        this.vx = 0;
        console.log(`${this.name} is stunned!`);
    }
    
    die() {
        this.alive = false;
        this.vx = 0;
        this.vy = 0;
        
        // Create death particles
        game.createParticles(this.x + this.width/2, this.y + this.height/2, this.color, 8);
        
        // Award score
        game.score += this.maxHealth;
        
        console.log(`${this.name} has been defeated!`);
    }
}

// Factory function to create enemies
function createEnemy(type, x, y) {
    return new Enemy(type, x, y);
}

// Spawn enemy waves
function spawnEnemyWave(chapter) {
    const enemies = [];
    const spawnY = game.canvas.height - 220;
    
    switch (chapter) {
        case 1:
            // Basic Beast Pirates
            for (let i = 0; i < 3; i++) {
                enemies.push(createEnemy(EnemyTypes.BEAST_PIRATE, 400 + i * 150, spawnY));
            }
            break;
            
        case 2:
            // Mixed enemies
            enemies.push(createEnemy(EnemyTypes.BEAST_PIRATE, 300, spawnY));
            enemies.push(createEnemy(EnemyTypes.SAMURAI, 500, spawnY));
            enemies.push(createEnemy(EnemyTypes.BEAST_PIRATE, 700, spawnY));
            break;
            
        case 3:
            // Stronger enemies
            enemies.push(createEnemy(EnemyTypes.NINJA, 350, spawnY));
            enemies.push(createEnemy(EnemyTypes.GIFTER, 600, spawnY));
            enemies.push(createEnemy(EnemyTypes.SAMURAI, 850, spawnY));
            break;
            
        case 4:
            // Boss fight preparation
            enemies.push(createEnemy(EnemyTypes.HEADLINER, 500, spawnY));
            enemies.push(createEnemy(EnemyTypes.GIFTER, 300, spawnY));
            enemies.push(createEnemy(EnemyTypes.GIFTER, 700, spawnY));
            break;
            
        case 5:
            // Kaido boss fight
            enemies.push(createEnemy(EnemyTypes.KAIDO, 500, spawnY));
            break;
    }
    
    return enemies;
}