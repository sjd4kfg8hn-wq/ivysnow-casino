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
    this.gameState = 'BETTING'; // BETTING, INSURANCE, PLAYING, DEALER_TURN, FINISHED
    
    this.humanHands = []; // Soporte para manos divididas (array de manos)
    this.activeHandIndex = 0;
    this.dealerHand = [];

    this.initListeners();
    this.updateUI();
  }

  initListeners() {
    // Selección de fichas
    document.querySelectorAll('.chip-btn').forEach(btn => {
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

    // Botón Repartir
    document.getElementById('deal-btn').addEventListener('click', () => {
      if (this.gameState === 'BETTING' && this.currentBet > 0) {
        this.startRound();
      } else if (this.currentBet === 0) {
        alert("¡Coloca una ficha en la mesa antes de repartir, jefe!");
      }
    });

    // Botones de Acción Profesional
    document.getElementById('hit-btn').addEventListener('click', () => this.playerHit());
    document.getElementById('stand-btn').addEventListener('click', () => this.playerStand());
    document.getElementById('double-btn').addEventListener('click', () => this.playerDouble());
    document.getElementById('split-btn').addEventListener('click', () => this.playerSplit());
  }

  startRound() {
    this.gameState = 'PLAYING';
    document.getElementById('deal-btn').style.display = 'none';
    document.getElementById('game-actions').style.display = 'flex';

    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) dialogueEl.innerText = `"${DEALER_CONFIG.dialogues.dealing}"`;
    
    // Reparto inicial IA
    AI_BOTS.forEach(bot => {
      bot.hand = [this.engine.drawCard(), this.engine.drawCard()];
    });
    
    // Reparto inicial Jugador y Crupier
    this.humanHands = [{ cards: [this.engine.drawCard(), this.engine.drawCard()], bet: this.currentBet, doubled: false }];
    this.activeHandIndex = 0;
    this.dealerHand = [this.engine.drawCard(), this.engine.drawCard()];

    // Comprobar regla de Seguro si el crupier muestra As
    if (this.engine.canOfferInsurance(this.dealerHand[0])) {
      document.getElementById('insurance-modal').style.display = 'flex';
      document.getElementById('insurance-yes').onclick = () => { this.resolveInsurance(true); };
      document.getElementById('insurance-no').onclick = () => { this.resolveInsurance(false); };
    }

    // Comprobar si se puede dividir la mano inicial del usuario
    const splitBtn = document.getElementById('split-btn');
    if (this.engine.canSplit(this.humanHands[0].cards) && this.bankroll >= this.currentBet) {
      splitBtn.style.display = 'inline-block';
    } else {
      splitBtn.style.display = 'none';
    }

    this.renderTable();
  }

  resolveInsurance(accepted) {
    document.getElementById('insurance-modal').style.display = 'none';
    if (accepted) {
      const insuranceCost = this.currentBet / 2;
      if (this.bankroll >= insuranceCost) {
        this.bankroll -= insuranceCost;
        this.insuranceBet = insuranceCost;
      }
    }
    this.updateUI();
  }

  playerHit() {
    const currentHand = this.humanHands[this.activeHandIndex];
    currentHand.cards.push(this.engine.drawCard());
    
    // Ocultar botón de doblar o dividir tras pedir carta
    document.getElementById('double-btn').style.display = 'none';
    document.getElementById('split-btn').style.display = 'none';

    const evaluation = this.engine.calculateHand(currentHand.cards);
    if (evaluation.isBust || evaluation.score === 21) {
      this.nextHandOrDealer();
    }
    this.renderTable();
  }

  playerStand() {
    this.nextHandOrDealer();
  }

  playerDouble() {
    const currentHand = this.humanHands[this.activeHandIndex];
    if (this.bankroll >= currentHand.bet) {
      this.bankroll -= currentHand.bet;
      currentHand.bet *= 2;
      currentHand.doubled = true;
      currentHand.cards.push(this.engine.drawCard());
      this.updateUI();
      this.nextHandOrDealer();
    }
  }

  playerSplit() {
    const currentHand = this.humanHands[this.activeHandIndex];
    if (this.bankroll >= currentHand.bet && currentHand.cards.length === 2) {
      this.bankroll -= currentHand.bet;
      
      const secondHand = {
        cards: [currentHand.cards.pop(), this.engine.drawCard()],
        bet: currentHand.bet,
        doubled: false
      };
      currentHand.cards.push(this.engine.drawCard());

      this.humanHands.push(secondHand);
      document.getElementById('split-btn').style.display = 'none';
      this.updateUI();
      this.renderTable();
    }
  }

  nextHandOrDealer() {
    this.activeHandIndex++;
    if (this.activeHandIndex >= this.humanHands.length) {
      // Turno de la IA y del Crupier
      this.executeAiTurns();
    } else {
      this.renderTable();
    }
  }

  executeAiTurns() {
    document.getElementById('game-actions').style.display = 'none';
    
    // Simular turno de la IA
    AI_BOTS.forEach((bot, idx) => {
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
    let totalWin = 0;

    this.humanHands.forEach(hand => {
      const result = this.engine.evaluateHand(hand.cards, this.dealerHand);
      if (result.payoutRatio > 0) {
        totalWin += hand.bet * result.payoutRatio;
      }
    });

    this.bankroll += totalWin;
    this.renderTable();

    // Botón para reiniciar ronda
    setTimeout(() => {
      document.getElementById('deal-btn').style.display = 'inline-block';
      document.getElementById('deal-btn').innerText = 'SIGUIENTE RONDA';
      this.gameState = 'BETTING';
      this.currentBet = 0;
      this.updateUI();
    }, 3000);
  }

  renderTable() {
    AI_BOTS.forEach((bot, index) => {
      const seat = document.getElementById(`seat-${index + 1}`);
      if (seat) {
        seat.querySelector('.cards').innerHTML = bot.hand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
      }
    });

    // Renderizar manos del jugador humano
    const humanCardsDiv = document.querySelector('#seat-human .cards');
    if (humanCardsDiv) {
      humanCardsDiv.innerHTML = this.humanHands.map((h, idx) => `
        <div class="hand-box ${idx === this.activeHandIndex && this.gameState === 'PLAYING' ? 'active-hand' : ''}">
          Mano ${idx + 1} (${h.bet}€): ${h.cards.map(c => `${c.value}${c.suit}`).join(' ')}
        </div>
      `).join('');
    }

    // Renderizar Crupier (revelando cartas si terminó la partida)
    const dealerCardsDiv = document.getElementById('dealer-cards');
    if (dealerCardsDiv) {
      if (this.gameState === 'PLAYING' || this.gameState === 'INSURANCE') {
        dealerCardsDiv.innerHTML = `<span class="card">${this.dealerHand[0].value}${this.dealerHand[0].suit}</span> <span class="card">🎴</span>`;
      } else {
        dealerCardsDiv.innerHTML = this.dealerHand.map(c => `<span class="card">${c.value}${c.suit}</span>`).join(' ');
      }
    }
  }

  updateUI() {
    document.getElementById('player-bankroll').innerText = `${this.bankroll.toLocaleString()}€`;
    document.getElementById('human-bet').innerText = `Apuesta: ${this.currentBet.toLocaleString()}€`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.casinoGame = new CasinoGame();
});
