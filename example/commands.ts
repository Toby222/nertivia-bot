/* eslint @typescript-eslint/no-namespace: "off", import/export: "off" */
import { Bot, CommandArgs, Embed, Message } from 'nertivia-bot'

export async function rainbow (_bot: Bot, msg: Message, args: CommandArgs): Promise<void> {
  let result = ''
  const input = args.many().map(token => token.raw + token.trailing).join('').split('')
  for (let i = 0; i < input.length; i++) {
    result += `{#hsl(${360 * i / input.length},100%,50%)}${input[i]}§r`
  }
  msg.reply(result)?.catch(reason => console.error(reason))
}
export namespace rainbow {
  export const helpStringShort = 'Gives a message in a rainbow-y hue.'
  export const helpString = helpStringShort + '\n\nPerfect to show off some pride'
  export const names: string[] = []
}

export async function help (bot: Bot, msg: Message, args: CommandArgs): Promise<void> {
  const commandName = args.single()
  console.log(commandName)
  if (commandName !== null) {
    const command = bot.commands.get(commandName)
    if (command === undefined) {
      await msg.reply('Unknown command ' + commandName)
    } else {
      const embed: Embed = {
        tag: 'div',
        content: [
          {
            tag: 'div',
            content: [
              {
                tag: 'strong',
                content: 'Help for command ' + commandName
              },
              {
                tag: 'div',
                content: '\n' + command.helpString
              }
            ]
          },
          {
            tag: 'div',
            content: [
              {
                tag: 'strong',
                content: '\nAliases:'
              },
              {
                tag: 'div',
                content: '\n> ' + command.names.join('\n> ')
              }
            ]
          }
        ]
      }
      await msg.reply('', { htmlEmbed: embed })
    }
  } else {
    const embed: Embed = {
      tag: 'div',
      content: [{
        tag: 'strong',
        styles: {
          display: 'flex',
          flexDirection: 'column'
        },
        content: 'List of all commands:\n\n'
      }]
    }
    const done: string[] = []
    for (const command of bot.commands.values()) {
      if (done.includes(command.names[0])) {
        continue
      }
      (embed.content as Embed[]).push(
        {
          tag: 'div',
          content: command.names[0] + ' - ' + command.helpStringShort
        }
      )
      done.push(command.names[0])
    }
    msg.reply('', { htmlEmbed: embed })
  }
}

export namespace help {
  export const helpStringShort = 'Return the help string of a command'
  export const helpString = helpStringShort + '\n\nOr a list of commands'
  export const names: string[] = []
}
