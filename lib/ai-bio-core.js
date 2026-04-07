const PERSONAS = ['developer', 'designer', 'marketer', 'freelancer', 'student', 'creator'];
const STYLES = ['minimal', 'dark', 'creative', 'elegant', 'freelancer'];
const SECTIONS = ['about', 'skills', 'projects', 'experience', 'contact'];

const TEMPLATE_LIBRARY = {
  minimal: {
    id: 'minimal',
    name: 'Minimal Pro',
    short: 'Sạch, dễ đọc, phù hợp CV online và portfolio chuyên nghiệp.',
    personaLabel: 'Chuyên nghiệp, tối giản',
    palette: { primary: '#476dff', accent: '#1ea5ff', bg: '#f2f7ff', surface: '#ffffff' },
    sectionOrder: ['about', 'skills', 'projects', 'experience', 'contact'],
  },
  dark: {
    id: 'dark',
    name: 'Dark Developer',
    short: 'Mạnh về công nghệ, nền tối, nhấn kỹ năng và dự án.',
    personaLabel: 'Developer, tech founder',
    palette: { primary: '#7b61ff', accent: '#35d6ff', bg: '#07111f', surface: '#10192f' },
    sectionOrder: ['about', 'skills', 'projects', 'experience', 'contact'],
  },
  creative: {
    id: 'creative',
    name: 'Creative Gradient',
    short: 'Sáng tạo, nổi bật, hợp designer và creator.',
    personaLabel: 'Designer, creator',
    palette: { primary: '#ff6ea8', accent: '#8f76ff', bg: '#15081f', surface: '#25113c' },
    sectionOrder: ['about', 'projects', 'skills', 'experience', 'contact'],
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant Designer',
    short: 'Thanh lịch, cao cấp, màu sáng, hợp trang cá nhân thương hiệu.',
    personaLabel: 'Designer, consultant',
    palette: { primary: '#c78a2b', accent: '#f1d58a', bg: '#f8f0e2', surface: '#fff9ef' },
    sectionOrder: ['about', 'projects', 'experience', 'skills', 'contact'],
  },
  freelancer: {
    id: 'freelancer',
    name: 'Freelancer Spotlight',
    short: 'Tập trung chốt dịch vụ, CTA rõ ràng, hợp freelancer và marketer.',
    personaLabel: 'Freelancer, marketer',
    palette: { primary: '#23a0ff', accent: '#40d69a', bg: '#07111f', surface: '#10233a' },
    sectionOrder: ['about', 'projects', 'skills', 'contact', 'experience'],
  },
};

const PERSONA_ORDER = {
  developer: ['dark', 'minimal', 'freelancer', 'creative', 'elegant'],
  designer: ['creative', 'elegant', 'minimal', 'dark', 'freelancer'],
  marketer: ['freelancer', 'creative', 'elegant', 'minimal', 'dark'],
  freelancer: ['freelancer', 'minimal', 'dark', 'creative', 'elegant'],
  student: ['minimal', 'dark', 'creative', 'freelancer', 'elegant'],
  creator: ['creative', 'freelancer', 'elegant', 'minimal', 'dark'],
};

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    persona: { type: 'string', enum: PERSONAS },
    style: { type: 'string', enum: STYLES },
    summary: { type: 'string' },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          templateId: { type: 'string', enum: Object.keys(TEMPLATE_LIBRARY) },
          title: { type: 'string' },
          subTitle: { type: 'string' },
          reason: { type: 'string' },
          badges: {
            type: 'array',
            items: { type: 'string' },
          },
          sections: {
            type: 'array',
            items: { type: 'string', enum: SECTIONS },
          },
          palette: {
            type: 'object',
            additionalProperties: false,
            properties: {
              bg: { type: 'string' },
              surface: { type: 'string' },
              primary: { type: 'string' },
              accent: { type: 'string' },
            },
            required: ['bg', 'surface', 'primary', 'accent'],
          },
          copy: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              title: { type: 'string' },
              tagline: { type: 'string' },
              bio: { type: 'string' },
              ctaText: { type: 'string' },
              skillsText: { type: 'string' },
              projectsText: { type: 'string' },
              experienceText: { type: 'string' },
            },
            required: ['name', 'title', 'tagline', 'bio', 'ctaText', 'skillsText', 'projectsText', 'experienceText'],
          },
        },
        required: ['templateId', 'title', 'subTitle', 'reason', 'badges', 'sections', 'palette', 'copy'],
      },
    },
  },
  required: ['persona', 'style', 'summary', 'suggestions'],
};

