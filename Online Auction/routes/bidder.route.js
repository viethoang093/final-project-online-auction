const express = require('express');
const router = express.Router();
const restrict = require('../middlewares/auth.mdw');
const reviewModel = require('../models/review.model');

router.get('/:Username', async (req, res) => {
    const bidderInfo = await reviewModel.getInfoBidderByUserName(req.params.Username);
    console.log(bidderInfo);
    console.log(bidderInfo.length);
    if (req.session.isAuthenticated && bidderInfo.length != 0) {
        //if ton tai giao dich giua 2 nguoi
        const check = await reviewModel.checkUser(bidderInfo[0].UserID, req.session.authUser.UserID);
        const rv = await reviewModel.getReviewBidder(bidderInfo[0].UserID);
        if (check[0].result == 1) {
            res.render('vwReview/bidder', {
                isAllowed: true,
                bidderInfo: bidderInfo,
                review: rv
            });
        }
        else {
            res.render('vwReview/bidder', {
                isAllowed: false,
                bidderInfo: bidderInfo,
                review: rv
            });
        }
    }
    else {
        return res.redirect('/');
    }
});
router.post('/:Username', async (req, res) => {
    const tmp = await reviewModel.getID(req.params.Username);
    if (req.body.Rate == 1) await reviewModel.updateRatingUp(tmp[0].UserID);
    else await reviewModel.updateRatingDown(tmp[0].UserID);
    await reviewModel.addReviewBidder(req.session.authUser.UserID, tmp[0].UserID, req.body.Comment, req.body.Rate)
    return res.redirect('back');
});

module.exports = router;