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
        var arrbrand = [1, 10, 20, 30, 40, 51, 60, 34,3,71,42,52,8,17,32,21,41,43,2,5,12,36,45,6,11,16,31,33,44,7,13,14,35,37];
        var showBrand = []
        for (let i = 0; i < brand.length; i++) {
            if(arrbrand.indexOf(brand[i].code)!=-1){
                showBrand.push({
                    code: brand[i].code,
                    label: brand[i].label
                })
            }
        }
        const login = req.session.data
        res.render("decision/index",{
            login: login,
            moment: moment,
            brand: showBrand
        })  
    }else{
        res.redirect("./login")
    }
}
exports.getDecisionContent = async function(req,res){
    var break2 = req.body.break2
    var break3 = req.body.break3
    var code1 = req.body.code1
    var code2 = req.body.code2
    var code3 = req.body.code3

    var parentBrand = [1, 10, 20, 30, 40, 51, 60]
    var childBrand = [[1, 2, 3, 71, 4, 5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15, 16, 17], [20, 21, 22, 23, 24, 25], [30, 31, 31, 33, 34, 35, 36, 37], [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50], [51, 52, 53, 54, 55], [60, 61, 62, 63]]
    var checkParent = parentBrand.indexOf(parseInt(code1))
    // jika code 1 terpilih parent brand
    if(checkParent!=-1){
        var mergeStep1 = [];
        var mergeStep2 = [];
        var mergeStep3 = [];
        var mergeStep4 = [];
        for (let i = 0; i < childBrand[0].length; i++) {
            mergeStep1.push(await dataFilterByBreak(pid, "B1", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeStep2.push(await dataFilterByBreak(pid, "B2a", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeStep3.push(await dataFilterByBreak(pid, "C3", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeStep4.push(await dataFilterByBreak(pid, "C4a", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
        }
    }else{
        var dataStep1 = await dataFilterByBreak(pid, "B1", "A7", break2, break3, code1, code2, code3);
        var dataStep2 = await dataFilterByBreak(pid, "B2a", "A7", break2, break3, code1, code2, code3);
        var dataStep3 = await dataFilterByBreak(pid, "C3", "A7", break2, break3, code1, code2, code3);
        var dataStep4 = await dataFilterByBreak(pid, "C4a", "A7", break2, break3, code1, code2, code3);
    }
    var dataStep1 = Object.keys(mergeStep1).reduce(function(arr, key) {
        return arr.concat(mergeStep1[key]);
    }, []);
    var dataStep2 = Object.keys(mergeStep2).reduce(function(arr, key) {
        return arr.concat(mergeStep2[key]);
    }, []);
    var dataStep3 = Object.keys(mergeStep3).reduce(function(arr, key) {
        return arr.concat(mergeStep3[key]);
    }, []);
    var dataStep4 = Object.keys(mergeStep4).reduce(function(arr, key) {
        return arr.concat(mergeStep4[key]);
    }, []);

    var dataLength = dataStep1.length
    var step1 = []
    var step2;
    var step3;
    var step4;

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

exports.filterGroup = async function(req,res){
    var break2 = req.body.break2;
    if(break2!="all"){
        var break2Group = await getAttributeByQid(pid, break2);
    }
    var break3 = req.body.break3;
    if(break3!="all"){
        var break3Group = await getAttributeByQid(pid, break3);
    }
    res.send([break2Group, break3Group])
}