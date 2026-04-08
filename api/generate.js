import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const allowedBlocks = {
  hero: ["split", "centered", "spotlight"],
  stats: ["grid", "strip"],
  about: ["card", "split"],
  skills: ["pills", "grid"],
  projects: ["cards", "showcase"],
  experience: ["timeline", "cards"],
  testimonials: ["cards"],
  contact: ["cta", "split"],
};

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

function buildFallbackConcepts(prompt = "", profile = {}) {
  const name = profile?.name || "Ales Trần";
  const title = profile?.title || "Frontend Developer & Product Builder";
  const email = profile?.email || "hello@example.com";
  const phone = profile?.phone || "+84 900 000 000";
  const location = profile?.location || "TP. Hồ Chí Minh";

  const baseContent = {
    name,
    title,
    tagline: profile?.tagline || "Tôi xây dựng website cá nhân hiện đại, rõ ràng và có thể chuyển đổi tốt.",
    bio: profile?.bio || "Đây là bản demo được sinh theo kiến trúc block tree. Bạn có thể chỉnh nội dung, đổi thứ tự block và export thành portfolio HTML.",
    ctaText: profile?.ctaText || "Liên hệ ngay",
    email,
    phone,
    location,
    website: profile?.website || "https://portfolio-demo.local",
    skills: ["React", "Next.js", "UI Engineering", "SEO", "TypeScript", "Design Systems"],
    projects: [
      {
        title: "AI Portfolio Builder",
        description: "Nền tảng tạo website giới thiệu bản thân bằng AI với preview realtime.",
        link: "https://portfolio-demo.local/project-1"
      },
      {
        title: "Launch Landing",
        description: "Landing page tối ưu chuyển đổi cho startup công nghệ.",
        link: "https://portfolio-demo.local/project-2"
      },
      {
        title: "Creator Media Kit",
        description: "Media kit online cho freelancer và content creator.",
        link: "https://portfolio-demo.local/project-3"
      }
    ],
    experience: [
      {
        role: "Frontend Developer",
        company: "Studio Nova",
        period: "2023 - Nay",
        description: "Thiết kế và phát triển landing page, dashboard và hệ thống giao diện cho sản phẩm SaaS."
      },
      {
        role: "Freelance Web Designer",
        company: "Self-employed",
        period: "2021 - 2023",
        description: "Làm website cá nhân, landing page và portfolio cho khách hàng cá nhân và doanh nghiệp nhỏ."
      }
    ],
    testimonials: [
      {
        quote: "Làm việc nhanh, giao diện đẹp và rất dễ chỉnh sửa sau bàn giao.",
        author: "Khách hàng demo",
        role: "Founder"
      },
      {
        quote: "Cấu trúc rõ ràng, phù hợp để giới thiệu năng lực và dự án nổi bật.",
        author: "Hiring Manager",
        role: "Recruitment"
      }
    ],
    stats: [
      { value: "12+", label: "Dự án" },
      { value: "4", label: "Năm kinh nghiệm" },
      { value: "24h", label: "Phản hồi" }
    ]
  };

  return {
    ok: true,
    provider: "fallback",
    concepts: [
      {
        id: "concept-minimal",
        name: "Minimal Signal",
        summary: "Sạch, gọn, tập trung vào độ rõ ràng và khả năng đọc nhanh.",
        site: {
          theme: {
            primary: "#4f46e5",
            accent: "#06b6d4",
            background: "#f4f7fb",
            surface: "#ffffff",
            text: "#162033",
            muted: "#5f6b84",
            radius: 24
          },
          layout: [
            { id: "hero-1", type: "hero", variant: "centered" },
            { id: "stats-1", type: "stats", variant: "strip" },
            { id: "about-1", type: "about", variant: "card" },
            { id: "skills-1", type: "skills", variant: "pills" },
            { id: "projects-1", type: "projects", variant: "cards" },
            { id: "experience-1", type: "experience", variant: "cards" },
            { id: "contact-1", type: "contact", variant: "cta" }
          ],
          content: baseContent
        }
      },
      {
        id: "concept-dark",
        name: "Dark Craft",
        summary: "Đậm chất công nghệ, phù hợp developer, founder và portfolio hiện đại.",
        site: {
          theme: {
            primary: "#7c3aed",
            accent: "#38bdf8",
            background: "#07111f",
            surface: "#10192f",
            text: "#edf4ff",
            muted: "#9bb0d1",
            radius: 24
          },
          layout: [
            { id: "hero-1", type: "hero", variant: "split" },
            { id: "stats-1", type: "stats", variant: "grid" },
            { id: "about-1", type: "about", variant: "split" },
            { id: "skills-1", type: "skills", variant: "grid" },
            { id: "projects-1", type: "projects", variant: "showcase" },
            { id: "experience-1", type: "experience", variant: "timeline" },
            { id: "testimonials-1", type: "testimonials", variant: "cards" },
            { id: "contact-1", type: "contact", variant: "split" }
          ],
          content: baseContent
        }
      },
      {
        id: "concept-creative",
        name: "Creative Pulse",
        summary: "Nổi bật hình ảnh, hợp designer, creator và personal brand.",
        site: {
          theme: {
            primary: "#ec4899",
            accent: "#8b5cf6",
            background: "#170a24",
            surface: "#261139",
            text: "#fff4fb",
            muted: "#d9bfd6",
            radius: 28
          },
          layout: [
            { id: "hero-1", type: "hero", variant: "spotlight" },
            { id: "about-1", type: "about", variant: "card" },
            { id: "projects-1", type: "projects", variant: "showcase" },
            { id: "skills-1", type: "skills", variant: "pills" },
            { id: "testimonials-1", type: "testimonials", variant: "cards" },
            { id: "contact-1", type: "contact", variant: "cta" }
          ],
          content: baseContent
        }
      }
    ],
    meta: { prompt }
  };
}

