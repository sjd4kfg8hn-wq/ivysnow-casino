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
    
    // CORRECCIÓN AQUÍ: Selección limpia del elemento por ID
    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) {
      dialogueEl.innerText = `"${DEALER_CONFIG.dialogues.dealing}"`;
    }
    
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
      if (seatElement) {
        const cardsDiv = seatElement.querySelector('.cards');
        if (cardsDiv) {
          cardsDiv.innerHTML = bot.hand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
        }
      }
    });

    // Renderizar mano del jugador humano
    const humanSeat = document.getElementById('seat-human');
    if (humanSeat) {
      const humanCardsDiv = humanSeat.querySelector('.cards');
      if (humanCardsDiv) {
        humanCardsDiv.innerHTML = this.humanHand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
      }
    }

    // Renderizar mano del crupier (ocultando la segunda carta inicialmente)
    const dealerCardsDiv = document.getElementById('dealer-cards');
    if (dealerCardsDiv) {
      dealerCardsDiv.innerHTML = `<span class="card">${this.dealerHand[0].value}${this.dealerHand[0].suit}</span> <span class="card">🎴</span>`;
    }
    
    const dealerScoreEl = document.getElementById('dealer-score');
    if (dealerScoreEl) {
      dealerScoreEl.innerText = `Puntuación visible: ${this.dealerHand[0].numericValue}`;
    }
  }

  updateUI() {
    const bankrollEl = document.getElementById('player-bankroll');
    if (bankrollEl) bankrollEl.innerText = `${this.bankroll.toLocaleString()}€`;

    const humanBetEl = document.getElementById('human-bet');
    if (humanBetEl) humanBetEl.innerText = `Apuesta: ${this.currentBet.toLocaleString()}€`;
  }
}

// Inicializar el juego al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
  window.casinoGame = new CasinoGame();
  console.log("Casino Monte Pináculo - Sistema iniciado correctamente.");
});