const SYSTEM_PROMPT = [
  'Bạn là AI designer cho một trình tạo website giới thiệu bản thân.',
  'Nhiệm vụ: từ prompt người dùng và hồ sơ hiện tại, đề xuất 3 mẫu website mạnh nhất.',
  'Chỉ được chọn templateId trong danh sách: minimal, dark, creative, elegant, freelancer.',
  'Bạn có thể tùy chỉnh bảng màu, chọn section, và viết lại nội dung ngắn gọn bằng tiếng Việt.',
  'Ưu tiên nội dung thực tế, rõ ràng, không bịa thành tích, không hứa hẹn quá mức.',
  'Nếu người dùng chưa nhập đủ dữ liệu cá nhân, hãy tạo bản nháp trung tính nhưng vẫn hữu ích.',
  'Tiêu đề và subtitle của từng gợi ý phải ngắn, dễ hiểu, mang tính bán hàng.',
  'badges là các nhãn ngắn từ 1-3 từ, ví dụ: Tối giản, Dự án, CTA mạnh.',
  'sections chỉ được dùng các giá trị: about, skills, projects, experience, contact.',
  'Màu sắc phải là mã hex hợp lệ.',
  'ctaText nên là một CTA ngắn như Tải CV, Xem dự án, Liên hệ tôi, Đặt lịch tư vấn.',
  'Trả về đúng JSON theo schema, không bọc markdown, không thêm giải thích ngoài JSON.',
].join(' ');

function normalizeRequestBody(body) {
  const prompt = safeString(body?.prompt, '');
  const persona = PERSONAS.includes(body?.persona) ? body.persona : detectPersonaFromText(prompt);
  const style = STYLES.includes(body?.style) ? body.style : detectStyleFromText(prompt);
  const profile = normalizeProfile(body?.profile || {});

  return {
    prompt,
    persona,
    style,
    profile,
  };
}

function normalizeProfile(profile) {
  return {
    name: safeString(profile?.name, 'Ales Trần'),
    title: safeString(profile?.title, 'Product Builder'),
    tagline: safeString(profile?.tagline, ''),
    bio: safeString(profile?.bio, ''),
    location: safeString(profile?.location, ''),
    email: safeString(profile?.email, ''),
    phone: safeString(profile?.phone, ''),
    websiteLink: safeString(profile?.websiteLink, ''),
    ctaText: safeString(profile?.ctaText, ''),
    skillsText: safeString(profile?.skillsText, ''),
    projectsText: safeString(profile?.projectsText, ''),
    experienceText: safeString(profile?.experienceText, ''),
  };
}

function safeString(value, fallback = '') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function detectPersonaFromText(text) {
  const lower = String(text || '').toLowerCase();
  if (/(developer|lập trình|frontend|backend|fullstack|web dev|kỹ sư|it)/.test(lower)) return 'developer';
  if (/(designer|ui|ux|figma|brand)/.test(lower)) return 'designer';
  if (/(marketing|marketer|seo|funnel|performance|content strategy)/.test(lower)) return 'marketer';
  if (/(freelancer|dịch vụ|service|agency cá nhân)/.test(lower)) return 'freelancer';
  if (/(student|sinh viên|fresher|mới ra trường|thực tập)/.test(lower)) return 'student';
  if (/(creator|content creator|influencer|media kit|koc|kol)/.test(lower)) return 'creator';
  return 'developer';
}

