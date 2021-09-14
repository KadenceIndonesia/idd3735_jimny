const express = require("express");
const indexController = require("../controllers/index");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.post("/decision/content", indexController.getDecisionContent);
Router.get("/detail/:id", indexController.getDetail);

Router.post("/filter", indexController.filterGroup)

module.exports = Router;