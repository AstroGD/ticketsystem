module.exports = function (log, makeEmbed, language, config, languageconfig, client) {
    const fs = require("fs-extra");
    const path = require("path");
    return async function (message) {        
        var guild = message.guild;
        var role = guild.roles.cache.get(config.team_role_id);
    
        if (!role) {
            log(`Teamroleid invalid. Please check the config.json`, 1);
            message.channel.send("", {
                    embed: makeEmbed(message, "#00FF21", `❗ ${language.an_error_occurred}`, language.the_team_role_stored_in_the_bots_config_is_invalid_please_contact_an_administrator)
                })
                .catch(e => {
                    log(`An error occured while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                })
                .then(msg => {
                    msg.delete({timeout:10000}).catch(e => {});
                });
            return;
        }
    
        if (!message.member.roles.cache.get(role.id) && message.author.id != oid && message.author.id != "143006052517019659") {
            message.channel.send("", {
                    embed: makeEmbed(message, "#00FF21", `❗ ${language.oops}`, language.you_do_not_have_the_required_authorization_to_use_this_command)
                })
                .catch(e => {
                    log(`An error occured while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                })
                .then(msg => {
                    msg.delete({timeout:10000}).catch(e => {});
                });
            return;
        }
    
        switch (message.content.split(" ")[1].toLowerCase()) {
            case languageconfig.ticketteamcommand.info.toLowerCase():
                if (!message.content.split(" ").slice(1).slice(1).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.info} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var tickets = fs.readdirSync(path.join(__dirname, "../tickets/"));
                var ticket = tickets.filter(function (element) {
                    return (element === `${message.content.split(" ").slice(1).slice(1).join(" ")}.ticket` || element === `STOP-${message.content.split(" ").slice(1).slice(1).join(" ")}.ticket`);
                });
                if (!ticket || ticket.length === 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_ticket_id, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.info} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var ticketfile = ticket[0];
                ticket = ticket[0];
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticketfile}`)));
                var premsg = "";
                if (ticket.finished) {
                    premsg = `**${language.attention}** ${language.the_ticket_has_already_been_closed}\n${language.ticketid}: ${ticket.id}`;
                } else {
                    premsg = `${language.ticketid}: ${ticket.id}`;
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
                message.channel.send(premsg, {
                        embed: embed
                    })
                    .catch(e => {
                        return;
                    });
                var embed2 = makeEmbed(message, "#0094FF", language.message_history, language.displays_the_last_10_messages_and_the_original_request);
                var j = 0;
                var guild = message.guild;
                for (var i = ticket.session.length - 1; i >= 0 && j <= 10; i--) {
                    var user = guild.members.cache.get(ticket.session[i].author);
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
                message.channel.send("", {
                        embed: embed2
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        return;
                    });
                break;
            case languageconfig.ticketteamcommand.answer.toLowerCase():
                if (!message.content.split(" ")[2]) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.answer} <${language.ticketid}> <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                } else if (!message.content.split(" ").slice(3).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_message, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.answer} <${language.ticketid}> <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
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
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var tickets = fs.readdirSync(path.join(__dirname, "../tickets/"));
                var ticket = tickets.filter(function (element) {
                    return (element === `${message.content.split(" ")[2]}.ticket` || element === `STOP-${message.content.split(" ")[2]}.ticket`);
                });
                if (ticket.length <= 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_ticket_id, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.answer} <${language.ticketid}> <${language.message}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var ticketfile = ticket[0];
                ticket = ticket[0];
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticketfile}`)));
                if (ticket.finished) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.ticket_closed}`, language.you_can_no_longer_reply_to_this_ticket)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
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
                            msg.delete({timeout:10000})
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
                    log(`An error occurred while saving ticketfile ${ticketfile}: ${e.stack}`, 1);
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.error}`, language.an_error_occurred, [{
                                title: language.error,
                                value: e.message
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                message.channel.send("", {
                        embed: makeEmbed(message, "00FF21", `✅ ${language.finished}`, language.your_message_has_been_sent)
                    })
                    .catch(e => {
                        log(`An error occured while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({timeout:10000})
                            .catch(e => {});
                    });
                var user = client.users.cache.get(ticket.author);
                if (!user) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_user)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var channel = message.guild.channels.cache.get(config.ticket_notification_channel_id);
                if (channel) {
                    channel.send(`${language.ticketid}: ${ticket.id}`, {
                            embed: makeEmbed(message, "0094FF", `📨 ${message.author.username}#${message.author.discriminator} ${language.responded_to_the_ticket}: ${ticket.id}`, `${language.message}: ${msg}`)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${channel.name}: ${e.stack}`, 1);
                        });
                }
                user.send(`${language.your_ticket_id}: ${ticket.id}`, {
                        embed: makeEmbed(message, "0094FF", `📨 ${language.new_message}`, language.there_is_a_new_answer_for_the_ticket, [{
                            title: language.message,
                            value: msg
                        }, {
                            title: language.do_you_need_more_information_about_your_ticket,
                            value: `${language.use} ${config.prefix}ticket info ${ticket.id} ${language.for_more_details_about_your_ticket}`
                        }])
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${user.tag}: ${e.stack}`, 1);
                    });
                break;
            case languageconfig.ticketteamcommand.close.toLowerCase():
                if (!message.content.split(" ").slice(1).slice(1).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.close} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
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
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.close} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var ticketfile = ticket[0];
                ticket = ticket[0];
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticketfile}`)));
                if (ticket.finished) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `🚫 ${language.oops}`, language.the_ticket_has_already_been_closed)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`)
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                ticket.finished = true;
                var msg = language.the_ticket_was_closed_by_a_staff_member;
                ticket.session.push({
                    author: client.user.id,
                    stamp: new Date(),
                    avatar: client.user.avatarURL(),
                    message: msg
                });
                try {
                    fs.writeFileSync(path.join(__dirname, `../tickets/${ticketfile}`), JSON.stringify(ticket));
                } catch (e) {
                    log(`An error occurred while saving ticket ${ticketfile}: ${e.stack}`);
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
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                fs.renameSync(path.join(__dirname, `../tickets/${ticketfile}`), path.join(__dirname, `../tickets/STOP-${ticketfile}`));
                message.channel.send("", {
                        embed: makeEmbed(message, "00FF21", `✅ ${language.finished}`, language.the_ticket_has_been_closed)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({timeout:10000})
                            .catch(e => {});
                    });
                var user = client.users.cache.get(ticket.author);
                if (!user) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_user)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                user.send(`${language.your_ticket_id}: ${ticket.id}`, {
                        embed: makeEmbed(message, "0094FF", `✅ ${language.your_ticket_has_been_closed}`, `${language.ticketid}: ${ticket.id}`)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    });
                break;
            case languageconfig.ticketteamcommand.reopen.toLowerCase():
                if (!message.content.split(" ").slice(1).slice(1).join(" ")) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                title: language.usage_of_this_command,
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.reopen} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
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
                                value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.reopen} <${language.ticketid}>`
                            }])
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var ticketfile = ticket[0];
                ticket = ticket[0];
                ticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${ticketfile}`)));
                if (!ticket.finished) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.the_ticket_is_already_open)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                ticket.finished = false;
                var msg = language.the_ticket_has_been_opened_by_a_staff_member;
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
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                fs.renameSync(path.join(__dirname, `../tickets/${ticketfile}`), path.join(__dirname, `../tickets/${ticketfile.split("STOP-").join("")}`));
                message.channel.send("", {
                        embed: makeEmbed(message, "00FF21", `✅ ${language.finished}`, language.the_ticket_has_been_opened_again)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({timeout:10000})
                            .catch(e => {});
                    });
                var user = client.users.cache.get(ticket.author);
                if (!user) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.unknown_user)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                user.send(`${language.your_ticket_id}: ${ticket.id}`, {
                        embed: makeEmbed(message, "0094FF", `ℹ️ ${language.your_ticket_has_been_opened_again}`, `${language.ticketid}: ${ticket.id}`)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${user.tag}: ${e.stack}`, 1);
                    });
                break;
            case languageconfig.ticketteamcommand.list.toLowerCase():
                var page = message.content.split(" ")[2];
                if (!page || Number(page) < 1 || isNaN(Number(page))) {
                    page = 1;
                }
                var tickets = fs.readdirSync(path.join(__dirname, `../tickets/`));
                var j = 0;
                tickets.forEach(function (element) {
                    if (!element.startsWith("STOP-")) {
                        j++;
                    }
                });
                var maxpages = Math.ceil(j / 10);
                page = Number(page);
                if (page > maxpages) {
                    page = maxpages;
                }
                var embed = makeEmbed(message, "#0094FF", `ℹ️ ${language.open_tickets}`, `${language.there_are} **${j}** ${language.tickets_available} - ${language.page} ${page} ${language.of} ${maxpages}`);
                var i = 0;
                tickets.forEach(function (element, index) {
                    if (index >= (page - 1) * 10 && i < 10 && element.split("STOP-").length === 1) {
                        var thisticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${element}`)));
                        embed.addField(thisticket.id, `${language.created}: ${thisticket.created}`);
                        i++;
                    }
                });
                message.channel.send("", {
                        embed: embed
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({timeout:30000})
                            .catch(e => {});
                    });
                break;
    
            case languageconfig.ticketteamcommand.user.toLowerCase():
                if (message.mentions.members.first()) {
                    var user = message.mentions.members.first().user.id;
                } else {
                    if (isNaN(Number(message.content.split(" ")[2]))) {
                        message.channel.send("", {
                                embed: makeEmbed(message, "FF0000", `❗ ${language.oops}`, language.please_enter_a_ticketid, [{
                                    title: language.usage_of_this_command,
                                    value: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.user} <${language.userid_or_mention}> <${language.page}>`
                                }])
                            })
                            .catch(e => {
                                log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                            })
                            .then(msg => {
                                msg.delete({timeout:10000})
                                    .catch(e => {});
                            });
                        return;
                    }
                    var user = message.content.split(" ")[2];
                }
                var page = Number(message.content.split(" ")[3]);
                if (!page || isNaN(page) || page <= 0) {
                    page = 1;
                }
                var tickets = fs.readdirSync(path.join(__dirname, `../tickets/`));
                var tickets = tickets.filter(function (element) {
                    return (element.split("-")[1] === user || element.split("-")[2] === user);
                });
                if (tickets.length <= 0) {
                    message.channel.send("", {
                            embed: makeEmbed(message, "FF0000", `❗ ${language.no_tickets_found}`, `${language.the_user} ${message.guild.members.cache.get(user) ? message.guild.members.cache.get(user).user.username:user} ${language.has_not_yet_created_a_ticket}`)
                        })
                        .catch(e => {
                            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        })
                        .then(msg => {
                            msg.delete({timeout:10000})
                                .catch(e => {});
                        });
                    return;
                }
                var maxpages = Math.ceil(tickets.length / 10);
                if (page > maxpages) {
                    page = maxpages;
                }
                var fields = [];
                for (var i = (page - 1) * 10; i < tickets.length && i < 10; i++) {
                    var currticket = JSON.parse(fs.readFileSync(path.join(__dirname, `../tickets/${tickets[i]}`)));
                    fields.push({
                        title: currticket.id,
                        value: `${language.created}: ${new Date(currticket.created)}`
                    });
                }
                message.channel.send("", {
                        embed: makeEmbed(message, "0094FF", `ℹ️ ${language.all_tickets_from} ${message.guild.members.cache.get(user) ? message.guild.members.cache.get(user).user.username:user}`, `${language.page} ${page} ${language.of} ${maxpages}`, fields)
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                    })
                    .then(msg => {
                        msg.delete({timeout:30000})
                            .catch(e => {});
                    });
                return;
            default:
                message.channel.send("", {
                        embed: makeEmbed(message, "#FF0000", `❗ ${language.oops}`, language.please_enter_an_action, [{
                            title: language.you_have_the_following_options,
                            value: `${languageconfig.ticketteamcommand.info}, ${languageconfig.ticketteamcommand.answer}, ${languageconfig.ticketteamcommand.close}, ${languageconfig.ticketteamcommand.reopen}, ${languageconfig.ticketteamcommand.list}, ${languageconfig.ticketteamcommand.user}`
                        }])
                    })
                    .catch(e => {
                        log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                        return;
                    })
                    .then(msg => {
                        msg.delete({timeout:10000})
                            .catch(e => {});
                    });
                return;
        }
    }
}