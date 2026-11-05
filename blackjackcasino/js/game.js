/**
 * CASINO MONTE PINÁCULO - CONTROLADOR PRINCIPAL DEL JUEGO (GAME.JS)
 */

import { BlackjackEngine } from './engine.js';
import { AI_BOTS } from './aiPlayers.js';
import { DEALER_CONFIG } from './dealer.js';

class CasinoGame {
  constructor() {
    console.log("CasinoGame iniciado correctamente");
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
    console.log("BindEvents ejecutado");

    // 1. Selección de fichas mediante dataset.value
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        console.log("Ficha pulsada");
        if (this.gameState !== 'BETTING') return;
        
        const value = Number(btn.dataset.value);
        if (this.bankroll >= value) {
          this.currentBet += value;
          this.bankroll -= value;
          this.updateUI();
        } else {
          alert("¡Saldo insuficiente para realizar esta apuesta!");
        }
      };
    });

    // 2. Botón Borrar Apuesta
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        console.log("Apuesta borrada");
        if (this.gameState !== 'BETTING') return;
        this.bankroll += this.currentBet;
        this.currentBet = 0;
        this.updateUI();
      };
    }

    // 3. Botón Repartir
    const dealBtn = document.getElementById('deal-btn');
    if (dealBtn) {
      dealBtn.onclick = () => {
        console.log("CLICK REPARTIR");
        if (this.gameState === 'BETTING' && this.currentBet > 0) {
          this.startRound();
        } else if (this.currentBet === 0) {
          alert("¡Debes realizar una apuesta antes de repartir!");
        }
      };
    }

    // 4. Botones de Acción de Juego
    const hitBtn = document.getElementById('hit-btn');
    const standBtn = document.getElementById('stand-btn');
    const doubleBtn = document.getElementById('double-btn');
    const splitBtn = document.getElementById('split-btn');

    if (hitBtn) hitBtn.onclick = () => this.playerHit();
    if (standBtn) standBtn.onclick = () => this.playerStand();
    if (doubleBtn) doubleBtn.onclick = () => this.playerDouble();
    if (splitBtn) splitBtn.onclick = () => this.playerSplit();

    // 5. Botones de Seguro
    const insYes = document.getElementById('insurance-yes');
    const insNo = document.getElementById('insurance-no');
    if (insYes) insYes.onclick = () => this.resolveInsurance(true);
    if (insNo) insNo.onclick = () => this.resolveInsurance(false);
  }

  startRound() {
    console.log("Iniciando ronda de juego...");
    this.gameState = 'PLAYING';
    
    // Ocultar fichas/apuestas y mostrar acciones de juego
    const bettingControls = document.getElementById('betting-controls');
    const gameActions = document.getElementById('game-actions');
    if (bettingControls) bettingControls.style.display = 'none';
    if (gameActions) gameActions.style.display = 'flex';

    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) dialogueEl.innerText = `"${DEALER_CONFIG.dialogues.dealing}"`;

    // Repartir a la IA
    AI_BOTS.forEach(bot => {
      bot.hand = [this.engine.drawCard(), this.engine.drawCard()];
    });

    // Repartir al jugador y crupier
    this.humanHands = [{ 
      cards: [this.engine.drawCard(), this.engine.drawCard()], 
      bet: this.currentBet, 
      doubled: false 
    }];
    this.activeHandIndex = 0;
    this.dealerHand = [this.engine.drawCard(), this.engine.drawCard()];

    // Comprobar Seguro si el crupier muestra un As
    if (this.engine.canOfferInsurance(this.dealerHand[0])) {
      const insModal = document.getElementById('insurance-modal');
      if (insModal) insModal.style.display = 'flex';
    }

    this.evaluateActionButtons();
    this.renderTable();
    this.updateUI();
  }

  evaluateActionButtons() {
    const currentHand = this.humanHands[this.activeHandIndex];

    // Evaluar botón Dividir
    const splitBtn = document.getElementById('split-btn');
    if (splitBtn) {
      splitBtn.style.display = (this.engine.canSplit(currentHand.cards) && this.bankroll >= currentHand.bet) 
        ? 'inline-block' 
        : 'none';
    }

    // Evaluar botón Doblar
    const doubleBtn = document.getElementById('double-btn');
    if (doubleBtn) {
      doubleBtn.style.display = (this.engine.canDoubleDown(currentHand.cards, this.bankroll, currentHand.bet)) 
        ? 'inline-block' 
        : 'none';
    }
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
    console.log("Jugador pide carta");
    const hand = this.humanHands[this.activeHandIndex];
    hand.cards.push(this.engine.drawCard());
    
    // Al pedir carta ya no se puede doblar ni dividir
    document.getElementById('double-btn').style.display = 'none';
    document.getElementById('split-btn').style.display = 'none';

    const evalResult = this.engine.calculateHand(hand.cards);
    if (evalResult.isBust || evalResult.score === 21) {
      this.nextHandOrDealer();
    } else {
      this.renderTable();
    }
  }

  playerStand() {
    console.log("Jugador se planta");
    this.nextHandOrDealer();
  }

  playerDouble() {
    console.log("Jugador dobla apuesta");
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
    console.log("Jugador divide mano");
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
      this.updateUI();
      this.evaluateActionButtons();
      this.renderTable();
    }
  }

  nextHandOrDealer() {
    this.activeHandIndex++;
    if (this.activeHandIndex >= this.humanHands.length) {
      this.executeAiTurns();
    } else {
      this.evaluateActionButtons();
      this.renderTable();
    }
  }

  executeAiTurns() {
    console.log("Ejecutando turnos de IA y Crupier");
    const gameActions = document.getElementById('game-actions');
    if (gameActions) gameActions.style.display = 'none';

    // Turno Bots IA
    AI_BOTS.forEach(bot => {
      let evalHand = this.engine.calculateHand(bot.hand);
      while (bot.decideAction(evalHand.score, this.dealerHand[0].numericValue, evalHand.isSoft) === 'HIT') {
        bot.hand.push(this.engine.drawCard());
        evalHand = this.engine.calculateHand(bot.hand);
      }
    });

    // Turno Crupier
    let dealerEval = this.engine.calculateHand(this.dealerHand);
    while (this.engine.shouldDealerHit(dealerEval.score, dealerEval.isSoft)) {
      this.dealerHand.push(this.engine.drawCard());
      dealerEval = this.engine.calculateHand(this.dealerHand);
    }

    this.settleGame();
  }

  settleGame() {
    console.log("Liquidando resultados de la ronda");
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
    this.updateUI();

    const dialogueEl = document.getElementById('dealer-dialogue');
    if (dialogueEl) {
      dialogueEl.innerText = totalPayout > 0 ? '"¡Excelente jugada, caballero VIP!"' : '"La casa se queda con la banca esta vez."';
    }

    // Reiniciar para la siguiente ronda tras 4.5 segundos
    setTimeout(() => {
      const bettingControls = document.getElementById('betting-controls');
      if (bettingControls) bettingControls.style.display = 'flex';
      
      this.gameState = 'BETTING';
      this.currentBet = 0;
      this.updateUI();
    }, 4500);
  }

  renderTable() {
    // Renderizar bots
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

    // Renderizar mano humana
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

    // Renderizar crupier
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

// Inicialización controlada al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado - Arrancando CasinoGame");
  window.casinoGame = new CasinoGame();
});
