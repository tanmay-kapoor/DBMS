require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const async = require("async");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.PASSWORD,
    database: "accounts_db"
});

let username = "";
let password = "";
let email = "";
let failure = false;
let msg = "";
let loggedIn = false;
let quantities = [];
let purchasedTickets = [];

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    loggedIn = false;
    res.render("login", {failure: failure, msg: msg});
    failure = false;
    msg = "";
});

app.post("/login", (req, res) => {
    username = req.body.username;
    password = req.body.password;

    connection.query("SELECT * FROM users WHERE username = ?", [username], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length > 0) {
                if(password === foundUsers[0].password) {
                    loggedIn = true;
                    res.redirect("/index");
                } else {
                    failure = true;
                    msg = "Incorrect credentials";
                    res.redirect("/login");
                }
            } else {
                failure = true;
                msg = "Account doesn't exist";
                res.redirect("/login");
            }
        } else {
            console.log(err);
        }
    });
});

app.get("/signup", (req, res) => {
    loggedIn = false;
    res.render("signup", {failure: failure, msg: msg});
    failure = false;
    msg = "";
});

app.post("/signup", (req, res) => {
    email = req.body.email;
    username = req.body.username;
    password = req.body.password;

    connection.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length === 0) {
                if(email!=="" && username!="" && password!="" && isValid(username)) {
                    connection.query("INSERT INTO users(email, username, password) VALUES(?)", [[email, username, password]], (error, result) => {
                        if(!error) {
                            console.log("Account created");
                            res.redirect("/login");
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    failure = true;
                    if(email==="" || username==="" || password==="") {
                        msg = "Empty fields are not allowed";
                    } else {
                        msg = "Username doesn't match constraints";
                    }
                    res.redirect("/signup");
                }
            } else {
                failure = true;
                msg = "Account with specified username/email exists already";
                res.redirect("/signup");
            }
        } else {
            console.log(err);
        }
    });
});

function isValid(username) {
    const allowedChars = ['-', '_', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for(let i = 0; i<username.length; i++) {
        let ch = username.charAt(i);
        if(!(ch>='a' && ch<='z') && !(ch>='A' && ch<='Z') && !allowedChars.includes(ch)) {
            return false;
        }
    }
    return true;
}

app.get("/forgot-password", (req, res) => {
    res.render("forgot-password", {failure: failure, msg: msg});
    failure = false;
    msg = "";
});

app.post("/forgot-password", (req, res) => {
    const email = req.body.email;
    const newPassword = generatePassword();

    connection.query("SELECT * FROM users WHERE email = ?", [email], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length > 0) {
                connection.query("UPDATE users SET password = ? WHERE email = ?", [newPassword, email], (error, result) => {
                    if(!error) {
                        console.log("Password updated");

                        const message = {
                            to: email,
                            from: process.env.SENDER_EMAIL,
                            subject: "Forgot password",
                            html: "Your new password is <strong>" + newPassword + "</strong><br>Pls use this to login."
                        }
                        sgMail.send(message).then(res.redirect("/login")).catch(err => console.log(err));

                    } else {
                        console.log(error);
                    }
                });
            } else {
                console.log("User not found");
                failure = true;
                msg = "User not found";
                res.redirect("/forgot-password");
            }
        } else {
            console.log(err);
        }
    });
});

function generatePassword() {
    const allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvqxyz!-_@";
    let newPassword = "";
    for(let i = 0; i<10; i++) {
        newPassword = newPassword + allowed.charAt(Math.floor(Math.random()*66));
    }
    return newPassword;
}

app.get("/index", (req, res) => {
    if(loggedIn) {
        res.render("index");
    } else {
        res.render("404");
    }
});

app.get("/sunfest", (req, res) => {
    if(loggedIn) {
        connection.query("SELECT * FROM reviews", (err, reviews) => {
            if(!err) {
                res.render("sunfest", {foundReviews: reviews});
            } else {
                console.log(err);
            }
        });
    } else {
        res.render("404");
    }
});

app.get("/reviews", (req, res) => {
    if(loggedIn) {
        res.render("reviews");
    } else {
        res.render("404");
    }
});

app.post("/reviews", (req, res) => {
    const { title, description } = req.body;
    connection.query("INSERT INTO reviews(title, description) VALUES(?)", [[title, description]], (err, results) => {
        if(!err) {
            res.redirect("/sunfest");
        } else {
            console.log(err);
        }
    });
});

app.get("/artists", (req, res) => {
    if(loggedIn) {
        connection.query("SELECT * FROM artists", (err, artists) => {
            if(!err) {
                connection.query("SELECT * FROM full_lineup", (error, fullLineup) => {
                    if(!error) {
                        res.render("artists", {
                            foundArtists: artists,
                            lineup: fullLineup
                        });
                    } else {
                        console.log(error);
                    }
                });
            } else {
                console.log(err);
            }
        });
    } else {
        res.render("404");
    }
});

