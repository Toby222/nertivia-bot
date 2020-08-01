import { Bot } from '.'

import { Args } from 'lexure'
import { Message } from 'nertivia.js'

export type CommandArgs = Args
export interface Command {
  (bot: Bot, msg: Message, args: CommandArgs): Promise<void>
  helpStringShort: string
  helpString: string
  names: string[]
}
