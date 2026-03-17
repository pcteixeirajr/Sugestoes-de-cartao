import type { SuggestionRequest } from '../types.js';

function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildFallbackSuggestions(input: SuggestionRequest): string[] {
  const occasion = titleCase(input.occasion);
  const relationship = input.relationship.trim().toLowerCase();

  return [
    `Que este ${occasion} seja cheio de alegria, carinho e bons momentos. Com muito carinho para uma pessoa ${relationship} que faz a diferença na minha vida.`,
    `Desejo que este ${occasion} traga motivos sinceros para sorrir e celebrar. Você é uma pessoa ${relationship} muito especial para mim.`,
    `Espero que esta lembrança deixe o seu ${occasion} ainda mais bonito. Obrigado por ser uma pessoa ${relationship} tão importante na minha caminhada.`,
  ];
}
