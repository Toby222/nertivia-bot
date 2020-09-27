import { Presence, ServerMember, Guild, Channel, Role, Message, Client } from 'nertivia.js'

import { IClientEvents, clientEventsNames } from 'nertivia.js/dist/Interfaces/ClientEvents'
import { IMessageButton } from 'nertivia.js/dist/Interfaces/MessageButton'

import { Command } from '.'

import * as Lexure from 'lexure'

/**
 * Options to pass to a new Bot instance
 */
export interface BotOpts {
  /**
   * A token to use for authentication
   *
   * @remarks
   * A token passed to the {@link Bot.login} method will overwrite this.
   */
  token: string
  respondToOthers: boolean
  respondToSelf: boolean
}

/**
 * Intermediate class between API Client and a command-ready bot
 *
 * @param opts - The options to the bot.
 */
export abstract class Bot extends Client implements IClientEvents {
  /** Authentication token to use on login if no other one is supplied. */
  private loginToken?: string
  /** Collection of the Bot's commands by name. */
  readonly commands: Map<string, Command> = new Map<string, Command>()

  /** Which messages to check for command invocation. */
  respondToOthers: boolean
  /** Which messages to check for command invocation. */
  respondToSelf: boolean

  /**
   * @param opts - The options to the bot.
   */
  constructor (opts: Partial<BotOpts>) {
    super()

    this.respondToOthers = opts.respondToOthers ?? true
    this.respondToSelf = opts.respondToSelf ?? false

    this.loginToken = opts.token
    // Initialize all events
    // 'message' should call handleMessage to also be able to handle commands
    for (const eventRaw in clientEventsNames) {
      const event = eventRaw as keyof typeof clientEventsNames
      if (event === undefined || event === null) {
        throw new Error('Bot tried to bind non-existent event: ' + eventRaw + ' in constructor')
      }
      if (this[event] === undefined) {
        throw new Error("Bot doesn't bind existing event: " + eventRaw + ' in constructor')
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

  /**
   * Gets called whenever the client receives a message.
   *
   * @remarks
   * Distinct from the {@link message} function in that it also triggers the command handler.
   *
   * @param message - The Message that triggered the function call
   * @internal
   */
  private async handleMessage (message: Message): Promise<void> {
    await this.message(message)

    if (message.content === undefined) { return }
    if (!(message.author.id === this.user?.id) && this.respondToSelf &&
     !((message.author.id !== this.user?.id) && this.respondToOthers)) { return }

    const parsed = this.parseCommand(message.content)
    if (parsed !== null) {
      parsed[0](this, message, parsed[1])
    }
  }

  /**
   *
   * @returns
   * If successful, as determined by {@link Bot.triggersCommand}, the Command and Arguments.
   * Null otherwise.
   *
   * @param str - The string to work on.
   * @sealed
   */
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

  /**
   * Registers a new Command to the bot.
   *
   * @param name - The name to assign for the command. Each name can only be assigned once.
   * @param command - The command to assign.
   * @param overwrite - Whether to force assigning a command, even if the name is already registered.
   *
   * @sealed
   */

  registerCommand (name: string, command: Command, overwrite = false): void {
    const existingCommand = this.commands.get(name)
    if (existingCommand !== undefined && !overwrite) {
      throw new Error('Tried to implicitly overwrite command')
    }
    existingCommand?.names.splice(existingCommand?.names.indexOf(name))

    command.names.push(name)
    this.commands.set(name, command)
  }

  /**
   *
   * @param name - The name of the command to unregister.
   * @param force - Whether to force unassigning, even if there is no command of that name.
   */
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

  /**
   * Gets called whenever a channel is created that is visible to the Bot.
   * @param channel - The newly created Channel.
   * @category Event Handler
   */
  abstract channelCreate(channel: Channel): Promise<void>

  /**
   * Gets called whenever a channel that is visible to the Bot is deleted.
   * @param channel - The newly deleted Channel
   * @category Event Handler
   */
  abstract channelDelete(channel: Channel): Promise<void>

  /**
   * Gets called whenever a command throws an error.
   * @param error - The Error that was thrown
   * @category Event Handler
   */
  abstract error(error: Error): Promise<void>

  /**
   * Gets called whenever a guild is created that is visible to the Bot.
   * @param guild - The newly created Guild
   * @category Event Handler
   */
  abstract guildCreate(guild: Guild): Promise<void>

  /**
   * Gets called whenever a guild that is visible to the Bot gets deleted.
   * @param guild - The newly deleted Guild
   * @category Event Handler
   */
  abstract guildDelete(guild: Guild): Promise<void>

  /**
   * Gets called whenever a new member joins a guild visible to the Bot.
   * @param serverMember - The new Guild member
   * @category Event Handler
   */
  abstract guildMemberAdd(serverMember: ServerMember): Promise<void>

  /**
   * Gets called whenever a member leaves a guild for any reason.
   * @param serverMember - The old Guild member
   * @category Event Handler
   */
  abstract guildMemberRemove(serverMember: ServerMember): Promise<void>

  /**
   * Gets called whenever the client receives a message.
   *
   * @remarks
   * Keep in mind that this gets called before the message is passed to the command handler.
   *
   * @param message - The message that triggered the function call
   * @category Event Handler
   */
  abstract message(message: Message): Promise<void>

  /**
   * Gets called when a user clicks a button on a message sent by the bot.
   * @param button - The Button that was clicked
   * @param done - The function to call after the bot has finished processing the event
   * @category Event Handler
   */
  abstract messageButtonClicked(button: IMessageButton, done: (/** A message to display to the user that just clicked the button */message?: string) => Promise<Record<string, unknown>>): Promise<void>

  /**
   * Gets called whenever a message visible to the bot is updated.
   * @param message - The message as it appears after the update
   * @category Event Handler
   */
  abstract messageUpdate(message: Message): Promise<void>

  /**
   * Gets called whenever a visible user changes their presence.
   * @param presence - The new presence
   * @category Event Handler
   */
  abstract presenceUpdate(presence: Presence): Promise<void>

  /**
   * Gets called after the bot has finished authentication.
   * @category Event Handler
   */
  abstract ready(): Promise<void>

  /**
   * Gets called whenever a role is created taht is visible to the bot.
   * @param role - The newly created role
   * @category Event Handler
   */
  abstract roleCreate(role: Role): Promise<void>

  /**
   * Gets called whenever a role visible to the bot is updated.
   * @param role - The role as it appears after the update
   * @category Event Handler
   */
  abstract roleUpdate(role: Role): Promise<void>

  /**
   * Determines whether or not a string triggers a command.
   * Example use would be for prefix checks.
   * @param string - The string to check.
   * @category Event Handler
   */
  abstract triggersCommand(string: string): number|null

  /**
   * Authenticate with the server.
   * @param token - The token to authenticate with. If not passed, uses the token passed in the constructor.
   * @throws
   * Throws error if there is no token to authenticate with.
   * @category Event Handler
   */
  async login (token?: string): Promise<unknown> {
    return super.login(token ?? this.loginToken ?? (() => { throw new Error('Tried to start bot without token.') })())
  }
}
