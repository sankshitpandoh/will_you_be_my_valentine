//sample testing key
//{"version":1,"name":"Swara","currentStage":6,"solved":{"stage1":true, "stage2":true, "stage3":true, "stage4":true, "stage5":true},"tokens":["WILL", "YOU", "BE", "MY", "VALENTINE"],"hintsUsed":{}}
// Core Game Engine
class Game {
    constructor() {
        this.stages = [];
        this.currentStageIndex = 0;
        this.state = this.loadState();
        this.currentStageInstance = null;
        this.hintLevel = 0;
        
        this.init();
    }

    init() {
        // Load stage modules
        this.stages = [
            window.Stage1Anagram,
            window.Stage2Lock,
            window.Stage3Tiles,
            window.Stage4WordSearch,
            window.Stage5Quiz
        ];

        // Setup event listeners
        this.setupEventListeners();
        
        // Render based on state
        if (this.state.currentStage === -1) {
            this.showLanding();
        } else if (this.state.currentStage === 5) {
            this.showFinalAssembly();
        } else if (this.state.currentStage === 6) {
            this.showFinalAsk();
        } else if (this.state.currentStage === 7) {
            this.showCelebration();
        } else {
            this.currentStageIndex = this.state.currentStage;
            this.showStage(this.currentStageIndex);
        }

        // Update token bar
        this.updateTokenBar();
    }

