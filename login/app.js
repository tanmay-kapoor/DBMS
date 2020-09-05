require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/accountsDB", { useNewUrlParser: true, useUnifiedTopology: true });

const usersSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String
});

const User = mongoose.model("User", usersSchema);

let failure = false;
let msg = "";

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login", {failure: failure, msg: msg});
    failure = false;
    msg = "";
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username}, (err, foundUser) => {
        if(!err) {
            if(foundUser) {
                if(password === foundUser.password) {
                    console.log("Logged in");
                    res.redirect("/login");
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
    res.render("signup", {failure: failure, msg: msg});
    failure = false;
    msg = "";
});

app.post("/signup", (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({$or: [{email: email}, {username: username}]}, (err, foundUser) => {
        if(!err) {
            if(!foundUser) {
                if(email!=="" && username!="" && password!="" && isValid(username)) {
                    const newUser = new User({
                        email: email,
                        username: username,
                        password: password
                    });
                    newUser.save((err) => {
                        if(!err) {
                            console.log("Account created");
                            res.redirect("/login");
                        } else {
                            console.log(err);
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
    
    User.findOne({email: email}, (err, foundUser) => {
        if(!err) {
            if(foundUser) {
                User.updateOne({email: email}, {password: newPassword}, (err, record) => {
                    if(!err) {
                        console.log("Password updated");
                    } else {
                        console.log(err);
                    }
                });

                const message = {
                    to: email,
                    from: "tanmay.skater@gmail.com",
                    subject: "Forgot password",
                    html: "Your new password is <strong>" + newPassword + "</strong><br>Pls use this to login."
                }
                sgMail.send(message).then(res.redirect("/login")).catch(err => console.log(err));
                
            } else {
                console.log("User not found");
                failure = true;
                msg = "Account with specified username/email exists already";
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

app.listen(3000, () => console.log("Server started on port 3000"));