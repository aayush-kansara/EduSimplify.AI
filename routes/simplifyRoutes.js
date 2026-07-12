const express = require("express");
const router = express.Router();

const {
    simplifyContent,
    generateRevisionNotes,
    generateFlashcards,
    generateQuiz,
    generateRoadmap,
    generateRealWorld,
    compareLevels
} = require("../controllers/simplifyController");

router.post("/simplify", simplifyContent);
router.post("/revision-notes", generateRevisionNotes);
router.post("/flashcards", generateFlashcards);
router.post("/quiz", generateQuiz);
router.post("/roadmap", generateRoadmap);
router.post("/realworld", generateRealWorld);
router.post("/compare-levels", compareLevels);

module.exports = router;