function detectStyleFromText(text) {
  const lower = String(text || '').toLowerCase();
  if (/(dark|nền tối|công nghệ|tech|neo|neon)/.test(lower)) return 'dark';
  if (/(creative|sáng tạo|gradient|rực|nổi bật)/.test(lower)) return 'creative';
  if (/(elegant|thanh lịch|sang trọng|luxury|cao cấp)/.test(lower)) return 'elegant';
  if (/(freelancer|dịch vụ|cta|chuyển đổi|lead)/.test(lower)) return 'freelancer';
  return 'minimal';
}

function buildOpenAIRequest(payload, model) {
  return {
    model,
    instructions: SYSTEM_PROMPT,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: buildUserPrompt(payload),
          },
        ],
      },
    ],
    max_output_tokens: 2400,
    text: {
      format: {
        type: 'json_schema',
        name: 'portfolio_site_suggestions',
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
  };
}

function buildUserPrompt(payload) {
  const templatesSummary = Object.values(TEMPLATE_LIBRARY)
    .map((template) => {
      return `- ${template.id}: ${template.name}. Phong cách: ${template.personaLabel}. Section mặc định: ${template.sectionOrder.join(', ')}.`;
    })
    .join('\n');

  const profile = payload.profile;
  const profileLines = [
    `name: ${profile.name}`,
    `title: ${profile.title}`,
    `tagline: ${profile.tagline}`,
    `bio: ${profile.bio}`,
    `location: ${profile.location}`,
    `email: ${profile.email}`,
    `phone: ${profile.phone}`,
    `websiteLink: ${profile.websiteLink}`,
    `ctaText: ${profile.ctaText}`,
    `skillsText: ${profile.skillsText}`,
    `projectsText: ${profile.projectsText}`,
    `experienceText: ${profile.experienceText}`,
  ].join('\n');

  return [
    `Prompt người dùng: ${payload.prompt || '(không có)'}`,
    `Persona gợi ý: ${payload.persona}`,
    `Style gợi ý: ${payload.style}`,
    'Template library có sẵn:',
    templatesSummary,
    'Hồ sơ hiện tại:',
    profileLines,
    'Hãy chọn 3 template tốt nhất từ thư viện có sẵn, nhưng được phép điều chỉnh bảng màu, badge, section order và nội dung copy.',
    'Giữ văn phong tiếng Việt tự nhiên, ngắn gọn, chuyên nghiệp.',
  ].join('\n\n');
}

function extractStructuredOutput(responseJson) {
  if (typeof responseJson?.output_text === 'string' && responseJson.output_text.trim()) {
    return JSON.parse(responseJson.output_text);
  }

  const outputs = Array.isArray(responseJson?.output) ? responseJson.output : [];
  for (const item of outputs) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      const text = typeof part?.text === 'string' ? part.text : '';
      if (text.trim()) {
        return JSON.parse(text);
      }
    }
  }

  throw new Error('Không đọc được JSON trả về từ OpenAI.');
}

function sanitizeModelOutput(raw, payload) {
  const persona = PERSONAS.includes(raw?.persona) ? raw.persona : payload.persona;
  const style = STYLES.includes(raw?.style) ? raw.style : payload.style;
  const summary = safeString(raw?.summary, 'AI đã tạo 3 gợi ý template.');

  const rawSuggestions = Array.isArray(raw?.suggestions) ? raw.suggestions : [];
  const suggestions = rawSuggestions.slice(0, 3).map((item, index) => sanitizeSuggestion(item, index, payload, persona, style));

  const fallbackTemplateIds = getRecommendationOrder(persona, style);
  while (suggestions.length < 3) {
    suggestions.push(buildFallbackSuggestion(fallbackTemplateIds[suggestions.length], payload, persona, style));
  }

  return { persona, style, summary, suggestions };
}

