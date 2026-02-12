import './style.css'
import { Game } from './Game'
import { Input } from './systems/Input'

const input = new Input()
const game = new Game()

const gameWindow = window as any
gameWindow.game = { input }

game.start()
