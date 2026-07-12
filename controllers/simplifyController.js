const { generateContent } = require("../services/watsonxService");

const {
    simplifyPrompt,
    revisionPrompt,
    flashcardPrompt,
    quizPrompt,
    roadmapPrompt,
    realWorldPrompt,
    compareLevelsPrompt
} = require("../prompts/granitePrompts");

module.exports.simplifyContent = async (req, res) => {

    try {

        const { content, level } = req.body;

        const prompt =
            simplifyPrompt(content, level);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");
    }

};


module.exports.generateRevisionNotes = async (req, res) => {

    try {

        const { content } = req.body;

        const prompt =
            revisionPrompt(content);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");

    }

};

module.exports.generateFlashcards = async (req, res) => {

    try {

        const { content } = req.body;

        const prompt =
            flashcardPrompt(content);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");

    }

};

module.exports.generateQuiz = async (req, res) => {

    try {

        const { content } = req.body;

        const prompt =
            quizPrompt(content);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");

    }

};

module.exports.generateRoadmap = async (req, res) => {

    try {

        const { content } = req.body;

        const prompt =
            roadmapPrompt(content);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");

    }

};

module.exports.generateRealWorld = async (req, res) => {

    try {

        const { content } = req.body;

        const prompt =
            realWorldPrompt(content);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");

    }

};

module.exports.compareLevels = async (req, res) => {

    try {

        const { content } = req.body;

        const prompt =
            compareLevelsPrompt(content);

        const result =
            await generateContent(prompt);

        res.json(result);

    } catch (err) {

        console.log(err);

        res.status(500).send("Something went wrong");

    }

};