function sanitizeSuggestion(item, index, payload, persona, style) {
  const fallbackTemplateId = getRecommendationOrder(persona, style)[index] || 'dark';
  const templateId = Object.prototype.hasOwnProperty.call(TEMPLATE_LIBRARY, item?.templateId)
    ? item.templateId
    : fallbackTemplateId;
  const template = TEMPLATE_LIBRARY[templateId] || TEMPLATE_LIBRARY.dark;

  const sections = normalizeSections(item?.sections, template.sectionOrder);
  const badges = normalizeBadges(item?.badges, sections);
  const profile = payload.profile;
  const copy = {
    name: safeString(item?.copy?.name, profile.name),
    title: safeString(item?.copy?.title, profile.title),
    tagline: safeString(item?.copy?.tagline, profile.tagline || `Website cá nhân theo phong cách ${style}.`),
    bio: safeString(item?.copy?.bio, profile.bio || 'Một bản giới thiệu cá nhân ngắn gọn, rõ năng lực và định hướng.'),
    ctaText: safeString(item?.copy?.ctaText, profile.ctaText || defaultCtaByPersona(persona)),
    skillsText: safeString(item?.copy?.skillsText, profile.skillsText || defaultSkillsByPersona(persona)),
    projectsText: safeString(item?.copy?.projectsText, profile.projectsText || defaultProjectsByPersona(persona)),
    experienceText: safeString(item?.copy?.experienceText, profile.experienceText || defaultExperienceByPersona(persona)),
  };

  return {
    id: `ai-suggestion-${index}`,
    templateId,
    title: safeString(item?.title, template.name),
    subTitle: safeString(item?.subTitle, template.short),
    reason: safeString(item?.reason, `Gợi ý phù hợp cho persona ${persona}.`),
    badges,
    sections,
    palette: {
      bg: normalizeHex(item?.palette?.bg, template.palette.bg),
      surface: normalizeHex(item?.palette?.surface, template.palette.surface),
      primary: normalizeHex(item?.palette?.primary, template.palette.primary),
      accent: normalizeHex(item?.palette?.accent, template.palette.accent),
    },
    copy,
  };
}

function normalizeSections(list, fallback) {
  const source = Array.isArray(list) ? list : fallback;
  const unique = [];
  for (const item of source) {
    if (SECTIONS.includes(item) && !unique.includes(item)) {
      unique.push(item);
    }
  }
  if (!unique.length) return [...fallback];
  return unique.slice(0, 5);
}

function normalizeBadges(list, sections) {
  const source = Array.isArray(list) ? list : [];
  const cleaned = source
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 6);
  if (cleaned.length) return cleaned;
  return sections.map(sectionToBadge).slice(0, 5);
}

function normalizeHex(value, fallback) {
  const candidate = String(value || '').trim();
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(candidate) ? candidate : fallback;
}

function getRecommendationOrder(persona, style) {
  const order = [...(PERSONA_ORDER[persona] || PERSONA_ORDER.developer)];
  if (style && order.includes(style)) {
    order.splice(order.indexOf(style), 1);
    order.unshift(style);
  }
  return order;
}

function buildFallbackSuggestion(templateId, payload, persona, style) {
  const template = TEMPLATE_LIBRARY[templateId] || TEMPLATE_LIBRARY.dark;
  return {
    id: `fallback-${template.id}`,
    templateId: template.id,
    title: template.name,
    subTitle: template.short,
    reason: `Template này phù hợp cho ${persona} với phong cách ${style}.`,
    badges: template.sectionOrder.map(sectionToBadge),
    sections: [...template.sectionOrder],
    palette: { ...template.palette },
    copy: {
      name: payload.profile.name,
      title: payload.profile.title,
      tagline: payload.profile.tagline || `Website cá nhân dành cho ${persona}.`,
      bio: payload.profile.bio || 'Một bản giới thiệu cá nhân gọn, rõ và dễ chỉnh sửa.',
      ctaText: payload.profile.ctaText || defaultCtaByPersona(persona),
      skillsText: payload.profile.skillsText || defaultSkillsByPersona(persona),
      projectsText: payload.profile.projectsText || defaultProjectsByPersona(persona),
      experienceText: payload.profile.experienceText || defaultExperienceByPersona(persona),
    },
  };
}

