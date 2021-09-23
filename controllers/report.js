const pid = process.env.PID
const axios = require("axios")
require("../library/index")

exports.getSourceOfInformation = async function(req,res){
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
        const login = req.session.data;
        
        res.render("soi/index", {
            login: login,
            brand: showBrand
        })
    }else{
        res.redirect("../../login")
    }
}


exports.getSourceOfInformationContent = async function(req,res){
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
        var mergeB1 = [];
        var mergeB2a = [];
        var mergeB12018 = [];
        var mergeB2a2018 = [];
        for (let i = 0; i < childBrand[0].length; i++) {
            mergeB1.push(await dataFilterByBreak(pid, "B1", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeB2a.push(await dataFilterByBreak(pid, "B2a", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeB12018.push(await dataFilterByBreak("idd37352018", "B12018", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeB2a2018.push(await dataFilterByBreak("idd37352018", "B2a2018", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
        }
        var dataB1 = Object.keys(mergeB1).reduce(function(arr, key) {
            return arr.concat(mergeB1[key]);
        }, []);
        var dataB2a = Object.keys(mergeB2a).reduce(function(arr, key) {
            return arr.concat(mergeB2a[key]);
        }, []);
        var dataB12018 = Object.keys(mergeB12018).reduce(function(arr, key) {
            return arr.concat(mergeB12018[key]);
        }, []);
        var dataB2a2018 = Object.keys(mergeB2a2018).reduce(function(arr, key) {
            return arr.concat(mergeB2a2018[key]);
        }, []);
    }else{
        var dataB1 = await dataFilterByBreak(pid, "B1", "A7", break2, break3, code1, code2, code3);
        var dataB2a = await dataFilterByBreak(pid, "B2a", "A7", break2, break3, code1, code2, code3);
        var dataB12018 = await dataFilterByBreak("idd37352018", "B12018", "A7", break2, break3, code1, code2, code3);
        var dataB2a2018 = await dataFilterByBreak("idd37352018", "B2a2018", "A7", break2, break3, code1, code2, code3);
    }

    
    const getattribute = await getAttributeByQid(pid, "B1");
    var dataLength = dataB1.length
    var result = []
    for (let i = 0; i < getattribute.length; i++) {
        result.push({
            code: getattribute[i].code,
            indexLabel: getattribute[i].label,
            label: 0,
            y: 0,
            value: 0,
        })
    }

    for (let x = 0; x < dataB1.length; x++) {
        for (let y = 0; y < result.length; y++) {
            if(dataB1[x].label==result[y].indexLabel){
                result[y].value = result[y].value + 1
            }
        }
    }

    for (let x = 0; x < dataB2a.length; x++) {
        for (let y = 0; y < result.length; y++) {
            if(dataB2a[x].label==result[y].indexLabel){
                result[y].value = result[y].value + 1
            }
        }
    }

    for (let z = 0; z < result.length; z++) {
        var achievement = result[z].value;
        var percent = achievement * 100 / dataLength
        var decimal = percent.toFixed(2)
        result[z].y = percent
        result[z].label = decimal
    }


    // 2018
    var dataLength2018 = dataB12018.length
    var result2018 = []
    for (let i = 0; i < getattribute.length; i++) {
        result2018.push({
            code: getattribute[i].code,
            indexLabel: getattribute[i].label,
            label: 0,
            y: 0,
            value: 0,
        })
    }

    for (let x = 0; x < dataB12018.length; x++) {
        for (let y = 0; y < result2018.length; y++) {
            if(dataB12018[x].label==result2018[y].indexLabel){
                result2018[y].value = result2018[y].value + 1
            }
        }
    }

    for (let x = 0; x < dataB2a2018.length; x++) {
        for (let y = 0; y < result2018.length; y++) {
            if(dataB2a2018[x].label==result2018[y].indexLabel){
                result2018[y].value = result2018[y].value + 1
            }
        }
    }

    for (let z = 0; z < result2018.length; z++) {
        var achievement = result2018[z].value;
        var percent = achievement * 100 / dataLength2018
        var decimal = percent.toFixed(2)
        result2018[z].y = percent
        result2018[z].label = decimal
    }
    // 2018



    res.send([result, dataLength, result2018, dataLength2018])
}

// AIDA
exports.getAida = async function(req,res){
    const login = req.session.data;
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
    var ageGroup = await getAttributeByQid(pid, "S6_GRUP");
    var sesGroup = await getAttributeByQid(pid, "S16");
    res.render("aida/index", {
        login: login,
        brand: showBrand
    });
}

exports.getAidaContent = async function(req,res){
    var break2 = req.body.break2
    var break3 = req.body.break3
    var code1 = req.body.code1
    var code2 = req.body.code2
    var code3 = req.body.code3
    if(req.body.step == "B5"){
        var step = ["B1", "B2a", "B5"];
    }else{
        var step = ["C3", "C4a", "C5"];
    }
    var parentBrand = [1, 10, 20, 30, 40, 51, 60]
    var childBrand = [[1, 2, 3, 71, 4, 5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15, 16, 17], [20, 21, 22, 23, 24, 25], [30, 31, 31, 33, 34, 35, 36, 37], [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50], [51, 52, 53, 54, 55], [60, 61, 62, 63]]
    var checkParent = parentBrand.indexOf(parseInt(code1))
    const getattributeB1 = await getAttributeByQid(pid, step[0]);
    var netting = ["Attention", "Interest", "Desire", "Action", "Total"];
    var resultY = []
    for (let i = 0; i < netting.length; i++) {
        var resultYY = []
        for (let i = 0; i < getattributeB1.length; i++) {
            resultYY.push({
                code: getattributeB1[i].code,
                label: getattributeB1[i].label,
                value: 0,
                percent: 0
            })
        }
        resultY.push({
            label: netting[i],
            value: 0,
            y: 0,
            x: resultYY
        })
    }

    // B5 = B1+B2a
    if(checkParent!=-1){
        var mergeB1 = [];
        var mergeB2a = [];
        var mergeB5 = [];
        for (let i = 0; i < childBrand[0].length; i++) {
            mergeB1.push(await dataFilterByBreak(pid, step[0], "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeB2a.push(await dataFilterByBreak(pid, step[1], "A7", break2, break3, childBrand[checkParent][i], code2, code3))
            mergeB5.push(await dataFilterByBreak(pid, step[2], "A7", break2, break3, childBrand[checkParent][i], code2, code3))
        }
        var dataB1 = Object.keys(mergeB1).reduce(function(arr, key) {
            return arr.concat(mergeB1[key]);
        }, []);
        var dataB2a = Object.keys(mergeB2a).reduce(function(arr, key) {
            return arr.concat(mergeB2a[key]);
        }, []);
        var dataB5 = Object.keys(mergeB5).reduce(function(arr, key) {
            return arr.concat(mergeB5[key]);
        }, []);
    }else{
        var dataB1 = await dataFilterByBreak(pid, step[0], "A7", break2, break3, code1, code2, code3);
        var dataB2a = await dataFilterByBreak(pid, step[1], "A7", break2, break3, code1, code2, code3);
        var dataB5 = await dataFilterByBreak(pid, step[2], "A7", break2, break3, code1, code2, code3);
    }
    var dataLengthB1 = dataB1.length
    var dataB5Length = dataB5.length
    for (let x = 0; x < resultY.length; x++) {
        for (let y = 0; y < dataB5.length; y++) {
            for (let z = 0; z < resultY[x].x.length; z++) {
                if(dataB5[y].parentcode==resultY[x].x[z].code){
                    if(dataB5[y].code<=3){
                        resultY[0].x[z].value = resultY[0].x[z].value+1
                        resultY[0].x[z].percent = (resultY[0].x[z].value * 100 / dataB5Length).toFixed(2)
                    }else if(dataB5[y].code>3 && dataB5[y].code<=6){
                        resultY[1].x[z].value = resultY[1].x[z].value+1
                        resultY[1].x[z].percent = (resultY[1].x[z].value * 100 / dataB5Length).toFixed(2)
                    }else if(dataB5[y].code>6 && dataB5[y].code<=8){
                        resultY[2].x[z].value = resultY[2].x[z].value+1
                        resultY[2].x[z].percent = (resultY[2].x[z].value * 100 / dataB5Length).toFixed(2)
                    }else if(dataB5[y].code>8){
                        resultY[3].x[z].value = resultY[3].x[z].value+1
                        resultY[3].x[z].percent = (resultY[3].x[z].value * 100 / dataB5Length).toFixed(2)
                    }
                    resultY[x].x[z].value = resultY[x].x[z].value+1
                    resultY[x].x[z].percent = (resultY[x].x[z].value * 100 / dataLengthB1).toFixed(2)
                }
            }
        }
    }
    for (let i = 0; i < resultY.length; i++) {
        var achievementY = resultY[i].value;
        var percentY = achievementY * 100 / dataLengthB1
        resultY[i].y = percentY
    }
    var resultX = []
    for (let i = 0; i < getattributeB1.length; i++) {
        resultX.push({
            code: getattributeB1[i].code,
            label: getattributeB1[i].label,
            y: 0,
            value: 0,
        })
    }
    for (let x = 0; x < dataB1.length; x++) {
        for (let y = 0; y < resultX.length; y++) {
            if(dataB1[x].label==resultX[y].label){
                resultX[y].value = resultX[y].value + 1
            }
        }
    }
    for (let x = 0; x < dataB2a.length; x++) {
        for (let y = 0; y < resultX.length; y++) {
            if(dataB2a[x].label==resultX[y].label){
                resultX[y].value = resultX[y].value + 1
            }
        }
    }
    for (let z = 0; z < resultX.length; z++) {
        var achievementX = resultX[z].value;
        var percentX = achievementX * 100 / dataLengthB1
        resultX[z].y = percentX
    }
    


    // C5 = C3 + C4a
    // if(checkParent!=-1){
    //     var mergeC3 = [];
    //     var mergeC4a = [];
    //     var mergeC5 = [];
    //     for (let i = 0; i < childBrand[0].length; i++) {
    //         mergeC3.push(await dataFilterByBreak(pid, "C3", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
    //         mergeC4a.push(await dataFilterByBreak(pid, "C4a", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
    //         mergeC5.push(await dataFilterByBreak(pid, "C5", "A7", break2, break3, childBrand[checkParent][i], code2, code3))
    //     }
    //     var dataC3 = Object.keys(mergeC3).reduce(function(arr, key) {
    //         return arr.concat(mergeC3[key]);
    //     }, []);
    //     var dataC4a = Object.keys(mergeC4a).reduce(function(arr, key) {
    //         return arr.concat(mergeC4a[key]);
    //     }, []);
    //     var dataC5 = Object.keys(mergeC5).reduce(function(arr, key) {
    //         return arr.concat(mergeC5[key]);
    //     }, []);
    // }else{
    //     var dataC3 = await dataFilterByBreak(pid, "C3", "A7", break2, break3, code1, code2, code3);
    //     var dataC4a = await dataFilterByBreak(pid, "C4a", "A7", break2, break3, code1, code2, code3);
    //     var dataC5 = await dataFilterByBreak(pid, "C5", "A7", break2, break3, code1, code2, code3);
    // }
    // var dataLengthC3 = dataC3.length
    // var dataC5Length = dataC5.length
    // for (let x = 0; x < resultY.length; x++) {
    //     for (let y = 0; y < dataC5.length; y++) {
    //         for (let z = 0; z < resultY[x].x.length; z++) {
    //             if(dataC5[y].parentcode==resultY[x].x[z].code){
    //                 if(dataC5[y].code<=3){
    //                     resultY[0].x[z].value = resultY[0].x[z].value+1
    //                     resultY[0].x[z].percent = (resultY[0].x[z].value * 100 / dataC5Length).toFixed(2)
    //                 }else if(dataC5[y].code>3 && dataC5[y].code<=6){
    //                     resultY[1].x[z].value = resultY[1].x[z].value+1
    //                     resultY[1].x[z].percent = (resultY[1].x[z].value * 100 / dataC5Length).toFixed(2)
    //                 }else if(dataC5[y].code>6 && dataC5[y].code<=8){
    //                     resultY[2].x[z].value = resultY[2].x[z].value+1
    //                     resultY[2].x[z].percent = (resultY[2].x[z].value * 100 / dataC5Length).toFixed(2)
    //                 }else if(dataC5[y].code>8){
    //                     resultY[3].x[z].value = resultY[3].x[z].value+1
    //                     resultY[3].x[z].percent = (resultY[3].x[z].value * 100 / dataC5Length).toFixed(2)
    //                 }
    //                 resultY[x].x[z].value = resultY[x].x[z].value+1
    //                 resultY[x].x[z].percent = (resultY[x].x[z].value * 100 / dataLengthC3).toFixed(2)
    //             }
    //         }
    //     }
    // }
    // for (let i = 0; i < resultY.length; i++) {
    //     var achievementY = resultY[i].value;
    //     var percentY = achievementY * 100 / dataLengthC3
    //     resultY[i].y = percentY
    // }
    // for (let x = 0; x < dataC3.length; x++) {
    //     for (let y = 0; y < resultX.length; y++) {
    //         if(dataC3[x].label==resultX[y].label){
    //             resultX[y].value = resultX[y].value + 1
    //         }
    //     }
    // }
    // for (let x = 0; x < dataC4a.length; x++) {
    //     for (let y = 0; y < resultX.length; y++) {
    //         if(dataC4a[x].label==resultX[y].label){
    //             resultX[y].value = resultX[y].value + 1
    //         }
    //     }
    // }
    // for (let z = 0; z < resultX.length; z++) {
    //     var achievementX = resultX[z].value;
    //     var percentX = achievementX * 100 / dataLengthC3
    //     resultX[z].y = percentX
    // }

    // resultY = data table
    // resultX = data canvas

    res.send([resultY,resultX,dataLengthB1]);
}