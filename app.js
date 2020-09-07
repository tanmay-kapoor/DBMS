require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
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

let failure = false;
let msg = "";
let loggedIn = false;

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
    const username = req.body.username;
    const password = req.body.password;

    connection.query("SELECT * FROM users WHERE username = ?", [username], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length > 0) {
                if(password === foundUsers[0].password) {
                    loggedIn = true;
                    res.redirect("index");
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
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    connection.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, foundUsers) => {
        if(!err) {
            if(!foundUsers.length > 0) {
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
                            from: "tanmay.skater@gmail.com",
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
        res.render("404", {msg: "Not logged in"});
    }
});

app.get("/sunfest", (req, res) => {
    if(loggedIn) {
        res.render("sunfest");
    } else {
        res.render("404", {msg: "Not logged in"});
    }
});

app.get("/artists", (req, res) => {
    if(loggedIn) {
        res.render("artists");
    } else {
        res.render("404", {msg: "Not logged in"});
    }
});

app.get("/profile", (req, res) => {
    if(loggedIn) {
        res.render("profile");
    } else {
        res.render("404", {msg: "Not logged in"});
    }
});

app.get("/contact", (req, res) => {
    if(loggedIn) {
        res.render("contact");
    } else {
        res.render("404", {msg: "Not logged in"});
    }
});

app.get("/tickets", (req, res) => {
    if(loggedIn) {
        res.render("tickets");
    } else {
        res.render("404");
    }
})

app.listen(3000, () => console.log("Server started on port 3000"));