function defaultCtaByPersona(persona) {
  switch (persona) {
    case 'designer':
      return 'Xem dự án';
    case 'marketer':
      return 'Đặt lịch tư vấn';
    case 'freelancer':
      return 'Nhận báo giá';
    case 'creator':
      return 'Xem media kit';
    default:
      return 'Tải CV';
  }
}

function defaultSkillsByPersona(persona) {
  switch (persona) {
    case 'designer':
      return 'UI Design, UX Research, Figma, Design System, Prototype, Branding';
    case 'marketer':
      return 'Performance Marketing, SEO, CRO, Landing Page, Email Marketing, Analytics';
    case 'freelancer':
      return 'Landing Page, Website dịch vụ, UI Design, Copy cơ bản, Client Communication';
    case 'student':
      return 'HTML/CSS, JavaScript, React cơ bản, Git/GitHub, Tự học nhanh';
    case 'creator':
      return 'Storytelling, Content Strategy, Video Script, Social Branding, Community';
    default:
      return 'React, Next.js, TypeScript, UI Engineering, Performance, SEO cơ bản';
  }
}

function defaultProjectsByPersona(persona) {
  switch (persona) {
    case 'designer':
      return 'Portfolio Refresh | Case study thiết kế lại website cá nhân\nBrand Story Site | Trang thương hiệu cá nhân tối giản';
    case 'marketer':
      return 'Service Funnel Page | Landing page thu lead\nExpert Profile | Trang cá nhân cho chuyên gia tư vấn';
    case 'freelancer':
      return 'Freelancer Brand Site | Website giới thiệu dịch vụ\nConsulting Page | Trang chốt lịch tư vấn';
    case 'student':
      return 'CV Online | Website giới thiệu bản thân đầu tiên\nTask App | Ứng dụng quản lý việc cá nhân';
    case 'creator':
      return 'Creator Hub | Trang tổng hợp social và dự án\nBrand Collab Page | Trang hợp tác thương hiệu';
    default:
      return 'AI Bio Builder | Trình tạo portfolio bằng AI\nLaunch Landing | Landing page tối ưu chuyển đổi';
  }
}

function defaultExperienceByPersona(persona) {
  switch (persona) {
    case 'designer':
      return 'UI/UX Designer | Thiết kế web app, website thương hiệu và design system.';
    case 'marketer':
      return 'Growth Marketer | Xây funnel, landing page và campaign performance.';
    case 'freelancer':
      return 'Freelancer | Thiết kế và triển khai website dịch vụ, landing page, portfolio.';
    case 'student':
      return 'Sinh viên năm cuối | Thực hiện dự án học tập và thực tập liên quan tới web.';
    case 'creator':
      return 'Content Creator | Sản xuất nội dung và triển khai hợp tác thương hiệu.';
    default:
      return 'Frontend Developer | Xây landing page, dashboard và website cá nhân.';
  }
}

function sectionToBadge(section) {
  switch (section) {
    case 'about':
      return 'Giới thiệu';
    case 'skills':
      return 'Kỹ năng';
    case 'projects':
      return 'Dự án';
    case 'experience':
      return 'Kinh nghiệm';
    case 'contact':
      return 'Liên hệ';
    default:
      return section;
  }
}

module.exports = {
  TEMPLATE_LIBRARY,
  PERSONAS,
  STYLES,
  SECTIONS,
  normalizeRequestBody,
  buildOpenAIRequest,
  extractStructuredOutput,
  sanitizeModelOutput,
};
