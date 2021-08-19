const pid = process.env.PID
const axios = require("axios")
require("../library/index")

exports.getSourceOfInformation = async function(req,res){
    if(req.session.loggedin==true){
        var brand = await getAttributeByQid(pid, "A1");
        const login = req.session.data;
        
        res.render("soi/index", {
            login: login,
            brand: brand
        })
    }else{
        res.redirect("../../login")
    }
}


exports.getSourceOfInformationContent = async function(req,res){
    if(req.query.brand=="all"){
        var dataB1 = await getData(pid, "B1");
        var dataB2a = await getData(pid, "B2a");
    }else{
        var dataB1 = await getDataByBreak(pid, "B1", "A7", req.query.brand);
        var dataB2a = await getDataByBreak(pid, "B2a", "A7", req.query.brand);
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
    var dataB12018 = await getData("idd37352018", "B12018");
    var dataB2a2018 = await getData("idd37352018", "B2a2018");
    var dataLength2018 = 1500
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



    res.send([result, dataLength, result2018])
}

// AIDA
exports.getAida = async function(req,res){
    const login = req.session.data;
    var brand = await getAttributeByQid(pid, "A1");
    res.render("aida/index", {
        login: login,
        brand: brand
    });
}

exports.getAidaContent = async function(req,res){
    if(req.query.brand=="all"){
        var dataB1 = await getData(pid, "B1");
        var dataB2a = await getData(pid, "B2a");
        var dataB5 = await getData(pid, "B5");
    }else{
        var dataB1 = await getDataByBreak(pid, "B1", "A7", req.query.brand);
        var dataB2a = await getDataByBreak(pid, "B2a", "A7", req.query.brand);
        var dataB5 = await getDataByBreak(pid, "B5", "A7", req.query.brand);
    }

    const getattributeB1 = await getAttributeByQid(pid, "B1");
    var dataLength = dataB1.length
    var dataB5Length = dataB5.length
    const dataC5 = await getData(pid, "C5");
    const getattribute = await getAttributeByQid(pid, "B5");
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
                    resultY[x].x[z].percent = (resultY[x].x[z].value * 100 / dataLength).toFixed(2)
                }
            }
        }
    }

    for (let i = 0; i < resultY.length; i++) {
        var achievementY = resultY[i].value;
        var percentY = achievementY * 100 / dataLength
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
        var percentX = achievementX * 100 / dataLength
        resultX[z].y = percentX
    }

    res.send([resultY,resultX,dataLength]);
}