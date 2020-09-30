module.exports = function (log, makeEmbed, language, config, languageconfig, client) {
    const fs = require("fs-extra");
    const path = require("path");

    return function (message) {
        switch (message.content.toLowerCase().split(" ")[1]) {
            case languageconfig.ticketcommand.create.toLowerCase():                
                if (!message.content.split(" ").slice(2).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "#FF0000", `⁉ ${language.oops}`, `${language.please_tell_us_what_happened}`, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.create} <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                if (message.content.split(" ").slice(1).slice(1).join(" ").length > 800) {
                    message.channel.send(`${language.your_original_message}:\n\n${message.content.split(" ").slice(1).slice(1).join(" ")}`, {
                            embed: makeEmbed(message, "#FF0000", `❗ ${language.oops}`, `${language.your_message_is_too_long} :( - ${language.a_maximum_of_800_characters_is_allowed}`)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 20000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var ticket = {};
                ticket.author = message.author.id;
                ticket.avatarURL = message.author.avatarURL();
                ticket.created = new Date();
                if (message.attachments.array().length > 0) {
                    message.channel.send(`${language.your_original_message}:\n\n${message.content.split(" ").slice(1).slice(1).join(" ")}`, {
                            embed: makeEmbed(message, "#FF0000", `❗ ${language.oops}`, language.uploaded_images_cant_be_processed_please_send_them_as_a_link_in_the_text)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 20000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                ticket.finished = false;
                ticket.session = [{
                    author: client.user.id,
                    stamp: new Date(),
                    avatar: client.user.avatarURL(),
                    message: language.ticket_started
                }, {
                    author: message.author.id,
                    stamp: new Date(),
                    avatar: message.author.avatarURL(),
                    message: message.content.split(" ").slice(1).slice(1).join(" ")
                }];
                ticket.id = `T-${message.author.id}-${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
                var embed = makeEmbed(message, "#00FF21", `✅ ${language.finished}`, `${language.your_ticket_was_successfully_created_it_has_the_following_id}\n${ticket.id}\n${language.to_access_your_ticket_please_use_this_id}`, [{
                    title: `${language.your_message}:`,
                    value: ticket.session[1].message
                }])
                message.author.send(`${language.your_ticket_id}: ${ticket.id}`, {
                        embed: embed
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.author.tag}: ${e.stack}`, 2);
                        message.channel.send(`${language.your_original_message}:\n\n${message.content.split(" ").slice(1).slice(1).join(" ")}`, makeEmbed(message, "#FF0000", `❗ ${language.oops}`, language.it_seems_youve_disabled_direct_messaging_please_activate_these_via_the_data_protection_settings_of_the_server))
                            .catch(e => {
                                log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                            })
                            .then(msg => {
                                msg.delete({
                                        timeout: 10000
                                    })
                                    .catch(e => {});
                            });
                        return;
                    }).then(msg => {
                        try {
                            fs.writeFileSync(path.join(__dirname, `../tickets/${ticket.id}.ticket`), JSON.stringify(ticket));
                        } catch (e) {
                            log(`An error occurred while trying to save a ticket: ${e.stack}`, 1);
                            return;
                        }
                        var teamchannel = message.guild.channels.cache.get(config.ticket_notification_channel_id);
                        if (!teamchannel) {
                            return;
                        }
                        var embed = makeEmbed(message, "#0094FF", `📨 ${language.new_ticket}`, ticket.id, [{
                            title: language.author,
                            value: ticket.author
                        }, {
                            title: language.created,
                            value: ticket.created
                        }, {
                            empty: true
                        }]);
                        embed.setThumbnail(ticket.avatarURL);
                        teamchannel.send(`${language.ticketid}: ${ticket.id}`, {
                                embed: embed
                            })
                            .catch(e => {
                                log(`An error occurred while sending a message to ${teamchannel.name}: ${e.stack}`, 1);
                            })
                        var user = client.users.cache.get(ticket.session[1].author)
                        if (!user) {
                            user = language.unknown_user;
                        } else {
                            user = user.username;
                        }
                        var embed = makeEmbed(message, "#0094FF", language.message_history, ticket.id, [{
                            title: `${client.user.username} | ${ticket.session[0].stamp}`,
                            value: ticket.session[0].message
                        }, {
                            title: `${user} | ${ticket.session[1].stamp}`,
                            value: ticket.session[1].message
                        }]);
                        teamchannel.send("", {
                                embed: embed
                            })
                            .catch(e => {
                                log(`An error occurred while sending a message to ${teamchannel.name}: ${e.stack}`, 1);
                            })
                    });
                break;
            case languageconfig.ticketcommand.info.toLowerCase():
                if (!message.content.split(" ").slice(1).slice(1).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `⁉️ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.info} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var tickets = fs.readdirSync(path.join(__dirname, `../tickets/`));
                var ticket = tickets.filter(function (element) {
                    return (element === `${message.content.split(" ").slice(1).slice(1).join(" ")}.ticket` || element === `STOP-${message.content.split(" ").slice(1).slice(1).join(" ")}.ticket`);
                });
                if (!ticket || ticket.length === 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `⁉️ ${language.oops}`, language.unknown_ticket_id, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.info} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                ticket = ticket[0];
                var ticketfile = ticket;
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticket}`)));
                if (ticket.finished) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.ticket_closed}`, language.your_tickets_been_closed_please_contact_the_team_if_this_is_a_mistake)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                if (ticket.author != message.author.id) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.oops}`, language.this_ticket_was_not_created_by_you)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var embed = makeEmbed(message, '#0094FF', `ℹ️ ${language.information_about_the_selected_ticket}`, ticket.id, [{
                    empty: true
                }, {
                    title: language.created,
                    value: ticket.created
                }, {
                    title: language.message,
                    value: ticket.session[1].message
                }]);
                message.author.send(`${language.your_ticket_id}: ${ticket.id}`, {
                        embed: embed
                    })
                    .catch(e => {
                        log(`An error occured while sending a message to ${message.author.tag}: ${e.stack}`, 2);
                        message.channel.send("", {
                                embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.it_seems_youve_disabled_direct_messaging_please_activate_these_via_the_data_protection_settings_of_the_server)
                            })
                            .catch(e => {
                                log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                            })
                            .then(msg => {
                                msg.delete({
                                        timeout: 10000
                                    })
                                    .catch(e => {});
                            });
                        return;
                    });
                var embed2 = makeEmbed(message, "#0094FF", language.message_history, language.displays_the_last_10_messages_and_the_original_request);
                var j = 0;
                for (var i = ticket.session.length - 1; i >= 0 && j <= 10; i--) {
                    var user = message.guild.members.cache.get(ticket.session[i].author);
                    if (!user) {
                        user = language.unknown_user;
                    } else {
                        user = user.user.username + "#" + user.user.discriminator;
                    }
                    var stamp = new Date(ticket.session[i].stamp)
                    stamp = `${stamp.getDate()}.${stamp.getMonth() + 1}.${stamp.getFullYear()} ${language.at} ${stamp.toString()}`;
                    embed2.addField(`${user} ${language.at} ${stamp}`, ticket.session[i].message);
                    j++;
                }
                message.author.send("", {
                        embed: embed2
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.author.tag}: ${e.stack}`, 1);
                        return;
                    });
                break;
            case languageconfig.ticketcommand.answer.toLowerCase():
                if (!message.content.split(" ")[2]) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.answer} <${language.ticketid}> <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                } else if (!message.content.split(" ").slice(3).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_message, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.answer} <${language.ticketid}> <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                if (message.content.split(" ").slice(3).join(" ").length > 800) {
                    message.channel.send(`${language.your_original_message}:\n\n${message.content.split(" ").slice(3).join(" ")}`, {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.a_maximum_of_800_characters_is_allowed)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 20000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var tickets = fs.readdirSync(path.join(__dirname, `../tickets/`));
                var ticket = tickets.filter(function (element) {
                    return (element === `${message.content.split(" ")[2]}.ticket` || element === `STOP-${message.content.split(" ")[2]}.ticket`);
                });
                if (ticket.length <= 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_ticket_id, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.answer} <${language.ticketid}> <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var ticketfile = ticket[0];
                ticket = ticket[0];
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticket}`)));
                if (ticket.author != message.author.id) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.oops}`, language.this_ticket_was_not_created_by_you)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                if (ticket.finished) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.ticket_closed}`, language.your_tickets_been_closed_please_contact_the_team_if_this_is_a_mistake)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var msg = message.content.split(" ").slice(3).join(" ");
                if (message.attachments.array().length > 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.uploaded_images_cant_be_processed_please_send_them_as_a_link_in_the_text)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                }
                ticket.session.push({
                    author: message.author.id,
                    stamp: new Date(),
                    avatar: message.author.avatarURL(),
                    message: msg
                });
                try {
                    fs.writeFileSync(path.join(__dirname, `../tickets/${ticketfile}`), JSON.stringify(ticket));
                } catch (e) {
                    log(`An error occurred while saving the ticket ${ticketfile}: ${e.message}`, 1);
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.an_error_occurred, [{
                                title: language.error,
                                value: e.message
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                message.channel.send("", {
                        embed: makeEmbed(message, "00FF21", `✅ ${language.finished}`, language.your_message_has_been_sent)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({
                                timeout: 10000
                            })
                            .catch(e => {});
                    });
                message.author.send(`${language.your_ticket_id}: ${ticket.id}`, {
                        embed: makeEmbed(message, "0094FF", `📨 ${language.you_replied_to_your_ticket}`, `${language.message}: ${msg}`)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a messagee to ${message.author.tag}: ${e.stack}`, 2);
                    });
                var teamchannel = client.guilds.cache.get(config.server_id).channels.cache.get(config.ticket_notification_channel_id);
                if (!teamchannel) {
                    return;
                }
                teamchannel.send(`${language.ticketid}: ${ticket.id}`, {
                        embed: makeEmbed(message, "0094FF", `📨 ${language.new_message}`, `${language.there_is_a_new_answer_for_the_ticket} ${ticket.id}`, [{
                            title: language.message,
                            value: msg
                        }])
                    })
                    .catch(e => {
                        log(`An error occured while sending a message to ${teamchannel.name}: ${e.stack}`, 1);
                    });
                break;
            case languageconfig.ticketcommand.close.toLowerCase():
                if (!message.content.split(" ").slice(1).slice(1).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.close} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var tickets = fs.readdirSync(path.join(__dirname, `../tickets/`));
                var ticket = tickets.filter(function (element) {
                    return (element === `${message.content.split(" ").slice(1).slice(1).join(" ")}.ticket` || element === `STOP-${message.content.split(" ").slice(1).slice(1).join(" ")}.ticket`);
                });
                if (ticket.length <= 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_ticket_id, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.close} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                var ticketfile = ticket[0];
                ticket = ticket[0];
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticketfile}`)));
                if (ticket.author != message.author.id) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.oops}`, language.this_ticket_was_not_created_by_you)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                if (ticket.finished) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.the_ticket_has_already_been_closed)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                ticket.finished = true;
                var msg = language.the_ticket_was_closed_by_the_user;
                ticket.session.push({
                    author: client.user.id,
                    stamp: new Date(),
                    avatar: client.user.avatarURL(),
                    message: msg
                });
                try {
                    fs.writeFileSync(path.join(__dirname, `../tickets/${ticketfile}`), JSON.stringify(ticket));
                } catch (e) {
                    log(`An error occurred while saving ticket ${ticketfile}: ${e.stack}`, 1);
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.an_error_occurred, [{
                                title: language.error,
                                value: e.message
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({
                                    timeout: 10000
                                })
                                .catch(e => {});
                        });
                    return;
                }
                fs.renameSync(path.join(__dirname, `../tickets/${ticketfile}`), path.join(__dirname, `../tickets/STOP-${ticketfile}`));
                message.channel.send("", {
                        embed: makeEmbed(message, "00FF21", `✅ ${language.finished}`, language.your_ticket_has_been_closed)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({
                                timeout: 10000
                            })
                            .catch(e => {});
                    });
                var teamchannel = client.guilds.cache.get(config.server_id).channels.cache.get(config.ticket_notification_channel_id);
                if (!teamchannel) {
                    return;
                }
                teamchannel.send(`${language.ticketid}: ${ticket.id}`, {
                        embed: makeEmbed(message, "0094FF", `🚫 ${language.ticket_closed}`, language.the_following_ticket_has_been_closed + ": " + ticket.id)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${teamchannel.name}: ${e.stack}`, 1);
                    });
                break;
            default:                
                message.channel.send("", {
                        embed: makeEmbed(message, "#0094FF", `ℹ️ ${language.usage_of_this_command}`, `${language.help_for} ${config.prefix}ticket`, [{
                            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.create} <${language.message}>`,
                            value: language.starts_a_new_ticket
                        }, {
                            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.info} <${language.ticketid}>`,
                            value: language.sends_information_about_a_ticket
                        }, {
                            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.answer} <${language.ticketid}> <${language.message}>`,
                            value: language.sends_an_answer_to_a_ticket
                        }, {
                            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.close} <${language.ticketid}>`,
                            value: language.closes_a_ticket
                        }])
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({
                                timeout: 20000
                            })
                            .catch(e => {});
                    });
                break;
        }
    }
}