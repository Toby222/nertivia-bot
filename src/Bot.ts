import { Presence, ServerMember, Guild, Channel, Role, Message, Client } from 'nertivia.js'

import { IClientEvents, clientEventsNames } from 'nertivia.js/dist/Interfaces/ClientEvents'
import { IMessageButton } from 'nertivia.js/dist/Interfaces/MessageButton'

import { Command } from '.'

import * as Lexure from 'lexure'

export interface BotOpts {
  token: string
}

export abstract class Bot extends Client implements IClientEvents {
  constructor (opts: Partial<BotOpts>) {
    super()

    this.loginToken = opts.token
    // Initialize all events
    // 'message' should call handleMessage to also be able to handle commands
    for (const eventRaw in clientEventsNames) {
      const event = eventRaw as keyof typeof clientEventsNames
      if (event === undefined || event === null) {
        throw new Error('Bot tried to bind non-existent event: ' + eventRaw + ' in constructor')
      }
      if (this[event] === undefined) {
        throw new Error('Bot doesn\'t bind existing event: ' + eventRaw + ' in constructor')
      }
      switch (event) {
        case 'message':
          this.on(event, this.handleMessage.bind(this))
          break
        default:
          this.on(event, this[event].bind(this))
          break
      }
    }
  }

  async handleMessage (message: Message): Promise<void> {
    await this.message(message)

    if (message.content === undefined) { return }
    if ((message.author.id === this.user?.id) === this.user?.bot) { return }

    const parsed = this.parseCommand(message.content)
    if (parsed !== null) {
      parsed[0](this, message, parsed[1])
    }
  }

  parseCommand (str: string): [Command, Lexure.Args] | null {
    const lexer = new Lexure.Lexer(str)
      .setQuotes([['"', '"'], ["'", "'"], ['“', '”']])
    const lexOut = lexer.lexCommand(this.triggersCommand.bind(this))

    if (lexOut === null) {
      return null
    }

    const command = this.commands.get(lexOut[0].value)
    if (command === undefined) {
      return null
    }
    const tokens = lexOut[1]()

    const parser = new Lexure.Parser(tokens)

    return [command, new Lexure.Args(parser.parse())]
  }

  registerCommand (name: string, command: Command, overwrite = false): void {
    const existingCommand = this.commands.get(name)
    if (existingCommand !== undefined && !overwrite) {
      throw new Error('Tried to implicitly overwrite command')
    }
    existingCommand?.names.splice(existingCommand?.names.indexOf(name))

    command.names.push(name)
    this.commands.set(name, command)
  }

  unregisterCommand (name: string, force = false): void {
    const command = this.commands.get(name)
    if (command === undefined) {
      if (!force) {
        throw new Error('Tried to unregister non-registered command. Use force option to ignore.')
      } else {
        return
      }
    }
    command.names.splice(command.names.indexOf(name))
    this.commands.delete(name)
  }

  private loginToken?: string
  readonly commands: Map<string, Command> = new Map<string, Command>()

  abstract async channelCreate(channel: Channel): Promise<void>
  abstract async channelDelete(channel: Channel): Promise<void>
  abstract async error(error: Error): Promise<void>
  abstract async guildCreate(guild: Guild): Promise<void>
  abstract async guildDelete(guild: Guild): Promise<void>
  abstract async guildMemberAdd(serverMember: ServerMember): Promise<void>
  abstract async guildMemberRemove(serverMember: ServerMember): Promise<void>
  abstract async message(message: Message): Promise<void>
  abstract async messageButtonClicked(Button: IMessageButton, done: (message?: string) => Promise<Record<string, unknown>>): Promise<void>
  abstract async messageUpdate(message: Message): Promise<void>
  abstract async presenceUpdate(presence: Presence): Promise<void>
  abstract async ready(): Promise<void>
  abstract async roleCreate(role: Role): Promise<void>
  abstract async roleUpdate(role: Role): Promise<void>

  abstract triggersCommand(string: string): number|null

  async login (token?: string): Promise<unknown> {
    return super.login(token ?? this.loginToken ?? (() => { throw new Error('Tried to start bot without token.') })())
  }
}
