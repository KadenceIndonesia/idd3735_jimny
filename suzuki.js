const express = require("express")
const mysql = require("mysql")
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require("express-session")
const mongoose = require("mongoose")

const indexRoutes = require("./routes/index");
const loginRoutes = require("./routes/login.js");
const reportRoutes = require("./routes/report");
global.baseurl = function(){
	var url = `http://${process.env.HOST}:${process.env.PORT}/`;
    return url;
}
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error => handleError(error));


const app = express();
app.use(fileupload());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    name: 'idd3735_jimny'
}))

app.use("/", indexRoutes)
app.use("/login", loginRoutes)
app.use("/report", reportRoutes)
app.get("/logout", function(req,res) {
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        req.session.destroy();
        res.redirect("/login")
})

app.listen(process.env.PORT, (req,res) => {
    
})