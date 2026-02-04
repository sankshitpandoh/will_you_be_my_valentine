// Stage 2: Code Lock Puzzle
window.Stage2Lock = {
    id: 'stage2',
    title: 'Code Lock',
    tokenReward: 'YOU',
    answer: '2024',
    digits: ['', '', '', ''],

    render(container, state, callbacks) {
        this.callbacks = callbacks;
        this.answer = '2024'; // Configurable: year relationship started
        this.digits = ['', '', '', ''];

        const html = `
            <div class="lock-container">
                <div class="lock-clue">
                    <p style="margin-bottom: 15px; font-size: 20px; font-weight: 600;">
                        The year we became from 2 to 5.
                    </p>
                    <p style="font-size: 16px; color: rgba(113, 0, 79, 0.7);">
                        Four digits. You already know it.
                    </p>
                </div>
                <div class="lock-input-container" id="lock-inputs">
                    ${this.digits.map((_, i) => `
                        <input 
                            type="text" 
                            class="lock-digit" 
                            data-index="${i}"
                            maxlength="1"
                            inputmode="numeric"
                            pattern="[0-9]"
                        />
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup input handlers
        const inputs = container.querySelectorAll('.lock-digit');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = value;
                this.digits[index] = value;

                // Auto-focus next input
                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
                pasted.split('').forEach((char, i) => {
                    if (inputs[i]) {
                        inputs[i].value = char;
                        this.digits[i] = char;
                    }
                });
                if (pasted.length < 4 && inputs[pasted.length]) {
                    inputs[pasted.length].focus();
                }
            });
        });

        // Focus first input
        inputs[0].focus();
    },

    checkAnswer() {
        const userAnswer = this.digits.join('');
        if (userAnswer.length !== 4) {
            return { correct: false, message: 'Please enter all 4 digits!' };
        }

        if (userAnswer === this.answer) {
            return { correct: true };
        } else {
            return { correct: false, message: 'Not the right year. Think about when our small family became from 2 to 5!' };
        }
    },

    reset() {
        this.digits = ['', '', '', ''];
        const inputs = document.querySelectorAll('.lock-digit');
        inputs.forEach(input => {
            input.value = '';
        });
        if (inputs[0]) inputs[0].focus();
    },

    getHint(level) {
        if (level === 1) {
            return 'Think: Hum 2 humarey 3';
        } else {
            return 'You, me and A B C';
        }
    }
};
