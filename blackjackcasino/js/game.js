/**
 * CASINO MONTE PINÁCULO - CONTROLADOR CON APUESTAS PARA EL JUGADOR HUMANO
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
    
    this.humanHands = [];
    this.activeHandIndex = 0;
    this.dealerHand = [];

    this.initListeners();
    this.updateUI();
  }

  initListeners() {
    // Escuchador de clic en cada ficha para el jugador humano
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.gameState !== 'BETTING') return;
        
        // Obtener el valor de la ficha pulsada
        const value = parseInt(btn.getAttribute('data-value'));
        
        // Validar si hay saldo suficiente
        if (this.bankroll >= value) {
          this.currentBet += value;
          this.bankroll -= value;
          this.updateUI();
        } else {
          alert("¡No tienes suficiente saldo para esta apuesta!");
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
          alert("¡Haz tu apuesta seleccionando las fichas antes de repartir, jefe!");
        }
      });
    }
  }

  startRound() {
    this.gameState = 'PLAYING';
    
    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) dialogueEl.innerText = `"${DEALER_CONFIG.dialogues.dealing}"`;

    // Asignar apuestas a los animales IA
    AI_BOTS.forEach(bot => {
      bot.hand = [this.engine.drawCard(), this.engine.drawCard()];
    });

    // Crear la mano inicial del jugador humano
    this.humanHands = [{ cards: [this.engine.drawCard(), this.engine.drawCard()], bet: this.currentBet }];
    this.dealerHand = [this.engine.drawCard(), this.engine.drawCard()];

    this.renderTable();
  }

  renderTable() {
    // Renderizar cartas de los animales IA
    AI_BOTS.forEach((bot, index) => {
      const seat = document.getElementById(`seat-${index + 1}`);
      if (seat) {
        const cardsDiv = seat.querySelector('.cards');
        if (cardsDiv) {
          cardsDiv.innerHTML = bot.hand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
        }
      }
    });

    // Renderizar mano y apuestas de la posición del jugador humano
    const humanSeat = document.getElementById('seat-human');
    if (humanSeat) {
      const humanCardsDiv = humanSeat.querySelector('.cards');
      if (humanCardsDiv && this.humanHands.length > 0) {
        humanCardsDiv.innerHTML = this.humanHands[0].cards.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
      }
    }

    // Renderizar Crupier
    const dealerCardsDiv = document.getElementById('dealer-cards');
    if (dealerCardsDiv) {
      dealerCardsDiv.innerHTML = `<span class="card">${this.dealerHand[0].value}${this.dealerHand[0].suit}</span> <span class="card">🎴</span>`;
    }
  }

  updateUI() {
    // Actualizar Saldo total y Apuesta actual en la interfaz y en el cuadro del humano
    const bankrollEl = document.getElementById('player-bankroll');
    if (bankrollEl) bankrollEl.innerText = `${this.bankroll.toLocaleString()}€`;

    const humanBetEl = document.getElementById('human-bet');
    if (humanBetEl) humanBetEl.innerText = `Apuesta: ${this.currentBet.toLocaleString()}€`;

    // Actualizar también dentro del cuadro de la mesa de Tú (VIP)
    const seatHuman = document.getElementById('seat-human');
    if (seatHuman) {
      const betInfo = seatHuman.querySelector('.bet-info');
      if (betInfo) betInfo.innerText = `Apuesta: ${this.currentBet.toLocaleString()}€`;
      
      const bankInfo = seatHuman.querySelector('.bankroll-display');
      if (bankInfo) bankInfo.innerHTML = `Saldo: <span>${this.bankroll.toLocaleString()}€</span>`;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.casinoGame = new CasinoGame();
});
