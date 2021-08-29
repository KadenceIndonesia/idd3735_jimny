const express = require("express");
const indexController = require("../controllers/index");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.post("/decision/content", indexController.getDecisionContent);
Router.get("/detail/:id", indexController.getDetail);
Router.get("/total/", indexController.getTotal);
Router.get("/uploadfile", indexController.getUpload);
Router.post("/uploadfile/upload", indexController.postUpload);

module.exports = Router;