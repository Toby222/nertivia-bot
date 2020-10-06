/* eslint @typescript-eslint/no-namespace: "off", import/export: "off" */
import { Bot, CommandArgs, Embed, Message } from 'nertivia-bot'

export async function rainbow (_bot: Bot, msg: Message, args: CommandArgs): Promise<void> {
  let result = ''
  const input = args.many().map(token => token.raw + token.trailing).join('').split('')

  function toRgb(h: number, s = 1, l = 0.5) {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3)
    const g = hue2rgb(p, q, h)
    const b = hue2rgb(p, q, h - 1 / 3)

    let result = `#${[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
      .map((num) => num.toString(16).padStart(2, '0'))
      .join('')}`

    if (result[1] === result[2] && result[3] === result[4] && result[5] === result[6]) {
      result = result[0] + result[1] + result[3] + result[5]
    }

    return result
  }

  const s = 1
  const l = 0.5

  for (let i = 0; i < input.length; i++) {
    if (input[i] === ' ') result += ' '
    else result += `{${toRgb(i / input.length)}}${input[i]}`
  }
  result += '§r'
  msg.reply(result)?.catch((reason) => console.error(reason))
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
