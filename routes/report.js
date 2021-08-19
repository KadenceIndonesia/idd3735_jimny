const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router()

Router.get("/sourceofinformation", reportController.getSourceOfInformation)
Router.get("/sourceofinformation/content/", reportController.getSourceOfInformationContent)

Router.get("/aida", reportController.getAida)
Router.get("/aida/content/", reportController.getAidaContent)


module.exports = Router;