// Stage 3: Tile Swap Puzzle (3x3)
window.Stage3Tiles = {
    id: 'stage3',
    title: 'Visual Puzzle',
    tokenReward: 'BE',
    gridSize: 3,
    tiles: [],
    selectedTile: null,
    imageUrl: null,

    render(container, state, callbacks) {
        this.callbacks = callbacks;
        this.gridSize = 3;
        this.selectedTile = null;

        // Start with fallback pattern, then try to load image
        this.imageUrl = null;
        
        // Create shuffled tiles
        const totalTiles = this.gridSize * this.gridSize;
        this.tiles = Array.from({ length: totalTiles }, (_, i) => i);
        this.shuffleTiles();

        const html = `
            <div class="tiles-container">
                <p style="text-align: center; margin-bottom: 20px; font-size: 18px; color: #71004f;">
                    Click two tiles to swap them and reconstruct the image
                </p>
                <div class="tiles-grid" id="tiles-grid">
                    ${this.tiles.map((tileIndex, i) => `
                        <div class="tile" data-index="${i}" data-tile-index="${tileIndex}">
                            ${this.renderTile(tileIndex)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Use event delegation on the grid container
        const gridContainer = container.querySelector('#tiles-grid');
        gridContainer.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (tile) {
                this.handleTileClick(tile);
            }
        });

        // Try to load image (will update tiles if successful)
        this.loadImage();
    },

    renderTile(tileIndex) {
        const row = Math.floor(tileIndex / this.gridSize);
        const col = tileIndex % this.gridSize;
        
        if (this.imageUrl) {
            // Calculate background position for this tile
            // For a 3x3 grid, each tile is 1/3 of the image
            // Position: (col * 100/3)%, (row * 100/3)%
            const xPercent = (col / (this.gridSize - 1)) * 100;
            const yPercent = (row / (this.gridSize - 1)) * 100;
            
            return `
                <div style="
                    width: 100%;
                    height: 100%;
                    background-image: url('${this.imageUrl}');
                    background-size: ${this.gridSize * 100}%;
                    background-position: ${xPercent}% ${yPercent}%;
                    background-repeat: no-repeat;
                "></div>
            `;
        } else {
            // Fallback pattern with numbers
            const colors = ['#ffdde1', '#ff9a9e', '#fecfef', '#ff4d79', '#ff6b9d', '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9'];
            const colorIndex = tileIndex % colors.length;
            const number = tileIndex + 1;
            return `
                <div class="tile-placeholder" style="background: ${colors[colorIndex]}; color: #71004f; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                    ${number}
                </div>
            `;
        }
    },

    loadImage() {
        // Try multiple possible image paths (check jpg, jpeg, png in various cases)
        const possiblePaths = [
            'assets/photo.png',
            'assets/photo.PNG',
            'assets/photo.jpg',
            'assets/photo.JPG',
            'assets/photo.jpeg',
            'assets/photo.JPEG',
            '../assets/photo.png',
            '../assets/photo.PNG',
            '../assets/photo.jpg',
            '../assets/photo.JPG',
            '../../assets/photo.png',
            '../../assets/photo.PNG',
            '../../assets/photo.jpg',
            '../../assets/photo.JPG',
            'year2026-updated/assets/photo.png',
            'year2026-updated/assets/photo.PNG',
            'year2026-updated/assets/photo.jpg',
            'year2026-updated/assets/photo.JPG'
        ];
        
        let triedPaths = 0;
        const tryNextPath = () => {
            if (triedPaths >= possiblePaths.length) {
                // All paths failed, keep fallback pattern
                this.imageUrl = null;
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                // Image loaded successfully, update tiles
                this.imageUrl = possiblePaths[triedPaths];
                this.updateTileBackgrounds();
            };
            img.onerror = () => {
                // Try next path
                triedPaths++;
                tryNextPath();
            };
            img.src = possiblePaths[triedPaths];
        };
        
        tryNextPath();
    },

    updateTileBackgrounds() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tileEl) => {
            const tileIndex = parseInt(tileEl.dataset.tileIndex);
            tileEl.innerHTML = this.renderTile(tileIndex);
        });
    },

    handleTileClick(tile) {
        if (this.selectedTile === null) {
            // Select first tile
            this.selectedTile = tile;
            tile.classList.add('selected');
        } else if (this.selectedTile === tile) {
            // Deselect
            this.selectedTile.classList.remove('selected');
            this.selectedTile = null;
        } else {
            // Swap tiles
            const index1 = parseInt(this.selectedTile.dataset.index);
            const index2 = parseInt(tile.dataset.index);
            
            // Swap in array
            [this.tiles[index1], this.tiles[index2]] = [this.tiles[index2], this.tiles[index1]];
            
            // Update UI
            const tileIndex1 = this.tiles[index1];
            const tileIndex2 = this.tiles[index2];
            
            // Update data attributes and content
            this.selectedTile.dataset.tileIndex = tileIndex1;
            this.selectedTile.innerHTML = this.renderTile(tileIndex1);
            this.selectedTile.classList.remove('selected');
            
            tile.dataset.tileIndex = tileIndex2;
            tile.innerHTML = this.renderTile(tileIndex2);
            
            // Deselect
            this.selectedTile = null;
        }
    },

    shuffleTiles() {
        // Fisher-Yates shuffle
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }
        
        // Ensure puzzle is solvable (even number of inversions)
        if (!this.isSolvable()) {
            // Swap first two tiles to fix parity
            [this.tiles[0], this.tiles[1]] = [this.tiles[1], this.tiles[0]];
        }
    },

    isSolvable() {
        let inversions = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = i + 1; j < this.tiles.length; j++) {
                if (this.tiles[i] > this.tiles[j] && this.tiles[i] !== this.tiles.length - 1 && this.tiles[j] !== this.tiles.length - 1) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0;
    },

    checkAnswer() {
        // Check if tiles are in correct order (0 to 8)
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] !== i) {
                return { correct: false, message: 'Not quite right. Keep trying!' };
            }
        }
        return { correct: true };
    },

    reset() {
        this.shuffleTiles();
        this.selectedTile = null;
        
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tileEl, i) => {
            const tileIndex = this.tiles[i];
            tileEl.dataset.tileIndex = tileIndex;
            tileEl.innerHTML = this.renderTile(tileIndex);
            tileEl.classList.remove('selected');
        });
    },

    getHint(level) {
        if (level === 1) {
            return 'Start with the corners.';
        } else {
            return 'Try aligning the top edge first.';
        }
    }
};
