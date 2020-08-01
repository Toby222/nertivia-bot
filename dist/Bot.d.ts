import { Presence, ServerMember, Guild, Channel, Role, Message, Client } from 'nertivia.js';
import { IClientEvents } from 'nertivia.js/dist/Interfaces/ClientEvents';
import { IMessageButton } from 'nertivia.js/dist/Interfaces/MessageButton';
import { Command } from '.';
import * as Lexure from 'lexure';
export interface BotOpts {
    token: string;
}
export declare abstract class Bot extends Client implements IClientEvents {
    constructor(opts: Partial<BotOpts>);
    handleMessage(message: Message): Promise<void>;
    parseCommand(str: string): [Command, Lexure.Args] | null;
    registerCommand(name: string, command: Command, overwrite?: boolean): void;
    unregisterCommand(name: string, force?: boolean): void;
    private loginToken?;
    readonly commands: Map<string, Command>;
    abstract channelCreate(channel: Channel): Promise<void>;
    abstract channelDelete(channel: Channel): Promise<void>;
    abstract error(error: Error): Promise<void>;
    abstract guildCreate(guild: Guild): Promise<void>;
    abstract guildDelete(guild: Guild): Promise<void>;
    abstract guildMemberAdd(serverMember: ServerMember): Promise<void>;
    abstract guildMemberRemove(serverMember: ServerMember): Promise<void>;
    abstract message(message: Message): Promise<void>;
    abstract messageButtonClicked(Button: IMessageButton, done: (message?: string) => Promise<Record<string, unknown>>): Promise<void>;
    abstract messageUpdate(message: Message): Promise<void>;
    abstract presenceUpdate(presence: Presence): Promise<void>;
    abstract ready(): Promise<void>;
    abstract roleCreate(role: Role): Promise<void>;
    abstract roleUpdate(role: Role): Promise<void>;
    abstract triggersCommand(string: string): number | null;
    login(token?: string): Promise<unknown>;
}
