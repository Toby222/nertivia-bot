import { IMessageButton } from 'nertivia.js/dist/Interfaces/MessageButton'

import { Bot, Presence, ServerMember, Guild, Channel, Role, Message } from 'nertivia-bot'

export class CustomBot extends Bot {
  prefix: string

  constructor (prefix: string, token?: string) {
    super({ token })

    this.prefix = prefix
  }

  async ready (): Promise<void> {
    if (this.user === undefined) {
      throw new Error('Invalid user after login.')
    }
    console.log(`Ready as [${this.user.username}:${this.user.discriminator}]`)
  }

  triggersCommand (str: string): number|null {
    return str.startsWith(this.prefix) ? this.prefix.length : null
  }

  async channelCreate (_channel: Channel): Promise<void> { }
  async channelDelete (_channel: Channel): Promise<void> { }
  async error (_error: Error): Promise<void> { }
  async guildCreate (_guild: Guild): Promise<void> { }
  async guildDelete (_guild: Guild): Promise<void> { }
  async guildMemberAdd (_serverMember: ServerMember): Promise<void> { }
  async guildMemberRemove (_serverMember: ServerMember): Promise<void> { }
  async message (_message: Message): Promise<void> { }
  async messageButtonClicked (_Button: IMessageButton, _done: (message?: string) => Promise<unknown>): Promise<void> { }
  async messageUpdate (_message: Message): Promise<void> { }
  async presenceUpdate (_presence: Presence): Promise<void> { }
  async roleCreate (_role: Role): Promise<void> { }
  async roleUpdate (_role: Role): Promise<void> { }
}
