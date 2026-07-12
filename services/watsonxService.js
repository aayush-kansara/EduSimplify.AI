const qs = require("qs");
const config = require("../config/watsonxConfig");

module.exports.generateContent = async (prompt) => {

    // =====================================
    // Get IBM Access Token
    // =====================================

    const tokenResponse = await fetch(
        "https://iam.cloud.ibm.com/identity/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: qs.stringify({
                grant_type: "urn:ibm:params:oauth:grant-type:apikey",
                apikey: config.apiKey
            })
        }
    );

    if (!tokenResponse.ok) {
        throw new Error("Failed to generate IBM access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // =====================================
    // Call Granite
    // =====================================

    const graniteResponse = await fetch(
        `${config.url}/ml/v1/text/chat?version=2023-05-29`,
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            }
                        ]
                    }
                ],

                project_id: config.projectId,
                model_id: config.model,

                max_tokens: 2000,
                temperature: 0,
                top_p: 1
            })
        }
    );

    if (!graniteResponse.ok) {
        const error = await graniteResponse.text();
        console.log(error);
        throw new Error("Granite request failed");
    }

    const result = await graniteResponse.json();

const aiResponse = result.choices[0].message.content;

console.log("AI RESPONSE:");
console.log(aiResponse);

let cleanedResponse = aiResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

return JSON.parse(cleanedResponse);

return JSON.parse(aiResponse);
};