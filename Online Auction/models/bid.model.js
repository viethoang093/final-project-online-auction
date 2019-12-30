const db = require('../utils/db');

module.exports = {
  all: () => db.load('SELECT * FROM Bid'),

  singleByUserID: async userid => {
    const bid = await db.load1(`Bid`, { UserID: userid })
    if (bid.length === 0)
      return null;
    return bid[0];
  },

  add: entity => db.add('Bid', entity),

  patch: (entity, bidid) => {
    const condition = { BidID: bidid };
    return db.patch('Bid', entity, condition);
  },

  delByUserID: userid => db.del('Bid', { UserID: userid }),
};