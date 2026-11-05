/**
 * CASINO MONTE PINÁCULO - ENGINE DE CONTROL (GAME.JS)
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

    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Escuchador de fichas
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        if (this.gameState !== 'BETTING') return;
        const val = parseInt(btn.getAttribute('data-value'), 10);
        if (this.bankroll >= val) {
          this.currentBet += val;
          this.bankroll -= val;
          this.updateUI();
        } else {
          alert("¡Saldo insuficiente para realizar esta apuesta!");
        }
      };
    });

    // Botón Borrar Apuesta
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (this.gameState !== 'BETTING') return;
        this.bankroll += this.currentBet;
        this.currentBet = 0;
        this.updateUI();
      };
    }

    // Botón Repartir
    const dealBtn = document.getElementById('deal-btn');
    if (dealBtn) {
      dealBtn.onclick = () => {
        if (this.gameState === 'BETTING' && this.currentBet > 0) {
          this.startRound();
        } else if (this.currentBet === 0) {
          alert("¡Por favor, selecciona tus fichas para apostar antes de repartir!");
        }
      };
    }

    // Botones de juego
    const hitBtn = document.getElementById('hit-btn');
    const standBtn = document.getElementById('stand-btn');
    const doubleBtn = document.getElementById('double-btn');
    const splitBtn = document.getElementById('split-btn');

    if (hitBtn) hitBtn.onclick = () => this.playerHit();
    if (standBtn) standBtn.onclick = () => this.playerStand();
    if (doubleBtn) doubleBtn.onclick = () => this.playerDouble();
    if (splitBtn) splitBtn.onclick = () => this.playerSplit();
  }

  startRound() {
    this.gameState = 'PLAYING';
    
    // Cambiar paneles visuales
    document.getElementById('betting-controls').style.display = 'none';
    document.getElementById('game-actions').style.display = 'flex';

    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) dialogueEl.innerText = `"${DEALER_CONFIG.dialogues.dealing}"`;

    // Repartir a la IA
    AI_BOTS.forEach(bot => {
      bot.hand = [this.engine.drawCard(), this.engine.drawCard()];
    });

    // Repartir al jugador y crupier
    this.humanHands = [{ cards: [this.engine.drawCard(), this.engine.drawCard()], bet: this.currentBet, doubled: false }];
    this.activeHandIndex = 0;
    this.dealerHand = [this.engine.drawCard(), this.engine.drawCard()];

    // Comprobar seguro si la carta visible del crupier es un As
    if (this.engine.canOfferInsurance(this.dealerHand[0])) {
      const insModal = document.getElementById('insurance-modal');
      if (insModal) insModal.style.display = 'flex';
      
      document.getElementById('insurance-yes').onclick = () => this.resolveInsurance(true);
      document.getElementById('insurance-no').onclick = () => this.resolveInsurance(false);
    }

    // Evaluar si se puede dividir
    const splitBtn = document.getElementById('split-btn');
    if (splitBtn) {
      splitBtn.style.display = (this.engine.canSplit(this.humanHands[0].cards) && this.bankroll >= this.currentBet) ? 'inline-block' : 'none';
    }

    this.renderTable();
  }

  resolveInsurance(accepted) {
    const insModal = document.getElementById('insurance-modal');
    if (insModal) insModal.style.display = 'none';
    if (accepted) {
      const insuranceCost = this.currentBet / 2;
      if (this.bankroll >= insuranceCost) {
        this.bankroll -= insuranceCost;
      }
    }
    this.updateUI();
  }

  playerHit() {
    const hand = this.humanHands[this.activeHandIndex];
    hand.cards.push(this.engine.drawCard());
    
    document.getElementById('double-btn').style.display = 'none';
    document.getElementById('split-btn').style.display = 'none';

    const evalResult = this.engine.calculateHand(hand.cards);
    if (evalResult.isBust || evalResult.score === 21) {
      this.nextHandOrDealer();
    }
    this.renderTable();
  }

  playerStand() {
    this.nextHandOrDealer();
  }

  playerDouble() {
    const hand = this.humanHands[this.activeHandIndex];
    if (this.bankroll >= hand.bet) {
      this.bankroll -= hand.bet;
      hand.bet *= 2;
      hand.doubled = true;
      hand.cards.push(this.engine.drawCard());
      this.updateUI();
      this.nextHandOrDealer();
    }
  }

  playerSplit() {
    const hand = this.humanHands[this.activeHandIndex];
    if (this.bankroll >= hand.bet && hand.cards.length === 2) {
      this.bankroll -= hand.bet;
      const newHand = {
        cards: [hand.cards.pop(), this.engine.drawCard()],
        bet: hand.bet,
        doubled: false
      };
      hand.cards.push(this.engine.drawCard());
      this.humanHands.push(newHand);
      document.getElementById('split-btn').style.display = 'none';
      this.updateUI();
      this.renderTable();
    }
  }

  nextHandOrDealer() {
    this.activeHandIndex++;
    if (this.activeHandIndex >= this.humanHands.length) {
      this.executeAiTurns();
    } else {
      this.renderTable();
    }
  }

  executeAiTurns() {
    document.getElementById('game-actions').style.display = 'none';

    // Inteligencia de los bots
    AI_BOTS.forEach(bot => {
      let evalHand = this.engine.calculateHand(bot.hand);
      while (bot.decideAction(evalHand.score, this.dealerHand[0].numericValue, evalHand.isSoft) === 'HIT') {
        bot.hand.push(this.engine.drawCard());
        evalHand = this.engine.calculateHand(bot.hand);
      }
    });

    // Turno del Crupier
    let dealerEval = this.engine.calculateHand(this.dealerHand);
    while (this.engine.shouldDealerHit(dealerEval.score, dealerEval.isSoft)) {
      this.dealerHand.push(this.engine.drawCard());
      dealerEval = this.engine.calculateHand(this.dealerHand);
    }

    this.settleGame();
  }

  settleGame() {
    this.gameState = 'FINISHED';
    let totalPayout = 0;
    const dealerEval = this.engine.calculateHand(this.dealerHand);

    this.humanHands.forEach(hand => {
      const pEval = this.engine.calculateHand(hand.cards);
      if (!pEval.isBust) {
        if (dealerEval.isBust || pEval.score > dealerEval.score) {
          totalPayout += hand.bet * 2;
        } else if (pEval.score === dealerEval.score) {
          totalPayout += hand.bet;
        }
      }
    });

    this.bankroll += totalPayout;
    this.renderTable();

    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) {
      dialogueEl.innerText = totalPayout > 0 ? '"¡Enhorabuena VIP, excelente jugada!"' : '"La casa se queda la banca en esta mano."';
    }

    setTimeout(() => {
      document.getElementById('betting-controls').style.display = 'flex';
      document.getElementById('game-actions').style.display = 'none';
      this.gameState = 'BETTING';
      this.currentBet = 0;
      this.updateUI();
    }, 4500);
  }

  renderTable() {
    // Dibujar cartas de bots
    AI_BOTS.forEach((bot, idx) => {
      const seat = document.getElementById(`seat-${idx + 1}`);
      if (seat) {
        let cardsContainer = seat.querySelector('.cards');
        if (!cardsContainer) {
          cardsContainer = document.createElement('div');
          cardsContainer.className = 'cards';
          seat.appendChild(cardsContainer);
        }
        cardsContainer.innerHTML = bot.hand.map(c => 
          `<span style="background:#fff; color:#111; padding:3px 6px; border-radius:4px; font-weight:bold; margin:2px; display:inline-block; border:1px solid #ccc;">${c.value}${c.suit}</span>`
        ).join('');
      }
    });

    // Dibujar cartas del jugador
    const humanSeat = document.getElementById('seat-human');
    if (humanSeat) {
      let humanCardsDiv = humanSeat.querySelector('.cards');
      if (!humanCardsDiv) {
        humanCardsDiv = document.createElement('div');
        humanCardsDiv.className = 'cards';
        humanSeat.appendChild(humanCardsDiv);
      }
      if (this.humanHands.length > 0) {
        humanCardsDiv.innerHTML = this.humanHands.map(h => 
          h.cards.map(c => `<span style="background:#fff; color:#111; padding:3px 6px; border-radius:4px; font-weight:bold; margin:2px; display:inline-block; border:1px solid #ccc;">${c.value}${c.suit}</span>`).join('')
        ).join('<br>');
      } else {
        humanCardsDiv.innerHTML = '';
      }
    }

    // Dibujar cartas del Crupier
    const dealerCardsDiv = document.getElementById('dealer-cards');
    if (dealerCardsDiv) {
      if (this.gameState === 'PLAYING') {
        dealerCardsDiv.innerHTML = `
          <span style="background:#fff; color:#111; padding:3px 6px; border-radius:4px; font-weight:bold; margin:2px; display:inline-block; border:1px solid #ccc;">${this.dealerHand[0].value}${this.dealerHand[0].suit}</span>
          <span style="background:#991b1b; color:#fff; padding:3px 6px; border-radius:4px; font-weight:bold; margin:2px; display:inline-block;">🎴</span>
        `;
      } else {
        dealerCardsDiv.innerHTML = this.dealerHand.map(c => 
          `<span style="background:#fff; color:#111; padding:3px 6px; border-radius:4px; font-weight:bold; margin:2px; display:inline-block; border:1px solid #ccc;">${c.value}${c.suit}</span>`
        ).join('');
      }
    }
  }

  updateUI() {
    const bankrollEl = document.getElementById('player-bankroll');
    if (bankrollEl) bankrollEl.innerText = `${this.bankroll.toLocaleString()}€`;

    const humanBetEl = document.getElementById('human-bet');
    if (humanBetEl) humanBetEl.innerText = `Apuesta: ${this.currentBet.toLocaleString()}€`;

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
