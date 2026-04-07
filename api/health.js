const response = await client.responses.create({
  model: "grok-4.20-reasoning",
  input: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
});
