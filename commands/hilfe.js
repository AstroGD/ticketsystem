module.exports = function (log, makeEmbed, language, config, languageconfig) {
    return function (message) {
        var embed = makeEmbed(message, "0094FF", `ℹ️ ${language.help}`, language.information_to_the_use_of_the_ticket_system, [{
            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.create} <${language.message}>`,
            value: language.starts_a_new_ticket
        }, {
            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.info} <${language.ticketid}>`,
            value: language.information_about_the_selected_ticket
        }, {
            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.answer} <${language.ticketid}> <${language.message}>`,
            value: language.sends_an_answer_to_a_ticket
        }, {
            title: `${config.prefix}${languageconfig.ticketcommand.main} ${languageconfig.ticketcommand.close} <${language.ticketid}>`,
            value: language.closes_a_ticket
        }]);
        message.channel.send("", {
            embed: embed
        }).catch(e => {
            log(`An error occurred while sending a message to ${message.channel.name}: ${e.stack}`, 1);
        }).then(msg => {
            msg.delete({timeout:30000}).catch(e => {});
        });

        var guild = message.guild;
        var role = guild.roles.cache.get(config.team_role_id);

        if (!role) {
            log(`Teamroleid invalid. Please check the config.json`, 1);
            message.channel.send("", {
                    embed: makeEmbed(message, "#00FF21", `❗ ${language.an_error_occurred}`, language.the_team_role_stored_in_the_bots_config_is_invalid_please_contact_an_administrator)
                })
                .catch(e => {
                    log(`An error occured while sending a message to ${message.channel.name}: ${e.stack}`, 1);
                });
            return;
        }

        if (message.member.roles.cache.get(role.id)) {
            message.author.send("", {
                    embed: makeEmbed(message, "#0094FF", `ℹ️ ${language.help}`, language.information_to_the_use_of_the_ticket_system + " | " + language.for_staff_members, [{
                        title: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.info} <${language.ticketid}>`,
                        value: language.information_about_the_selected_ticket
                    }, {
                        title: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.answer} <${language.ticketid}> <${language.message}>`,
                        value: language.sends_an_answer_to_a_ticket
                    }, {
                        title: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.close} <${language.ticketid}>`,
                        value: language.closes_a_ticket
                    }, {
                        title: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.reopen} <${language.ticketid}>`,
                        value: language.reopens_a_ticket
                    }, {
                        title: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.list}`,
                        value: language.shows_a_list_of_all_open_tickets
                    }, {
                        title: `${config.prefix}${languageconfig.ticketteamcommand.main} ${languageconfig.ticketteamcommand.user} <${language.userid_or_mention}>`,
                        value: language.shows_a_list_of_tickets_created_by_a_specific_user
                    }])
                })
                .catch(e => {
                    log(`An error occured while sending a message to ${message.author.tag}: ${e.stack}`, 1);
                });
            return;
        }
    }
}