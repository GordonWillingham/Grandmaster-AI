
import React from 'react';
import { ChessOpening } from './types';

export const OPENINGS: ChessOpening[] = [
  {
    name: "Ruy Lopez (Spanish Opening)",
    category: "Offense",
    era: "Classic",
    moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    description: "One of the oldest and most thoroughly studied openings in chess. It focuses on central control and pressure on the Nc6 knight.",
    pros: ["Strong central control", "Flexible development", "Long-term pressure"],
    cons: ["Deep theory required", "Black has many solid responses"]
  },
  {
    name: "Sicilian Defense",
    category: "Defense",
    era: "Classic",
    moves: "1. e4 c5",
    description: "The most popular and high-scoring response to 1. e4. It creates an asymmetrical position where Black fights for the center from the flank.",
    pros: ["High winning chances for Black", "Asymmetrical positions", "Complex tactical play"],
    cons: ["Very theoretical", "White can choose aggressive lines"]
  },
  {
    name: "Queen's Gambit",
    category: "Offense",
    era: "Classic",
    moves: "1. d4 d5 2. c4",
    description: "A foundational opening for 1. d4 players. White offers a pawn to gain control of the center and rapid development.",
    pros: ["Solid central foundation", "Good development for pieces", "Positional advantage"],
    cons: ["Black can accept and hold the pawn (briefly)", "Slow maneuvering games"]
  },
  {
    name: "Berlin Defense",
    category: "Defense",
    era: "Contemporary",
    moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6",
    description: "Known as the 'Berlin Wall', it became famous after Kramnik used it to defeat Kasparov. Extremely solid and drawish at high levels.",
    pros: ["Highly resilient", "Neutralizes White's Ruy Lopez attack", "Solid structure"],
    cons: ["Passive for Black", "Difficult to play for a win"]
  },
  {
    name: "Catalan Opening",
    category: "Offense",
    era: "Contemporary",
    moves: "1. d4 Nf6 2. c4 e6 3. g3",
    description: "A combination of the Queen's Gambit and Reti Opening. White fianchettoes the light-squared bishop for long-term pressure.",
    pros: ["Long-term positional pressure", "Hard for Black to find active counterplay", "Favored by modern engines"],
    cons: ["Subtle and slow", "Requires high positional understanding"]
  }
];
