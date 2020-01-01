const express = require('express');
const productModel = require('../models/product.model');
const bidModel = require('../models/bid.model');
const router = express.Router();


router.get('/id=:id', async (req, res) => {
  var userTmp = null;
  if (req.session.isAuthenticated) userTmp = req.session.authUser.UserID;
  const proid = req.params.id;
  const [prd, sli, cwi, g4, review, relatedPrd, fvr, mp] = await Promise.all([
    productModel.single(proid),
    productModel.getSellerInfo(proid),
    productModel.getCurrentWinner(proid),
    productModel.get3TimesLatestPrice(proid),
    productModel.getReview(proid),
    productModel.get5RelatedProduct(proid),
    productModel.fvr(proid, userTmp),
    bidModel.MaxPrice(proid, userTmp)
  ]);
  var reviewLength = 0, isWinner = false, MaxPrice_AutoBid = null;
  var curPrice=0;
  if (req.session.isAuthenticated && cwi[0].length != 0) {
    isWinner = (cwi[0][0].userID === req.session.authUser.UserID);
    curPrice=cwi[0][0].CurrentBid;
  }
  if (mp.length != 0) {
    if (req.session.isAuthenticated && mp[0].Price > curPrice) {
      MaxPrice_AutoBid = mp[0].Price;
    }
  }
  if (review[0].length != 0) reviewLength = review[0][0].CountRevByID;
  res.render('vwSingleProduct/single', {
    Productid: proid,
    product: prd[0],
    PrdEmpty: prd[0].length === 0,
    sellerInfo: sli[0],
    curWinnerInfo: cwi[0],
    InfoLastestAuction: g4[0],
    review: review[0],
    reviewLength: reviewLength,
    relatedPrd: relatedPrd[0],
    favorite: fvr,
    isWinner: isWinner,
    autoBidPrice: MaxPrice_AutoBid
  });

});
router.post('/id=:id', async (req, res) => {
  if (req.body.key === 'bid') {
    delete req.body.key;
    if (req.session.isAuthenticated && 1 == 1) {
      const status = await bidModel.fAuction(req.params.id, req.session.authUser.UserID, req.body.Price);
    }
    return res.redirect('back');
  }
  if (req.body.key === 'review') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
      const date = new Date();
      const entity = req.body;
      entity.UserID = req.session.authUser.UserID;
      entity.ReviewID = null;
      entity.ProductId = req.params.id;
      entity.TimePost = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      await productModel.addReview(entity);
      const tmp = await productModel.getReview(req.body.ProductId, 1);
      return res.json(tmp[0][0]);
    }
  }
  if (req.body.key === 'favorite') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
      const tmpx = await productModel.fInsertFavorite(req.params.id, req.session.authUser.UserID);
      return res.json(tmpx[0].result);
    }
    return res.json(0);
  }
  if (req.body.key === 'autobid') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
       await bidModel.fAutoBid(req.params.id, req.session.authUser.UserID, req.body.Price);
    }
    return res.redirect('back');
  }
  return res.redirect('back');
})

module.exports = router;

