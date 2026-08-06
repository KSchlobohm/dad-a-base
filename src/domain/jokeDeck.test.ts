import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  initialJokeDeckState,
  nextJoke,
  previousJoke,
  togglePunchline,
} from './jokeDeck.ts'

describe('joke deck state', () => {
  it('starts at the first joke with the punchline hidden', () => {
    assert.deepEqual(initialJokeDeckState(), {
      index: 0,
      showingPunchline: false,
    })
  })

  it('wraps forward and hides the next punchline', () => {
    assert.deepEqual(nextJoke({ index: 19, showingPunchline: true }, 20), {
      index: 0,
      showingPunchline: false,
    })
  })

  it('wraps backward and hides the previous punchline', () => {
    assert.deepEqual(previousJoke({ index: 0, showingPunchline: true }, 20), {
      index: 19,
      showingPunchline: false,
    })
  })

  it('toggles punchline visibility without changing the joke', () => {
    const revealed = togglePunchline({ index: 3, showingPunchline: false })
    assert.deepEqual(revealed, { index: 3, showingPunchline: true })
    assert.deepEqual(togglePunchline(revealed), {
      index: 3,
      showingPunchline: false,
    })
  })

  it('rejects an empty joke collection', () => {
    assert.throws(
      () => nextJoke(initialJokeDeckState(), 0),
      /jokeCount must be a positive integer/,
    )
  })
})
