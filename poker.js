let Hearts = "♥";
let Clubs = "♧";
let Diamonds = "♢";
let Spades = "♤";

let Suits = [Hearts, Clubs, Diamonds, Spades];

let Ranks = {
    "A": 14,
    "K": 13,
    "Q": 12,
    "J": 11,
    "1": 10,
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2
}

let Types = {
    STRAIGHT_FLUSH: "straight-flush",
    FOUR_OF_A_KIND: "four-of-a-kind",
    FULL_HOUSE: "full-house",
    FLUSH: "flush",
    STRAIGHT: "straight",
    THREE_OF_A_KIND: "three-of-a-kind",
    TWO_PAIR: "two-pair",
    PAIR: "pair",
    NOTHING: "nothing"
}

function hand(holeCards, commonCards) {

    let cards = holeCards.concat(commonCards);

    cards = sort(cards);

    return straightFlush(cards)
        ?? fourOfAKind(cards)
        ?? fullHouse(cards)
        ?? flush(cards)
        ?? straight(cards)
        ?? threeOfAKind(cards)
        ?? twoPair(cards)
        ?? pair(cards)
        ?? nothing(cards);
}

//region: utilities 

function sort(cards) {
    return cards.sort(
        function compareFn(a, b) {
            return Ranks[b[0]] - Ranks[a[0]];
        }
    );
}

function filterSuit(cards, suit) {
    return cards.filter(card => card[card.length - 1] === suit);
}

function getRank(card) {
    return card.substring(0, card.length - 1);
}

function findSetofSizeN(cards, n) {
    let count = 0;
    let currentRank = null;
    for(let i = 0; i < cards.length; i++) {
        if(getRank(cards[i]) === currentRank ) {
            count++;
            if(count === n) {
                let kickerCards = cards.filter(c => getRank(c) !== currentRank)

                return {
                    "ranks": [currentRank, ...kickerCards.map(c => getRank(c))]
                };
            }
        } else {
            if(i > cards.length - n) {
                // not enough cards remain to make a set of n
                return null;
            }
            currentRank = getRank(cards[i]);
            count = 1;
        }
    }
}

//  ♥ ♧ ♢ ♤ - hand method types (9):

function straightFlush(cards) {
    currentSuitIndex = 0;

    foundMatch = null;
    while (!foundMatch && currentSuitIndex < 4 ) {
        let cardsInSuit = filterSuit(cards, Suits[currentSuitIndex]);

        let numOfThisSuit = cardsInSuit.length;

        currentSuitIndex++;
        if (numOfThisSuit === 3 || numOfThisSuit === 4) { 
            break;
        }
        else if (numOfThisSuit < 5 ) {
            continue;
        }
        else if (numOfThisSuit >= 5) {
            foundMatch = straight(cardsInSuit);
        }
    }

    if (foundMatch) {
        return {
            "type": Types.STRAIGHT_FLUSH,
            "ranks": [foundMatch.ranks[0]]
        };
    } else {
        return null;
    }
}

function fourOfAKind(cards) {
    let matchFound = findSetofSizeN(cards, 4);
    if(matchFound) {
        return {
            type: Types.FOUR_OF_A_KIND,
            ranks: matchFound.ranks.slice(0, 2)
        }
    } else {
        return null;
    }
}

function fullHouse(cards) {
    let trioFound = threeOfAKind(cards);
    if (trioFound) {
        let remainingCards = cards.filter(c => getRank(c) !== trioFound.ranks[0]);
    
        let pairFound = pair(remainingCards);
        
        if (pairFound) {
            return {
                type: Types.FULL_HOUSE,
                ranks: [trioFound.ranks[0], pairFound.ranks[0]]
            }
        }
    }

    return null;
}

function flush(cards) {
    currentSuitIndex = 0;

    while (currentSuitIndex < 4 ) {

        let cardsInSuit = filterSuit(cards, Suits[currentSuitIndex]);

        let numOfThisSuit = cardsInSuit.length;

        currentSuitIndex++;
        if (numOfThisSuit === 3 || numOfThisSuit === 4) { 
            break;
        }
        else if (numOfThisSuit < 5 ) {
            continue;
        }
        else if (numOfThisSuit >= 5) {
            return {
                type: Types.FLUSH,
                ranks: cardsInSuit.slice(0,5)
            };

        }
    }
}

function straight(cards) {
    let startingIndex = 0;
    while (startingIndex < cards.length - 4) {
        for (let i = startingIndex; i <= startingIndex + 5; i ++) {
            if(Ranks[getRank(cards[i+1])[0]] !== (Ranks[getRank(cards[i])[0]] - 1)) {
                break;
            }
            else if(i === 3) {
                return {
                    type: Types.STRAIGHT,
                    ranks: [getRank(cards[startingIndex])]
                }
            }
        }
        startingIndex++;
    }
    return null;
}

function threeOfAKind(cards) {
    let matchFound = findSetofSizeN(cards, 3);
    if(matchFound) {
        return {
            type: Types.THREE_OF_A_KIND,
            ranks: matchFound.ranks.slice(0, 3)
        }
    } else {
        return null;
    }
}

function twoPair(cards) {
    let firstPair = pair(cards);
    if (firstPair) {
        let remainingCards = cards.filter(c => getRank(c) !== firstPair.ranks[0]);
    
        let secondPair = pair(remainingCards);
        
        if (secondPair) {
            return {
                type: Types.TWO_PAIR,
                ranks: [firstPair.ranks[0], secondPair.ranks[0], secondPair.ranks[1]]
            }
        }
    }
    return null;
}

function pair(cards) {
    let matchFound = findSetofSizeN(cards, 2);
    if(matchFound) {
        return {
            type: Types.PAIR,
            ranks: matchFound.ranks.slice(0, 4)
        }
    } else {
        return null;
    }
}

function nothing(cards) {
    return {
        type: Types.NOTHING,
        ranks: cards.slice(0, 5).map(c => getRank(c))
    }
}
