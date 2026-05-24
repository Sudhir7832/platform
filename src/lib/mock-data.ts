// ===== Mock Data for PulseSync Dashboard =====

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  media?: string[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    clicks: number;
  };
}

export interface AnalyticsData {
  date: string;
  reach: number;
  engagement: number;
  followers: number;
  clicks: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending";
  lastActive: Date;
}

export interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

export interface TrendingHashtag {
  tag: string;
  posts: number;
  growth: number;
  platform: string;
}

// ===== Dashboard Stats =====
export const dashboardStats = {
  totalPosts: 1247,
  totalReach: 2840000,
  engagement: 4.8,
  followers: 158400,
  growthRate: 12.5,
  scheduledPosts: 23,
  drafts: 8,
  activeAccounts: 6,
};

// ===== Recent Posts =====
export const recentPosts: Post[] = [
  {
    id: "1",
    content:
      "🚀 Excited to announce our new AI-powered content optimization feature! Create better posts in half the time. #AI #SocialMedia #ContentCreation",
    platforms: ["instagram", "twitter", "linkedin"],
    status: "published",
    publishedAt: new Date(Date.now() - 2 * 3600000),
    engagement: { likes: 842, comments: 156, shares: 234, reach: 45200, clicks: 1823 },
  },
  {
    id: "2",
    content:
      "The future of social media management is here. Automate, optimize, and grow your audience across every platform. 💡",
    platforms: ["instagram", "facebook", "linkedin", "twitter"],
    status: "published",
    publishedAt: new Date(Date.now() - 8 * 3600000),
    engagement: { likes: 1205, comments: 89, shares: 456, reach: 78300, clicks: 2456 },
  },
  {
    id: "3",
    content:
      "5 tips to boost your engagement rate this week:\n1. Post at optimal times\n2. Use trending hashtags\n3. Engage with comments\n4. Share user-generated content\n5. Experiment with Reels/Shorts",
    platforms: ["instagram", "linkedin", "threads"],
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 4 * 3600000),
    engagement: { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 },
  },
  {
    id: "4",
    content:
      "Behind the scenes of our product development process. Building something amazing for creators worldwide! 🎨✨",
    platforms: ["instagram", "tiktok", "twitter"],
    status: "published",
    publishedAt: new Date(Date.now() - 24 * 3600000),
    engagement: { likes: 2341, comments: 312, shares: 567, reach: 125000, clicks: 4521 },
  },
  {
    id: "5",
    content:
      "What's your biggest social media challenge? Drop a comment below! We're building solutions for every creator. 👇",
    platforms: ["twitter", "threads", "facebook"],
    status: "published",
    publishedAt: new Date(Date.now() - 48 * 3600000),
    engagement: { likes: 567, comments: 234, shares: 89, reach: 34500, clicks: 987 },
  },
  {
    id: "6",
    content:
      "New blog post: How to create a content calendar that actually works. Link in bio! 📅",
    platforms: ["instagram", "pinterest", "linkedin"],
    status: "draft",
    engagement: { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 },
  },
];

// ===== Analytics Data (30 days) =====
export const analyticsData: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseReach = 80000 + Math.random() * 40000;
  const trend = i * 800;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    reach: Math.round(baseReach + trend + (Math.random() - 0.5) * 20000),
    engagement: Math.round(3000 + Math.random() * 2000 + i * 80),
    followers: Math.round(150000 + i * 280 + Math.random() * 500),
    clicks: Math.round(1500 + Math.random() * 1000 + i * 50),
  };
});

// ===== Platform Analytics =====
export const platformAnalytics = [
  { platform: "Instagram", followers: 52400, engagement: 5.2, reach: 890000, posts: 145, color: "#E4405F" },
  { platform: "Twitter/X", followers: 34200, engagement: 3.8, reach: 650000, posts: 312, color: "#1DA1F2" },
  { platform: "LinkedIn", followers: 28100, engagement: 6.1, reach: 420000, posts: 89, color: "#0A66C2" },
  { platform: "Facebook", followers: 18700, engagement: 2.9, reach: 340000, posts: 124, color: "#1877F2" },
  { platform: "TikTok", followers: 15800, engagement: 8.4, reach: 1200000, posts: 67, color: "#00F2EA" },
  { platform: "Pinterest", followers: 9200, engagement: 4.5, reach: 180000, posts: 98, color: "#BD081C" },
];

// ===== Audience Demographics =====
export const audienceDemographics = [
  { name: "18-24", value: 28, color: "#7c3aed" },
  { name: "25-34", value: 35, color: "#3b82f6" },
  { name: "35-44", value: 22, color: "#06b6d4" },
  { name: "45-54", value: 10, color: "#a78bfa" },
  { name: "55+", value: 5, color: "#6366f1" },
];

