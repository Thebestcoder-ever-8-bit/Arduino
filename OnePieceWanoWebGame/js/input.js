// Input Manager for mobile controls
class InputManager {
    constructor() {
        this.keys = {};
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0,
            power: 0,
            angle: 0
        };
        
        this.touches = new Map();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Mouse events for desktop testing
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Keyboard events for desktop testing
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        // Setup button listeners
        this.setupButtonListeners();
    }
    
    setupButtonListeners() {
        const attackBtn = document.getElementById('attackBtn');
        const specialBtn = document.getElementById('specialBtn');
        const hakiBtn = document.getElementById('hakiBtn');
        const jumpBtn = document.getElementById('jumpBtn');
        
        if (attackBtn) {
            attackBtn.addEventListener('touchstart', () => this.handleAttack(), { passive: true });
            attackBtn.addEventListener('mousedown', () => this.handleAttack());
        }
        
        if (specialBtn) {
            specialBtn.addEventListener('touchstart', () => this.handleSpecialAttack(), { passive: true });
            specialBtn.addEventListener('mousedown', () => this.handleSpecialAttack());
        }
        
        if (hakiBtn) {
            hakiBtn.addEventListener('touchstart', () => this.handleHaki(), { passive: true });
            hakiBtn.addEventListener('mousedown', () => this.handleHaki());
        }
        
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', () => this.handleJump(), { passive: true });
            jumpBtn.addEventListener('mousedown', () => this.handleJump());
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchId = touch.identifier;
            
            this.touches.set(touchId, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY
            });
            
            // Check if touch is on joystick
            if (this.isTouchOnJoystick(touch.clientX, touch.clientY)) {
                this.startJoystick(touch.clientX, touch.clientY, touchId);
            }
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchId = touch.identifier;
            
            if (this.touches.has(touchId)) {
                const touchData = this.touches.get(touchId);
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
                
                // Update joystick if this touch controls it
                if (this.joystick.active && this.joystick.touchId === touchId) {
                    this.updateJoystick(touch.clientX, touch.clientY);
                }
            }
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchId = touch.identifier;
            
            this.touches.delete(touchId);
            
            // End joystick if this touch controlled it
            if (this.joystick.active && this.joystick.touchId === touchId) {
                this.endJoystick();
            }
        }
    }
    
    handleMouseDown(e) {
        // Simulate touch for desktop testing
        if (this.isTouchOnJoystick(e.clientX, e.clientY)) {
            this.startJoystick(e.clientX, e.clientY, 'mouse');
        }
    }
    
    handleMouseMove(e) {
        if (this.joystick.active && this.joystick.touchId === 'mouse') {
            this.updateJoystick(e.clientX, e.clientY);
        }
    }
    
    handleMouseUp(e) {
        if (this.joystick.active && this.joystick.touchId === 'mouse') {
            this.endJoystick();
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        // Handle keyboard controls for desktop testing
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.handleJump();
                break;
            case 'KeyZ':
                this.handleAttack();
                break;
            case 'KeyX':
                this.handleSpecialAttack();
                break;
            case 'KeyC':
                this.handleHaki();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    isTouchOnJoystick(x, y) {
        const joystickElement = document.getElementById('joystick');
        if (!joystickElement) return false;
        
        const rect = joystickElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;
        
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        return distance <= radius;
    }
    
    startJoystick(x, y, touchId) {
        const joystickElement = document.getElementById('joystick');
        if (!joystickElement) return;
        
        const rect = joystickElement.getBoundingClientRect();
        this.joystick.active = true;
        this.joystick.touchId = touchId;
        this.joystick.startX = rect.left + rect.width / 2;
        this.joystick.startY = rect.top + rect.height / 2;
        this.joystick.currentX = x;
        this.joystick.currentY = y;
        
        this.updateJoystick(x, y);
    }
    
    updateJoystick(x, y) {
        if (!this.joystick.active) return;
        
        this.joystick.currentX = x;
        this.joystick.currentY = y;
        
        // Calculate delta from center
        this.joystick.deltaX = x - this.joystick.startX;
        this.joystick.deltaY = y - this.joystick.startY;
        
        // Calculate distance and angle
        const distance = Math.sqrt(this.joystick.deltaX ** 2 + this.joystick.deltaY ** 2);
        const maxDistance = 60; // Maximum joystick range
        
        // Clamp to max distance
        if (distance > maxDistance) {
            const angle = Math.atan2(this.joystick.deltaY, this.joystick.deltaX);
            this.joystick.deltaX = Math.cos(angle) * maxDistance;
            this.joystick.deltaY = Math.sin(angle) * maxDistance;
        }
        
        // Calculate power (0-1) and angle
        this.joystick.power = Math.min(distance / maxDistance, 1);
        this.joystick.angle = Math.atan2(this.joystick.deltaY, this.joystick.deltaX);
        
        // Update visual joystick knob
        this.updateJoystickVisual();
    }
    
    updateJoystickVisual() {
        const knob = document.getElementById('joystickKnob');
        if (!knob) return;
        
        const offsetX = this.joystick.deltaX;
        const offsetY = this.joystick.deltaY;
        
        knob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }
    
    endJoystick() {
        this.joystick.active = false;
        this.joystick.touchId = null;
        this.joystick.deltaX = 0;
        this.joystick.deltaY = 0;
        this.joystick.power = 0;
        this.joystick.angle = 0;
        
        // Reset visual joystick knob
        const knob = document.getElementById('joystickKnob');
        if (knob) {
            knob.style.transform = 'translate(-50%, -50%)';
        }
    }
    
    // Action handlers
    handleAttack() {
        if (game && game.player) {
            game.player.attack();
        }
    }
    
    handleSpecialAttack() {
        if (game && game.player) {
            game.player.useSpecialAttack();
        }
    }
    
    handleHaki() {
        if (game && game.player) {
            game.player.useHaki();
        }
    }
    
    handleJump() {
        if (game && game.player) {
            game.player.jump();
        }
    }
    
    // Get input state for game logic
    getMovementInput() {
        let x = 0, y = 0;
        
        // Joystick input
        if (this.joystick.active) {
            x = this.joystick.deltaX / 60; // Normalize to -1 to 1
            y = this.joystick.deltaY / 60;
        }
        
        // Keyboard input (for desktop testing)
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) x = -1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) x = 1;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) y = -1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) y = 1;
        
        return { x, y };
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    getJoystickPower() {
        return this.joystick.power;
    }
    
    getJoystickAngle() {
        return this.joystick.angle;
    }
}

// Global input manager instance
let inputManager;