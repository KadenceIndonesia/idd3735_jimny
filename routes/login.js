const express = require("express");
const Router = express.Router();
const db = require("../models/db");
const moment = require("moment");
require("../library/index");
Router.get("/", (req,res) => {
    res.render("login")
})


Router.post("/auth", async function(req,res){
    if(req.session.loggedin==true){
        res.redirect("../")
    }else{
        var pid = req.body.pid
        var email = req.body.email
        var pass = req.body.password
        const auth = await getAuth(pid, email, pass)
        if(auth.message=='success'){
            req.session.loggedin = true
            req.session.data = auth.login
            res.redirect("../../")
        }else{
            console.log(auth)
            res.redirect("../")
        }   
    }
})

module.exports = Router;