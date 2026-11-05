/**
 * CASINO MONTE PINÁCULO - INTELIGENCIA ARTIFICIAL DE LOS JUGADORES (AI_PLAYERS.JS)
 */

export const AI_BOTS = [
  {
    name: 'El Quinqui',
    animal: 'Shih Tzu',
    hand: [],
    decideAction(score, dealerUpCardScore, isSoft) {
      if (score < 12) return 'HIT';
      if (score >= 17) return 'STAND';
      return dealerUpCardScore >= 7 ? 'HIT' : 'STAND';
    }
  },
  {
    name: 'El Seductor',
    animal: 'Husky',
    hand: [],
    decideAction(score, dealerUpCardScore, isSoft) {
      if (isSoft && score <= 18) return 'HIT';
      return score < 16 ? 'HIT' : 'STAND';
    }
  },
  {
    name: 'La Diva',
    animal: 'Pitbull',
    hand: [],
    decideAction(score, dealerUpCardScore, isSoft) {
      return score < 15 ? 'HIT' : 'STAND';
    }
  },
  {
    name: 'El Hippie',
    animal: 'Dogo de Burdeos',
    hand: [],
    decideAction(score, dealerUpCardScore, isSoft) {
      return score < 17 ? 'HIT' : 'STAND';
    }
  }
];