    setupEventListeners() {
        // Landing screen
        document.getElementById('start-button').addEventListener('click', () => {
            // const nameInput = document.getElementById('name-input');
            // if (nameInput.value.trim()) {
            // }
            this.state.name = 'Swara';
            this.saveState();
            this.currentStageIndex = 0;
            this.state.currentStage = 0;
            this.saveState();
            this.showStage(0);
        });

        // Game controls
        document.getElementById('check-button').addEventListener('click', () => {
            this.checkAnswer();
        });

        document.getElementById('hint-button').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('reset-stage-button').addEventListener('click', () => {
            if (confirm('Reset this stage? Your progress will be lost.')) {
                this.resetCurrentStage();
            }
        });

        // Token modal
        document.getElementById('continue-button').addEventListener('click', () => {
            this.hideTokenModal();
            if (this.currentStageIndex < this.stages.length - 1) {
                this.currentStageIndex++;
                this.state.currentStage = this.currentStageIndex;
                this.saveState();
                this.showStage(this.currentStageIndex);
            } else {
                // All stages complete
                this.state.currentStage = 5;
                this.saveState();
                this.showFinalAssembly();
            }
        });

        // Final screens
        document.getElementById('reveal-button').addEventListener('click', () => {
            this.showFinalAsk();
        });

        document.getElementById('yes-valentine').addEventListener('click', () => {
            this.showCelebration('yes');
        });

        document.getElementById('of-course-valentine').addEventListener('click', () => {
            this.showCelebration('of-course');
        });

        document.getElementById('plan-date-button').addEventListener('click', () => {
            alert('💛 Let\'s make it special! 💛');
        });

        document.getElementById('reset-quiz-button').addEventListener('click', () => {
            this.resetAll();
        });

        // Settings
        document.getElementById('reset-all-button').addEventListener('click', () => {
            this.resetAll();
        });

        document.getElementById('close-settings-button').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('active');
        });

        // Settings button (if it exists)
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                document.getElementById('settings-modal').classList.add('active');
            });
        }
    }

    showLanding() {
        this.hideAllScreens();
        document.getElementById('landing-screen').classList.add('active');
        const nameInput = document.getElementById('name-input');
        if (this.state.name) {
            nameInput.value = this.state.name;
        }
    }

    showStage(index) {
        if (index < 0 || index >= this.stages.length) return;

        this.hideAllScreens();
        document.getElementById('stage-screen').classList.add('active');

        const stageModule = this.stages[index];
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';

        // Update header
        document.getElementById('stage-title').textContent = `Stage ${index + 1}: ${stageModule.title}`;
        document.getElementById('progress-text').textContent = `Stage ${index + 1} / ${this.stages.length}`;

        // Reset hint level
        this.hintLevel = this.state.hintsUsed[`stage${index + 1}`] || 0;
        this.updateHintButton();

        // Render stage
        this.currentStageInstance = stageModule;
        stageModule.render(container, this.state, {
            onSolved: () => this.onStageSolved(index),
            onFail: (message) => this.onStageFail(message),
            onHintUsed: (level) => this.onHintUsed(index, level)
        });

        // Update token bar
        this.updateTokenBar();
    }

    checkAnswer() {
        if (!this.currentStageInstance) return;

        const result = this.currentStageInstance.checkAnswer();
        
        if (result.correct) {
            this.onStageSolved(this.currentStageIndex);
        } else {
            this.onStageFail(result.message || 'Not quite right. Try again!');
        }
    }

    showHint() {
        if (!this.currentStageInstance) return;

        if (this.hintLevel >= 2) {
            alert('You\'ve used all hints for this stage!');
            return;
        }

        this.hintLevel++;
        const hint = this.currentStageInstance.getHint(this.hintLevel);
        
        // Display hint
        const container = document.getElementById('puzzle-container');
        let hintDisplay = container.querySelector('.hint-display');
        if (!hintDisplay) {
            hintDisplay = document.createElement('div');
            hintDisplay.className = 'hint-display';
            container.appendChild(hintDisplay);
        }
        
        const hintText = this.hintLevel === 1 ? 'A tiny nudge…' : 'No shame, I got you.';
        hintDisplay.innerHTML = `<strong>${hintText}</strong><br>${hint}`;
        
        this.updateHintButton();
        this.onHintUsed(this.currentStageIndex, this.hintLevel);
    }

    updateHintButton() {
        const hintButton = document.getElementById('hint-button');
        if (this.hintLevel >= 2) {
            hintButton.disabled = true;
            hintButton.textContent = 'No more hints';
            hintButton.style.opacity = '0.5';
        } else {
            hintButton.disabled = false;
            hintButton.textContent = `Hint (${2 - this.hintLevel} left)`;
            hintButton.style.opacity = '1';
        }
    }

    onStageSolved(stageIndex) {
        const stageKey = `stage${stageIndex + 1}`;
        this.state.solved[stageKey] = true;
        this.state.tokens.push(this.stages[stageIndex].tokenReward);
        this.saveState();
        
        // Stage-specific success messages
        const successMessages = [
            'mm, smarty pants 😌',           // Stage 1
            'Nice work! 🎯',            // Stage 2
            'Golden Job  :D',      // Stage 3
            'Impressive! ✨',           // Stage 4
            'Absolutely brilliant! 🌟'  // Stage 5
        ];
        
        // Show success message
        const container = document.getElementById('puzzle-container');
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = successMessages[stageIndex] || 'Well done! 🎉';
        container.appendChild(successMsg);

        // Update token bar
        this.updateTokenBar();

        // Show token modal after a brief delay
        setTimeout(() => {
            this.showTokenModal(this.stages[stageIndex].tokenReward);
        }, 1000);
    }

    onStageFail(message) {
        const container = document.getElementById('puzzle-container');
        let errorMsg = container.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.cssText = 'text-align: center; padding: 15px; background: rgba(255, 77, 121, 0.1); border-radius: 8px; color: #ff4d79; margin-top: 20px;';
            container.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
        
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.remove();
            }
        }, 3000);
    }

    onHintUsed(stageIndex, level) {
        const stageKey = `stage${stageIndex + 1}`;
        this.state.hintsUsed[stageKey] = level;
        this.saveState();
    }

    resetCurrentStage() {
        if (this.currentStageInstance && this.currentStageInstance.reset) {
            this.currentStageInstance.reset();
        }
        const stageKey = `stage${this.currentStageIndex + 1}`;
        delete this.state.solved[stageKey];
        this.state.hintsUsed[stageKey] = 0;
        this.hintLevel = 0;
        this.updateHintButton();
        this.saveState();
        this.showStage(this.currentStageIndex);
    }

    showTokenModal(token) {
        document.getElementById('unlocked-token').textContent = token;
        document.getElementById('token-modal').classList.add('active');
    }

    hideTokenModal() {
        document.getElementById('token-modal').classList.remove('active');
    }

    updateTokenBar() {
        const slots = document.querySelectorAll('.token-slot');
        slots.forEach(slot => {
            const token = slot.dataset.token;
            if (this.state.tokens.includes(token)) {
                slot.classList.add('unlocked');
                slot.querySelector('.token-placeholder').textContent = token;
            } else {
                slot.classList.remove('unlocked');
                slot.querySelector('.token-placeholder').textContent = '?';
            }
        });
    }

    showFinalAssembly() {
        this.hideAllScreens();
        document.getElementById('assembly-screen').classList.add('active');

        const assemblyContainer = document.getElementById('token-assembly');
        assemblyContainer.innerHTML = '';

        const tokens = ['WILL', 'YOU', 'BE', 'MY', 'VALENTINE'];
        const name = this.state.name ? `, ${this.state.name}` : '';

        tokens.forEach((token, index) => {
            setTimeout(() => {
                const tokenEl = document.createElement('div');
                tokenEl.className = 'assembly-token';
                tokenEl.textContent = token;
                assemblyContainer.appendChild(tokenEl);
            }, index * 300);
        });

        setTimeout(() => {
            const revealButton = document.getElementById('reveal-button');
            revealButton.style.display = 'block';
        }, tokens.length * 300 + 500);
    }

    showFinalAsk() {
        this.hideAllScreens();
        document.getElementById('final-ask-screen').classList.add('active');
        this.state.currentStage = 6;
        this.saveState();
    }

    showCelebration(buttonType = 'yes') {
        this.hideAllScreens();
        document.getElementById('celebration-screen').classList.add('active');
        this.state.currentStage = 7;
        this.saveState();

        // Calculate score
        const totalHints = Object.values(this.state.hintsUsed).reduce((sum, count) => sum + (count || 0), 0);
        const score = totalHints <= 2 ? 'Smooth Operator' : 'Adorable Chaos';
        
        const name = this.state.name || 'you';
        document.getElementById('celebration-message').textContent = 
            `WE ARE GOING ON A 2-DAY TRIP AT A COZY HOUSE IN NANDI HILLS FOR THE 14TH!!! 🏔️✨💛${name !== 'you' ? ` Get ready, ${name}!` : ''}`;

        // Set video source based on button pressed
        const video = document.getElementById('celebration-video');
        if (video) {
            // If "of course" was pressed, use dance2.mp4, otherwise use dance.mp4
            const videoSource = buttonType === 'of-course' ? 'assets/dance2.mp4' : 'assets/dance.mp4';
            video.src = videoSource;
            video.currentTime = 0;
            video.muted = false;
            
            // Function to play video with sound
            const playVideoWithSound = () => {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // If autoplay with sound fails, try muted then unmute
                        console.log('Autoplay with sound blocked, trying muted approach:', e);
                        video.muted = true;
                        video.play().then(() => {
                            // Unmute after a short delay
                            setTimeout(() => {
                                video.muted = false;
                            }, 200);
                        }).catch(err => {
                            console.error('Video autoplay failed:', err);
                        });
                    });
                }
            };
            
            // Ensure video is loaded before playing
            if (video.readyState >= 2) {
                // Video is already loaded, play immediately
                playVideoWithSound();
            } else {
                // Wait for video to load
                video.addEventListener('loadeddata', playVideoWithSound, { once: true });
                // Also try to load the video
                video.load();
            }
        }

        // Confetti animation
        this.startConfetti();
    }

    startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confetti = [];
        const colors = ['#ff4d79', '#ff6b9d', '#ffdde1', '#ff9a9e', '#fecfef'];

        for (let i = 0; i < 100; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * confetti.length + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncrement: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach((c, i) => {
                ctx.beginPath();
                ctx.lineWidth = c.d;
                ctx.strokeStyle = c.color;
                ctx.moveTo(c.x + c.tilt + c.r, c.y);
                ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
                ctx.stroke();

                c.tiltAngle += c.tiltAngleIncrement;
                c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
                c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;

                if (c.y > canvas.height) {
                    c.y = -c.r;
                    c.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    loadState() {
        const defaultState = {
            version: 1,
            name: '',
            currentStage: -1,
            solved: {},
            tokens: [],
            hintsUsed: {}
        };

        try {
            const saved = localStorage.getItem('valentine-game-state');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultState, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }

        return defaultState;
    }

    saveState() {
        try {
            localStorage.setItem('valentine-game-state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    resetAll() {
        if (confirm('Reset all progress? This cannot be undone.')) {
            localStorage.removeItem('valentine-game-state');
            location.reload();
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    
    // Listen for video control messages from parent window (when in iframe)
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'videoControl') {
            const video = document.getElementById('celebration-video');
            const celebrationScreen = document.getElementById('celebration-screen');
            
            if (video) {
                if (event.data.action === 'play') {
                    // Only play if celebration screen is active (when checkCelebration flag is set)
                    if (event.data.checkCelebration) {
                        if (celebrationScreen && celebrationScreen.classList.contains('active')) {
                            video.play().catch(e => {
                                console.log('Video play failed:', e);
                            });
                        }
                    } else {
                        // If no check flag, play anyway (for other cases)
                        video.play().catch(e => {
                            console.log('Video play failed:', e);
                        });
                    }
                } else if (event.data.action === 'pause') {
                    video.pause();
                }
            }
        }
    });
    
    // Also handle visibility changes (when iframe becomes visible/hidden)
    document.addEventListener('visibilitychange', () => {
        const video = document.getElementById('celebration-video');
        if (video) {
            if (document.hidden) {
                video.pause();
            } else {
                // Only resume if we're on the celebration screen
                const celebrationScreen = document.getElementById('celebration-screen');
                if (celebrationScreen && celebrationScreen.classList.contains('active')) {
                    video.play().catch(e => {
                        console.log('Video play failed:', e);
                    });
                }
            }
        }
    });
});
