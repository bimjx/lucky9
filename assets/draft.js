// Constants and Variables
const startButton = document.getElementById('start-btn');
const resultText = document.getElementById('result');
const TURN_TIME_LIMIT = 15000; // 15 seconds

let player1Cards = [];
let player2Cards = [];
let player1Turn = true;
let gameInProgress = false;
let turnTimer;

let player1Score = 0;
let player2Score = 0;

const cardValues = {
    2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 1
};

const suits = ['♠', '♥', '♦', '♣'];
const deck = [];

// Generate deck
for (const suit of suits) {
    for (let value = 2; value <= 10; value++) {
        deck.push({ value, suit });
    }
    deck.push({ value: 'J', suit });
    deck.push({ value: 'Q', suit });
    deck.push({ value: 'K', suit });
    deck.push({ value: 'A', suit });
}

let shuffledDeck = shuffleDeck([...deck]);

// Functions to Manage Deck and Hand
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function calculateTotal(hand) {
    const sum = hand.reduce((total, card) => total + cardValues[card.value], 0);
    return sum % 10;
}

// Display and Interactivity Functions
function displayPlayerCards(player) {
    const playerCards = player === 1 ? player1Cards : player2Cards;
    const playerTotal = document.getElementById(`player${player}-total`);
    const playerCardsDiv = document.getElementById(`player${player}-cards`);

    playerCardsDiv.innerHTML = '';
    if (playerCards.length === 2) {
        // Show back-facing cards initially
        for (let i = 0; i < 2; i++) {
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            playerCardsDiv.appendChild(cardBack);
        }
        playerTotal.innerHTML = 'Total: ?';
        disableAllButtons();

        // Reveal button to show initial two cards
        const revealBtn = document.createElement('button');
        revealBtn.textContent = 'Reveal Cards';
        revealBtn.classList.add('reveal-btn');
        revealBtn.onclick = () => {
            showAllCards(player);
            revealBtn.disabled = true;
            document.getElementById(`hit-btn-${player}`).disabled = false;
            document.getElementById(`stand-btn-${player}`).disabled = false;
        };
        playerCardsDiv.appendChild(revealBtn);
    } else {
        // If third card is drawn, reveal all three automatically
        showAllCards(player);
    }
}

function showAllCards(player) {
    const playerCards = player === 1 ? player1Cards : player2Cards;
    const playerTotal = document.getElementById(`player${player}-total`);
    const playerCardsDiv = document.getElementById(`player${player}-cards`);

    playerCardsDiv.innerHTML = ''; // Clear existing cards

    playerCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
        cardElement.innerHTML = `
            <span class="top-left">${card.value}</span>
            <span class="suit">${card.suit}</span>
            <span class="bottom-right">${card.value}</span>
        `;
        playerCardsDiv.appendChild(cardElement);
    });

    playerTotal.innerHTML = 'Total: ' + calculateTotal(playerCards);
}

// Game Logic Functions
function hit(player) {
    let playerCards = player === 1 ? player1Cards : player2Cards;

    if (playerCards.length < 3) {
        playerCards.push(shuffledDeck.pop());
        displayPlayerCards(player);
    }

    let total = calculateTotal(playerCards);

    if (player === 1 && total === 9) {
        document.getElementById('hit-btn-2').disabled = false;
        document.getElementById('stand-btn-2').disabled = true;
        document.getElementById('hit-btn-1').disabled = true;
        document.getElementById('stand-btn-1').disabled = true;
        document.getElementById('player1').classList.remove('active');
        document.getElementById('player2').classList.add('active');

        setTimeout(() => hit(2), 1000);
        return;
    }

    if (playerCards.length === 3) {
        stand(player);
    } else {
        startTurnTimer(player);
    }
}

function startTurnTimer(player) {
    clearTimeout(turnTimer);
    turnTimer = setTimeout(() => stand(player), TURN_TIME_LIMIT);
}

function stand(player) {
    clearTimeout(turnTimer);

    if (player === 1) {
        document.getElementById('hit-btn-1').disabled = true;
        document.getElementById('stand-btn-1').disabled = true;
        document.getElementById('hit-btn-2').disabled = true;
        document.getElementById('stand-btn-2').disabled = true;
        document.getElementById('player1').classList.remove('active');
        document.getElementById('player2').classList.add('active');
        startTurnTimer(2);
    } else {
        determineWinner();
    }
}

function declareWinner() {
    const player1Total = calculateTotal(player1Cards);
    const player2Total = calculateTotal(player2Cards);

    if (player1Total === player2Total) {
        resultText.innerHTML = '🤝 It\'s a Tie!';
    } else if (player1Total > player2Total) {
        resultText.innerHTML = '🎉 Player 1 Wins!';
        player1Score++;
    } else {
        resultText.innerHTML = '🎉 Player 2 Wins!';
        player2Score++;
    }

    updateScoreDisplay();
    disableAllButtons();
    startButton.disabled = false;
    document.getElementById('continue-btn').style.display = 'inline-block';
    document.getElementById('continue-btn').disabled = false;
    gameInProgress = false;
}

