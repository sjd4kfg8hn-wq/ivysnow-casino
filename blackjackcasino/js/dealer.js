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
  shouldDealerHit(dealerHandScore, isSoft17) {
    if (dealerHandScore < 17) return true;
    if (dealerHandScore === 17 && isSoft17) return true; 
    return false;
  }
};
