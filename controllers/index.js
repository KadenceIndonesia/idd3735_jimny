const express = require("express");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname, "../public/data");
const xslx = require("xlsx");
const db = require("../models/db");
const { resolve } = require("path");
const { count } = require("console");
const session = require("express-session");
const pid = process.env.PID;
require("../library/index");

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
exports.getIndex = async function (req, res) {
  if (req.session.loggedin == true) {
    var brand = await getAttributeByQid(pid, "A1");
    var arrbrand = [
      1, 10, 20, 30, 40, 51, 60, 34, 3, 71, 42, 52, 8, 17, 32, 21, 41, 43, 2, 5,
      12, 36, 45, 6, 11, 16, 31, 33, 44, 7, 13, 14, 35, 37,
    ];
    var showBrand = [];
    for (let i = 0; i < brand.length; i++) {
      if (arrbrand.indexOf(brand[i].code) != -1) {
        showBrand.push({
          code: brand[i].code,
          label: brand[i].label,
        });
      }
    }
    const login = req.session.data;
    res.render("decision/index", {
      login: login,
      moment: moment,
      brand: showBrand,
    });
  } else {
    res.redirect("./login");
  }
};
exports.getDecisionContent = async function (req, res) {
  const attrB1 = await getAttributeByQid(pid, "B1"); // panggil attribut B1
  var data = [];

  // filter object
  var datamatch = function () {
    var target = {};
    if (req.body.code1 != "all") {
      Object.assign(target, { A7: parseInt(req.body.code1) });
    }
    if (req.body.code2 != "all") {
      Object.assign(target, { [req.body.break2]: parseInt(req.body.code2) });
    }
    if (req.body.code3 != "all") {
      Object.assign(target, { [req.body.break3]: parseInt(req.body.code3) });
    }
    return target;
  };
  var dataSizeFilter = await findMatchByObject(datamatch());
  // filter object
  var findCode = async function (code) {
    return await findObj(attrB1, "code", `${code}`);
  };

  var a = datamatch();
  Object.assign(a);
  var result_a = await findMatchByObject(a); //base data

  // rumus apalah ini gue juga ga paham kenapa bisa jalan
  for (let i = 0; i < result_a.length; i++) {
    var findArr = await findObj(data, "code", result_a[i].B1);
    var step2 = [];
    for (let x = 0; x < result_a[i].B2a.length; x++) {
      if ((await findCode(result_a[i].B2a[x])) != -1) {
        var step4 = [];
        for (let z = 0; z < result_a[i].C4a.length; z++) {
          if ((await findCode(result_a[i].C4a[z])) != -1) {
            step4.push({
              code: result_a[i].C4a[z],
              label: attrB1[await findCode(result_a[i].C4a[z])].label,
              value: 1,
              percent: 0,
            });
          }
        }
        step2.push({
          code: result_a[i].B2a[x],
          label: attrB1[await findCode(result_a[i].B2a[x])].label,
          value: 1,
          percent: 0,
          step3: [
            {
              code: result_a[i].C3,
              label: attrB1[await findCode(result_a[i].C3)].label,
              value: 1,
              percent: 0,
              step4: step4,
            },
          ],
        });
      }
    }
    if (findArr == -1) {
      data.push({
        code: result_a[i].B1,
        label: attrB1[await findCode(result_a[i].B1)].label,
        value: 1,
        percent: 0,
        step2: step2,
      });
    } else {
      data[findArr].value = data[findArr].value + 1;
      for (let xx = 0; xx < result_a[i].B2a.length; xx++) {
        if ((await findCode(result_a[i].B2a[xx])) != -1) {
          var findArr2 = await findObj(
            data[findArr].step2,
            "code",
            result_a[i].B2a[xx]
          );
          if (findArr2 == -1) {
            var step4 = [];
            for (let zz = 0; zz < result_a[i].C4a.length; zz++) {
              if ((await findCode(result_a[i].C4a[zz])) != -1) {
                step4.push({
                  code: result_a[i].C4a[zz],
                  label: attrB1[await findCode(result_a[i].C4a[zz])].label,
                  value: 1,
                  percent: 0,
                });
              }
            }
            data[findArr].step2.push({
              code: result_a[i].B2a[xx],
              label: attrB1[await findCode(result_a[i].B2a[xx])].label,
              value: 1,
              percent: 0,
              step3: [
                {
                  code: result_a[i].C3,
                  label: attrB1[await findCode(result_a[i].C3)].label,
                  value: 1,
                  percent: 0,
                  step4: step4,
                },
              ],
            });
          } else {
            data[findArr].step2[findArr2].value =
              data[findArr].step2[findArr2].value + 1;
            var findArr3 = await findObj(
              data[findArr].step2[findArr2].step3,
              "code",
              result_a[i].C3
            );
            if (findArr3 == -1) {
              var step4 = [];
              for (let zzz = 0; zzz < result_a[i].C4a.length; zzz++) {
                if ((await findCode(result_a[i].C4a[zzz])) != -1) {
                  step4.push({
                    code: result_a[i].C4a[zzz],
                    label: attrB1[await findCode(result_a[i].C4a[zzz])].label,
                    value: 1,
                    percent: 0,
                  });
                }
              }
              data[findArr].step2[findArr2].step3.push({
                code: result_a[i].C3,
                label: attrB1[await findCode(result_a[i].C3)].label,
                value: 1,
                percent: 0,
                step4: step4,
              });
            } else {
              data[findArr].step2[findArr2].step3[findArr3].value =
                data[findArr].step2[findArr2].step3[findArr3].value + 1;
              var step4 = [];
              for (let zzzz = 0; zzzz < result_a[i].C4a.length; zzzz++) {
                if ((await findCode(result_a[i].C4a[zzzz])) != -1) {
                  var findArr4 = await findObj(
                    data[findArr].step2[findArr2].step3[findArr3],
                    "code",
                    result_a[i].C4a[zzzz]
                  );
                  if (findArr4 == -1) {
                    data[findArr].step2[findArr2].step3[findArr3].step4.push({
                      code: result_a[i].C4a[zzzz],
                      label:
                        attrB1[await findCode(result_a[i].C4a[zzzz])].label,
                      value: 1,
                      percent: 0,
                    });
                  } else {
                    data[findArr].step2[findArr2].step3[findArr3].step4[
                      findArr4
                    ] =
                      data[findArr].step2[findArr2].step3[findArr3].step4[
                        findArr4
                      ] + 1;
                  }
                }
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i].percent = ((data[i].value / dataSizeFilter.length) * 100).toFixed(
        2
      );
      var lengthstep2 = data[i].step2.reduce(function (prev, cur) {
        return prev + cur.value;
      }, 0);
      for (let x = 0; x < data[i].step2.length; x++) {
        data[i].step2[x].percent = (
          (data[i].step2[x].value / lengthstep2) *
          100
        ).toFixed(2);
        var lengthstep3 = data[i].step2[x].step3.reduce(function (prev, cur) {
          return prev + cur.value;
        }, 0);
        for (let y = 0; y < data[i].step2[x].step3.length; y++) {
          data[i].step2[x].step3[y].percent = (
            (data[i].step2[x].step3[y].value / lengthstep3) *
            100
          ).toFixed(2);
          if (data[i].step2[x].step3[y].step4 != undefined) {
            var lengthstep4 = data[i].step2[x].step3[y].step4.reduce(function (
              prev,
              cur
            ) {
              return prev + cur.value;
            },
            0);
            for (let z = 0; z < data[i].step2[x].step3[y].step4.length; z++) {
              data[i].step2[x].step3[y].step4[z].percent = (
                (data[i].step2[x].step3[y].step4[z].value / lengthstep4) *
                100
              ).toFixed(2);
            }
          }
        }
      }
    }
  }
  // rumus apalah ini gue juga ga paham kenapa bisa jalan

  res.render("decision/content", {
    step1: data,
  });
};

exports.getDetail = async function (req, res) {
  var id = req.params.id;
  res.render("detailchart", {
    id: id,
  });
};

exports.filterGroup = async function (req, res) {
  var break2 = req.body.break2;
  if (break2 != "all") {
    var break2Group = await getAttributeByQid(pid, break2);
  }
  var break3 = req.body.break3;
  if (break3 != "all") {
    var break3Group = await getAttributeByQid(pid, break3);
  }
  res.send([break2Group, break3Group]);
};

exports.getDecisionReverse = async function (req, res) {
  if (req.session.loggedin == true) {
    var brand = await getAttributeByQid(pid, "A1");
    var arrbrand = [
      1, 10, 20, 30, 40, 51, 60, 34, 3, 71, 42, 52, 8, 17, 32, 21, 41, 43, 2, 5,
      12, 36, 45, 6, 11, 16, 31, 33, 44, 7, 13, 14, 35, 37,
    ];
    var showBrand = [];
    for (let i = 0; i < brand.length; i++) {
      if (arrbrand.indexOf(brand[i].code) != -1) {
        showBrand.push({
          code: brand[i].code,
          label: brand[i].label,
        });
      }
    }
    const login = req.session.data;
    res.render("reverse/index", {
      login: login,
      moment: moment,
      brand: showBrand,
    });
  } else {
    res.redirect("../login");
  }
};

exports.getDecisionReverseContent = async function (req, res) {
  const attrB1 = await getAttributeByQid(pid, "B1"); // panggil attribut B1
  var data = [];

  // filter object
  var datamatch = function () {
    var target = {};
    if (req.body.code1 != "all") {
      Object.assign(target, { A7: parseInt(req.body.code1) });
    }
    if (req.body.code2 != "all") {
      Object.assign(target, { [req.body.break2]: parseInt(req.body.code2) });
    }
    if (req.body.code3 != "all") {
      Object.assign(target, { [req.body.break3]: parseInt(req.body.code3) });
    }
    return target;
  };
  var dataSizeFilter = await findMatchByObject(datamatch());
  // filter object
  var findCode = async function (code) {
    return await findObj(attrB1, "code", `${code}`);
  };

  var a = datamatch();
  Object.assign(a);
  var result_a = await findMatchByObject(a); //base data

  // rumus apalah ini gue juga ga paham kenapa bisa jalan
  for (let i = 0; i < result_a.length; i++) {
    var findArr = await findObj(data, "code", result_a[i].B1);
    var step2 = [];
    for (let x = 0; x < result_a[i].B2a.length; x++) {
      if ((await findCode(result_a[i].B2a[x])) != -1) {
        var step4 = [];
        for (let z = 0; z < result_a[i].C4a.length; z++) {
          if ((await findCode(result_a[i].C4a[z])) != -1) {
            step4.push({
              code: result_a[i].C4a[z],
              label: attrB1[await findCode(result_a[i].C4a[z])].label,
              value: 1,
              percent: 0,
            });
          }
        }
        step2.push({
          code: result_a[i].B2a[x],
          label: attrB1[await findCode(result_a[i].B2a[x])].label,
          value: 1,
          percent: 0,
          step3: [
            {
              code: result_a[i].C3,
              label: attrB1[await findCode(result_a[i].C3)].label,
              value: 1,
              percent: 0,
              step4: step4,
            },
          ],
        });
      }
    }
    if (findArr == -1) {
      data.push({
        code: result_a[i].B1,
        label: attrB1[await findCode(result_a[i].B1)].label,
        value: 1,
        percent: 0,
        step2: step2,
      });
    } else {
      data[findArr].value = data[findArr].value + 1;
      for (let xx = 0; xx < result_a[i].B2a.length; xx++) {
        if ((await findCode(result_a[i].B2a[xx])) != -1) {
          var findArr2 = await findObj(
            data[findArr].step2,
            "code",
            result_a[i].B2a[xx]
          );
          if (findArr2 == -1) {
            var step4 = [];
            for (let zz = 0; zz < result_a[i].C4a.length; zz++) {
              if ((await findCode(result_a[i].C4a[zz])) != -1) {
                step4.push({
                  code: result_a[i].C4a[zz],
                  label: attrB1[await findCode(result_a[i].C4a[zz])].label,
                  value: 1,
                  percent: 0,
                });
              }
            }
            data[findArr].step2.push({
              code: result_a[i].B2a[xx],
              label: attrB1[await findCode(result_a[i].B2a[xx])].label,
              value: 1,
              percent: 0,
              step3: [
                {
                  code: result_a[i].C3,
                  label: attrB1[await findCode(result_a[i].C3)].label,
                  value: 1,
                  percent: 0,
                  step4: step4,
                },
              ],
            });
          } else {
            data[findArr].step2[findArr2].value =
              data[findArr].step2[findArr2].value + 1;
            var findArr3 = await findObj(
              data[findArr].step2[findArr2].step3,
              "code",
              result_a[i].C3
            );
            if (findArr3 == -1) {
              var step4 = [];
              for (let zzz = 0; zzz < result_a[i].C4a.length; zzz++) {
                if ((await findCode(result_a[i].C4a[zzz])) != -1) {
                  step4.push({
                    code: result_a[i].C4a[zzz],
                    label: attrB1[await findCode(result_a[i].C4a[zzz])].label,
                    value: 1,
                    percent: 0,
                  });
                }
              }
              data[findArr].step2[findArr2].step3.push({
                code: result_a[i].C3,
                label: attrB1[await findCode(result_a[i].C3)].label,
                value: 1,
                percent: 0,
                step4: step4,
              });
            } else {
              data[findArr].step2[findArr2].step3[findArr3].value =
                data[findArr].step2[findArr2].step3[findArr3].value + 1;
              var step4 = [];
              for (let zzzz = 0; zzzz < result_a[i].C4a.length; zzzz++) {
                if ((await findCode(result_a[i].C4a[zzzz])) != -1) {
                  var findArr4 = await findObj(
                    data[findArr].step2[findArr2].step3[findArr3],
                    "code",
                    result_a[i].C4a[zzzz]
                  );
                  if (findArr4 == -1) {
                    data[findArr].step2[findArr2].step3[findArr3].step4.push({
                      code: result_a[i].C4a[zzzz],
                      label:
                        attrB1[await findCode(result_a[i].C4a[zzzz])].label,
                      value: 1,
                      percent: 0,
                    });
                  } else {
                    data[findArr].step2[findArr2].step3[findArr3].step4[
                      findArr4
                    ] =
                      data[findArr].step2[findArr2].step3[findArr3].step4[
                        findArr4
                      ] + 1;
                  }
                }
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i].percent = ((data[i].value / dataSizeFilter.length) * 100).toFixed(
        2
      );
      var lengthstep2 = data[i].step2.reduce(function (prev, cur) {
        return prev + cur.value;
      }, 0);
      for (let x = 0; x < data[i].step2.length; x++) {
        data[i].step2[x].percent = (
          (data[i].step2[x].value / lengthstep2) *
          100
        ).toFixed(2);
        var lengthstep3 = data[i].step2[x].step3.reduce(function (prev, cur) {
          return prev + cur.value;
        }, 0);
        for (let y = 0; y < data[i].step2[x].step3.length; y++) {
          data[i].step2[x].step3[y].percent = (
            (data[i].step2[x].step3[y].value / lengthstep3) *
            100
          ).toFixed(2);
          if (data[i].step2[x].step3[y].step4 != undefined) {
            var lengthstep4 = data[i].step2[x].step3[y].step4.reduce(function (
              prev,
              cur
            ) {
              return prev + cur.value;
            },
            0);
            for (let z = 0; z < data[i].step2[x].step3[y].step4.length; z++) {
              data[i].step2[x].step3[y].step4[z].percent = (
                (data[i].step2[x].step3[y].step4[z].value / lengthstep4) *
                100
              ).toFixed(2);
            }
          }
        }
      }
    }
  }
  // rumus apalah ini gue juga ga paham kenapa bisa jalan

  res.render("decision/content", {
    step1: data,
  });
};
