import { Bot } from '.';
import { Args } from 'lexure';
import { Message } from 'nertivia.js';
/** Arguments for a Command */
export declare type CommandArgs = Args;
/**
 * A Command that can be called from a Bot
 * @example
 * ```typescript
 * async function exampleCommand(_bot: Bot, msg: Message, _args: CommandArgs) {
 *   await msg.reply('This is a response')
 *   return
 * }
 * namespace exampleCommand {
 *   export const helpStringShort = 'Return the help string of a command'
 *   export const helpString = helpStringShort + '\n\nOr a list of commands'
 *   export const names: string[] = []
 * }
 * ```
 */
export interface Command {
    /**
     * The function that is called.
     * @example
     * ```typescript
     * async function exampleCommand(_bot: Bot, msg: Message, _args: CommandArgs) {
     *   await msg.reply('This is a response')
     *   return
     * }
     * ```
     */
    (bot: Bot, msg: Message, args: CommandArgs): Promise<void>;
    /**
     * A short description of the command.
     * Should be one line.
     */
    helpStringShort: string;
    /**
     * A description of the command.
     * May be a paragraph or more.
     * Include usage, and possible examples here.
     */
    helpString: string;
    /**
     * All names that have been assigned to this command.
     */
    names: string[];
}
