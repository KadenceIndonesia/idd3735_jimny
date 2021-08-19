const mysql = require("mysql");
require("dotenv").config()
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database:'idd3756_jimny',
    port: 8889
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;