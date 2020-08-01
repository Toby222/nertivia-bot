import { CustomBot } from './customBot'

import { rainbow, help } from './commands'

const bot = new CustomBot('t.', process.env.NERTIVIA_TOKEN)

bot.registerCommand('rainbow', rainbow)
bot.registerCommand('rain', rainbow)

bot.registerCommand('help', help)
bot.registerCommand('?', help)

bot.login()