// ===== Team Members =====
export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@pulsesync.com",
    avatar: "SJ",
    role: "owner",
    status: "active",
    lastActive: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex@pulsesync.com",
    avatar: "AC",
    role: "admin",
    status: "active",
    lastActive: new Date(Date.now() - 1800000),
  },
  {
    id: "3",
    name: "Maria Garcia",
    email: "maria@pulsesync.com",
    avatar: "MG",
    role: "editor",
    status: "active",
    lastActive: new Date(Date.now() - 7200000),
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james@pulsesync.com",
    avatar: "JW",
    role: "editor",
    status: "active",
    lastActive: new Date(Date.now() - 86400000),
  },
  {
    id: "5",
    name: "Emily Davis",
    email: "emily@pulsesync.com",
    avatar: "ED",
    role: "viewer",
    status: "pending",
    lastActive: new Date(Date.now() - 172800000),
  },
];

// ===== Notifications =====
export const notifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Post Published",
    message: "Your post was published to Instagram, Twitter, and LinkedIn",
    time: new Date(Date.now() - 300000),
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "AI Suggestion",
    message: "Optimal posting time for your audience is 2:00 PM EST today",
    time: new Date(Date.now() - 1800000),
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Engagement Drop",
    message: "Your Instagram engagement dropped 15% this week. Try posting Reels.",
    time: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: "4",
    type: "success",
    title: "Milestone Reached",
    message: "You've crossed 50K followers on Instagram! 🎉",
    time: new Date(Date.now() - 7200000),
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Trending Topic",
    message: "#AIContent is trending. Consider creating related content.",
    time: new Date(Date.now() - 14400000),
    read: true,
  },
];

// ===== Trending Hashtags =====
export const trendingHashtags: TrendingHashtag[] = [
  { tag: "#AIContent", posts: 125000, growth: 234, platform: "instagram" },
  { tag: "#ContentCreator", posts: 890000, growth: 12, platform: "tiktok" },
  { tag: "#DigitalMarketing", posts: 450000, growth: 8, platform: "linkedin" },
  { tag: "#SocialMediaTips", posts: 320000, growth: 45, platform: "twitter" },
  { tag: "#CreatorEconomy", posts: 78000, growth: 67, platform: "twitter" },
  { tag: "#VideoMarketing", posts: 210000, growth: 23, platform: "tiktok" },
  { tag: "#BrandStrategy", posts: 95000, growth: 31, platform: "linkedin" },
  { tag: "#ViralContent", posts: 560000, growth: 89, platform: "instagram" },
];

// ===== Calendar Events =====
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  platforms: string[];
  status: "scheduled" | "published" | "draft";
  color: string;
}

export const calendarEvents: CalendarEvent[] = (() => {
  const now = new Date();
  const events: CalendarEvent[] = [];
  const titles = [
    "Product Launch Announcement",
    "Behind the Scenes",
    "Weekly Tips Thread",
    "User Testimonial Share",
    "Industry News Roundup",
    "Tutorial: Getting Started",
    "Community Q&A",
    "Feature Spotlight",
    "Engagement Post",
    "Milestone Celebration",
    "Blog Post Promotion",
    "Live Session Promo",
    "Contest Announcement",
    "Partner Spotlight",
    "Monthly Analytics Review",
  ];

  for (let i = 0; i < 15; i++) {
    const dayOffset = Math.floor(Math.random() * 28) - 7;
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const hours = 8 + Math.floor(Math.random() * 12);
    const minutes = Math.random() > 0.5 ? 30 : 0;

    const platformSets = [
      ["instagram", "twitter"],
      ["linkedin", "facebook"],
      ["tiktok", "instagram"],
      ["twitter", "threads"],
      ["instagram", "linkedin", "facebook"],
      ["twitter"],
      ["instagram", "tiktok", "twitter"],
    ];

    const colors = ["#7c3aed", "#3b82f6", "#06b6d4", "#a78bfa", "#6366f1"];

    events.push({
      id: `cal-${i}`,
      title: titles[i],
      date: date,
      time: `${hours}:${minutes === 0 ? "00" : "30"}`,
      platforms: platformSets[i % platformSets.length],
      status: dayOffset < 0 ? "published" : dayOffset === 0 ? "scheduled" : "scheduled",
      color: colors[i % colors.length],
    });
  }

  return events;
})();

// ===== AI Chat Messages =====
export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const aiChatMessages: AIChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Can you help me write a post about our new feature launch?",
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Of course! Here's a compelling post for your feature launch:\n\n🚀 **Big News!** We just launched [Feature Name] — and it's going to change how you create content.\n\nHere's what makes it special:\n✨ AI-powered optimization\n📊 Real-time analytics\n⚡ 10x faster workflow\n\nTry it free today → [link]\n\n#ProductLaunch #Innovation #ContentCreation\n\nWant me to adapt this for specific platforms?",
    timestamp: new Date(Date.now() - 540000),
  },
  {
    id: "3",
    role: "user",
    content: "Yes, please adapt it for LinkedIn and make it more professional",
    timestamp: new Date(Date.now() - 480000),
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Here's the LinkedIn version:\n\n---\n\nI'm thrilled to share that we've just launched [Feature Name] — a breakthrough in content creation technology.\n\nAfter months of development and feedback from 500+ beta users, we've built something that genuinely transforms the content workflow:\n\n→ AI-powered content optimization that learns your brand voice\n→ Real-time performance analytics across all platforms\n→ Workflow automation that saves 10+ hours per week\n\nThe early results have been incredible: beta users reported a 340% increase in engagement and 60% reduction in content creation time.\n\nIf you're a content creator, marketer, or business owner managing multiple platforms, I'd love for you to try it.\n\nLink in comments 👇\n\n#ContentCreation #AI #SocialMediaMarketing #ProductLaunch #MarTech",
    timestamp: new Date(Date.now() - 420000),
  },
];

