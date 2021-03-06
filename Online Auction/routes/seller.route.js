const express = require('express');
const router = express.Router();
const restrict = require('../middlewares/auth.mdw');
const reviewModel = require('../models/review.model');

router.get('/:Username', async (req, res) => {
    const sellerInfo = await reviewModel.getInfoSellerByUserName(req.params.Username);
    if (req.session.isAuthenticated && sellerInfo.length!=0) {
        const check = await reviewModel.checkUser(req.session.authUser.UserID, sellerInfo[0].UserID);
        const rv = await reviewModel.getReviewSeller(sellerInfo[0].UserID);
        if (check[0].result == 1)
            res.render('vwReview/seller', {
                isAllowed: true,
                sellerInfo: sellerInfo,
                review: rv
            });
        else {
            res.render('vwReview/seller', {
                isAllowed: false,
                sellerInfo: sellerInfo,
                review: rv
            });
        }
    }
    else res.redirect('/');
});
router.post('/:Username', async (req, res) => {
    const tmp=await reviewModel.getID(req.params.Username);
    if (req.body.Rate==1) await reviewModel.updateRatingUp(tmp[0].UserID);
    else  await reviewModel.updateRatingDown(tmp[0].UserID);
    await reviewModel.addReviewSeller(req.session.authUser.UserID, tmp[0].UserID,req.body.Comment,req.body.Rate)
    return res.redirect('back');
}); 

module.exports = router;
