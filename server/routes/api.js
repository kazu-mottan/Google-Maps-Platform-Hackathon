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

    const {start, goal, midpoint} = quiz;
    let end = nowQuizCount - 1;
    if(end < 0) end = 0;
    if(midpoint.length < nowQuizCount) end = midpoint.length;

    const startPoint = {type:"start", position: start};
    const goalPoint = {type:"goal", position: goal};

    const passedMidpoint = midpoint.slice(0,end);
    const results = await Promise.all(
        passedMidpoint.map(ele => place.getRefImg(ele.name))
    );
    results.forEach((r,index) => {
        passedMidpoint[index].type = "midpoint";
        passedMidpoint[index].image = r.refImage;
    });

    const spots = [startPoint, goalPoint , ...passedMidpoint];

    res.status(200).json({spots:spots,total:midpoint.length});
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
    if(length < nowQuizCount){
        logger.error("No Next Exists");
        res.status(400).json({msg: "No Next Exists"});
    }else{
        let index = nowQuizCount;
        if(index < 0) index = 0;
        if(index >= quiz.midpoint.length ) index = quiz.midpoint.length - 1;
        const next = quiz.midpoint[index];
        const imageReview = await place.getImgAndReview(next.name);
        const near = await place.getNear(next.position);
        next.image = imageReview.refImage;
        next.hints = imageReview.hints;
        next.hints.nearSpot = near.nearSpot;

        res.status(200).json({next:next});
    }
});

module.exports = router;