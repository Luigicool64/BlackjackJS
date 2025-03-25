// Variables du jeu
let deck = [];
let mainJoueur = [];
let mainCroupier = [];
let jeuTermine = false;
let solde = 1000;
let mise = 10;
let historique = [];

// Éléments du DOM
const elements = {
    tirer: document.getElementById('tirer'),
    rester: document.getElementById('rester'),
    nouveauJeu: document.getElementById('nouveau-jeu'),
    doubler: document.getElementById('doubler'),
    message: document.getElementById('message'),
    cartesJoueur: document.getElementById('cartes-joueur'),
    cartesCroupier: document.getElementById('cartes-croupier'),
    pointsJoueur: document.getElementById('points-joueur'),
    pointsCroupier: document.getElementById('points-croupier'),
    solde: document.getElementById('solde'),
    mise: document.getElementById('mise'),
    historique: document.getElementById('historique')
};

// Démarrer une nouvelle partie automatiquement si le joueur a des jetons
function verifierEtRelancer() {
    if (solde >= mise) {
        elements.message.textContent = "Nouvelle partie en cours...";
        setTimeout(() => {
            commencerJeu();
        }, 1500);
    } else {
        elements.message.textContent = "Jeu terminé - Plus de fonds";
        elements.tirer.disabled = true;
        elements.rester.disabled = true;
        elements.doubler.disabled = true;
        elements.nouveauJeu.style.display = 'inline-block';
    }
}

function commencerJeu() {
    // Vérifier le solde
    if (solde < mise) {
        elements.message.textContent = "Fonds insuffisants";
        return;
    }

    // Créer et mélanger le deck
    deck = creerDeck();
    deck = melangerDeck(deck);
    
    // Distribuer les cartes initiales
    mainJoueur = [tirerCarte(), tirerCarte()];
    mainCroupier = [tirerCarte(), tirerCarte()];
    
    jeuTermine = false;
    solde -= mise;
    
    // Mettre à jour l'interface
    mettreAJourInterface();
    elements.message.textContent = "À vous de jouer";
    
    // Vérifier blackjack initial
    if (calculerPoints(mainJoueur) === 21) {
        finirJeu();
    }
}

function creerDeck() {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({suit, value});
        }
    }
    
    return deck;
}

function melangerDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function tirerCarte() {
    return deck.pop();
}

function calculerPoints(main) {
    let points = 0;
    let as = 0;
    
    for (let carte of main) {
        if (carte.value === 'A') {
            as += 1;
            points += 11;
        } else if (['K', 'Q', 'J'].includes(carte.value)) {
            points += 10;
        } else {
            points += parseInt(carte.value);
        }
    }
    
    while (points > 21 && as > 0) {
        points -= 10;
        as -= 1;
    }
    
    return points;
}

function mettreAJourInterface() {
    // Cartes du joueur
    elements.cartesJoueur.innerHTML = '';
    mainJoueur.forEach(carte => {
        const elementCarte = document.createElement('div');
        elementCarte.className = 'carte' + (['♥', '♦'].includes(carte.suit) ? ' rouge' : '');
        elementCarte.textContent = carte.value + carte.suit;
        elements.cartesJoueur.appendChild(elementCarte);
    });
    elements.pointsJoueur.textContent = calculerPoints(mainJoueur);
    
    // Cartes du croupier
    elements.cartesCroupier.innerHTML = '';
    mainCroupier.forEach((carte, index) => {
        const elementCarte = document.createElement('div');
        elementCarte.className = 'carte' + (['♥', '♦'].includes(carte.suit) ? ' rouge' : '');
        elementCarte.textContent = (index === 0 && !jeuTermine) ? '🂠' : carte.value + carte.suit;
        elements.cartesCroupier.appendChild(elementCarte);
    });
    elements.pointsCroupier.textContent = jeuTermine ? calculerPoints(mainCroupier) : '?';
    
    // Mise et solde
    elements.mise.textContent = mise;
    elements.solde.textContent = solde;
}

function actionTirer() {
    if (!jeuTermine) {
        mainJoueur.push(tirerCarte());
        mettreAJourInterface();
        
        if (calculerPoints(mainJoueur) > 21) {
            finirJeu();
        }
    }
}

function actionRester() {
    if (!jeuTermine) {
        // Le croupier joue son tour
        while (calculerPoints(mainCroupier) < 17) {
            mainCroupier.push(tirerCarte());
        }
        finirJeu();
    }
}

function finirJeu() {
    jeuTermine = true;
    mettreAJourInterface();
    
    const pointsJ = calculerPoints(mainJoueur);
    const pointsC = calculerPoints(mainCroupier);
    let gain = 0;
    let resultat = '';
    
    if (pointsJ > 21) {
        resultat = 'Perdu';
        gain = 0;
        elements.message.textContent = 'Vous avez dépassé 21! Perdu.';
    } else if (pointsC > 21) {
        resultat = 'Gagné';
        gain = mise * 2;
        elements.message.textContent = 'Le croupier dépasse 21! Gagné!';
    } else if (pointsJ > pointsC) {
        resultat = 'Gagné';
        gain = mise * 2;
        elements.message.textContent = 'Vous avez gagné!';
    } else if (pointsJ < pointsC) {
        resultat = 'Perdu';
        gain = 0;
        elements.message.textContent = 'Le croupier gagne.';
    } else {
        resultat = 'Égalité';
        gain = mise;
        elements.message.textContent = 'Égalité!';
    }
    
    solde += gain;
    
    // Ajouter à l'historique
    historique.push({
        resultat,
        mise: mise,
        gain: gain - mise,
        date: new Date().toLocaleTimeString()
    });
    
    mettreAJourHistorique();
    
    // Relancer automatiquement si le joueur a encore des jetons
    verifierEtRelancer();
}

function mettreAJourHistorique() {
    elements.historique.innerHTML = '';
    historique.slice().reverse().forEach(partie => {
        const div = document.createElement('div');
        div.className = 'history-entry ' + 
            (partie.resultat === 'Gagné' ? 'win' : 
             partie.resultat === 'Perdu' ? 'lose' : 'push');
        div.innerHTML = `
            ${partie.date} - 
            Mise: ${partie.mise}€ - 
            ${partie.gain >= 0 ? '+' : ''}${partie.gain}€ - 
            ${partie.resultat}
        `;
        elements.historique.appendChild(div);
    });
}

// Écouteurs d'événements
elements.tirer.addEventListener('click', actionTirer);
elements.rester.addEventListener('click', actionRester);
elements.doubler.addEventListener('click', () => {
    if (solde >= mise && !jeuTermine) {
        solde -= mise;
        mise *= 2;
        elements.mise.textContent = mise;
        elements.solde.textContent = solde;
        actionTirer();
        actionRester();
    }
});
elements.nouveauJeu.addEventListener('click', () => {
    if (solde > 0) {
        mise = 10;
        commencerJeu();
        elements.nouveauJeu.style.display = 'none';
    }
});

// Démarrer la première partie
commencerJeu();