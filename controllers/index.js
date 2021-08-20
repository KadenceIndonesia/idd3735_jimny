const express = require("express")
const moment = require("moment")
const path = require("path")
const fs = require("fs")
const directoryPath = path.join(__dirname, '../public/data')
const xslx = require("xlsx")
const db = require("../models/db")
const { resolve } = require("path")
const { count } = require("console")
const session = require("express-session")
const pid = process.env.PID


global.findObj = function(array, attr, value){
    return new Promise(resolve => {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                resolve(i);
            }
        }
        resolve(-1);
    })
}
exports.getIndex = async function(req,res){
    if(req.session.loggedin==true){
        var brand = await getAttributeByQid(pid, "A1");
        const login = req.session.data
        
        res.render("decision/index",{
            login: login,
            moment: moment,
            brand: brand
        })  
    }else{
        res.redirect("./login")
    }
}
exports.getDecisionContent = async function(req,res){
    if(req.query.brand=="all"){
        var dataStep1 = await getData(pid, "B1");
    }else{
        var dataStep1 = await getDataByBreak(pid, "B1", "A7", req.query.brand);
    }
    var dataLength = dataStep1.length
    const step1 = []
    var step2;
    var step3;
    var step4;
    const dataStep2 = await getData(pid, "B2a");
    const dataStep3 = await getData(pid, "C3");
    const dataStep4 = await getData(pid, "C4a");

    const nettingLogic = (netting, i) => {
        if(netting=="all"){
            return dataStep1[i].code > 0
        }else{
            if(netting=="Online"){
                return dataStep1[i].code > 18
            }else{
                return dataStep1[i].code <= 18
            }
        }
    }

    for (let i = 0; i < dataStep1.length; i++) {
        if(nettingLogic(req.query.netting, i)){
            var findArr = await findObj(step1, "label", dataStep1[i].label) // find array by label
            if(findArr == -1){ //jika label belum ada di step1
                step2 = []
                for (let x = 0; x < dataStep2.length; x++) {
                    if(dataStep2[x].sbjnum==dataStep1[i].sbjnum){
                        var findArr2 = await findObj(step2, "label", dataStep2[x].label)
                        if(findArr2==-1){ //step 1 == false, step2 == false
                            step3 = []
                            for (let z = 0; z < dataStep3.length; z++) {
                                if(dataStep3[z].sbjnum==dataStep2[x].sbjnum){
                                    var findArr3 = await findObj(step3, "label", dataStep3[z].label)
                                    if(findArr3==-1){//step 1 == false, step2 == false, step3 == false
                                        step4 = []
                                        for (let a = 0; a < dataStep4.length; a++) {
                                            if(dataStep4[a].sbjnum==dataStep3[z].sbjnum){
                                                var findArr4 = await findObj(step4, "label", dataStep4[a].label)
                                                if(findArr4==-1){ //step 1 == false, step2 == false, step3 == false, step4 ==  false
                                                    step4.push({
                                                        label: dataStep4[a].label,
                                                        value: 1,
                                                        percent: 0
                                                    })
                                                }else{ //step 1 == false, step2 == false, step3 == false, step4 ==  true
                                                    step4[findArr4].value = step4[findArr4].value + 1
                                                }
                                            }
                                        }
                                        step3.push({
                                            label: dataStep3[z].label,
                                            value: 1,
                                            percent: 0,
                                            step4: step4
                                        })
                                    }else{ //step 1 == false, step2 == false, step3 == true
                                        step3[findArr3].value = step3[findArr3].value + 1
                                    }
                                }
                            }
                            step2.push({
                                label: dataStep2[x].label,
                                value: 1,
                                percent: 0,
                                step3: step3
                            })
                        }else{ //step 1 == false, step2 == true
                            step2[findArr2].value = step2[findArr2].value + 1
                        }
                    }
                }
                step1.push({
                    label: dataStep1[i].label,
                    value: 1,
                    percent: 0,
                    step2: step2
                })
            }else{ //step 1 == true
                step1[findArr].value = step1[findArr].value + 1 //update value di step 1
                // step1[findArr].percent = (step1[findArr].value + 1 * 100 / dataLength).toFixed(2)
                for (let y = 0; y < dataStep2.length; y++) {
                    if(dataStep2[y].sbjnum==dataStep1[i].sbjnum){
                        var findArr2 = await findObj(step1[findArr].step2, "label", dataStep2[y].label)
                        if(findArr2 == -1){//step 1 == true, step2 == false
                            step3 = []
                            for (let z = 0; z < dataStep3.length; z++) {
                                var findArr3 = await findObj(step3, "label", dataStep3[z].label)
                                if(dataStep3[z].sbjnum == dataStep2[y].sbjnum){
                                    if(findArr3 == -1){//step 1 == true, step2 == false, step3 == false
                                        step4 = []
                                        for (let a = 0; a < dataStep4.length; a++) {
                                            var findArr4 = await findObj(step4, "label", dataStep4[a].label);
                                            if(dataStep4[a].sbjnum == dataStep3[z].sbjnum){
                                                if(findArr4 == -1){//step 1 == true, step2 == false, step3 == false, step4 == false
                                                    step3.push({
                                                        label: dataStep4[a].label,
                                                        value: 1,
                                                        percent: 0
                                                    })
                                                }else{ //step 1 == true, step2 == false, step3 == false, step4 == true
                                                    step4[findArr4].value = step4[findArr4].value + 1
                                                }
                                            }
                                        }
                                        step3.push({
                                            label: dataStep3[z].label,
                                            value: 1,
                                            percent: 0,
                                            step4: step4
                                        })
                                    }else{ //step 1 == true, step2 == false, step3 == true
                                        step3[findArr3].value = step3[findArr3].value + 1
                                    }
                                }
                            }
                            step1[findArr].step2.push({
                                label: dataStep2[y].label,
                                value: 1,
                                percent: 0,
                                step3: step3
                            })
                        }else{//step 1 == true, step2 == true
                            // step3 = []
                            // for (let z = 0; z < dataStep3.length; z++) {
                            //     var findArr3 = await findObj(step3, "label", dataStep3[z].label)
                            //     if(dataStep3[z].sbjnum == dataStep2[y].sbjnum){
                            //         if(findArr3 == -1){//step 1 == true, step2 == true, step3 == false
                            //             step4 = []
                            //             for (let a = 0; a < dataStep4.length; a++) {
                            //                 var findArr4 = await findObj(step4, "label", dataStep4[a].label);
                            //                 if(dataStep4[a].sbjnum == dataStep3[z].sbjnum){
                            //                     if(findArr4 == -1){//step 1 == true, step2 == true, step3 == false, step4 == false
                            //                         step3.push({
                            //                             label: dataStep4[a].label,
                            //                             value: 1,
                            //                             percent: 0
                            //                         })
                            //                     }else{ //step 1 == true, step2 == true, step3 == false, step4 == true
                            //                         step4[findArr4].value = step4[findArr4].value + 1
                            //                     }
                            //                 }
                            //             }
                            //             step3.push({
                            //                 label: dataStep3[z].label,
                            //                 value: 1,
                            //                 percent: 0,
                            //                 step4: step4
                            //             })
                            //         }else{ //step 1 == true, step2 == true, step3 == true
                            //             step3[findArr3].value = step3[findArr3].value + 1
                            //         }
                            //     }
                            // }
                            // step1[findArr].step2.push({
                            //     label: dataStep2[y].label,
                            //     value: 1,
                            //     percent: 0,
                            //     step3: step3
                            // })
                            step1[findArr].step2[findArr2].value = step1[findArr].step2[findArr2].value + 1
                        }
                    }
                }
            }
        }
    }

    // update percent step 2
    for (let i = 0; i < step1.length; i++) {
        step1[i].percent = (step1[i].value / dataLength * 100).toFixed(2)
        var lengthStep1 = step1[i].value
        for (let x = 0; x < step1[i].step2.length; x++) {
            step1[i].step2[x].percent = (step1[i].step2[x].value / lengthStep1 * 100).toFixed(2)
        }
    }
    res.render("decision/content",{
        step1: step1,
        step2: step2
    })  

}

exports.getDetail = async function(req,res){
    var id = req.params.id
    res.render("detailchart",{
        id: id
    })
}

exports.getTotal = async function(req,res){
    // if(req.session.email==undefined){
    //     res.redirect("../login")
    // }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, typeses: req.session.type})
        db.query("SELECT * FROM dataSync ORDER BY dateSync DESC LIMIT 1", function(err,result){
            res.render("achievement",{
                login: login,
                moment: moment
            })
        })
    // }
}

exports.getUpload = async function(req,res){
    // if(req.session.email==undefined){
    //     res.redirect("../login")
    // }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, typeses: req.session.type})
        res.render("importfile",{
            login: login,
            moment: moment
        })
    // }
}

exports.postUpload = async function(req,res){
    let uploadPath;
    var filename = req.files.filexls;
    var extension = path.extname(filename.name);
    uploadPath = "public/data/overall_achievement.xlsx"
    var date = new Date()
    filename.mv(uploadPath, function(errupload){
        if(errupload){
            throw err;
        }else{
            db.query("INSERT INTO dataSync VALUES(null,?)",[date], function(errsave,syncdata){
                if(syncdata){
                    res.redirect("../../")
                }
            })
        }
    })
}