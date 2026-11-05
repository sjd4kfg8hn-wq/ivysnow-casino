/**
 * CASINO MONTE PINÁCULO - GATO CRUPIER (IA DEL DEALER)
 */

export const DEALER_CONFIG = {
  name: 'Gato Culturista',
  title: 'Crupier VIP',
  avatar: 'images/dealer_cat.png',
  dialogues: {
    welcome: 'Bienvenidos a Monte Pináculo. Hagan sus apuestas, caballeros.',
    dealing: 'Repartiendo juego... mucha suerte.',
    playerTurn: 'Su turno, adelante.',
    dealerTurn: 'Turno de la casa.',
    bust: 'Se pasó. Gana la casa.',
    blackjack: '¡Blackjack natural!',
    push: 'Empate. Se devuelve la apuesta.'
  },
  
  // El crupier se planta estrictamente en 17 o más (Soft 17 regla estándar configurable)
  shouldDealerHit(dealerHandScore, isSoft17) {
    if (dealerHandScore < 17) return true;
    // Si es soft 17 (un 17 que contiene un As contado como 11), por norma de casino a veces pide
    if (dealerHandScore === 17 && isSoft17) return true; 
    return false;
  }
};
