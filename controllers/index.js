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

const nettingB1 = [
  { code: 1, label: "DEALER" },
  { code: 2, label: "WOM" },
  { code: 3, label: "EVENT" },
  { code: 4, label: "GOOGLE SEARCH" },
  { code: 5, label: "SOCMED/VIDEO STREAMING" },
  { code: 6, label: "TV & RADIO" },
  { code: 7, label: "WEBSITE/NEWSLETTER" },
  { code: 8, label: "INCIDENCE" },
  { code: 9, label: "OOH" },
  { code: 10, label: "MAGAZINE & NEWSPAPER" },
  { code: 11, label: "ONLINE NEWS" },
  { code: 12, label: "ONLINE SALES" },
  { code: 13, label: "ONLINE ADS" },
];

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
  const nettingLogic = (netting, i) => {
    if (netting == "all") {
      return dataStep1[i].code > 0;
    } else if (netting == "Online") {
      return dataStep1[i].code > 18;
    } else {
      return dataStep1[i].code <= 18;
    }
  };

  var datamatch = function () {
    var target = {};
    var parentBrand = [1, 10, 20, 30, 40, 51, 60];
    var childBrand = [
      [1, 2, 3, 71, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16, 17],
      [20, 21, 22, 23, 24, 25],
      [30, 31, 31, 33, 34, 35, 36, 37],
      [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
      [51, 52, 53, 54, 55],
      [60, 61, 62, 63],
    ];
    if (req.body.code1 != "all") {
      var checkParent = parentBrand.indexOf(parseInt(req.body.code1));
      if (checkParent == -1) {
        Object.assign(target, { A7: parseInt(req.body.code1) });
      } else {
        Object.assign(target, { A7: { $in: childBrand[checkParent] } });
      }
    }
    var netting = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 27, 28],
      [19, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 35],
    ];
    if (req.body.netting != "all") {
      Object.assign(target, {
        B1: { $in: netting[parseInt(req.body.netting) - 1] },
      });
    }
    if (req.body.code2 != "all") {
      Object.assign(target, { [req.body.break2]: parseInt(req.body.code2) });
    }
    if (req.body.code3 != "all") {
      Object.assign(target, { [req.body.break3]: parseInt(req.body.code3) });
    }
    return target;
  };
  // filter object
  var dataSizeFilter = await findMatchByObject(datamatch());
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
  const attrD1a = await getAttributeByQid(pid, "D1a"); // panggil attribut B1
  var data = [];
  // filter object
  const nettingLogic = (netting, i) => {
    if (netting == "all") {
      return dataStep1[i].code > 0;
    } else if (netting == "Online") {
      return dataStep1[i].code > 18;
    } else {
      return dataStep1[i].code <= 18;
    }
  };

  var datamatch = function () {
    var target = {};
    var parentBrand = [1, 10, 20, 30, 40, 51, 60];
    var childBrand = [
      [1, 2, 3, 71, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16, 17],
      [20, 21, 22, 23, 24, 25],
      [30, 31, 31, 33, 34, 35, 36, 37],
      [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
      [51, 52, 53, 54, 55],
      [60, 61, 62, 63],
    ];
    if (req.body.code1 != "all") {
      var checkParent = parentBrand.indexOf(parseInt(req.body.code1));
      if (checkParent == -1) {
        Object.assign(target, { A7: parseInt(req.body.code1) });
      } else {
        Object.assign(target, { A7: { $in: childBrand[checkParent] } });
      }
    }
    var netting = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 27, 28],
      [19, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 35],
    ];
    if (req.body.netting != "all") {
      Object.assign(target, {
        B1: { $in: netting[parseInt(req.body.netting) - 1] },
      });
    }
    if (req.body.code2 != "all") {
      Object.assign(target, { [req.body.break2]: parseInt(req.body.code2) });
    }
    if (req.body.code3 != "all") {
      Object.assign(target, { [req.body.break3]: parseInt(req.body.code3) });
    }
    return target;
  };
  // filter object
  var dataSizeFilter = await findMatchByObject(datamatch());
  var findCode = async function (code) {
    return await findObj(attrB1, "code", `${code}`);
  };
  var findCodeD1a = async function (code) {
    return await findObj(attrD1a, "code", code);
  };

  var a = datamatch();
  Object.assign(a);
  var result_a = await findMatchByObject(a); //base data
  // rumus apalah ini gue juga ga paham kenapa bisa jalan
  for (let i = 0; i < result_a.length; i++) {
    var findArr = await findObj(data, "code", result_a[i].D1A);
    var step2 = [];
    var step3 = [];
    // var nettingIndexB1 = await findObj(
    //   nettingB1,
    //   "label",
    //   attrB1[await findCode(result_a[i].B1)].netting
    // );
    // var getCodeB1 = nettingB1[nettingIndexB1].code;
    // step3.push({
    //   code: getCodeB1,
    //   label: attrB1[await findCode(result_a[i].B1)].netting,
    //   value: 1,
    //   percent: 0,
    // });
    var nettingIndexC3 = await findObj(
      nettingB1,
      "label",
      attrB1[await findCode(result_a[i].C3)].netting
    );
    var getCodeC3 = nettingB1[nettingIndexC3].code;
    step2.push({
      code: getCodeC3,
      label: attrB1[await findCode(result_a[i].C3)].netting,
      value: 1,
      percent: 0,
      step3: step3,
    });
    for (let x = 0; x < result_a[i].C4a.length; x++) {
      if ((await findCode(result_a[i].C4a[x])) != -1) {
        var nettingIndexC4a = await findObj(
          nettingB1,
          "label",
          attrB1[await findCode(result_a[i].C4a[x])].netting
        );
        var getCodeC4a = nettingB1[nettingIndexC4a].code;
        step2.push({
          code: getCodeC4a,
          label: attrB1[await findCode(result_a[i].C4a[x])].netting,
          value: 1,
          percent: 0,
          step3: step3,
        });
      }
    }
    if (findArr == -1) {
      data.push({
        code: result_a[i].D1A,
        label: attrD1a[await findCodeD1a(result_a[i].D1A)].label,
        value: 1,
        percent: 0,
        step2: step2,
      });
    } else {
      data[findArr].value = data[findArr].value + 1;

      var nettingIndexC3 = await findObj(
        nettingB1,
        "label",
        attrB1[await findCode(result_a[i].C3)].netting
      );
      var getCodeStep3 = nettingB1[nettingIndexC3].code;
      var findArrC3 = await findObj(data[findArr].step2, "code", getCodeStep3);
      var step3 = [];
      if (findArrC3 == -1) {
        var nettingIndexB1 = await findObj(
          nettingB1,
          "label",
          attrB1[await findCode(result_a[i].B1)].netting
        );
        var getCodeB1 = nettingB1[nettingIndexB1].code;
        step3.push({
          code: getCodeB1,
          label: attrB1[await findCode(result_a[i].B1)].netting,
          value: 1,
          percent: 0,
        });
        step2.push({
          code: getCodeStep3,
          label: attrB1[await findCode(result_a[i].C3)].netting,
          value: 1,
          percent: 0,
          step3: step3,
        });
      } else {
        data[findArr].step2[findArrC3].value =
          data[findArr].step2[findArrC3].value + 1;
      }

      for (let xx = 0; xx < result_a[i].C4a.length; xx++) {
        if ((await findCode(result_a[i].C4a[xx])) != -1) {
          var nettingIndex = await findObj(
            nettingB1,
            "label",
            attrB1[await findCode(result_a[i].C4a[xx])].netting
          );
          var getCode = nettingB1[nettingIndex].code;
          var findArr2 = await findObj(data[findArr].step2, "code", getCode);
          if (findArr2 == -1) {
            data[findArr].step2.push({
              code: getCode,
              label: attrB1[await findCode(result_a[i].C4a[xx])].netting,
              value: 1,
              percent: 0,
              step3: step3,
            });
          } else {
            data[findArr].step2[findArr2].value =
              data[findArr].step2[findArr2].value + 1;
          }
        }
      }
    }
  }

  for (let i = 0; i < result_a.length; i++) {
    // cari netting B1
    var nettingIndexB1 = await findObj(
      nettingB1,
      "label",
      attrB1[await findCode(result_a[i].B1)].netting
    );
    // cari netting B1

    //cari netting C3
    var nettingIndexC3 = await findObj(
      nettingB1,
      "label",
      attrB1[await findCode(result_a[i].C3)].netting
    );
    //cari netting C3
    var getCodeC3 = nettingB1[nettingIndexC3].code; // ambil kode C3 dari netting
    var a = await findObj(data[0].step2, "code", getCodeC3); // dari netting

    var getCodeB1 = nettingB1[nettingIndexB1].code;
    var findArrB1 = await findObj(data[0].step2[a].step3, "code", getCodeB1);
    if (findArrB1 == -1) {
      data[0].step2[a].step3.push({
        code: getCodeB1,
        label: attrB1[await findCode(result_a[i].B1)].netting,
        value: 1,
        percent: 0,
      });
    } else {
      data[0].step2[a].step3[findArrB1].value =
        data[0].step2[a].step3[findArrB1].value + 1;
    }

    for (let y = 0; y < result_a[i].B2a.length; y++) {
      // cari netting B2a
      if ((await findCode(result_a[i].B2a[y])) != -1) {
        var nettingIndexB2a = await findObj(
          nettingB1,
          "label",
          attrB1[await findCode(result_a[i].B2a[y])].netting
        );
        // cari netting B2a
        var getCodeB2a = nettingB1[nettingIndexB2a].code;
        var findArrB2a = await findObj(
          data[0].step2[a].step3,
          "code",
          getCodeB2a
        );
        if (findArrB2a == -1) {
          data[0].step2[a].step3.push({
            code: getCodeB2a,
            label: attrB1[await findCode(result_a[i].B2a[y])].netting,
            value: 1,
            percent: 0,
          });
        } else {
          data[0].step2[a].step3[findArrB2a].value =
            data[0].step2[a].step3[findArrB2a].value + 1;
        }
      }
    }

    for (let x = 0; x < result_a[i].C4a.length; x++) {
      if ((await findCode(result_a[i].C4a[x])) != -1) {
        //cari netting C4a
        var nettingIndexC4a = await findObj(
          nettingB1,
          "label",
          attrB1[await findCode(result_a[i].C4a[x])].netting
        );
        var getCodeC4a = nettingB1[nettingIndexC4a].code; // ambil kode C3 dari netting
        var b = await findObj(data[0].step2, "code", getCodeC4a); // dari netting
        var findArrB1_2 = await findObj(
          data[0].step2[b].step3,
          "code",
          getCodeB1
        );
        //cari netting C3
        if (findArrB1_2 == -1) {
          data[0].step2[b].step3.push({
            code: getCodeB1,
            label: attrB1[await findCode(result_a[i].B1)].netting,
            value: 1,
            percent: 0,
          });
        } else {
          data[0].step2[b].step3[findArrB1_2].value =
            data[0].step2[b].step3[findArrB1_2].value + 1;
        }

        for (let z = 0; z < result_a[i].B2a.length; z++) {
          // cari netting B2a
          if ((await findCode(result_a[i].B2a[z])) != -1) {
            // cari netting B2a
            var findArrB2a_2 = await findObj(
              data[0].step2[b].step3,
              "code",
              getCodeB2a
            );
            if (findArrB2a_2 == -1) {
              data[0].step2[b].step3.push({
                code: getCodeB2a,
                label: attrB1[await findCode(result_a[i].B2a[z])].netting,
                value: 1,
                percent: 0,
              });
            } else {
              data[0].step2[b].step3[findArrB2a_2].value =
                data[0].step2[b].step3[findArrB2a_2].value + 1;
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
    for (let x = 0; x < data[i].step2.length; x++) {
      data[i].step2[x].percent = (
        (data[i].step2[x].value / data[i].value) *
        data[i].percent
      ).toFixed(2);
      for (let y = 0; y < data[i].step2[x].step3.length; y++) {
        data[i].step2[x].step3[y].percent = (
          (data[i].step2[x].step3[y].value / data[i].step2[x].value) *
          data[i].step2[x].percent
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
  // rumus apalah ini gue juga ga paham kenapa bisa jalan

  res.render("reverse/content", {
    step1: data,
  });
  // res.send(data);
};
