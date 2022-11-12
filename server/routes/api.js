const express = require("express");
const logger = require("../common/logger.js");
const router = express.Router();
const db = require("../db/index.js");
const direction = require("../gmap/directions");
const place = require("../gmap/place");

router.get('/route/:mapID', async (req, res) => {
    const mapID = req.params.mapID;
    const quiz = await db.findOneFrom("quiz",{id:mapID});
    if(!quiz){
        logger.error("Quiz Not Found");
        res.status(400).json({msg: "Quiz Not Found"});
    }
    const {start, goal, midpoint} = quiz;
    const route = await direction.getRoute(start, goal, midpoint);
    res.status(200).json(route);
});

router.post('/init/:mapID', async (req, res) => {
    const mapID = req.params.mapID;
    const nowQuizCount = req.body.now;
    const quiz = await db.findOneFrom("quiz",{id:mapID});
    if(!quiz){
        logger.error("Quiz Not Found");
        res.status(400).json({msg: "Quiz Not Found"});
    }
    const length = quiz.midpoint.length;
    if(length <= nowQuizCount) nowQuizCount = length;

    const {start, goal, midpoint} = quiz;
    start.type = "start";
    goal.type = "goal"
    const promises = [];
    for(let i = 0; i < nowQuizCount; ++i){
        promises.push(place.getRefImg(midpoint[i].name));
    }
    const results = await Promise.all(promises);
    for(let i = 0; i < nowQuizCount; ++i){
        midpoint[i].type = "midpoint";
        midpoint[i].image = results[i].refImage;
    }

    const spots = [start, goal, ...(midpoint.slice(nowQuizCount))];

    res.status(200).json({spots:spots,total:length});
});

router.post('/next/:mapID', async (req, res) => {
    const mapID = req.params.mapID;
    const nowQuizCount = req.body.now;
    const quiz = await db.findOneFrom("quiz",{id:mapID});
    if(!quiz){
        logger.error("Quiz Not Found");
        res.status(400).json({msg: "Quiz Not Found"});
    }
    const length = quiz.midpoint.length;
    if(length <= nowQuizCount){
        logger.error("No Next Exists");
        res.status(400).json({msg: "No Next Exists"});
    }else{
        const next = quiz.midpoint[nowQuizCount];
        const imageReview = await place.getImgAndReview(next.name);
        const near = await place.getNear(next.position);
        next.image = imageReview.refImage;
        next.hints = imageReview.hints;
        next.hints.nearSpot = near.nearSpot;

        res.status(200).json({next:next});
    }
});

module.exports = router;