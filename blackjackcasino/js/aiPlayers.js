/**
 * CASINO MONTE PINÁCULO - INTELIGENCIA ARTIFICIAL DE MESA
 */

export const AI_BOTS = [
  {
    id: 'shih_tzu',
    name: 'Shih Tzu',
    title: 'El Quinqui',
    position: 1,
    avatar: 'images/shih_tzu.png',
    riskFactor: 0.85, // Arriesga mucho
    baseBet: 100,
    dialogues: {
      hit: ['¡Tírale otra, primo, sin miedo!', '¡Aquí hemos venido a jugar!'],
      stand: ['Me planto, que ya huele a victoria.', 'Ahí se queda.'],
      win: ['¡Toma ya! ¡A cobrarrrr!', '¿Véis cómo se hace?'],
      lose: ['¡Esta mesa está trucada, me cago en diez!', 'Menuda mala racha...'],
      greet: '¿Vas a jugar o has venido a mirar, máquina?'
    },
    decideAction(handScore, dealerUpCardValue, isSoft) {
      if (handScore < 15) return 'HIT';
      if (handScore >= 15 && handScore <= 17 && Math.random() < this.riskFactor) return 'HIT';
      return 'STAND';
    }
  },
  {
    id: 'husky',
    name: 'Husky',
    title: 'El Seductor',
    position: 2,
    avatar: 'images/husky.png',
    riskFactor: 0.3, // Muy calculador
    baseBet: 1000,
    dialogues: {
      hit: ['Una más, con elegancia.', 'Analizando probabilidades... dame carta.'],
      stand: ['Posición perfecta. Me planto.', 'El control lo es todo.'],
      win: ['Tranquilos, profesionales en la mesa.', 'Tal como lo había calculado.'],
      lose: ['Un ligero contratiempo estadístico.', 'Imposible...'],
      greet: 'Observad y aprended cómo se juega en Monte Pináculo.'
    },
    decideAction(handScore, dealerUpCardValue, isSoft) {
      // Estrategia básica estricta
      if (handScore < 12) return 'HIT';
      if (handScore >= 12 && handScore <= 16 && dealerUpCardValue >= 7) return 'HIT';
      return 'STAND';
    }
  },
  {
    id: 'pitbull',
    name: 'Pitbull',
    title: 'La Diva',
    position: 3,
    avatar: 'images/pitbull.png',
    riskFactor: 0.5, // Impredecible / Dramático
    baseBet: 500,
    dialogues: {
      hit: ['¡Cariño, esa carta no me representa! ¡Dame otra!', '¡Ay qué nervios! ¡Dame!'],
      stand: ['¡Ni se te ocurra darme más! Me quedo así.', 'Suficiente drama por hoy.'],
      win: ['¡Espectacular! ¡El casino es mío!', '¡Diva se nace, no se hace!'],
      lose: ['¡Qué tragedia! ¡Esto es un escándalo!', '¡No puedo con tanto estrés!'],
      greet: '¡Hola tesoro! Espero que traigas buena suerte a la mesa.'
    },
    decideAction(handScore, dealerUpCardValue, isSoft) {
      if (handScore < 14) return 'HIT';
      if (handScore === 16 && Math.random() > 0.5) return 'HIT';
      return 'STAND';
    }
  },
  {
    id: 'dogo',
    name: 'Dogo de Burdeos',
    title: 'El Hippie',
    position: 4,
    avatar: 'images/dogo.png',
    riskFactor: 0.2, // Muy conservador
    baseBet: 50,
    dialogues: {
      hit: ['Fluimos con la energía... ponme una carta, hermano.', 'A ver qué nos depara el universo.'],
      stand: ['Paz mental ante todo. Me planto.', 'Todo está en armonía.'],
      win: ['El dinero es energía, hermano.', 'Buena vibra para todos.'],
      lose: ['El universo da y el universo quita...', 'Sin malas vibraciones.'],
      greet: 'Buenas vibras, colega. Que fluya el juego.'
    },
    decideAction(handScore, dealerUpCardValue, isSoft) {
      if (handScore < 13) return 'HIT';
      return 'STAND';
    }
  }
];
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
