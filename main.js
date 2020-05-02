/**
 * Ticketsystem by AstroGD
 * @author AstroGD (https://www.astrogd.eu)
 * @version 2.0.0
 * @since 15. Mai 2018
 * @link https://www.astrogd.eu
 * @license AGPL-3.0
 */

console.log(`[I] Loader: Loading Code`);

//Requirements
const Discord = require("discord.js");
const fs = require("fs-extra");
const path = require("path");

//Variables
const startupdate = new Date();
const timestamp = `${startupdate.getFullYear()}-${startupdate.getMonth() + 1}-${startupdate.getDate()}-${startupdate.getHours()}-${startupdate.getMinutes()}-${startupdate.getSeconds()}`;
const client = new Discord.Client();
const pk = require(path.join(__dirname, "/package.json"));
var language, languageconfig, commands;

//Modules
const request = require(path.join(__dirname, "/request.js"));
const makeEmbed = require(path.join(__dirname, "/makeEmbed.js"))(client);

//Path Ensurances
fs.ensureDirSync(path.join(__dirname, "/log/"));
fs.ensureDirSync(path.join(__dirname, "/tickets/"));
fs.ensureDirSync(path.join(__dirname, "/lang"));

//Files
var config = require(`${__dirname}/config.json`);
var stream = fs.createWriteStream(`${__dirname}/log/${timestamp}.log`);

//Functions
function log(msg, status = "INFO", consoletype = 1) {
    let dateCurrent = new Date();
    const timestampCurrent = `${dateCurrent.getFullYear()}-${dateCurrent.getMonth() + 1}-${dateCurrent.getDay()}-${dateCurrent.getHours()}-${dateCurrent.getMinutes()}-${dateCurrent.getSeconds()}`;

    switch (status) {
        case 1: //ERROR
            status = "ERROR";
            break;
        case 2: //WARN
            status = "WARN";
            break;
        case 3: //DEBUG
            status = "DEBUG";
            break;
        default: //INFO
            status = "INFO";
            break;
    }

    if (!consoletype || (consoletype != 1 && consoletype != 2 && consoletype != 3)) consoletype = 1;

    let logCurrent = `[${timestampCurrent}] ${status} [Ticketsystem] ${msg.stack ? `An error occurred:\n${msg.stack}` : msg}`;
    if (consoletype == 1 || consoletype == 3) stream.write(logCurrent + '\n');
    if (consoletype == 1 || consoletype == 2) console.log(logCurrent);
}

async function checkVersion() {
    let versionInfo = null;
    try {
        versionInfo = await request({
            'method': 'GET',
            'hostname': 'software.astrogd.eu',
            'path': '/ticketsystem/version.json',
            'headers': {},
            'maxRedirects': 20
        });
    } catch (error) {
        return log(`Version couldn't be checked! Make sure to allow network access to software.astrogd.eu`, 1);
    }

    if (!versionInfo) return log(`Version couldn't be checked! Make sure to allow network access to software.astrogd.eu`, 1);
    versionInfo = JSON.parse(versionInfo.toString());

    const version = pk.version.split(".");
    const latest = versionInfo.version.split(".");

    if (version[0] < latest[0] || version[0] == latest[0] && version[1] < latest[1] || version[0] == latest[0] && version[1] == latest[1] && version[2] < latest[2]) {
        return log(`A new version of the ticketsystem is available (${pk.version} --> ${versionInfo.version}). Make sure to visit ${versionInfo.url} and download the newest version. If you need help look in the repositorys wiki under "how to update" or contact AstroGD (https://www.astrogd.eu/en/kontakt)`, 2);
    }

    log(`Newest version installed!`, 3);
};

//Additional Code
process.on("unhandledRejection", (reason) => {
    log(`An unhandled Promise Rejection occurred: ${reason}`, 1);
});

process.on('uncaughtException', (err) => {
    try {
        log(`An uncaught Exception took Place: ${err.stack}\n\nBot is force destroying...`, 1);
    } catch (e) {

    }
    try {
        client.destroy().then(() => {
            process.exit();
        });
    } catch (e) {
        process.exit();
    }
    return;
});

