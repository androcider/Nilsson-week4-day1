const http = require('http');
const fs = require('fs');
const path = require('path');

// Set content type based on file extension
const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Determine the file path
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './snake.html'; // Serve snake.html by default
    }

    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();

    // Set content type
    const contentTypeHeader = contentType[extname] || 'application/octet-stream';

    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                // File not found
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // Server error
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + err.code);
            }
        } else {
            // Serve the file
            res.writeHead(200, { 'Content-Type': contentTypeHeader });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 3000; // Set the port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Snake game logic
const blockSize = 20;
const width = 20;
const height = 20;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = 'right';
let score = 0;
let gameLoopInterval;

function draw() {
    console.clear();
    console.log('┌' + '─'.repeat(width) + '┐');
    for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1) {
                row += '│';
            } else if (x === food.x && y === food.y) {
                row += '●';
            } else if (snake.some(segment => segment.x === x && segment.y === y)) {
                row += '■';
            } else {
                row += ' ';
            }
        }
        console.log(row);
    }
    console.log('└' + '─'.repeat(width) + '┘');
    console.log(`Score: ${score}`);
    if (isGameOver) console.log('Game over! Press Ctrl+C to exit.');
}

function update() {
    if (isGameOver) return;

    const head = { ...snake[0] };
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    if (head.x < 1 || head.x >= width - 1 || head.y < 0 || head.y >= height || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        isGameOver = true;
        draw();
        rl.close();
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
    draw();
}

function generateFood() {
    food.x = Math.floor(Math.random() * (width - 2)) + 1;
    food.y = Math.floor(Math.random() * (height - 2));
}

function gameLoop() {
    update();
    if (!isGameOver) setTimeout(gameLoop, 100); // Decreased interval to 100 milliseconds
}

// Function to handle user input
function handleInput(input) {
    switch (input.toLowerCase()) {
        case 'w':
            if (direction !== 'down') direction = 'up';
            break;
        case 's':
            if (direction !== 'up') direction = 'down';
            break;
        case 'a':
            if (direction !== 'right') direction = 'left';
            break;
        case 'd':
            if (direction !== 'left') direction = 'right';
            break;
        case 'q':
            isGameOver = true;
            draw();
            rl.close();
            break;
    }
}

// Start the game loop
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isGameOver = false;
generateFood();
draw();
rl.on('line', handleInput);
gameLoop();
