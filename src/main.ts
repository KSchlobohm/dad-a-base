import { registerSW } from 'virtual:pwa-register'
import {
  initialJokeDeckState,
  nextJoke,
  previousJoke,
  togglePunchline,
  type JokeDeckState,
} from './domain/jokeDeck.ts'
import { jokes } from './jokes.ts'
import './style.css'

const setupText = requiredElement<HTMLParagraphElement>('setup-text')
const punchlineText = requiredElement<HTMLParagraphElement>('punchline-text')
const linkContainer = requiredElement<HTMLDivElement>('joke-link-container')
const card = requiredElement<HTMLDivElement>('card')
const backButton = requiredElement<HTMLButtonElement>('back-button')
const nextButton = requiredElement<HTMLButtonElement>('next-button')
const hint = requiredSelector<HTMLElement>('.hint')

let state = initialJokeDeckState()

function render(nextState: JokeDeckState): void {
  const joke = jokes[nextState.index]
  if (!joke) {
    throw new RangeError(`No joke exists at index ${nextState.index}`)
  }

  state = nextState
  setupText.textContent = joke.setup
  punchlineText.textContent = joke.punchline
  punchlineText.classList.toggle('hidden', !state.showingPunchline)
  linkContainer.replaceChildren()

  if (joke.link) {
    const link = document.createElement('a')
    link.href = joke.link
    link.textContent = '🎮 Play on Steam'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.className = 'joke-link'
    link.addEventListener('click', (event) => event.stopPropagation())
    linkContainer.append(link)
  }

  linkContainer.classList.toggle(
    'hidden',
    !state.showingPunchline || !joke.link,
  )
  hint.textContent = state.showingPunchline
    ? 'tap to hide • use Next/Back to navigate'
    : 'tap to reveal'
}

card.addEventListener('click', () => render(togglePunchline(state)))
card.addEventListener('keydown', (event) => {
  if (
    event.target === card
    && (event.key === 'Enter' || event.key === ' ')
  ) {
    event.preventDefault()
    render(togglePunchline(state))
  }
})
backButton.addEventListener('click', () => render(previousJoke(state, jokes.length)))
nextButton.addEventListener('click', () => render(nextJoke(state, jokes.length)))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    render(nextJoke(state, jokes.length))
  }
  if (event.key === 'ArrowLeft') {
    render(previousJoke(state, jokes.length))
  }
})

const updateBanner = requiredElement<HTMLElement>('update-banner')
const updateButton = requiredElement<HTMLButtonElement>('update-button')
const updateServiceWorker = registerSW({
  onNeedRefresh() {
    updateBanner.classList.remove('hidden')
  },
})

updateButton.addEventListener('click', () => {
  void updateServiceWorker(true)
})

render(state)

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing required #${id} element`)
  }
  return element as T
}

function requiredSelector<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Missing required ${selector} element`)
  }
  return element
}