//Startup Function
async function startup() {
    log(`Initialized!`);
    log("Starting up - Loading Bots language");

    if (!fs.existsSync(`${__dirname}/lang/${config.language}.json`)) {
        log(`Language File not found. Please download missing files or contact the developer.`, 1);
        process.exit(28);
    } else {
        language = JSON.parse(fs.readFileSync(`${__dirname}/lang/${config.language}.json`, "utf-8")).translations;
        languageconfig = JSON.parse(fs.readFileSync(`${__dirname}/lang/${config.language}.json`, "utf-8")).settings;
    }

    log("Done - Logging in");

    await checkVersion();
    setInterval(function () {
        checkVersion();
    }, 3600000); //Check version every hour

    client.login(config.token);

    client.on("ready", () => {
        try {
            log(`Online. Connected as ${client.user.tag} (${client.user.id}) - Checking Botuser`);
            if (!client.user.bot) {
                log(`Not a Bot User. This is against the Discord ToS. Program will be terminated. Please change the token in the config.`, 1);
                client.destroy()
                    .then(() => {
                        process.exit();
                    });
                return;
            }

            log("Is a bot user - Checking Guild");
            let guild = client.guilds.cache.get(config.server_id);
            if (!guild) {
                log(`Guild not found. Please edit Config.json. Program will be terminated.`, 1);
                client.destroy()
                    .then(() => {
                        process.exit();
                    });
                return;
            }

            log(`Guild found. Listening to ${guild.name} (${guild.id}) - Loading commands`);

            client.user.setPresence({
                status: "online",
                activity: {
                    name: config.custom_status || `${language.ticket_system} | ${config.prefix}${languageconfig.helpcommand.main}`,
                    type: "PLAYING"
                }
            });

            //Commands
            const ticketCommand = require(path.join(__dirname, "/commands/ticket.js"))(log, makeEmbed, language, config, languageconfig, client);
            const ticketteamCommand = require(path.join(__dirname, "/commands/ticketteam.js"))(log, makeEmbed, language, config, languageconfig, client);
            const hilfeCommand = require(path.join(__dirname, "/commands/hilfe.js"))(log, makeEmbed, language, config, languageconfig);
            commands = {
                ticket: ticketCommand,
                ticketteam: ticketteamCommand,
                hilfe: hilfeCommand
            }

            log(`Done - Listening for commands.`);
        } catch (e) {
            log(`An error occurred while running Ready Event Actions: ${e.stack}`, 1);
        }
    });

    client.on("message", async (message) => {
        try {
            if (message.author.bot) return;
            if (!message.guild) {
                log(`Got a DM from ${message.author.tag} - Sorry but thats unwanted`);
                message.author.send("", {
                        embed: makeEmbed(message, "#FF0000", `🚫 - ${language.oops}! ${language.this_bot_is_not_usable_via_dm}`, language.please_enter_your_command_on_our_server)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a DM to ${message.author.tag}: ${e.stack}`, 2);
                        return;
                    });
                return;
            }
            if (!message.content.startsWith(config.prefix) || message.guild.id != config.server_id) return;

            log(`Received commandlike message from ${message.author.tag} - Checking for Commands`);

            const cmd = message.content.split(config.prefix).slice(1).join(config.prefix).split(" ")[0].toLowerCase();

            if (cmd == languageconfig.ticketcommand.main.toLowerCase()) {
                message.content = `${config.prefix}ticket ${message.content.split(" ").slice(1).join(" ")}`;
            } else if (cmd == languageconfig.ticketteamcommand.main.toLowerCase()) {
                message.content = `${config.prefix}ticketteam ${message.content.split(" ").slice(1).join(" ")}`;
            } else if (cmd == languageconfig.helpcommand.main.toLowerCase()) {
                message.content = `${config.prefix}hilfe ${message.content.split(" ").slice(1).join(" ")}`;
            }

            if (!commands[message.content.split(config.prefix).slice(1).join(config.prefix).split(" ")[0].toLowerCase()]) {
                log(`No Command found :(`);
                if (config.errorOnCommandNotFound) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "#FF0000", `⁉️ ${language.oops}`, language.this_command_does_not_exist_please_use_the_help_command_to_get_a_list_of_all_commands)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                            return;
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                }
                return;
            } else {                
                log(`Command found :) | ${message.content.split(" ")[0].toLowerCase()}`);
                commands[message.content.split(config.prefix).slice(1).join(config.prefix).split(" ")[0].toLowerCase()](message);
                message.delete({timeout:0}).catch(e => {});
                return;
            }
        } catch (e) {
            log(`An error occurred while running Message Event Actions: ${e.stack}`, 1);
        }
    });
}


//Startup
console.log(`[I] Loader: Code loaded. Starting Function - Activating Log Function`);
startup();