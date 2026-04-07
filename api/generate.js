import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function fallbackTemplates(prompt = "") {
  return {
    ok: true,
    provider: "fallback",
    variants: [
      {
        id: "minimal-pro",
        name: "Minimal Pro",
        persona: "professional",
        style: "minimal",
        palette: {
          primary: "#111827",
          accent: "#2563eb",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#111827"
        },
        sections: ["hero", "about", "skills", "projects", "contact"],
        copy: {
          headline: "Xin chào, tôi là Nguyễn Văn A",
          subheadline: "Tôi xây dựng sản phẩm số hiện đại và dễ dùng.",
          about: "Mẫu dự phòng khi AI chưa phản hồi đúng định dạng."
        }
      }
    ],
    meta: { prompt }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    console.log("generate called");

    const { prompt = "", profile = {} } = req.body || {};

    if (!process.env.XAI_API_KEY) {
      return res.status(200).json({
        ...fallbackTemplates(prompt),
        debug: "Missing XAI_API_KEY"
      });
    }

    const systemPrompt = `
Bạn là AI tạo template website giới thiệu bản thân.
Hãy trả về đúng 3 mẫu dưới dạng JSON hợp lệ.
Không dùng markdown.

Schema:
{
  "variants": [
    {
      "id": "slug-ngan",
      "name": "Tên mẫu",
      "persona": "developer|designer|marketer|student|freelancer|creator|professional",
      "style": "mô tả ngắn",
      "palette": {
        "primary": "#RRGGBB",
        "accent": "#RRGGBB",
        "background": "#RRGGBB",
        "surface": "#RRGGBB",
        "text": "#RRGGBB"
      },
      "sections": ["hero","about","skills","projects","experience","services","gallery","testimonials","contact"],
      "copy": {
        "headline": "tiêu đề",
        "subheadline": "mô tả ngắn",
        "about": "giới thiệu"
      }
    }
  ]
}
`;

    const userPrompt = `
Prompt người dùng: ${prompt || "Tạo website giới thiệu bản thân hiện đại"}
Thông tin bổ sung:
${JSON.stringify(profile, null, 2)}
`;

    const response = await client.responses.create({
      model: "grok-4.20-reasoning",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    console.log("xai response received");

    const text =
      response.output_text ||
      response.output
        ?.map((item) =>
          (item?.content || []).map((c) => c?.text || "").join(" ")
        )
        .join(" ") ||
      "";

    const parsed = safeParseJson(text);

    if (!parsed || !Array.isArray(parsed.variants)) {
      return res.status(200).json({
        ...fallbackTemplates(prompt),
        debug: "Invalid model output",
        raw: text.slice(0, 1500)
      });
    }

    return res.status(200).json({
      ok: true,
      provider: "xai",
      variants: parsed.variants.slice(0, 3),
      meta: {
        prompt,
        model: "grok-4.20-reasoning"
      }
    });
  } catch (error) {
    console.error("generate error:", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || "Unknown server error"
    });
  }
}
