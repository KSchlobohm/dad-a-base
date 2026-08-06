export interface Joke {
  setup: string
  punchline: string
  link?: string
}

export const jokes: readonly Joke[] = [
  { setup: 'What do you call a factory that makes okay products?', punchline: 'A satisfactory.', link: 'https://store.steampowered.com/app/526870/Satisfactory/' },
  { setup: "Why don't skeletons fight?", punchline: "They don't have the guts." },
  { setup: 'I used to hate facial hair...', punchline: 'but then it grew on me.' },
  { setup: "I'm reading a book about anti-gravity...", punchline: "It's impossible to put down." },
  { setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field.' },
  { setup: 'I used to be a banker...', punchline: 'but I lost interest.' },
  { setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go." },
  { setup: "What do you call cheese that isn't yours?", punchline: 'Nacho cheese.' },
  { setup: 'Why did the bicycle fall over?', punchline: 'Because it was two-tired.' },
  { setup: 'How do you organize a space party?', punchline: 'You planet.' },
  { setup: 'What do you call a sleeping dinosaur?', punchline: 'A dino-snore.' },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up." },
  { setup: 'What do you call a fake noodle?', punchline: 'An impasta.' },
  { setup: 'Why did the math book look so sad?', punchline: 'Because it had too many problems.' },
  { setup: 'What do you call a bear with no teeth?', punchline: 'A gummy bear.' },
  { setup: "Why can't a nose be 12 inches long?", punchline: 'Because then it would be a foot.' },
  { setup: 'What did the ocean say to the beach?', punchline: 'Nothing, it just waved.' },
  { setup: 'Why did the golfer bring an extra pair of pants?', punchline: 'In case he got a hole in one.' },
  { setup: 'Did you hear about the claustrophobic astronaut?', punchline: 'He just needed a little space.' },
  { setup: 'Why do bees have sticky hair?', punchline: 'Because they use a honeycomb.' },
]