function sanitizeConcepts(raw, fallback) {
  if (!Array.isArray(raw)) return fallback.concepts;

  const safe = raw.slice(0, 3).map((concept, index) => {
    const fb = fallback.concepts[index] || fallback.concepts[0];
    const site = concept?.site || {};
    const theme = site?.theme || {};
    const layout = Array.isArray(site?.layout) ? site.layout : [];
    const content = site?.content || {};

    const validLayout = layout
      .filter((block) => block && typeof block === "object")
      .map((block, i) => {
        const type = Object.keys(allowedBlocks).includes(block.type) ? block.type : null;
        if (!type) return null;
        const variants = allowedBlocks[type];
        const variant = variants.includes(block.variant) ? block.variant : variants[0];
        return {
          id: block.id || `${type}-${i + 1}`,
          type,
          variant,
        };
      })
      .filter(Boolean);

    return {
      id: concept?.id || fb.id,
      name: concept?.name || fb.name,
      summary: concept?.summary || fb.summary,
      site: {
        theme: {
          primary: theme.primary || fb.site.theme.primary,
          accent: theme.accent || fb.site.theme.accent,
          background: theme.background || fb.site.theme.background,
          surface: theme.surface || fb.site.theme.surface,
          text: theme.text || fb.site.theme.text,
          muted: theme.muted || fb.site.theme.muted,
          radius: Number(theme.radius || fb.site.theme.radius || 24)
        },
        layout: validLayout.length ? validLayout : fb.site.layout,
        content: {
          ...fb.site.content,
          ...content
        }
      }
    };
  });

  return safe.length ? safe : fallback.concepts;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { prompt = "", profile = {} } = req.body || {};
  const fallback = buildFallbackConcepts(prompt, profile);

  try {
    if (!process.env.XAI_API_KEY) {
      return res.status(200).json({
        ...fallback,
        debug: "Missing XAI_API_KEY"
      });
    }

    const systemPrompt = `
Bạn là AI thiết kế website giới thiệu bản thân theo kiến trúc block-tree.
Nhiệm vụ của bạn là tạo RA 3 concept website khác nhau.
Không dùng markdown. Chỉ trả về JSON hợp lệ.

Schema bắt buộc:
{
  "concepts": [
    {
      "id": "slug-ngan",
      "name": "Tên concept",
      "summary": "1 câu mô tả ngắn",
      "site": {
        "theme": {
          "primary": "#RRGGBB",
          "accent": "#RRGGBB",
          "background": "#RRGGBB",
          "surface": "#RRGGBB",
          "text": "#RRGGBB",
          "muted": "#RRGGBB",
          "radius": 24
        },
        "layout": [
          { "id": "hero-1", "type": "hero", "variant": "split" }
        ],
        "content": {
          "name": "",
          "title": "",
          "tagline": "",
          "bio": "",
          "ctaText": "",
          "email": "",
          "phone": "",
          "location": "",
          "website": "",
          "skills": [""],
          "projects": [{ "title": "", "description": "", "link": "" }],
          "experience": [{ "role": "", "company": "", "period": "", "description": "" }],
          "testimonials": [{ "quote": "", "author": "", "role": "" }],
          "stats": [{ "value": "", "label": "" }]
        }
      }
    }
  ]
}

Allowed blocks and variants:
- hero: split, centered, spotlight
- stats: grid, strip
- about: card, split
- skills: pills, grid
- projects: cards, showcase
- experience: timeline, cards
- testimonials: cards
- contact: cta, split

Quy tắc:
- Trả đúng 3 concept.
- Mỗi concept phải khác nhau rõ ràng về tone, theme và layout.
- Layout phải là mảng block hợp lệ theo allowed blocks.
- Nội dung viết bằng tiếng Việt.
- Website dành cho cá nhân giới thiệu bản thân / portfolio / freelance profile.
`;

    const userPrompt = `
Mô tả người dùng: ${prompt || "Tạo website giới thiệu bản thân hiện đại"}

Hồ sơ hiện có:
${JSON.stringify(profile, null, 2)}
`;

    const response = await client.responses.create({
      model: "grok-4.20-reasoning",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const text =
      response.output_text ||
      response.output
        ?.map((item) => (item?.content || []).map((c) => c?.text || "").join(" "))
        .join(" ") ||
      "";

    const parsed = safeParseJson(text);
    const concepts = sanitizeConcepts(parsed?.concepts, fallback);

    return res.status(200).json({
      ok: true,
      provider: "xai",
      concepts,
      meta: {
        prompt,
        model: "grok-4.20-reasoning"
      }
    });
  } catch (error) {
    return res.status(200).json({
      ...fallback,
      error: error?.message || "Unknown error"
    });
  }
}
