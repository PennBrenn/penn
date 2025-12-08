class PagePet {
        constructor() {
            // Configuration
            this.petName = "Penn";
            this.frameRate = 150; 
            
            // Physics Config
            this.walkSpeed = 3;
            this.climbSpeed = 2;
            this.gravity = 0.6;   
            this.jumpPower = -15; 
            this.bounce = 0.4; 
            
            // Animation States
            this.states = {
                IDLE: 'idle',
                WALK_LEFT: 'walk left',
                WALK_RIGHT: 'walk right',
                CLIMB_LEFT: 'climb left',
                CLIMB_RIGHT: 'climb right',
                PICKED_UP: 'picked up',
                FALLING: 'falling'
            };

            // Initial State
            this.currentState = this.states.FALLING;
            this.currentFrame = 1;
            this.totalFrames = 6;
            this.animPaused = false; 
            
            // Position & Physics
            this.x = window.innerWidth / 2;
            this.y = 0; 
            this.vx = 0; 
            this.vy = 0; 
            
            // Interaction Flags
            this.isDragging = false;
            // FIX 1: Initialize mouse at bottom so he doesn't climb invisible air on load
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight; 
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;

            // DOM Setup
            this.createDOM();
            this.bindEvents();

            // Start Loops
            this.animLoop = setInterval(() => this.updateAnimation(), this.frameRate);
            this.gameLoop = requestAnimationFrame(() => this.updatePhysics());
        }

        createDOM() {
            this.container = document.createElement('div');
            this.container.id = 'penn-pet-container';
            
            this.img = document.createElement('img');
            this.img.id = 'penn-pet-img';
            this.img.draggable = false; 
            
            this.nameTag = document.createElement('div');
            this.nameTag.id = 'penn-name';
            this.nameTag.innerText = this.petName;

            this.container.appendChild(this.nameTag);
            this.container.appendChild(this.img);
            document.body.appendChild(this.container);
        }

        bindEvents() {
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                if(this.currentState === this.states.IDLE) {
                    if(Math.random() < 0.05) this.decideNextMove();
                }
            });

            this.container.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.currentState = this.states.PICKED_UP;
                this.animPaused = false; 
                this.container.classList.add('grabbing');
                
                this.dragOffsetX = e.clientX - this.x;
                this.dragOffsetY = e.clientY - this.y;
                this.vx = 0;
                this.vy = 0;
            });

            window.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.currentState = this.states.FALLING;
                    this.animPaused = false; 
                    this.container.classList.remove('grabbing');
                }
            });
        }

        updateAnimation() {
            if (this.animPaused) return;

            this.currentFrame++;
            if (this.currentFrame > this.totalFrames) this.currentFrame = 1;

            const path = `animations/${this.currentState}/frame${this.currentFrame}.png`;
            this.img.src = path;
        }

        updatePhysics() {
            const floor = window.innerHeight - 96; 
            const rightWall = window.innerWidth - 96;

            if (this.isDragging) {
                this.x = this.mouseX - this.dragOffsetX;
                this.y = this.mouseY - this.dragOffsetY;
            } 
            else {
                // 1. FALLING
                if (this.currentState === this.states.FALLING) {
                    this.vy += this.gravity;
                    this.y += this.vy;
                    this.x += this.vx; 

                    if (this.y >= floor) {
                        this.y = floor;
                        this.vy = -this.vy * this.bounce; 
                        this.vx *= 0.8;

                        if (Math.abs(this.vy) < 1 && Math.abs(this.vy) > -1) {
                            this.vy = 0;
                            this.vx = 0;
                            this.currentState = this.states.IDLE;
                            setTimeout(() => this.decideNextMove(), 500);
                        }
                    }
                }

                // 2. WALKING
                else if (this.currentState === this.states.WALK_LEFT) {
                    this.x -= this.walkSpeed;
                    if (this.x <= 0) {
                        this.x = 0;
                        this.currentState = this.states.CLIMB_LEFT; 
                    }
                }
                else if (this.currentState === this.states.WALK_RIGHT) {
                    this.x += this.walkSpeed;
                    if (this.x >= rightWall) {
                        this.x = rightWall;
                        this.currentState = this.states.CLIMB_RIGHT; 
                    }
                }

                // 3. CLIMBING
                else if (this.currentState === this.states.CLIMB_LEFT || this.currentState === this.states.CLIMB_RIGHT) {
                    let isMoving = false;

                    // Wall Jump Chance
                    if (Math.random() < 0.015) {
                        this.animPaused = false;
                        this.currentState = this.states.FALLING;
                        this.vy = this.jumpPower * 0.8; 
                        
                        // Jump away from the wall
                        if (this.currentState === this.states.CLIMB_LEFT) {
                            this.vx = 6; 
                            this.x += 5; // Nudge away instantly
                        } else {
                            this.vx = -6; 
                            this.x -= 5;
                        }
                        // Return early to apply physics next frame
                        requestAnimationFrame(() => this.updatePhysics());
                        return; 
                    }

                    // Climb movement
                    if (this.y > this.mouseY + 10) {
                        this.y -= this.climbSpeed;
                        isMoving = true;
                    } else if (this.y < this.mouseY - 10) {
                        this.y += this.climbSpeed;
                        isMoving = true;
                    }

                    this.animPaused = !isMoving; 

                    // Hit Ceiling
                    if (this.y <= 0) {
                        this.y = 0;
                        this.animPaused = false; 
                        this.currentState = this.states.FALLING;
                    }
                    
                    // Hit Floor (Slide down)
                    if (this.y >= floor) {
                        this.y = floor;
                        this.animPaused = false; 
                        this.currentState = this.states.IDLE;
                        
                        // FIX 2: Nudge away from wall so we don't instantly re-climb
                        if (this.x <= 0) this.x = 2;
                        if (this.x >= rightWall) this.x = rightWall - 2;
                        
                        // Trigger next move decision
                        setTimeout(() => this.decideNextMove(), 1000);
                    }
                }
            }

            // Boundary Checks
            if (this.x < 0) { this.x = 0; this.vx *= -1; } 
            if (this.x > rightWall) { this.x = rightWall; this.vx *= -1; } 
            if (this.y > floor) this.y = floor; 

            this.container.style.left = `${this.x}px`;
            this.container.style.top = `${this.y}px`;

            requestAnimationFrame(() => this.updatePhysics());
        }

        decideNextMove() {
            if (this.isDragging || this.currentState === this.states.FALLING) return;
            if (this.currentState.includes('climb')) return; // Don't decide to walk if climbing

            this.animPaused = false; 
            const rand = Math.random();
            const floor = window.innerHeight - 96;
            const rightWall = window.innerWidth - 96;

            if (this.y >= floor) {
                
                // Floor Jump
                if (this.mouseY < this.y - 50 && rand < 0.3) {
                    this.currentState = this.states.FALLING;
                    this.vy = this.jumpPower; 
                    if (this.mouseX < this.x) this.vx = -4;
                    else this.vx = 4;
                    return;
                }

                // FIX 3: Smart Walking (Don't walk into the wall you are touching)
                let canWalkLeft = this.x > 5;
                let canWalkRight = this.x < rightWall - 5;

                // Standard Wandering
                if (rand < 0.5) {
                    // Walk towards mouse
                    const distToMouse = this.mouseX - this.x;
                    if (distToMouse < 0 && canWalkLeft) this.currentState = this.states.WALK_LEFT;
                    else if (distToMouse > 0 && canWalkRight) this.currentState = this.states.WALK_RIGHT;
                    else this.currentState = this.states.IDLE;
                } else if (rand < 0.8) {
                    // Random walk
                    const goLeft = Math.random() > 0.5;
                    if (goLeft && canWalkLeft) this.currentState = this.states.WALK_LEFT;
                    else if (!goLeft && canWalkRight) this.currentState = this.states.WALK_RIGHT;
                    else this.currentState = this.states.IDLE;
                } else {
                    this.currentState = this.states.IDLE;
                }

                setTimeout(() => this.decideNextMove(), 1000 + Math.random() * 2000);
            }
        }
    }

    window.addEventListener('load', () => {
        new PagePet();
    });
