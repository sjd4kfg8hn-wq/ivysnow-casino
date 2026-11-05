/**
 * CASINO MONTE PINÁCULO - MOTOR MATEMÁTICO DEL BLACKJACK (ENGINE.JS)
 */

export class BlackjackEngine {
  constructor(numDecks = 6) {
    this.numDecks = numDecks;
    this.deck = [];
    this.resetDeck();
  }

  resetDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.deck = [];

    for (let d = 0; d < this.numDecks; d++) {
      for (const suit of suits) {
        for (const value of values) {
          let numericValue = parseInt(value);
          if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
          if (value === 'A') numericValue = 11;

          this.deck.push({ suit, value, numericValue });
        }
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawCard() {
    if (this.deck.length < 15) {
      this.resetDeck();
    }
    return this.deck.pop();
  }

  calculateHand(cards) {
    let score = 0;
    let aces = 0;

    cards.forEach(card => {
      score += card.numericValue;
      if (card.value === 'A') aces++;
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    const isSoft = aces > 0 && score <= 21;
    return {
      score,
      isBust: score > 21,
      isSoft
    };
  }

  canOfferInsurance(dealerUpCard) {
    return dealerUpCard && dealerUpCard.value === 'A';
  }

  canDoubleDown(hand, bankroll, currentBet) {
    return hand.length === 2 && bankroll >= currentBet;
  }

  canSplit(hand) {
    return hand.length === 2 && hand[0].numericValue === hand[1].numericValue;
  }

  shouldDealerHit(dealerScore, isSoft) {
    if (dealerScore < 17) return true;
    if (dealerScore === 17 && isSoft) return true;
    return false;
  }
}
