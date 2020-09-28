/* eslint @typescript-eslint/no-namespace: "off", import/export: "off" */
import { Bot, CommandArgs, Embed, Message } from 'nertivia-bot'

export async function rainbow (_bot: Bot, msg: Message, args: CommandArgs): Promise<void> {
  let result = ''
  const input = args.many().map(token => token.raw + token.trailing).join('').split('')
   
  function toRgb(h){
      var hue2rgb = function hue2rgb(t){
          if(t < 0) t += 1
          if(t > 1) t -= 1
          if(t < 1/6) return 6 * t
          if(t < 1/2) return 1
          if(t < 2/3) return (2/3 - t) * 6
          return 0
      }

      const r = hue2rgb(h + 1/3)
      const g = hue2rgb(h)
      const b = hue2rgb(h - 1/3)

      let result = '#'+[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)].map(num => num.toString(16).padStart(2, '0')).join('');
        
      if(result[1] === result[2] && result[3] === result[4] && result[5] === result[6]) {
        result = result[0] + result[1] + result[3] + result[5];
      }

      return result;
  }
  
  for (let i = 0; i < input.length; i++) {
    result += `{${toRgb(i / input.length)}}${input[i]}§r`
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