app.get("/profile", (req, res) => {

    if(loggedIn) {
        purchasedTickets = [];
        let q = 
        `SELECT ticket_id, quantity FROM user_ticket_relation 
        WHERE user_id = (SELECT user_id FROM users WHERE username = ?)`;

        connection.query(q, [username], (err, ids) => {
            if(!err) { 
                if(ids.length > 0) {

                    async.forEachOf(ids, (row, i, callback) => {

                        connection.query("SELECT name FROM tickets WHERE ticket_id = ?", [row.ticket_id], (err, name) => {
                            if(!err) {

                                let temp = {
                                    name: name[0].name,
                                    quantity: row.quantity
                                };
                                purchasedTickets.push(temp);

                                callback(null)
                            } else {
                                console.log(err);
                            }
                        });

                    }, err => {
                        if(err) {
                            console.log(err);
                        } else {
                            connection.query("SELECT amount FROM users WHERE username = ?", [username], (err, amount) => {
                                if(!err) {
                                    let payable = amount[0].amount;
                                    res.render("profile", {tickets: purchasedTickets, payable: payable});
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    });

                } else {
                    let temp = {
                        name: "No Tickets bought",
                        quantity: "Your tickets will be displayed here once you buy them."
                    };
                    purchasedTickets.push(temp);
                    let payable = 0;

                    res.render("profile", {tickets: purchasedTickets, payable: payable});
                }
            } else {
                console.log(err);
            }
        });

    } else {
        res.render("404");
    }
});

app.get("/tickets", (req, res) => {
    if(loggedIn) {
        connection.query("SELECT * FROM tickets", (err, tickets) => {
            if(!err) {
                res.render("tickets", {foundTickets: tickets});     
            } else {
                console.log(err);
            }
        });
    } else {
        res.render("404");
    }
});

app.post("/buy", (req, res) => {
    let key, i = 0, finalAmount = 0;

    for(key in req.body) {
        quantities[i++] = req.body[key];
    }

    connection.query("SELECT amount FROM users WHERE username = ?", [username], (error, amt) => {
        if(!error) {
            finalAmount = amt[0].amount
            finalAmount += quantities[0]*2999 + quantities[1]*3449 + quantities[2]*1699 + quantities[3]*4999 + quantities[4]*6099;
        
            connection.query("UPDATE users SET amount = ? WHERE username = ?", [finalAmount, username], (err, results) => {
                if(!err) {

                    async.forEachOf(quantities, (quantity, i, callback) => {
                        if(!err) {
                            if(quantity > 0) {
                                let q = `SELECT quantity FROM user_ticket_relation
                                         WHERE user_id = (SELECT user_id FROM users WHERE username = ?)
                                            AND ticket_id = ?`;

                                connection.query(q, [username, i+1], (err, results) => {
                                    if(!err) {
                                        if(results.length > 0) {
                                            
                                            q = `UPDATE user_ticket_relation 
                                                SET quantity = quantity + ? 
                                                WHERE user_id = (SELECT user_id FROM users WHERE username = ?)
                                                AND ticket_id = ?`;

                                            connection.query(q, [quantity, username, i+1], (err, result) => {
                                                if(!err) {
                                                    // console.log("Updated");
                                                    callback(null);
                                                } else {
                                                    console.log(err);
                                                }
                                            });

                                        } else {
                                            q = `INSERT INTO user_ticket_relation VALUES(
                                                (SELECT user_id FROM users WHERE username = ?), ?, ?
                                            )`;
    
                                            connection.query(q, [username, i+1, quantity], (err, result) => {
                                                if(!err) {
                                                    // console.log("Inserted");
                                                    callback(null);
                                                } else {
                                                    console.log(err);
                                                }
                                            });
                                        }
                                    } else {
                                        console.log(err);
                                    }                                         
                                });
                            }
                        } else {
                            callback(err);
                        }
                    }, err => {
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect("/profile");
                        }
                    });

                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(error);
        }
    });

});

app.get("/contact", (req, res) => {
    if(loggedIn) {
        res.render("contact");
    } else {
        res.render("404");
    }
});

app.post("/contact", (req, res) => {
    const { name, email, subject, message } = req.body;

    connection.query("SELECT username FROM users WHERE email = ?", [email], (error, foundUsernames) => {
        if(!error) {
            if(foundUsernames.length > 0) {
                let username = foundUsernames[0].username;
    
                const messageToSend = {
                    to: process.env.SENDER_EMAIL,
                    from: process.env.SENDER_EMAIL,
                    subject: subject,
                    html: "<strong>Name: </strong>"+name+"<br><strong>Email: </strong>"+email+"<br><strong>Account username: </strong>"+username+"<br><strong>Issue: </strong>"+message
                }
                sgMail.send(messageToSend).then(res.redirect("/contact")).catch(err => console.log(err));
            }
        } else {
            console.log(error);
        }
    });
});

app.listen(3000, () => console.log("Server started on port 3000"));