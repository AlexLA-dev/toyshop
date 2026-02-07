import type { ToyCard, ToyColor } from '../types';

/**
 * Card deck for the toy shop game.
 *
 * Each card has 4 coloured edges (N/E/S/W) and a count of toys per colour.
 * The deck has 24 cards (enough for two full 4×4 grids minus the cash register).
 *
 * Card design rationale:
 * - Each card has 2-3 colours to create interesting combo opportunities
 * - Toy counts per card range from 1-3 to keep scoring meaningful
 * - Edge colours create connection puzzles
 */

const C: Record<string, ToyColor> = {
  R: 'red',
  B: 'blue',
  G: 'green',
  Y: 'yellow',
};

function card(
  id: string,
  n: ToyColor,
  e: ToyColor,
  s: ToyColor,
  w: ToyColor,
  toys: Partial<Record<ToyColor, number>>,
): ToyCard {
  return { id, edges: { N: n, E: e, S: s, W: w }, toys };
}

export const FULL_DECK: ToyCard[] = [
  // Red-heavy cards
  card('t01', C.R, C.R, C.B, C.G, { red: 2, blue: 1 }),
  card('t02', C.R, C.G, C.R, C.B, { red: 2, green: 1 }),
  card('t03', C.R, C.B, C.Y, C.R, { red: 1, yellow: 1 }),
  card('t04', C.R, C.R, C.G, C.Y, { red: 3 }),

  // Blue-heavy cards
  card('t05', C.B, C.B, C.R, C.G, { blue: 2, red: 1 }),
  card('t06', C.B, C.Y, C.B, C.R, { blue: 2, yellow: 1 }),
  card('t07', C.B, C.G, C.Y, C.B, { blue: 1, green: 1 }),
  card('t08', C.B, C.B, C.G, C.R, { blue: 3 }),

  // Green-heavy cards
  card('t09', C.G, C.G, C.R, C.B, { green: 2, red: 1 }),
  card('t10', C.G, C.R, C.G, C.Y, { green: 2, yellow: 1 }),
  card('t11', C.G, C.B, C.Y, C.G, { green: 1, blue: 1 }),
  card('t12', C.G, C.G, C.B, C.R, { green: 3 }),

  // Yellow-heavy cards
  card('t13', C.Y, C.Y, C.R, C.B, { yellow: 2, red: 1 }),
  card('t14', C.Y, C.G, C.Y, C.R, { yellow: 2, green: 1 }),
  card('t15', C.Y, C.B, C.G, C.Y, { yellow: 1, blue: 1 }),
  card('t16', C.Y, C.Y, C.G, C.B, { yellow: 3 }),

  // Mixed cards (good for combos)
  card('t17', C.R, C.B, C.G, C.Y, { red: 1, blue: 1, green: 1 }),
  card('t18', C.Y, C.R, C.B, C.G, { yellow: 1, red: 1, blue: 1 }),
  card('t19', C.G, C.Y, C.R, C.B, { green: 1, yellow: 1, red: 1 }),
  card('t20', C.B, C.G, C.Y, C.R, { blue: 1, green: 1, yellow: 1 }),

  // Bonus pattern cards
  card('t21', C.R, C.R, C.R, C.B, { red: 2 }),
  card('t22', C.B, C.B, C.B, C.G, { blue: 2 }),
  card('t23', C.G, C.G, C.G, C.Y, { green: 2 }),
  card('t24', C.Y, C.Y, C.Y, C.R, { yellow: 2 }),
];

/** Fisher-Yates shuffle (returns new array) */
export function shuffleDeck(deck: ToyCard[]): ToyCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
