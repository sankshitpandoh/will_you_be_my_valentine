// Stage 5: Mixed Puzzle (Riddles)
window.Stage5Quiz = {
    id: 'stage5',
    title: 'Riddles',
    tokenReward: 'VALENTINE',
    questions: [
        {
            text: 'Pick the naughtiest cat',
            options: ['BISCUIT.PNG', 'ARCHIE.PNG', 'COFFEE.PNG'],
            images: ['assets/BISCUIT.PNG', 'assets/ARCHIE.PNG', 'assets/COFFEE.PNG'],
            alternateImage: 'assets/BISCUIT2.PNG', // Alternate image for biscuit when selected
            correct: 0, // Biscuit
            isImageQuestion: true
        },
        {
            text: 'Way down yonder on the Chattahoochee, it gets hotter than _______ ?',
            options: ['Chattahoochee', 'Hoochie Coochie', 'Gujarat', 'Jabalpur'],
            correct: 0 // Chattahoochee
        },
        {
            text: 'When you get where you\'re goin\', don\'t forget turn back around\nAnd help the next one in line\nAlways stay __________________ ?',
            options: ['Hot', 'Sexy', 'Humble and Kind', 'in da zone'],
            correct: 2 // Humble and Kind
        }
    ],
    selectedAnswers: [],

    render(container, state, callbacks) {
        this.callbacks = callbacks;
        this.selectedAnswers = Array(this.questions.length).fill(null);

        const html = `
            <div class="quiz-container">
                <p style="text-align: center; margin-bottom: 20px; font-size: 18px; color: #71004f;">
                    Answer the questions (get 2 out of 3 correct to pass)
                </p>
                ${this.questions.map((q, qIndex) => `
                    <div class="quiz-question">
                        <div class="quiz-question-text">${q.text.replace(/\n/g, '<br>')}</div>
                        <div class="quiz-options ${q.isImageQuestion ? 'quiz-options-images' : ''}">
                            ${q.options.map((option, oIndex) => {
                                if (q.isImageQuestion) {
                                    return `
                                        <div class="quiz-option quiz-option-image" data-question="${qIndex}" data-option="${oIndex}">
                                            <img src="${q.images[oIndex]}" alt="${option}" class="quiz-image" data-original-src="${q.images[oIndex]}" data-alternate-src="${qIndex === 0 && oIndex === 0 ? q.alternateImage : ''}">
                                            <div class="quiz-image-label">${option.replace('.PNG', '')}</div>
                                        </div>
                                    `;
                                } else {
                                    return `
                                        <div class="quiz-option" data-question="${qIndex}" data-option="${oIndex}">
                                            ${String.fromCharCode(65 + oIndex)}) ${option}
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;

        // Setup click handlers
        const options = container.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                this.handleOptionClick(option);
            });
        });
    },

    handleOptionClick(option) {
        const questionIndex = parseInt(option.dataset.question);
        const optionIndex = parseInt(option.dataset.option);
        const question = this.questions[questionIndex];

        // Update selection
        this.selectedAnswers[questionIndex] = optionIndex;

        // Update UI
        const questionEl = option.closest('.quiz-question');
        const allOptions = questionEl.querySelectorAll('.quiz-option');
        
        // Handle image switching for the cat question (first question)
        if (questionIndex === 0 && question.isImageQuestion) {
            // Find the Biscuit option (index 0)
            const biscuitOption = Array.from(allOptions).find(opt => parseInt(opt.dataset.option) === 0);
            const biscuitImg = biscuitOption ? biscuitOption.querySelector('.quiz-image') : null;
            
            if (biscuitImg) {
                // If Biscuit is selected, switch to alternate image
                if (optionIndex === 0) {
                    biscuitImg.src = question.alternateImage;
                } else {
                    // If Biscuit is deselected, revert to original image
                    biscuitImg.src = question.images[0];
                }
            }
        }
        
        // Update selection states
        allOptions.forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
    },

    checkAnswer() {
        // Check if all questions are answered
        if (this.selectedAnswers.some(answer => answer === null)) {
            return { correct: false, message: 'Please answer all questions!' };
        }

        // Count correct answers
        let correctCount = 0;
        this.selectedAnswers.forEach((selected, index) => {
            if (selected === this.questions[index].correct) {
                correctCount++;
            }
        });

        // Need at least 2/3 correct
        if (correctCount >= 2) {
            return { correct: true };
        } else {
            return { correct: false, message: `You got ${correctCount} out of 3. Need at least 2 correct!` };
        }
    },

    reset() {
        this.selectedAnswers = Array(this.questions.length).fill(null);
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    },

    getHint(level) {
        if (level === 1) {
            return 'For the cat question: Think about who causes the most mischief!';
        } else {
            return 'Biscuit is definitely the naughtiest one!';
        }
    }
};
