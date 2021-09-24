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
  const attrD1a = await getAttributeByQid(pid, "D1a"); // panggil attribut D1A
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
    // var netting = [
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 27, 28],
    //   [19, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 35],
    // ];
    // if (req.body.netting != "all") {
    //   Object.assign(target, {
    //     B1: { $in: netting[parseInt(req.body.netting) - 1] },
    //   });
    // }
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
    var tempArrStep1 = [];
    for (let x = 0; x < result_a[i].step_1.length; x++) {
      var findObjInStep1 = await findCode(result_a[i].step_1[x]);
      if (findObjInStep1 != -1) {
        var findNettingIndexStep1 = await findObj(
          nettingB1,
          "label",
          attrB1[findObjInStep1].netting
        );
        var getNettingCodeStep1 = nettingB1[findNettingIndexStep1].code;
        var findArr = await findObj(data, "code", getNettingCodeStep1);
        if (tempArrStep1.indexOf(getNettingCodeStep1) == -1) {
          if (findArr == -1) {
            var tempArrStep2 = [];
            var step2 = [];
            for (let y = 0; y < result_a[i].step_2.length; y++) {
              var findObjInStep2 = await findCode(result_a[i].step_2[y]);
              if (findObjInStep2 != -1) {
                var findNettingIndexStep2 = await findObj(
                  nettingB1,
                  "label",
                  attrB1[findObjInStep2].netting
                );
                var getNettingCodeStep2 = nettingB1[findNettingIndexStep2].code;
                step2.push({
                  code: getNettingCodeStep2,
                  label: attrB1[findObjInStep2].netting,
                  value: 1,
                  percent: 0,
                  duration: result_a[i].C4b,
                  average: 0,
                  step3: [
                    {
                      code: result_a[i].D1A,
                      label: attrD1a[await findCodeD1a(result_a[i].D1A)].label,
                      value: 1,
                      percent: 0,
                      duration: result_a[i].D4,
                      average: 0,
                    },
                  ],
                });
              }
            }
            tempArrStep1.push(getNettingCodeStep1);
            data.push({
              code: getNettingCodeStep1,
              label: attrB1[findObjInStep1].netting,
              value: 1,
              percent: 0,
              duration: result_a[i].B2b,
              average: 0,
              step2: step2,
            });
          } else {
            data[findArr].value++;
            data[findArr].duration = data[findArr].duration + result_a[i].B2b;
            var tempArrStep2 = [];
            for (let y = 0; y < result_a[i].step_2.length; y++) {
              var findObjInStep2 = await findCode(result_a[i].step_2[y]);
              if (findObjInStep2 != -1) {
                var findNettingIndexStep2 = await findObj(
                  nettingB1,
                  "label",
                  attrB1[findObjInStep2].netting
                );
                var getNettingCodeStep2 = nettingB1[findNettingIndexStep2].code;
                var findArrStep2 = await findObj(
                  data[findArr].step2,
                  "code",
                  getNettingCodeStep2
                );
                if (tempArrStep2.indexOf(getNettingCodeStep2) == -1) {
                  if (findArrStep2 == -1) {
                    tempArrStep2.push(getNettingCodeStep2);
                    data[findArr].step2.push({
                      code: getNettingCodeStep2,
                      label: attrB1[findObjInStep2].netting,
                      value: 1,
                      percent: 0,
                      duration: result_a[i].C4b,
                      average: 0,
                      step3: [
                        {
                          code: result_a[i].D1A,
                          label:
                            attrD1a[await findCodeD1a(result_a[i].D1A)].label,
                          value: 1,
                          percent: 0,
                          duration: result_a[i].D4,
                          average: 0,
                        },
                      ],
                    });
                  } else {
                    data[findArr].step2[findArrStep2].value++;
                    data[findArr].step2[findArrStep2].duration =
                      data[findArr].step2[findArrStep2].duration +
                      result_a[i].C4b;
                    var findArrStep3 = await findObj(
                      data[findArr].step2[findArrStep2].step3,
                      "code",
                      result_a[i].D1A
                    );
                    if (findArrStep3 == -1) {
                      data[findArr].step2[findArrStep2].step3.push({
                        code: result_a[i].D1A,
                        label:
                          attrD1a[await findCodeD1a(result_a[i].D1A)].label,
                        value: 1,
                        percent: 0,
                        duration: result_a[i].D4,
                        average: 0,
                      });
                    } else {
                      data[findArr].step2[findArrStep2].step3[findArrStep3]
                        .value++;
                      data[findArr].step2[findArrStep2].step3[
                        findArrStep3
                      ].duration =
                        data[findArr].step2[findArrStep2].step3[findArrStep3]
                          .duration + result_a[i].D4;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  var lengthstep1 = data.reduce(function (prev, cur) {
    return prev + cur.value;
  }, 0);
  for (let i = 0; i < data.length; i++) {
    data[i].percent = ((data[i].value / lengthstep1) * 100).toFixed(2);
    data[i].average = (data[i].duration / data[i].value).toFixed(0);
    var lengthstep2 = data[i].step2.reduce(function (prev, cur) {
      return prev + cur.value;
    }, 0);
    for (let x = 0; x < data[i].step2.length; x++) {
      data[i].step2[x].percent = (
        (data[i].step2[x].value / lengthstep2) *
        100
      ).toFixed(2);
      data[i].step2[x].average = (
        data[i].step2[x].duration / data[i].step2[x].value
      ).toFixed(0);
      var lengthstep3 = data[i].step2[x].step3.reduce(function (prev, cur) {
        return prev + cur.value;
      }, 0);
      for (let y = 0; y < data[i].step2[x].step3.length; y++) {
        data[i].step2[x].step3[y].percent = (
          (data[i].step2[x].step3[y].value / lengthstep3) *
          100
        ).toFixed(2);
        data[i].step2[x].step3[y].average = (
          data[i].step2[x].step3[y].duration / data[i].step2[x].step3[y].value
        ).toFixed(0);
      }
    }
  }
  // rumus apalah ini gue juga ga paham kenapa bisa jalan

  // sorting
  data.sort((a, b) => (a.value < b.value ? 1 : -1));
  for (let i = 0; i < data.length; i++) {
    data[i].step2.sort((a, b) => (a.value < b.value ? 1 : -1));
  }

  res.render("decision/content", {
    step1: data,
  });
  // res.send(data);
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
    // var netting = [
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 27, 28],
    //   [19, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 35],
    // ];
    // if (req.body.netting != "all") {
    //   Object.assign(target, {
    //     B1: { $in: netting[parseInt(req.body.netting) - 1] },
    //   });
    // }
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
    if (findArr == -1) {
      var step2 = [];

      var tempArrStep2 = [];
      for (let x = 0; x < result_a[i].step_2.length; x++) {
        if ((await findCode(result_a[i].step_2[x])) != -1) {
          var nettingIndexStep2 = await findObj(
            nettingB1,
            "label",
            attrB1[await findCode(result_a[i].step_2[x])].netting
          );
          var getCodeStep2 = nettingB1[nettingIndexStep2].code;
          if (tempArrStep2.indexOf(getCodeStep2) == -1) {
            tempArrStep2.push(getCodeStep2);
            var tempArrStep3 = [];
            var step3 = [];
            for (let y = 0; y < result_a[y].step_1.length; y++) {
              if ((await findCode(result_a[i].step_1[y])) != -1) {
                var nettingIndexStep3 = await findObj(
                  nettingB1,
                  "label",
                  attrB1[await findCode(result_a[i].step_1[y])].netting
                );
                var getCodeStep3 = nettingB1[nettingIndexStep3].code;
                if (tempArrStep3.indexOf(getCodeStep3) == -1) {
                  tempArrStep3.push(getCodeStep3);
                  step3.push({
                    code: getCodeStep3,
                    label:
                      attrB1[await findCode(result_a[i].step_1[y])].netting,
                    value: 1,
                    percent: 0,
                  });
                }
              }
            }
            step2.push({
              code: getCodeStep2,
              label: attrB1[await findCode(result_a[i].step_2[x])].netting,
              value: 1,
              percent: 0,
              step3: step3,
            });
          }
        }
      }
      data.push({
        code: result_a[i].D1A,
        label: attrD1a[await findCodeD1a(result_a[i].D1A)].label,
        value: 1,
        percent: 0,
        duration: result_a[i].D4,
        average: 0,
        step2: step2,
      });
    } else {
      data[findArr].value = data[findArr].value + 1;
      data[findArr].duration = data[findArr].duration + result_a[i].D4;
      var step2 = [];
      var tempArrStep2 = [];
      for (let xx = 0; xx < result_a[i].step_2.length; xx++) {
        if ((await findCode(result_a[i].step_2[xx])) != -1) {
          var nettingIndexStep2 = await findObj(
            nettingB1,
            "label",
            attrB1[await findCode(result_a[i].step_2[xx])].netting
          );
          var getCodeStep2 = nettingB1[nettingIndexStep2].code;
          var findArrStep2 = await findObj(
            data[findArr].step2,
            "code",
            getCodeStep2
          );
          if (tempArrStep2.indexOf(getCodeStep2) == -1) {
            tempArrStep2.push(getCodeStep2);
            var tempArrStep3 = [];
            var step3 = [];
            if (findArrStep2 == -1) {
              for (let yy = 0; yy < result_a[i].step_1.length; yy++) {
                if ((await findCode(result_a[i].step_1[yy])) != -1) {
                  var nettingIndexStep3 = await findObj(
                    nettingB1,
                    "label",
                    attrB1[await findCode(result_a[i].step_1[yy])].netting
                  );
                  var getCodeStep3 = nettingB1[nettingIndexStep3].code;
                  if (tempArrStep3.indexOf(getCodeStep3) == -1) {
                    tempArrStep3.push(getCodeStep3);
                    step3.push({
                      code: getCodeStep3,
                      label:
                        attrB1[await findCode(result_a[i].step_1[yy])].netting,
                      value: 1,
                      percent: 0,
                    });
                  }
                }
              }
              data[findArr].step2.push({
                code: getCodeStep2,
                label: attrB1[await findCode(result_a[i].step_2[xx])].netting,
                value: 1,
                percent: 0,
                step3: step3,
              });
            } else {
              data[findArr].step2[findArrStep2].value =
                data[findArr].step2[findArrStep2].value + 1;
              for (let yyy = 0; yyy < result_a[i].step_1.length; yyy++) {
                if ((await findCode(result_a[i].step_1[yyy])) != -1) {
                  var nettingIndexStep3 = await findObj(
                    nettingB1,
                    "label",
                    attrB1[await findCode(result_a[i].step_1[yyy])].netting
                  );
                  var getCodeStep3 = nettingB1[nettingIndexStep3].code;
                  var findArrStep3 = await findObj(
                    data[findArr].step2[findArrStep2].step3,
                    "code",
                    getCodeStep3
                  );
                  if (tempArrStep3.indexOf(getCodeStep3) == -1) {
                    tempArrStep3.push(getCodeStep3);
                    if (findArrStep3 == -1) {
                      data[findArr].step2[findArrStep2].step3.push({
                        code: getCodeStep3,
                        label:
                          attrB1[await findCode(result_a[i].step_1[yyy])]
                            .netting,
                        value: 1,
                        percent: 0,
                      });
                    } else {
                      data[findArr].step2[findArrStep2].step3[findArrStep3].value =
                        data[findArr].step2[findArrStep2].step3[findArrStep3].value + 1;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // for (let i = 0; i < result_a.length; i++) {
  //   if (result_a[i].D1A == 2) {
  //     for (let x = 0; x < result_a[i].step_2.length; x++) {
  //       var nettingIndexStep2 = await findCode(result_a[i].step_2[x]);
  //       if (nettingIndexStep2 != -1) {
  //         var findNettingIndexStep2 = await findObj(
  //           nettingB1,
  //           "label",
  //           attrB1[nettingIndexStep2].netting
  //         );
  //         var findObjInStep2 = await findObj(
  //           data[0].step2,
  //           "label",
  //           nettingB1[findNettingIndexStep2].label
  //         );
  //         var tempArrStep3 = [];
  //         for (let y = 0; y < result_a[i].step_1.length; y++) {
  //           var nettingIndexStep3 = await findCode(result_a[i].step_1[y]);
  //           if (nettingIndexStep3 != -1) {
  //             var findNettingIndexStep3 = await findObj(
  //               nettingB1,
  //               "label",
  //               attrB1[nettingIndexStep3].netting
  //             );
  //             var findObjInStep3 = await findObj(
  //               data[0].step2[findObjInStep2].step3,
  //               "label",
  //               nettingB1[findNettingIndexStep3].label
  //             );
  //             if (
  //               tempArrStep3.indexOf(nettingB1[findNettingIndexStep3].code) ==
  //               -1
  //             ) {
  //               tempArrStep3.push(nettingB1[findNettingIndexStep3].code);
  //               if (findObjInStep3 == -1) {
  //                 data[0].step2[findObjInStep2].step3.push({
  //                   code: nettingB1[findNettingIndexStep3].code,
  //                   label: attrB1[nettingIndexStep3].netting,
  //                   value: 1,
  //                   percent: 0,
  //                 });
  //               } else {
  //                 data[0].step2[findObjInStep2].step3[findObjInStep3].value =
  //                   data[0].step2[findObjInStep2].step3[findObjInStep3].value +
  //                   1;
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  for (let i = 0; i < data.length; i++) {
    data[i].percent = ((data[i].value / dataSizeFilter.length) * 100).toFixed(
      2
    );
    data[i].average = (data[i].duration / data[i].value).toFixed(0);
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
      }
    }
  }
  // rumus apalah ini gue juga ga paham kenapa bisa jalan

  // sorting
  data.sort((a, b) => (a.value < b.value ? 1 : -1));
  for (let i = 0; i < data.length; i++) {
    data[i].step2.sort((a, b) => (a.value < b.value ? 1 : -1));
    for (let x = 0; x < data[i].step2.length; x++) {
      data[i].step2[x].step3.sort((a, b) => (a.value < b.value ? 1 : -1));
    }
  }

  res.render("reverse/content", {
    step1: data,
  });
  // res.send(data);
};
