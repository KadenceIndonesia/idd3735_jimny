const axios = require("axios");
const decisions = require("../models/decisions");
global.getAuth = function (pid, email, pass) {
  return new Promise((resolve) => {
    axios
      .post(process.env.APIURL + "/auth/login", {
        pid: pid,
        email: email,
        password: pass,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

global.getData = function (pid, qidx) {
  return new Promise((resolve) => {
    axios
      .get(process.env.APIURL + "/api/" + pid + "/data/" + qidx)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
};
global.getDataByBreak = function (pid, qidx, topbreak, code) {
  return new Promise((resolve) => {
    axios
      .post(
        process.env.APIURL +
          "/api/" +
          pid +
          "/data/" +
          qidx +
          "/break/" +
          topbreak +
          "/" +
          code
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

global.dataFilterByBreak = function (
  pid,
  qidx,
  break1,
  break2,
  break3,
  code1,
  code2,
  code3
) {
  return new Promise((resolve) => {
    axios
      .post(process.env.APIURL + "/api/" + pid + "/data/" + qidx + "/break/", {
        break1: break1,
        code1: code1,
        break2: break2,
        code2: code2,
        break3: break3,
        code3: code3,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

global.getAttributeByQid = function (pid, qidx) {
  return new Promise((resolve) => {
    axios
      .get(process.env.APIURL + "/api/" + pid + "/data/" + qidx + "/attribute")
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

global.findMatchByObject = function (obj) {
  return new Promise((resolve) => {
    decisions.aggregate([
        {
            $match: obj
        }
    ])
      .exec()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};


global.findObj = function (array, attr, value) {
  return new Promise((resolve) => {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i][attr] === value) {
        resolve(i);
      }
    }
    resolve(-1);
  });
};
