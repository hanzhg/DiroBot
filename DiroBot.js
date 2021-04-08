var fs = require("fs");

const Discord = require('discord.js');
const nodemailer = require("nodemailer");
const client = new Discord.Client();
const {
    v4: uuidv4
} = require('uuid');

const emails = fs.readFileSync("./emails.txt", "utf-8").split("\r\n");

var dataID = {};

var config = JSON.parse(fs.readFileSync("config.json"));

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: config.nodemailer.username,
        pass: config.nodemailer.password,
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    var message = msg.content.split(" ");
    var userID = msg.author.id;
    switch (message[0]) {
        case "!v":
            if (message.length > 1) {
                if (emails.includes(message[1])) {
                    var uniqueID = uuidv4();

                    dataID[uniqueID] = [userID, message[1]];

                    var mailOptions = {
                        from: config.nodemailer.username,
                        to: message[1],
                        subject: "Code d'accès",
                        html: "Voici votre code d'accès : " + uniqueID
                    };

                    smtpTransport.sendMail(mailOptions, function (err, info) {
                        if (err)
                            console.log(err)
                        else
                            console.log(info);
                    });

                    msg.channel.send("Le code d'accès à été envoyé").then(msg1 => {
                        msg1.delete({
                            timeout: 5000
                        });
                    });

                    msg.delete({
                        timeout: 2000
                    });

                } else {
                    msg.channel.send("Vous n'êtes pas dans la liste des membres").then(msg1 => {
                        msg1.delete({
                            timeout: 5000
                        });
                    });

                    msg.delete({
                        timeout: 5000
                    });
                }
            } else {
                msg.channel.send("Veuillez réessayer.").then(msg1 => {
                    msg1.delete({
                        timeout: 5000
                    });
                });

                msg.delete({
                    timeout: 5000
                });
            }
            break;

        case "!code":
            if (message.length > 1) {
                if (message[1] in dataID) {
                    if (dataID[message[1]][0] == userID) {

                        let server = client.guilds.cache.get(config.discord.serverID);

                        var role = server.roles.cache.find(role => role.name === config.discord.role);

                        server.members.cache.get(msg.author.id).roles.add(role);

                        fs.writeFile('whitelist.txt', dataID[message[1]][1] + "\n", {
                            'flag': 'a'
                        }, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                        });

                        msg.channel.send("Membre confirmé").then(msg1 => {
                            msg1.delete({
                                timeout: 5000
                            });
                        });

                        msg.delete({
                            timeout: 5000
                        });
                    } else {
                        msg.channel.send("Mauvais compte Discord.").then(msg1 => {
                            msg1.delete({
                                timeout: 5000
                            });
                        });

                        msg.delete({
                            timeout: 5000
                        });
                    }
                } else {
                    msg.channel.send("Mauvais code d'accès.").then(msg1 => {
                        msg1.delete({
                            timeout: 5000
                        });
                    });

                    msg.delete({
                        timeout: 5000
                    });
                }
            }
            break;

        case "yo":
            msg.channel.send("poils");
            break;

        case "bruh":
            msg.channel.send("ses vraies");
            break;
    }
});

client.login(config.discord.token);