    class PagePet {
        constructor() {
            // Configuration
            this.petName = "Penn";
            this.frameRate = 150; 
            
            // Physics Config
            this.walkSpeed = 1;
            this.zoomSpeed = 12; // Speed during "Zoomies"
            this.climbSpeed = 1;
            this.gravity = 0.4;   
            this.jumpPower = -15; 
            this.bounce = 1; 
            
            // Animation States
            this.states = {
                IDLE: 'idle',
                WALK_LEFT: 'walk left',
                WALK_RIGHT: 'walk right',
                CLIMB_LEFT: 'climb left',
                CLIMB_RIGHT: 'climb right',
                CLIMB_CEILING: 'climb ceiling',
                PEEK: 'peek',                   
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
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight; 
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            
            // Silly Flags
            this.isZooming = false; // "Zoomies" mode
            this.isScared = false;  // Run away mode

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
                this.isZooming = false; // Calms him down
                this.isScared = false;
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
            
            // Determine actual speed (Normal or Zoomies)
            const currentSpeed = this.isZooming ? this.zoomSpeed : this.walkSpeed;

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

                // 2. WALKING (Logic 1: Wobbly / Logic 3: Zoomies)
                else if (this.currentState === this.states.WALK_LEFT) {
                    this.x -= currentSpeed;
                    
                    // Logic 1: Wobbly Walk (If not zooming)
                    if (!this.isZooming) this.x += (Math.random() - 0.5) * 2;

                    if (this.x <= 0) {
                        this.x = 0;
                        this.handleWallHit(true); // true = left wall
                    }
                }
                else if (this.currentState === this.states.WALK_RIGHT) {
                    this.x += currentSpeed;
                    
                    if (!this.isZooming) this.x += (Math.random() - 0.5) * 2;

                    if (this.x >= rightWall) {
                        this.x = rightWall;
                        this.handleWallHit(false); // false = right wall
                    }
                }

                // 3. CLIMBING (Side Walls)
                else if (this.currentState === this.states.CLIMB_LEFT || this.currentState === this.states.CLIMB_RIGHT) {
                    let isMoving = false;

                    // Wall Jump Logic
                    if (Math.random() < 0.005) {
                        this.performWallJump();
                        return; 
                    }

                    // Movement
                    if (this.y > this.mouseY + 10) {
                        this.y -= this.climbSpeed;
                        isMoving = true;
                    } else if (this.y < this.mouseY - 10) {
                        this.y += this.climbSpeed;
                        isMoving = true;
                    }

                    this.animPaused = !isMoving; 

                    // Hit Ceiling -> Switch to Ceiling Climb
                    if (this.y <= 0) {
                        this.y = 0;
                        this.animPaused = false; 
                        this.currentState = this.states.CLIMB_CEILING; // NEW TRANSITION
                    }
                    
                    // Hit Floor
                    if (this.y >= floor) {
                        this.y = floor;
                        this.animPaused = false; 
                        this.currentState = this.states.IDLE;
                        
                        // Nudge away
                        if (this.x <= 0) this.x = 2;
                        if (this.x >= rightWall) this.x = rightWall - 2;
                        
                        setTimeout(() => this.decideNextMove(), 1000);
                    }
                }

                // 4. CEILING CLIMB (NEW FEATURE)
                else if (this.currentState === this.states.CLIMB_CEILING) {
                    let isMoving = false;
                    
                    // Move Left/Right towards mouse on ceiling
                    if (this.x > this.mouseX + 10) {
                        this.x -= this.climbSpeed;
                        isMoving = true;
                    } else if (this.x < this.mouseX - 10) {
                        this.x += this.climbSpeed;
                        isMoving = true;
                    }
                    
                    this.animPaused = !isMoving;

                    // Random chance to fall off ceiling
                    if (Math.random() < 0.005) {
                        this.currentState = this.states.FALLING;
                        this.animPaused = false;
                    }

                    // Hit Side Walls (Transition back to side climb)
                    if (this.x <= 0) {
                        this.x = 0;
                        this.currentState = this.states.CLIMB_LEFT;
                    } else if (this.x >= rightWall) {
                        this.x = rightWall;
                        this.currentState = this.states.CLIMB_RIGHT;
                    }
                }
                
                // 5. PEEK (Logic 8: Rare Peek)
                else if (this.currentState === this.states.PEEK) {
                   // Just wait. The timeout in handleWallHit will end this state.
                }

                // 6. IDLE
                else if (this.currentState === this.states.IDLE) {
                    // Do nothing
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
        
        // Helper for Logic 8 (Rare Peek)
        handleWallHit(isLeft) {
            // 10% chance to Peek instead of Climb immediately
            // But NOT if we are zooming (zoomies crash into walls -> climb immediately)
            if (!this.isZooming && Math.random() < 0.10) {
                this.currentState = this.states.PEEK;
                this.animPaused = false;
                
                // Peek for 1 second, then climb
                setTimeout(() => {
                    this.currentState = isLeft ? this.states.CLIMB_LEFT : this.states.CLIMB_RIGHT;
                }, 1000);
            } else {
                // Normal behavior
                this.currentState = isLeft ? this.states.CLIMB_LEFT : this.states.CLIMB_RIGHT;
            }
        }

        performWallJump() {
            this.animPaused = false;
            this.currentState = this.states.FALLING;
            this.vy = this.jumpPower * 0.8; 
            
            if (this.currentState === this.states.CLIMB_LEFT) {
                this.vx = 6; 
                this.x += 5; 
            } else {
                this.vx = -6; 
                this.x -= 5;
            }
            requestAnimationFrame(() => this.updatePhysics());
        }

        decideNextMove() {
            if (this.isDragging || this.currentState === this.states.FALLING) return;
            if (this.currentState.includes('climb') || this.currentState === 'peek') return;

            this.animPaused = false; 
            const rand = Math.random();
            const floor = window.innerHeight - 96;
            const rightWall = window.innerWidth - 96;

            // Reset Silly States
            this.isZooming = false;
            this.isScared = false;

            if (this.y >= floor) {
                
                // Logic 6: Scared Mode (10% chance)
                if (Math.random() < 0.10) {
                    this.isScared = true;
                    this.isZooming = true; // Run away fast!
                }
                
                // Logic 3: Random Zoomies (5% chance)
                if (!this.isScared && Math.random() < 0.05) {
                    this.isZooming = true;
                }

                // Floor Jump
                if (this.mouseY < this.y - 50 && rand < 0.3 && !this.isScared) {
                    this.currentState = this.states.FALLING;
                    this.vy = this.jumpPower; 
                    if (this.mouseX < this.x) this.vx = -4;
                    else this.vx = 4;
                    return;
                }

                let canWalkLeft = this.x > 5;
                let canWalkRight = this.x < rightWall - 5;
                
                // Determine Target Direction
                // If Scared: Run AWAY from mouse
                // If Normal: Run TOWARDS mouse (sometimes)
                let distToMouse = this.mouseX - this.x;
                let walkTowardsMouse = true;
                
                if (this.isScared) {
                    walkTowardsMouse = false; // Reverse logic
                }

                // Decision Tree
                if (rand < 0.6 || this.isScared) {
                    // Purposeful Walk (Towards or Away from mouse)
                    if (walkTowardsMouse) {
                         if (distToMouse < 0 && canWalkLeft) this.currentState = this.states.WALK_LEFT;
                         else if (distToMouse > 0 && canWalkRight) this.currentState = this.states.WALK_RIGHT;
                         else this.currentState = this.states.IDLE;
                    } else {
                         // Run Away!
                         if (distToMouse < 0 && canWalkRight) this.currentState = this.states.WALK_RIGHT; // Mouse is left, go right
                         else if (distToMouse > 0 && canWalkLeft) this.currentState = this.states.WALK_LEFT; // Mouse is right, go left
                         else this.currentState = this.states.IDLE; // Trapped
                    }
                } else if (rand < 0.8) {
                    // Random Walk
                    const goLeft = Math.random() > 0.5;
                    if (goLeft && canWalkLeft) this.currentState = this.states.WALK_LEFT;
                    else if (!goLeft && canWalkRight) this.currentState = this.states.WALK_RIGHT;
                    else this.currentState = this.states.IDLE;
                } else {
                    this.currentState = this.states.IDLE;
                }

                // Fast update if zooming, slow if idle
                let nextDecisionTime = this.isZooming ? 500 : (1000 + Math.random() * 2000);
                setTimeout(() => this.decideNextMove(), nextDecisionTime);
            }
        }
    }

    window.addEventListener('load', () => {
        new PagePet();
    });

