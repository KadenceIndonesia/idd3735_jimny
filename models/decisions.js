const mongoose = require("mongoose")

const decisionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    SbjNum: Number,
    S3: Number,
    S5: Number,
    S17: Number,
    S18: Number,
    S19: Number,
    A7: Number,
    B1: Number,
    B2a: [],
    C3: Number,
    C4a: Array,
    D1A: Number,
    S6_GRUP: Number,
    S7: Number,
    S8: Number,
    S9A: Number,
    S9B: Number,
    S11_TRF: Number,
    S12: Number,
    S12_Score: Number,
    S13: Number,
    S13_Score: Number,
    S16: Number
})

module.exports = mongoose.model('Decision', decisionSchema);