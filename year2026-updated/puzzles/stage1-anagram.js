// Stage 1: Anagram / Unscramble Puzzle
window.Stage1Anagram = {
    id: 'stage1',
    title: 'Word Play',
    tokenReward: 'WILL',
    answer: 'YADAV',
    letters: [],
    selectedLetters: [],
    answerSlots: [],

    render(container, state, callbacks) {
        this.callbacks = callbacks;
        this.answer = 'YADAV';
        
        // Scramble the letters
        this.letters = this.shuffleArray(this.answer.split(''));
        this.selectedLetters = [];
        this.answerSlots = Array(this.answer.length).fill(null);

        const html = `
            <div class="anagram-container">
                <p style="text-align: center; margin-bottom: 20px; font-size: 18px; color: #71004f;">
                    Rearrange the letters to form a word
                </p>
                <div class="anagram-letters" id="anagram-letters">
                    ${this.letters.map((letter, i) => `
                        <div class="letter-tile" data-index="${i}" data-letter="${letter}">
                            ${letter}
                        </div>
                    `).join('')}
                </div>
                <div class="anagram-answer" id="anagram-answer">
                    ${this.answerSlots.map((_, i) => `
                        <div class="answer-slot" data-slot-index="${i}"></div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup click handlers
        const letterTiles = container.querySelectorAll('.letter-tile');
        const answerSlots = container.querySelectorAll('.answer-slot');

        letterTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                this.handleLetterClick(tile);
            });
        });

        answerSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                this.handleSlotClick(slot);
            });
        });
    },

    handleLetterClick(tile) {
        const letter = tile.dataset.letter;
        const index = parseInt(tile.dataset.index);

        // Find first empty slot
        const emptySlotIndex = this.answerSlots.findIndex(slot => slot === null);
        if (emptySlotIndex === -1) return;

        // Move letter to answer
        this.answerSlots[emptySlotIndex] = letter;
        this.selectedLetters.push({ letter, originalIndex: index });

        // Update UI
        tile.classList.add('selected');
        tile.style.opacity = '0.5';
        tile.style.pointerEvents = 'none';

        const slot = document.querySelector(`[data-slot-index="${emptySlotIndex}"]`);
        slot.textContent = letter;
        slot.dataset.letter = letter;
        slot.dataset.originalIndex = index;

        this.updateDisplay();
    },

    handleSlotClick(slot) {
        if (!slot.dataset.letter) return;

        const letter = slot.dataset.letter;
        const originalIndex = parseInt(slot.dataset.originalIndex);

        // Remove from answer
        const slotIndex = parseInt(slot.dataset.slotIndex);
        this.answerSlots[slotIndex] = null;
        this.selectedLetters = this.selectedLetters.filter(
            item => !(item.letter === letter && item.originalIndex === originalIndex)
        );

        // Restore letter tile
        const tile = document.querySelector(`[data-index="${originalIndex}"]`);
        if (tile) {
            tile.classList.remove('selected');
            tile.style.opacity = '1';
            tile.style.pointerEvents = 'auto';
        }

        // Clear slot
        slot.textContent = '';
        delete slot.dataset.letter;
        delete slot.dataset.originalIndex;

        this.updateDisplay();
    },

    updateDisplay() {
        // Update answer slots display
        const slots = document.querySelectorAll('.answer-slot');
        slots.forEach((slot, i) => {
            if (this.answerSlots[i]) {
                slot.textContent = this.answerSlots[i];
            } else {
                slot.textContent = '';
            }
        });
    },

    checkAnswer() {
        const userAnswer = this.answerSlots.join('');
        if (userAnswer.length !== this.answer.length) {
            return { correct: false, message: 'Please fill all slots!' };
        }

        if (userAnswer === this.answer) {
            return { correct: true };
        } else {
            return { correct: false, message: 'Not quite right. Try again!' };
        }
    },

    reset() {
        this.selectedLetters = [];
        this.answerSlots = Array(this.answer.length).fill(null);
        this.letters = this.shuffleArray(this.answer.split(''));
    },

    getHint(level) {
        if (level === 1) {
            return 'Bicuit Kumar ______';
        } else {
            return 'Sankshit Kumar ______';
        }
    },

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
