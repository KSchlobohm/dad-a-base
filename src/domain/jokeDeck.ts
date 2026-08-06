export interface JokeDeckState {
  index: number
  showingPunchline: boolean
}

export function initialJokeDeckState(): JokeDeckState {
  return { index: 0, showingPunchline: false }
}

export function nextJoke(state: JokeDeckState, jokeCount: number): JokeDeckState {
  assertJokeCount(jokeCount)
  return {
    index: (state.index + 1) % jokeCount,
    showingPunchline: false,
  }
}

export function previousJoke(state: JokeDeckState, jokeCount: number): JokeDeckState {
  assertJokeCount(jokeCount)
  return {
    index: (state.index - 1 + jokeCount) % jokeCount,
    showingPunchline: false,
  }
}

export function togglePunchline(state: JokeDeckState): JokeDeckState {
  return {
    ...state,
    showingPunchline: !state.showingPunchline,
  }
}

function assertJokeCount(jokeCount: number): void {
  if (!Number.isInteger(jokeCount) || jokeCount <= 0) {
    throw new RangeError('jokeCount must be a positive integer')
  }
}
