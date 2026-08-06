import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { jokes } from './jokes.ts'

describe('joke catalog', () => {
  it('preserves the curated 20-joke collection', () => {
    assert.equal(jokes.length, 20)
    assert.equal(jokes[0]?.setup, 'What do you call a factory that makes okay products?')
    assert.equal(jokes.at(-1)?.punchline, 'Because they use a honeycomb.')
  })

  it('contains complete, unique joke text', () => {
    const setups = new Set<string>()

    for (const joke of jokes) {
      assert.ok(joke.setup.trim())
      assert.ok(joke.punchline.trim())
      assert.equal(setups.has(joke.setup), false)
      setups.add(joke.setup)
    }
  })

  it('keeps the Satisfactory link on only the matching joke', () => {
    const linkedJokes = jokes.filter((joke) => joke.link)
    assert.deepEqual(linkedJokes, [
      {
        setup: 'What do you call a factory that makes okay products?',
        punchline: 'A satisfactory.',
        link: 'https://store.steampowered.com/app/526870/Satisfactory/',
      },
    ])
  })
})
