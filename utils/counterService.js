const Counter = require('../models/counter');

async function getNextSequence(name) {
    const updatedCounter = await Counter.findByIdAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return Number(updatedCounter.seq);
}

module.exports = getNextSequence;
