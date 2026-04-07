import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const response = await client.responses.create({
  model: "grok-4.20-beta-latest-non-reasoning",
  input: [
    {
      role: "system",
      content: "You generate portfolio website templates as structured JSON."
    },
    {
      role: "user",
      content: userPrompt
    }
  ]
});