// Start New Game or Continue
function startGame(isNewGame = true) {
    if (gameInProgress) return;

    gameInProgress = true;
    startButton.disabled = true;
    clearTimeout(turnTimer);
    document.getElementById('continue-btn').style.display = 'none';

    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const shuffleOverlay = createShuffleOverlay();
    document.body.appendChild(shuffleOverlay);

    setTimeout(() => {
        document.body.removeChild(shuffleOverlay);
        loading.style.display = 'none';

        shuffledDeck = shuffleDeck([...deck]);
        player1Cards = [];
        player2Cards = [];
        resultText.innerHTML = '';
        resultText.classList.remove('winner', 'loser');

        setTimeout(() => {
            resetGameUI(isNewGame);
            player1Cards.push(shuffledDeck.pop(), shuffledDeck.pop());
            player2Cards.push(shuffledDeck.pop(), shuffledDeck.pop());
            displayPlayerCards(1);
            displayPlayerCards(2);

            let player1Total = calculateTotal(player1Cards);
            let player2Total = calculateTotal(player2Cards);

            if (player1Total === 9) {
                declareImmediateWinner(1);
                return;
            } else if (player2Total === 9) {
                declareImmediateWinner(2);
                return;
            }

            document.getElementById('player1').classList.add('active');
            document.getElementById('player2').classList.remove('active');
            player1Turn = true;
        }, 1000);
    }, 2000);
}

// Utility Functions
function createShuffleOverlay() {
    const shuffleOverlay = document.createElement('div');
    shuffleOverlay.id = 'shuffle-overlay';
    shuffleOverlay.style.position = 'absolute';
    shuffleOverlay.style.top = '50%';
    shuffleOverlay.style.left = '50%';
    shuffleOverlay.style.transform = 'translate(-50%, -50%)';
    shuffleOverlay.style.display = 'flex';
    shuffleOverlay.style.justifyContent = 'center';
    shuffleOverlay.style.alignItems = 'center';
    shuffleOverlay.style.gap = '10px';
    shuffleOverlay.style.zIndex = '1000';
    shuffleOverlay.style.width = '100%';
    shuffleOverlay.style.height = '100vh';
    shuffleOverlay.style.background = 'rgba(0, 0, 0, 0.7)';

    for (let i = 0; i < 5; i++) {
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.style.animationDelay = `${i * 0.2}s`;
        shuffleOverlay.appendChild(cardBack);
    }

    return shuffleOverlay;
}

function resetGameUI(isNewGame) {
    document.getElementById('player1-cards').innerHTML = '<div class="card-back"></div><div class="card-back"></div>';
    document.getElementById('player2-cards').innerHTML = '<div class="card-back"></div><div class="card-back"></div>';
    document.getElementById('player1-total').innerHTML = 'Total: ?';
    document.getElementById('player2-total').innerHTML = 'Total: ?';
    document.getElementById('hit-btn-1').style.display = 'inline-block';
    document.getElementById('stand-btn-1').style.display = 'inline-block';
    document.getElementById('hit-btn-2').style.display = 'inline-block';
    document.getElementById('stand-btn-2').style.display = 'inline-block';
    document.getElementById('hit-btn-1').disabled = false;
    document.getElementById('stand-btn-1').disabled = false;
    document.getElementById('hit-btn-2').disabled = true;
    document.getElementById('stand-btn-2').disabled = true;

    if (isNewGame) {
        player1Score = 0;
        player2Score = 0;
    }

    updateScoreDisplay();
}

// Event Listeners
startButton.addEventListener('click', () => startGame(true));
document.getElementById('continue-btn').addEventListener('click', () => startGame(false));
document.getElementById('hit-btn-1').addEventListener('click', () => hit(1));
document.getElementById('stand-btn-1').addEventListener('click', () => stand(1));
document.getElementById('hit-btn-2').addEventListener('click', () => hit(2));
document.getElementById('stand-btn-2').addEventListener('click', () => stand(2));

// Window Load for Button Initialization
window.onload = function () {
    document.getElementById('hit-btn-1').style.display = 'none';
    document.getElementById('stand-btn-1').style.display = 'none';
    document.getElementById('hit-btn-2').style.display = 'none';
    document.getElementById('stand-btn-2').style.display = 'none';
};

// Score Update Function
function updateScoreDisplay() {
    document.querySelectorAll('.player')[0].querySelector('.score-badge').textContent = `Score: ${player1Score}`;
    document.querySelectorAll('.player')[1].querySelector('.score-badge').textContent = `Score: ${player2Score}`;
}

function disableAllButtons() {
    document.getElementById('hit-btn-1').disabled = true;
    document.getElementById('stand-btn-1').disabled = true;
    document.getElementById('hit-btn-2').disabled = true;
    document.getElementById('stand-btn-2').disabled = true;
}
