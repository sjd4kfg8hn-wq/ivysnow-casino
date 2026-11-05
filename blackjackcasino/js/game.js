/**
 * CASINO MONTE PINÁCULO - CONTROLADOR PRINCIPAL DEL JUEGO (GAME.JS)
 */

import { BlackjackEngine } from './engine.js';
import { AI_BOTS } from './aiPlayers.js';
import { DEALER_CONFIG } from './dealer.js';

class CasinoGame {
  constructor() {
    this.engine = new BlackjackEngine(6);
    this.bankroll = 10000;
    this.currentBet = 0;
    this.gameState = 'BETTING'; // BETTING, PLAYING, DEALER_TURN, FINISHED
    
    this.initListeners();
    this.updateUI();
  }

  initListeners() {
    // Manejo de selección de fichas de apuesta
    const chipButtons = document.querySelectorAll('.chip-btn');
    chipButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.gameState !== 'BETTING') return;
        const value = parseInt(e.target.getAttribute('data-value'));
        if (this.bankroll >= value) {
          this.currentBet += value;
          this.bankroll -= value;
          this.updateUI();
        }
      });
    });

    // Botón de Repartir
    const dealBtn = document.getElementById('deal-btn');
    if (dealBtn) {
      dealBtn.addEventListener('click', () => {
        if (this.gameState === 'BETTING' && this.currentBet > 0) {
          this.startRound();
        } else if (this.currentBet === 0) {
          alert("¡Coloca una ficha en la mesa antes de repartir, jefe!");
        }
      });
    }
  }

  startRound() {
    this.gameState = 'PLAYING';
    document.getElementById('dealer-dialogue.innerText') = `"${DEALER_CONFIG.dialogues.dealing}"`;
    
    // Repartir cartas iniciales a jugadores IA y humano
    AI_BOTS.forEach(bot => {
      bot.hand = [this.engine.drawCard(), this.engine.drawCard()];
    });
    
    this.humanHand = [this.engine.drawCard(), this.engine.drawCard()];
    this.dealerHand = [this.engine.drawCard(), this.engine.drawCard()];

    this.renderTable();
  }

  renderTable() {
    // Actualizar visualmente las manos y puntuaciones en el DOM
    AI_BOTS.forEach((bot, index) => {
      const seatElement = document.getElementById(`seat-${index + 1}`);
      const cardsDiv = seatElement.querySelector('.cards');
      cardsDiv.innerHTML = bot.hand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
    });

    // Renderizar mano del jugador humano
    const humanSeat = document.getElementById('seat-human');
    const humanCardsDiv = humanSeat.querySelector('.cards');
    humanCardsDiv.innerHTML = this.humanHand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');

    // Renderizar mano del crupier (ocultando la segunda carta inicialmente)
    const dealerCardsDiv = document.getElementById('dealer-cards');
    dealerCardsDiv.innerHTML = `<span class="card">${this.dealerHand[0].value}${this.dealerHand[0].suit}</span> <span class="card">🎴</span>`;
    
    document.getElementById('dealer-score').innerText = `Puntuación visible: ${this.dealerHand[0].numericValue}`;
  }

  updateUI() {
    document.getElementById('player-bankroll').innerText = `${this.bankroll.toLocaleString()}€`;
    document.getElementById('human-bet').innerText = `Apuesta: ${this.currentBet.toLocaleString()}€`;
  }
}

// Inicializar el juego al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
  window.casinoGame = new CasinoGame();
  console.log("Casino Monte Pináculo - Sistema iniciado correctamente.");
});
