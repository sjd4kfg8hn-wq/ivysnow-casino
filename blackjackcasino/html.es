<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Casino Monte Pináculo - Blackjack VIP</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

    <div class="casino-table-container">
        
        <!-- ZONA DEL CRUPIER (Gato Culturista) -->
        <div class="dealer-area">
            <h2 id="dealer-title">Gato Culturista - Crupier VIP</h2>
            <div id="dealer-dialogue" class="dialogue-box">"Bienvenidos a Monte Pináculo. Hagan sus apuestas, caballeros."</div>
            <div id="dealer-cards" class="card-container"></div>
            <div id="dealer-score" class="score-display">Puntuación: 0</div>
        </div>

        <!-- ZONA DE LA MESA: 4 JUGADORES IA + JUGADOR HUMANO -->
        <div class="table-positions">
            <!-- Posición 1: Shih Tzu (El Quinqui) -->
            <div class="player-seat" id="seat-1">
                <h3>Shih Tzu</h3>
                <span class="personality-tag">El Quinqui</span>
                <div class="cards"></div>
                <div class="bet-info">Apuesta: 100€</div>
            </div>

            <!-- Posición 2: Husky (El Seductor) -->
            <div class="player-seat" id="seat-2">
                <h3>Husky</h3>
                <span class="personality-tag">El Seductor</span>
                <div class="cards"></div>
                <div class="bet-info">Apuesta: 1.000€</div>
            </div>

            <!-- Posición 3: Pitbull (La Diva) -->
            <div class="player-seat" id="seat-3">
                <h3>Pitbull</h3>
                <span class="personality-tag">La Diva</span>
                <div class="cards"></div>
                <div class="bet-info">Apuesta: 500€</div>
            </div>

            <!-- Posición 4: Dogo de Burdeos (El Hippie) -->
            <div class="player-seat" id="seat-4">
                <h3>Dogo de Burdeos</h3>
                <span class="personality-tag">El Hippie</span>
                <div class="cards"></div>
                <div class="bet-info">Apuesta: 50€</div>
            </div>

            <!-- Posición 5: TÚ (Jugador Humano en Primera Persona) -->
            <div class="player-seat human" id="seat-human">
                <h3>Tú (VIP)</h3>
                <span class="personality-tag">Jugador</span>
                <div class="cards"></div>
                <div class="bet-info" id="human-bet">Apuesta: 0€</div>
                <div class="bankroll-display">Saldo: <span id="player-bankroll">10.000€</span></div>
            </div>
        </div>

        <!-- PANEL DE CONTROL Y FICHAS PREMIUM -->
        <div class="control-panel">
            <button class="chip-btn" data-value="10" style="background: #e5e7eb; color: #111;">10€</button>
            <button class="chip-btn" data-value="100" style="background: #10b981; color: #fff;">100€</button>
            <button class="chip-btn" data-value="1000" style="background: #3b82f6; color: #fff;">1K</button>
            <button class="chip-btn" data-value="5000" style="background: #8b5cf6; color: #fff;">5K</button>
            <button class="chip-btn" data-value="10000" style="background: #111827; color: #d4af37; border-color: #d4af37;">10K</button>
            <button id="deal-btn" class="action-btn">REPARTIR</button>
        </div>

    </div>

    <!-- SCRIPT PRINCIPAL DE CONTROL -->
    <script type="module" src="js/game.js"></script>
</body>
</html>
