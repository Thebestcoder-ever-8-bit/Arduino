// Character Types
const CharacterTypes = {
    LUFFY: 'luffy',
    ZORO: 'zoro',
    SANJI: 'sanji',
    NAMI: 'nami',
    USOPP: 'usopp',
    CHOPPER: 'chopper',
    ROBIN: 'robin',
    FRANKY: 'franky',
    BROOK: 'brook',
    JINBE: 'jinbe'
};

// Devil Fruit Types
const DevilFruitTypes = {
    NONE: 'none',
    PARAMECIA: 'paramecia',
    ZOAN: 'zoan',
    LOGIA: 'logia'
};

// Haki Types
const HakiTypes = {
    NONE: 'none',
    OBSERVATION: 'observation',
    ARMAMENT: 'armament',
    CONQUEROR: 'conqueror'
};

class Character {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.onGround = false;
        this.facing = 1; // 1 = right, -1 = left
        
        // Combat
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.attackPower = 100;
        this.defense = 50;
        this.alive = true;
        
        // State
        this.attacking = false;
        this.usingSpecial = false;
        this.usingHaki = false;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.hakiCooldown = 0;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.currentAnimation = 'idle';
        
        // Initialize character-specific properties
        this.initializeCharacter();
    }
    
    initializeCharacter() {
        const characterData = this.getCharacterData();
        
        this.name = characterData.name;
        this.devilFruit = characterData.devilFruit;
        this.devilFruitType = characterData.devilFruitType;
        this.hakiTypes = characterData.hakiTypes;
        this.maxHealth = characterData.maxHealth;
        this.health = this.maxHealth;
        this.attackPower = characterData.attackPower;
        this.defense = characterData.defense;
        this.speed = characterData.speed;
        this.color = characterData.color;
        this.specialAttack = characterData.specialAttack;
    }
    
    getCharacterData() {
        const data = {
            [CharacterTypes.LUFFY]: {
                name: 'Monkey D. Luffy',
                devilFruit: 'Gomu Gomu no Mi',
                devilFruitType: DevilFruitTypes.PARAMECIA,
                hakiTypes: [HakiTypes.OBSERVATION, HakiTypes.ARMAMENT, HakiTypes.CONQUEROR],
                maxHealth: 1000,
                attackPower: 120,
                defense: 80,
                speed: 6,
                color: '#FFD700',
                specialAttack: 'Gomu Gomu no Bazooka'
            },
            [CharacterTypes.ZORO]: {
                name: 'Roronoa Zoro',
                devilFruit: 'None',
                devilFruitType: DevilFruitTypes.NONE,
                hakiTypes: [HakiTypes.OBSERVATION, HakiTypes.ARMAMENT],
                maxHealth: 900,
                attackPower: 140,
                defense: 100,
                speed: 5,
                color: '#00FF00',
                specialAttack: 'Santoryu: Oni Giri'
            },
            [CharacterTypes.SANJI]: {
                name: 'Vinsmoke Sanji',
                devilFruit: 'None',
                devilFruitType: DevilFruitTypes.NONE,
                hakiTypes: [HakiTypes.OBSERVATION, HakiTypes.ARMAMENT],
                maxHealth: 850,
                attackPower: 110,
                defense: 70,
                speed: 7,
                color: '#FFA500',
                specialAttack: 'Diable Jambe'
            },
            [CharacterTypes.NAMI]: {
                name: 'Nami',
                devilFruit: 'None',
                devilFruitType: DevilFruitTypes.NONE,
                hakiTypes: [],
                maxHealth: 600,
                attackPower: 80,
                defense: 40,
                speed: 6,
                color: '#FF8C00',
                specialAttack: 'Thunder Tempo'
            }
        };
        
        return data[this.type] || data[CharacterTypes.LUFFY];
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.specialCooldown > 0) this.specialCooldown -= deltaTime;
        if (this.hakiCooldown > 0) this.hakiCooldown -= deltaTime;
        
        // Apply gravity
        this.vy += game.world.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Ground collision
        const groundY = game.canvas.height - 160; // Ground level
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
        this.updateAnimation();
        
        // Reset states
        if (this.attacking && this.attackCooldown <= 0) {
            this.attacking = false;
        }
        if (this.usingSpecial && this.specialCooldown <= 0) {
            this.usingSpecial = false;
        }
        if (this.usingHaki && this.hakiCooldown <= 0) {
            this.usingHaki = false;
        }
    }
    
    updateAnimation() {
        // Determine current animation
        if (this.attacking) {
            this.currentAnimation = 'attack';
        } else if (this.usingSpecial) {
            this.currentAnimation = 'special';
        } else if (!this.onGround) {
            this.currentAnimation = 'jump';
        } else if (Math.abs(this.vx) > 0.1) {
            this.currentAnimation = 'walk';
        } else {
            this.currentAnimation = 'idle';
        }
        
        // Update animation frame
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
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
        
        // Draw character
        this.drawCharacter(ctx);
        
        // Draw effects
        if (this.usingHaki) {
            this.drawHakiEffect(ctx);
        }
        
        ctx.restore();
        
        // Draw health bar
        this.drawHealthBar(ctx);
    }
    
    drawCharacter(ctx) {
        // Simple character representation
        ctx.fillStyle = this.color;
        
        // Body
        ctx.fillRect(this.x + 10, this.y + 20, 20, 30);
        
        // Head
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.fillRect(this.x + 5, this.y + 25, 8, 20);
        ctx.fillRect(this.x + 27, this.y + 25, 8, 20);
        
        // Legs
        ctx.fillRect(this.x + 12, this.y + 50, 6, 15);
        ctx.fillRect(this.x + 22, this.y + 50, 6, 15);
        
        // Character-specific details
        this.drawCharacterDetails(ctx);
        
        // Animation effects
        if (this.attacking) {
            this.drawAttackEffect(ctx);
        }
    }
    
    drawCharacterDetails(ctx) {
        switch (this.type) {
            case CharacterTypes.LUFFY:
                // Straw hat
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + 10, this.y + 5, 20, 4);
                // Scar under eye
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + 15, this.y + 18);
                ctx.lineTo(this.x + 18, this.y + 20);
                ctx.stroke();
                break;
                
            case CharacterTypes.ZORO:
                // Green hair
                ctx.fillStyle = '#00AA00';
                ctx.fillRect(this.x + 15, this.y + 3, 10, 8);
                // Swords
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x + 35, this.y + 10);
                ctx.lineTo(this.x + 35, this.y + 40);
                ctx.stroke();
                break;
                
            case CharacterTypes.SANJI:
                // Blonde hair
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x + 15, this.y + 3, 10, 8);
                // Suit
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x + 12, this.y + 22, 16, 25);
                break;
        }
    }
    
    drawAttackEffect(ctx) {
        const effectSize = 20 + Math.sin(Date.now() * 0.01) * 5;
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, effectSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawHakiEffect(ctx) {
        // Haki aura effect
        const auraSize = 30 + Math.sin(Date.now() * 0.005) * 10;
        ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, auraSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawHealthBar(ctx) {
        const barWidth = 50;
        const barHeight = 6;
        const barX = this.x - 5;
        const barY = this.y - 15;
        
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
    
    // Movement methods
    moveLeft() {
        this.vx = -this.speed;
        this.facing = -1;
    }
    
    moveRight() {
        this.vx = this.speed;
        this.facing = 1;
    }
    
    stopMoving() {
        this.vx = 0;
    }
    
    jump() {
        if (this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }
    }
    
    // Combat methods
    attack() {
        if (this.attackCooldown > 0 || this.attacking) return false;
        
        this.attacking = true;
        this.attackCooldown = 500; // 500ms cooldown
        
        // Create attack hitbox
        const attackBox = {
            x: this.facing === 1 ? this.x + this.width : this.x - 30,
            y: this.y,
            width: 30,
            height: this.height
        };
        
        // Check for enemy hits
        game.enemies.forEach(enemy => {
            if (this.checkCollision(attackBox, enemy)) {
                enemy.takeDamage(this.attackPower);
                game.createParticles(enemy.x, enemy.y, '#FF0000', 3);
            }
        });
        
        // Play attack sound
        game.playSound('attack');
        
        console.log(`${this.name} attacks!`);
        return true;
    }
    
    useSpecialAttack() {
        if (this.specialCooldown > 0 || this.usingSpecial) return false;
        
        this.usingSpecial = true;
        this.specialCooldown = 2000; // 2 second cooldown
        
        // Character-specific special attacks
        this.executeSpecialAttack();
        
        // Play special sound
        game.playSound('special');
        
        console.log(`${this.name} uses ${this.specialAttack}!`);
        return true;
    }
    
    executeSpecialAttack() {
        switch (this.type) {
            case CharacterTypes.LUFFY:
                this.gomuGomuBazooka();
                break;
            case CharacterTypes.ZORO:
                this.oniGiri();
                break;
            case CharacterTypes.SANJI:
                this.diableJambe();
                break;
            default:
                this.basicSpecialAttack();
                break;
        }
    }
    
    gomuGomuBazooka() {
        // Luffy's rubber bazooka - wide area attack
        const attackBox = {
            x: this.facing === 1 ? this.x + this.width : this.x - 100,
            y: this.y - 20,
            width: 100,
            height: this.height + 40
        };
        
        game.enemies.forEach(enemy => {
            if (this.checkCollision(attackBox, enemy)) {
                enemy.takeDamage(this.attackPower * 2);
                enemy.knockback(this.facing * 10, -5);
                game.createParticles(enemy.x, enemy.y, '#FFD700', 8);
            }
        });
    }
    
    oniGiri() {
        // Zoro's three-sword attack - high damage
        const attackBox = {
            x: this.facing === 1 ? this.x + this.width : this.x - 50,
            y: this.y,
            width: 50,
            height: this.height
        };
        
        game.enemies.forEach(enemy => {
            if (this.checkCollision(attackBox, enemy)) {
                enemy.takeDamage(this.attackPower * 2.5);
                game.createParticles(enemy.x, enemy.y, '#00FF00', 10);
            }
        });
    }
    
    diableJambe() {
        // Sanji's flaming kick - fire damage over time
        const attackBox = {
            x: this.facing === 1 ? this.x + this.width : this.x - 40,
            y: this.y + 20,
            width: 40,
            height: 30
        };
        
        game.enemies.forEach(enemy => {
            if (this.checkCollision(attackBox, enemy)) {
                enemy.takeDamage(this.attackPower * 1.8);
                enemy.applyBurnEffect(3000); // 3 second burn
                game.createParticles(enemy.x, enemy.y, '#FF4500', 6);
            }
        });
    }
    
    basicSpecialAttack() {
        // Default special attack
        const attackBox = {
            x: this.facing === 1 ? this.x + this.width : this.x - 60,
            y: this.y,
            width: 60,
            height: this.height
        };
        
        game.enemies.forEach(enemy => {
            if (this.checkCollision(attackBox, enemy)) {
                enemy.takeDamage(this.attackPower * 1.5);
                game.createParticles(enemy.x, enemy.y, this.color, 5);
            }
        });
    }
    
    useHaki() {
        if (this.hakiTypes.length === 0 || this.hakiCooldown > 0) return false;
        
        this.usingHaki = true;
        this.hakiCooldown = 5000; // 5 second cooldown
        
        // Apply haki effects
        this.applyHakiEffects();
        
        console.log(`${this.name} activates Haki!`);
        return true;
    }
    
    applyHakiEffects() {
        // Temporary stat boost
        this.attackPower *= 1.5;
        this.defense *= 1.3;
        
        // Reset after duration
        setTimeout(() => {
            this.attackPower /= 1.5;
            this.defense /= 1.3;
        }, 3000);
    }
    
    takeDamage(damage) {
        const finalDamage = Math.max(1, damage - this.defense);
        this.health -= finalDamage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        // Update UI
        UI.updateHealth(this.health, this.maxHealth);
        
        console.log(`${this.name} takes ${finalDamage} damage! Health: ${this.health}/${this.maxHealth}`);
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        UI.updateHealth(this.health, this.maxHealth);
    }
    
    die() {
        this.alive = false;
        console.log(`${this.name} has been defeated!`);
        // Game over logic would go here
    }
    
    checkCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }
}