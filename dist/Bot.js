"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const nertivia_js_1 = require("nertivia.js");
const ClientEvents_1 = require("nertivia.js/dist/Interfaces/ClientEvents");
const Lexure = require("lexure");
class Bot extends nertivia_js_1.Client {
    constructor(opts) {
        super();
        this.commands = new Map();
        this.loginToken = opts.token;
        // Initialize all events
        // 'message' should call handleMessage to also be able to handle commands
        for (const eventRaw in ClientEvents_1.clientEventsNames) {
            const event = eventRaw;
            if (event === undefined || event === null) {
                throw new Error('Bot tried to bind non-existent event: ' + eventRaw + ' in constructor');
            }
            if (this[event] === undefined) {
                throw new Error('Bot doesn\'t bind existing event: ' + eventRaw + ' in constructor');
            }
            switch (event) {
                case 'message':
                    this.on(event, this.handleMessage.bind(this));
                    break;
                default:
                    this.on(event, this[event].bind(this));
                    break;
            }
        }
    }
    async handleMessage(message) {
        var _a, _b;
        await this.message(message);
        if (message.content === undefined) {
            return;
        }
        if ((message.author.id === ((_a = this.user) === null || _a === void 0 ? void 0 : _a.id)) === ((_b = this.user) === null || _b === void 0 ? void 0 : _b.bot)) {
            return;
        }
        const parsed = this.parseCommand(message.content);
        if (parsed !== null) {
            parsed[0](this, message, parsed[1]);
        }
    }
    parseCommand(str) {
        const lexer = new Lexure.Lexer(str)
            .setQuotes([['"', '"'], ["'", "'"], ['“', '”']]);
        const lexOut = lexer.lexCommand(this.triggersCommand.bind(this));
        if (lexOut === null) {
            return null;
        }
        const command = this.commands.get(lexOut[0].value);
        if (command === undefined) {
            return null;
        }
        const tokens = lexOut[1]();
        const parser = new Lexure.Parser(tokens);
        return [command, new Lexure.Args(parser.parse())];
    }
    registerCommand(name, command, overwrite = false) {
        const existingCommand = this.commands.get(name);
        if (existingCommand !== undefined && !overwrite) {
            throw new Error('Tried to implicitly overwrite command');
        }
        existingCommand === null || existingCommand === void 0 ? void 0 : existingCommand.names.splice(existingCommand === null || existingCommand === void 0 ? void 0 : existingCommand.names.indexOf(name));
        command.names.push(name);
        this.commands.set(name, command);
    }
    unregisterCommand(name, force = false) {
        const command = this.commands.get(name);
        if (command === undefined) {
            if (!force) {
                throw new Error('Tried to unregister non-registered command. Use force option to ignore.');
            }
            else {
                return;
            }
        }
        command.names.splice(command.names.indexOf(name));
        this.commands.delete(name);
    }
    async login(token) {
        var _a;
        return super.login((_a = token !== null && token !== void 0 ? token : this.loginToken) !== null && _a !== void 0 ? _a : (() => { throw new Error('Tried to start bot without token.'); })());
    }
}
exports.Bot = Bot;
