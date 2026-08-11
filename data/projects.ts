export type CoverTheme =
  | "pearlescent-pink"
  | "icy-blue"
  | "chrome"
  | "warm-orange"
  | "floral"
  | "dark-purple"
  | "glass";

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  role: string;
  description: string;
  longDescription: string;
  coverImage: string | null;
  coverTheme: CoverTheme;
  accentColor: string;
  images: string[];
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  songTitle: string;
  songArtist: string;
  audioUrl: string | null;
  durationSeconds: number;
};

export const projects: Project[] = [
  {
    id: "aurora-notes",
    title: "Aurora Notes",
    subtitle: "Soft journaling companion",
    year: "2026",
    role: "Product Design & Engineering",
    description: "A calm writing space with luminous prompts and gentle motion.",
    longDescription:
      "Aurora Notes explores how interface rhythm can feel like listening. Placeholder copy for the project story — replace with the real narrative later.",
    coverImage: null,
    coverTheme: "pearlescent-pink",
    accentColor: "#f3b6c8",
    images: [],
    technologies: ["Next.js", "TypeScript", "Motion"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Morning Bloom (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 151,
  },
  {
    id: "ice-circuit",
    title: "Ice Circuit",
    subtitle: "Spatial systems playground",
    year: "2025",
    role: "Creative Technologist",
    description: "An icy blue experiment in responsive spatial layouts.",
    longDescription:
      "Ice Circuit is a temporary stand-in project used to validate the record-collection interaction model.",
    coverImage: null,
    coverTheme: "icy-blue",
    accentColor: "#9ec8ef",
    images: [],
    technologies: ["Three.js", "R3F", "Zustand"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Glacier Softly (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 168,
  },
  {
    id: "chrome-atelier",
    title: "Chrome Atelier",
    subtitle: "Reflective brand toolkit",
    year: "2025",
    role: "Frontend Engineer",
    description: "Liquid metal surfaces and editorial chrome accents.",
    longDescription:
      "Chrome Atelier focuses on reflective materials and champagne-metal details inside a soft luxury environment.",
    coverImage: null,
    coverTheme: "chrome",
    accentColor: "#c9ccd4",
    images: [],
    technologies: ["React", "Tailwind", "WebGL"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Mirror Room (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 142,
  },
  {
    id: "citrus-orbit",
    title: "Citrus Orbit",
    subtitle: "Warm motion study",
    year: "2024",
    role: "Interaction Designer",
    description: "Sunlit orange forms with playful orbital motion.",
    longDescription:
      "Citrus Orbit is a placeholder for a warmer, more playful project identity in the archive.",
    coverImage: null,
    coverTheme: "warm-orange",
    accentColor: "#f0a66a",
    images: [],
    technologies: ["Motion", "Canvas", "CSS"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Sunset Drift (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 176,
  },
  {
    id: "garden-signal",
    title: "Garden Signal",
    subtitle: "Organic interface study",
    year: "2024",
    role: "Full-Stack Developer",
    description: "Floral textures meeting precise product systems.",
    longDescription:
      "Garden Signal blends botanical softness with structured information design — temporary placeholder content.",
    coverImage: null,
    coverTheme: "floral",
    accentColor: "#d7a8b8",
    images: [],
    technologies: ["Next.js", "Supabase", "Motion"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Petal Frequency (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 159,
  },
  {
    id: "violet-archive",
    title: "Violet Archive",
    subtitle: "Deep-lilac knowledge vault",
    year: "2023",
    role: "Software Engineer",
    description: "A dusk-purple system for collecting quiet research.",
    longDescription:
      "Violet Archive represents a darker pastel cover in the collection — still light and dreamy, never nightclub-dark.",
    coverImage: null,
    coverTheme: "dark-purple",
    accentColor: "#8f6fb5",
    images: [],
    technologies: ["TypeScript", "GraphQL", "R3F"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Dusk Library (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 184,
  },
  {
    id: "glass-harbor",
    title: "Glass Harbor",
    subtitle: "Translucent product narrative",
    year: "2026",
    role: "Design Engineer",
    description: "Smoked glass panels floating over soft terrain.",
    longDescription:
      "Glass Harbor is the translucent cover theme placeholder — ready to be replaced with a real project later.",
    coverImage: null,
    coverTheme: "glass",
    accentColor: "#e7dde8",
    images: [],
    technologies: ["Drei", "GLSL", "Next.js"],
    githubUrl: "#",
    liveUrl: "#",
    songTitle: "Harbor Haze (Placeholder)",
    songArtist: "Vera Faith Archive",
    audioUrl: null,
    durationSeconds: 155,
  },
];

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id) ?? null;
}

export function getProjectIndex(id: string) {
  return projects.findIndex((project) => project.id === id);
}
