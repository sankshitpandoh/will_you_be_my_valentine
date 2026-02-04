// Stage 4: Word Search Mini
window.Stage4WordSearch = {
    id: 'stage4',
    title: 'Word Search',
    tokenReward: 'MY',
    answer: 'SMILE',
    grid: [],
    selectedCells: [],
    gridSize: 6,

    render(container, state, callbacks) {
        this.callbacks = callbacks;
        this.answer = 'SMILE';
        this.gridSize = 6;
        this.selectedCells = [];
        
        // Generate grid with hidden word
        this.generateGrid();

        const html = `
            <div class="wordsearch-container">
                <p style="text-align: center; margin-bottom: 20px; font-size: 18px; color: #71004f;">
                    Click letters in sequence to find the hidden word
                </p>
                <div class="wordsearch-grid" id="wordsearch-grid">
                    ${this.grid.map((row, r) => 
                        row.map((cell, c) => `
                            <div class="wordsearch-cell" data-row="${r}" data-col="${c}">
                                ${cell.letter}
                            </div>
                        `).join('')
                    ).join('')}
                </div>
                <div class="wordsearch-answer" id="wordsearch-answer">
                    ${this.selectedCells.map(cell => cell.letter).join('') || ''}
                </div>
                <button id="clear-selection" class="reset-button" style="margin-top: 15px; max-width: 200px; margin-left: auto; margin-right: auto;">
                    Clear
                </button>
            </div>
        `;

        container.innerHTML = html;

        // Setup click handlers using event delegation (more robust)
        const gridEl = container.querySelector('#wordsearch-grid');
        if (gridEl) {
            gridEl.addEventListener('click', (e) => {
                const cell = e.target.closest('.wordsearch-cell');
                if (cell) {
                    this.handleCellClick(cell);
                }
            });
        }

        const clearButton = container.querySelector('#clear-selection');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearSelection();
            });
        }
    },

    generateGrid() {
        // Create empty grid
        this.grid = Array(this.gridSize).fill(null).map(() => 
            Array(this.gridSize).fill(null)
        );

        // Place answer word horizontally (random row, random start column)
        const row = Math.floor(Math.random() * this.gridSize);
        const startCol = Math.floor(Math.random() * (this.gridSize - this.answer.length + 1));
        
        const answerLetters = this.answer.split('');
        answerLetters.forEach((letter, i) => {
            this.grid[row][startCol + i] = { letter, isAnswer: true, index: i };
        });

        // Fill remaining cells with random letters
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (!this.grid[r][c]) {
                    this.grid[r][c] = { 
                        letter: alphabet[Math.floor(Math.random() * alphabet.length)],
                        isAnswer: false 
                    };
                }
            }
        }
    },

    handleCellClick(cell) {
        // Validate cell and data attributes
        if (!cell || !cell.dataset) {
            console.log('Invalid cell element');
            return;
        }

        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        // Validate row and col are valid numbers
        if (isNaN(row) || isNaN(col) || row < 0 || col < 0 || 
            row >= this.gridSize || col >= this.gridSize) {
            console.warn('Invalid cell coordinates:', row, col);
            return;
        }

        // Validate grid data exists
        if (!this.grid[row] || !this.grid[row][col]) {
            console.warn('Cell data not found at:', row, col);
            return;
        }

        const cellData = this.grid[row][col];
        if (!cellData || !cellData.letter) {
            console.warn('Invalid cell data:', cellData);
            return;
        }

        // Check if this cell is already selected
        const existingIndex = this.selectedCells.findIndex(
            c => c.row === row && c.col === col
        );

        if (existingIndex !== -1) {
            // Deselect if clicking the last selected cell
            if (existingIndex === this.selectedCells.length - 1) {
                this.selectedCells.pop();
                cell.classList.remove('selected');
            }
        } else {
            // Add to selection if it's adjacent to last selected (or first selection)
            if (this.selectedCells.length === 0 || this.isAdjacent(row, col)) {
                this.selectedCells.push({
                    row,
                    col,
                    letter: cellData.letter
                });
                cell.classList.add('selected');
            } else {
                // Cell is not adjacent - show alert
                alert('Please select adjacent cells in a straight line!');
            }
        }

        this.updateAnswerDisplay();
    },

    isAdjacent(row, col) {
        if (this.selectedCells.length === 0) return true;
        
        const last = this.selectedCells[this.selectedCells.length - 1];
        const rowDiff = row - last.row;
        const colDiff = col - last.col;
        
        // Must be adjacent (within 1 cell in any direction)
        if (Math.abs(rowDiff) > 1 || Math.abs(colDiff) > 1 || 
            (rowDiff === 0 && colDiff === 0)) {
            return false;
        }
        
        // If we have 2+ cells selected, enforce direction consistency
        // (must continue in the same direction as the previous selection)
        if (this.selectedCells.length >= 2) {
            const secondLast = this.selectedCells[this.selectedCells.length - 2];
            const prevRowDiff = last.row - secondLast.row;
            const prevColDiff = last.col - secondLast.col;
            
            // New cell must continue in the same direction
            return rowDiff === prevRowDiff && colDiff === prevColDiff;
        }
        
        // First selection after initial cell - any adjacent direction is fine
        return true;
    },

    updateAnswerDisplay() {
        const answerEl = document.getElementById('wordsearch-answer');
        if (answerEl) {
            answerEl.textContent = this.selectedCells.map(c => c.letter).join('');
        }
    },

    clearSelection() {
        this.selectedCells = [];
        const cells = document.querySelectorAll('.wordsearch-cell');
        cells.forEach(cell => {
            cell.classList.remove('selected');
        });
        this.updateAnswerDisplay();
    },

    checkAnswer() {
        const userAnswer = this.selectedCells.map(c => c.letter).join('');
        
        if (userAnswer.length === 0) {
            return { correct: false, message: 'Please select some letters!' };
        }

        if (userAnswer === this.answer) {
            return { correct: true };
        } else {
            return { correct: false, message: 'Not the right word. Try again!' };
        }
    },

    reset() {
        this.generateGrid();
        this.selectedCells = [];
        
        const gridEl = document.getElementById('wordsearch-grid');
        if (!gridEl) {
            console.warn('Grid element not found during reset');
            return;
        }

        gridEl.innerHTML = this.grid.map((row, r) => 
            row.map((cell, c) => `
                <div class="wordsearch-cell" data-row="${r}" data-col="${c}">
                    ${cell.letter}
                </div>
            `).join('')
        ).join('');

        // Clear any selected visual state
        const allCells = document.querySelectorAll('.wordsearch-cell');
        allCells.forEach(cell => {
            cell.classList.remove('selected');
        });

        // Note: Event handlers are already attached via event delegation in render(),
        // so no need to re-attach them here

        this.updateAnswerDisplay();
    },

    getHint(level) {
        if (level === 1) {
            return 'You so precious when you  _________';
        } else {
            return '<img src="assets/smile.png" alt="Hint: What you do without trying" style="max-width: 300px; max-height: 300px; border-radius: 8px; margin-top: 10px; display: block; margin-left: auto; margin-right: auto;" />';
        }
    }
};