// ===== Pricing Plans =====
export interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started",
    features: [
      "3 social accounts",
      "30 posts per month",
      "Basic analytics",
      "Content calendar",
      "1 user",
      "Community support",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: 29,
    yearlyPrice: 24,
    description: "For growing creators & businesses",
    features: [
      "15 social accounts",
      "Unlimited posts",
      "Advanced analytics",
      "AI content optimization",
      "Viral score & best time AI",
      "Smart content repurposing",
      "5 team members",
      "Priority support",
      "Custom branding",
      "API access",
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    name: "Agency",
    price: 99,
    yearlyPrice: 79,
    description: "For teams & agencies at scale",
    features: [
      "Unlimited social accounts",
      "Unlimited posts",
      "Enterprise analytics",
      "AI content suite",
      "Competitor tracking",
      "AI auto-reply assistant",
      "Unlimited team members",
      "Approval workflows",
      "White-label reports",
      "Dedicated account manager",
      "SSO & advanced security",
      "Custom integrations",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
];

// ===== Testimonials =====
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  platform: string;
  followers: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Jessica Park",
    role: "Content Creator",
    company: "@jessicapark",
    avatar: "JP",
    content:
      "PulseSync saved me 15+ hours per week. I used to copy-paste posts across 6 platforms manually. Now it's one click and done. The AI caption adaptation is genuinely magical.",
    platform: "instagram",
    followers: "2.4M",
  },
  {
    id: "2",
    name: "Marcus Chen",
    role: "Marketing Director",
    company: "TechFlow Inc.",
    avatar: "MC",
    content:
      "We manage 40+ client accounts. PulseSync's team workflows and approval system made our agency 3x more efficient. The analytics alone are worth the price.",
    platform: "linkedin",
    followers: "180K",
  },
  {
    id: "3",
    name: "Aria Williams",
    role: "Social Media Manager",
    company: "Bloom Studio",
    avatar: "AW",
    content:
      "The viral score feature is insanely accurate. It predicted our top-performing posts with 90% accuracy. Our engagement jumped 250% in 3 months.",
    platform: "tiktok",
    followers: "890K",
  },
  {
    id: "4",
    name: "David Kim",
    role: "Founder & CEO",
    company: "Kreativ Labs",
    avatar: "DK",
    content:
      "I've tried Buffer, Hootsuite, Later — nothing comes close to PulseSync. The UI is gorgeous and the AI features are years ahead of the competition.",
    platform: "twitter",
    followers: "156K",
  },
];

// ===== Features List =====
export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  {
    title: "AI Smart Adaptation",
    description:
      "AI automatically rewrites captions for each platform's style — professional for LinkedIn, engaging for Instagram, concise for Twitter.",
    icon: "sparkles",
  },
  {
    title: "Viral Score Prediction",
    description:
      "Real-time AI analysis predicts your content's viral probability before you publish. Optimize for maximum impact.",
    icon: "zap",
  },
  {
    title: "Best Time AI",
    description:
      "Machine learning analyzes your audience activity, platform trends, and engagement history to recommend optimal posting times.",
    icon: "clock",
  },
  {
    title: "Smart Repurposing",
    description:
      "Convert a LinkedIn post into a Twitter thread, a tweet into an Instagram caption, or a video script into Shorts captions.",
    icon: "repeat",
  },
  {
    title: "One-Click Cross Posting",
    description:
      "A single publish button pushes your content to every selected platform simultaneously with platform-optimized formatting.",
    icon: "send",
  },
  {
    title: "AI Auto-Reply",
    description:
      "AI monitors and responds to comments and messages across all platforms, maintaining your brand voice 24/7.",
    icon: "message-circle",
  },
  {
    title: "Competitor Tracker",
    description:
      "Track competitor engagement, posting frequency, and content strategies. Get actionable insights to stay ahead.",
    icon: "target",
  },
  {
    title: "Trend Discovery",
    description:
      "Real-time trending topics and viral hashtags across all platforms. Never miss a trending moment.",
    icon: "trending-up",
  },
];

// ===== Landing Page Stats =====
export const landingStats = [
  { label: "Posts Published", value: 12500000, suffix: "+" },
  { label: "Active Creators", value: 50000, suffix: "+" },
  { label: "Platforms", value: 9, suffix: "" },
  { label: "Time Saved", value: 15, suffix: "hrs/week" },
];
