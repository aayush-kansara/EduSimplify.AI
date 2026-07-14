// =====================================
// SIMPLIFY PROMPT
// =====================================

module.exports.simplifyPrompt = (content, level) => `

Learner Level: ${level}

IMPORTANT:

If level is CHILD:

- Explain as a friendly teacher teaching a 10–12 year old student.
- Cover every important idea from the original content.
- Explain concepts one by one in the same order they appear.
- Use very simple words and short sentences.
- Avoid difficult technical terms whenever possible.
- If a technical term must be used, explain it immediately.
- Never skip important points just to make the explanation shorter.
- The child should be able to understand the entire topic after reading the explanation.
- Make the explanation detailed, engaging, and educational rather than brief.


If level is BEGINNER:

- Explain for a first-year college student with little or no prior knowledge.
- Cover all major concepts from the original content.
- Introduce technical terms gradually and define them clearly.
- Explain not only what something is, but also why it is used.
- Use simple academic language.
- Avoid advanced implementation details.
- Build a strong conceptual foundation.
- The explanation should be educational and beginner-friendly.

If level is INTERMEDIATE:

- Assume the learner already understands the basics.
- Use proper academic and technical terminology.
- Explain internal working, behavior, and relationships between concepts.
- Discuss advantages, limitations, and common use cases.
- Include implementation-level understanding where relevant.
- Use subject-specific vocabulary confidently.
- Focus on how and why a concept works.
- Avoid oversimplification.
- Maintain educational depth while remaining understandable.

If level is EXPERT:

- Assume the learner is an experienced developer, engineer, researcher, or domain professional.
- Use advanced technical terminology naturally.
- Provide architecture-level understanding.
- Explain implementation details, design considerations, trade-offs, and best practices.
- Discuss performance, scalability, maintainability, or security implications when relevant.
- Reference industry usage and professional applications.
- Focus on deep conceptual understanding rather than introductory teaching.
- Do not simplify concepts.
- Maintain a professional and technically rigorous tone.
- Include advanced insights beyond textbook definitions.


The difference between CHILD and EXPERT must be obvious.

{
  "simplifiedExplanation": "Detailed and intuitive explanation based on learner level",
  "summary": "detailed summary of the topic"
}

IMPORTANT:

- Never leave simplifiedExplanation empty.
- Never leave summary empty.
- Both fields are required.
- Return JSON only.

Learner Level:
${level}

Content:
${content}

`;


// =====================================
// REVISION NOTES PROMPT
// =====================================

module.exports.revisionPrompt = (content) => `

Generate concise revision notes.

Rules:
- Generate exactly 7 revision points.
- Each point must be one line.
- Focus on exam-relevant information.

Return ONLY valid JSON.

{
  "revisionNotes": []
}

Content:
${content}

`;


// =====================================
// FLASHCARDS PROMPT
// =====================================

module.exports.flashcardPrompt = (content) => `

Generate educational flashcards.

Rules:
- Generate exactly 5 flashcards.
- Each flashcard must contain:
  - question
  - answer

Return ONLY valid JSON.

{
  "flashcards": [
    {
      "question": "",
      "answer": ""
    }
  ]
}

Content:
${content}

`;


// =====================================
// QUIZ PROMPT
// =====================================

module.exports.quizPrompt = (content) => `

Generate exactly 5 MCQs.

Rules:
- 4 options per question.
- Only one correct answer.
- Questions should test conceptual understanding.

Return ONLY valid JSON.

{
  "quizQuestions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answerIndex": 0
    }
  ]
}

IMPORTANT:
answerIndex must contain the zero-based index of the correct answer.

Content:
${content}

`;


// =====================================
// ROADMAP PROMPT
// =====================================

module.exports.roadmapPrompt = (content) => `

Create a personalized learning roadmap.

Return ONLY valid JSON.

{
  "prerequisites": [
    "Prerequisite 1",
    "Prerequisite 2",
    "Prerequisite 3"
  ],

  "learningJourney": [
    {
      "step": 1,
      "title": "Topic Name",
      "description": "Short explanation"
    }
  ]
}

Rules:

- Generate 4 prerequisites.
- Generate exactly 5 learning journey steps.
- Steps must be in logical learning order.
- Keep descriptions short.
- Return raw JSON only.
- Do not wrap JSON in markdown.

Content:
${content}

`;

// =====================================
// REAL WORLD EXPLORER PROMPT
// =====================================

module.exports.realWorldPrompt = (content) => `

Explain how this topic is used in the real world.

Return ONLY valid JSON.

{
  "sections": [
    {
      "title": "Real-World Applications",
      "icon": "fa-rocket",
      "color": "linear-gradient(135deg, #0f62fe, #0043ce)",
      "text": "Explanation",
      "industries": [
        "Industry 1",
        "Industry 2"
      ]
    }
  ]
}

Rules:

- Generate exactly 4 sections.
- Keep titles concise.
- Keep explanations under 50 words.
- Provide 3-4 industries/tags per section.
- Return raw JSON only.
- Do not wrap JSON in markdown.

Content:
${content}

`;

// =====================================
// COMPARE LEVELS PROMPT
// =====================================

module.exports.compareLevelsPrompt = (content) => `

Explain the same topic for four learner levels.

Return ONLY valid JSON.

{
  "levels": [
    {
      "level": "Child",
      "text": "Explanation",
      "icon": "fa-child-reaching",
      "cls": "alc-child"
    },
    {
      "level": "Beginner",
      "text": "Explanation",
      "icon": "fa-seedling",
      "cls": "alc-beginner"
    },
    {
      "level": "Intermediate",
      "text": "Explanation",
      "icon": "fa-graduation-cap",
      "cls": "alc-intermediate"
    },
    {
      "level": "Expert",
      "text": "Explanation",
      "icon": "fa-brain",
      "cls": "alc-expert"
    }
  ]
}

Rules:

- CHILD → age 10-12.
- BEGINNER → first-year student.
- INTERMEDIATE → academic explanation.
- EXPERT → advanced technical explanation.
- Difference between levels must be obvious.
- Return raw JSON only.
- Do not wrap JSON in markdown.

Content:
${content}

`;