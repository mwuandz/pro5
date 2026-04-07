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
          text: "#111827",
        },
        sections: ["hero", "about", "skills", "projects", "contact"],
        copy: {
          headline: "Xin chào, tôi là Nguyễn Văn A",
          subheadline: "Tôi xây dựng sản phẩm số hiện đại và dễ dùng.",
          about:
            "Đây là website giới thiệu bản thân được tạo bằng AI, phù hợp để làm portfolio hoặc landing page cá nhân.",
        },
      },
      {
        id: "creator-dark",
        name: "Creator Dark",
        persona: "creator",
        style: "dark modern",
        palette: {
          primary: "#0f172a",
          accent: "#38bdf8",
          background: "#020617",
          surface: "#111827",
          text: "#e5e7eb",
        },
        sections: ["hero", "about", "services", "projects", "testimonials", "contact"],
        copy: {
          headline: "Xây dựng thương hiệu cá nhân nổi bật",
          subheadline: "Một giao diện đậm chất sáng tạo, hiện đại và khác biệt.",
          about:
            "Phù hợp cho freelancer, marketer, creator hoặc người cần trang profile chuyên nghiệp.",
        },
      },
      {
        id: "soft-portfolio",
        name: "Soft Portfolio",
        persona: "designer",
        style: "soft elegant",
        palette: {
          primary: "#7c3aed",
          accent: "#ec4899",
          background: "#fff7fb",
          surface: "#ffffff",
          text: "#3f3f46",
        },
        sections: ["hero", "about", "skills", "gallery", "experience", "contact"],
        copy: {
          headline: "Portfolio cá nhân thanh lịch",
          subheadline: "Tối ưu cho việc giới thiệu bản thân, kỹ năng và dự án nổi bật.",
          about:
            "Thiết kế nhẹ nhàng, phù hợp cho designer, sinh viên hoặc freelancer muốn có profile đẹp mắt.",
        },
      },
    ],
    meta: {
      prompt,
      note: "Fallback local templates",
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { prompt = "", profile = {} } = req.body || {};

    if (!process.env.XAI_API_KEY) {
      return res.status(200).json(fallbackTemplates(prompt));
    }

    const systemPrompt = `
Bạn là AI tạo template website giới thiệu bản thân.
Hãy tạo đúng 3 phương án template khác nhau cho website cá nhân.

Yêu cầu:
- Trả về JSON hợp lệ, không thêm markdown, không thêm giải thích.
- JSON phải có cấu trúc:
{
  "ok": true,
  "provider": "xai",
  "variants": [
    {
      "id": "slug-ngan",
      "name": "Tên mẫu",
      "persona": "developer|designer|marketer|student|freelancer|creator|professional",
      "style": "mô tả ngắn style",
      "palette": {
        "primary": "#RRGGBB",
        "accent": "#RRGGBB",
        "background": "#RRGGBB",
        "surface": "#RRGGBB",
        "text": "#RRGGBB"
      },
      "sections": ["hero","about","skills","projects","experience","services","gallery","testimonials","contact"],
      "copy": {
        "headline": "tiêu đề hero",
        "subheadline": "mô tả ngắn",
        "about": "đoạn giới thiệu"
      }
    }
  ],
  "meta": {
    "prompt": "prompt gốc"
  }
}

Quy tắc:
- Chỉ trả về 3 variants.
- Mỗi variant phải khác nhau rõ ràng về style, palette, section order hoặc persona.
- Màu phải hợp lý và dễ đọc.
- Nội dung viết bằng tiếng Việt.
`;

    const userPrompt = `
Prompt người dùng: ${prompt || "Tạo website giới thiệu bản thân hiện đại"}

Thông tin bổ sung:
${JSON.stringify(profile, null, 2)}
`;

    const response = await client.responses.create({
      model: process.env.XAI_MODEL || "grok-4.20-reasoning",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text =
      response.output_text ||
      response.output?.map((item) => item?.content?.map((c) => c?.text || "").join(" ")).join(" ") ||
      "";

    const parsed = safeParseJson(text);

    if (!parsed || !Array.isArray(parsed.variants)) {
      return res.status(200).json(fallbackTemplates(prompt));
    }

    return res.status(200).json({
      ok: true,
      provider: "xai",
      variants: parsed.variants.slice(0, 3),
      meta: {
        prompt,
        model: process.env.XAI_MODEL || "grok-4.20-reasoning",
      },
    });
  } catch (error) {
    return res.status(200).json({
      ...fallbackTemplates(req.body?.prompt || ""),
      error: error?.message || "Unknown error",
    });
  }
}
