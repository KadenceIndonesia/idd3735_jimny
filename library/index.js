const axios = require("axios")
global.getAuth = function(pid, email, pass){
    return new Promise(resolve => {
        axios.post(process.env.APIURL+'/auth/login',{
            pid: pid,
            email: email,
            password: pass
        })
        .then((response) => {
            resolve(response.data)
        })
        .catch((error) => {
            resolve(error)
        })
    })
}

global.getData = function(pid, qidx){
    return new Promise(resolve => {
        axios.get(process.env.APIURL+"/api/"+pid+"/data/"+qidx)
        .then((response) => {
            resolve(response.data)
        })
        .catch(error => {
            resolve(error)
        })
    })
}
global.getDataByBreak = function(pid, qidx, topbreak, code){
    return new Promise(resolve => {
        axios.get(process.env.APIURL+"/api/"+pid+"/data/"+qidx+"/break/"+topbreak+"/"+code)
        .then((response) => {
            resolve(response.data)
        })
        .catch(error => {
            resolve(error)
        })
    })
}
global.getAttributeByQid = function(pid, qidx){
    return new Promise(resolve => {
        axios.get(process.env.APIURL+"/api/"+pid+"/data/"+qidx+"/attribute")
        .then((response) => {
            resolve(response.data)
        })
        .catch(error => {
            resolve(error)
        })
    })
}