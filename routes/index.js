const express = require("express");
const indexController = require("../controllers/index");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.post("/decision/content", indexController.getDecisionContent);
Router.get("/detail/:id", indexController.getDetail);

Router.post("/filter", indexController.filterGroup)

Router.get("/reverse/", indexController.getDecisionReverse);
Router.post("/reverse/content", indexController.getDecisionReverseContent);

module.exports = Router;