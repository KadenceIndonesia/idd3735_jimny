const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router()

Router.get("/sourceofinformation", reportController.getSourceOfInformation)
Router.post("/sourceofinformation/content/", reportController.getSourceOfInformationContent)

Router.get("/aida", reportController.getAida)
Router.post("/aida/content/", reportController.getAidaContent)


module.exports = Router;