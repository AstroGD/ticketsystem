module.exports = function (client) {
    return function (message, color, title, description, fields) {
        const Discord = require("discord.js");

        var embed = new Discord.MessageEmbed();
        embed.setColor(color)
            .setFooter("Ticket System by AstroGD", client.user.avatarURL()) //Getting my name out in the world is the only payment I get for releasing free code so I am very thankful if you leave this as it is.
            .setTimestamp(new Date())
            .setTitle(title)
            .setDescription(description);

        if (message) {
            embed.setAuthor(message.author.username, message.author.avatarURL());
        }

        if (fields) {
            for (var i = 0; i < fields.length; i++) {
                if (!fields[i].inline) fields[i].inline = false;
                if (!fields[i].empty) {
                    embed.addField(fields[i].title, fields[i].value, fields[i].inline);
                } else {
                    embed.addField('\u200b', '\u200b', fields[i].inline);
                }
            }
        }
        return embed;
    }
}