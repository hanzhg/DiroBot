const Discord = require('discord.js');
const nodemailer = require("nodemailer");
const fs = require("fs");

const client = new Discord.Client();

var emails = fs.readFileSync("./emails.txt", "utf-8");

var dataID = {};

// config
var sender = "example@gmail.com";
var password = "*****";
var serverID = "";
var token = "";

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: sender,
        pass: password
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
                    var uniqueID = Math.round(Math.random() * 999999);

                    dataID[uniqueID] = [userID, message[1]];

                    var mailOptions = {
                        from: sender,
                        to: message[1],
                        subject: "Code d'accès",
                        html: "<h2>Voici votre code d'accès : " + uniqueID + "</h2>"
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
                        })
                        .catch( /*Your Error handling if the Message isn't returned, sent, etc.*/ );

                    msg.delete({
                        timeout: 2000
                    });

                }
            } else {
                msg.channel.send("Vous n'êtes pas dans la liste des membres").then(msg1 => {
                        msg1.delete({
                            timeout: 5000
                        });
                    })
                    .catch( /*Your Error handling if the Message isn't returned, sent, etc.*/ );

                msg.delete({
                    timeout: 5000
                });
            }
            break;

        case "!code":
            if (message.length > 1) {
                if (message[1] in dataID) {
                    if (dataID[message[1]][0] == userID) {

                        let server = client.guilds.cache.get(serverID);
                        var role = server.roles.cache.find(role => role.name === "Membre");

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
                            })
                            .catch( /*Your Error handling if the Message isn't returned, sent, etc.*/ );

                        msg.delete({
                            timeout: 5000
                        });
                    }
                } else {
                    msg.channel.send("Mauvais code d'accès").then(msg1 => {
                            msg1.delete({
                                timeout: 5000
                            });
                        })
                        .catch( /*Your Error handling if the Message isn't returned, sent, etc.*/ );

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
            // msg.channel.send("ses vraies");
            msg.delete({
                timeout: 500
            });
            break;
    }
});

client.login(token);