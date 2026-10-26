"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Theme = "light" | "dark";

type Experience = {
  id: number;
  role: string;
  company: string;
  duration: string;
  desc: string;
};

type Education = {
  id: number;
  degree: string;
  college: string;
  year: string;
};

type Basics = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
};

type Snapshot = {
  data: Basics;
  experiences: Experience[];
  educations: Education[];
  skills: string;
  jobDesc: string;
  date: string;
};

const STORAGE_KEY = "resume_pro_data_v2";
const HISTORY_KEY = "resume_history_v2";

const playSound = (type: "click" | "hover" | "success") => {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const frequency =
      type === "click" ? 800 : type === "hover" ? 1200 : 600;

    oscillator.frequency.setValueAtTime(frequency, now);

    if (type === "success") {
      oscillator.frequency.linearRampToValueAtTime(1200, now + 0.2);
    }

    gain.gain.setValueAtTime(
      type === "hover" ? 0.025 : type === "click" ? 0.05 : 0.08,
      now
    );
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscillator.start(now);
    oscillator.stop(now + 0.26);
    oscillator.onended = () => void ctx.close();
  } catch {
    // Sound is optional; the tool still works without it.
  }
};

const defaultData: Basics = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
};

const defaultExperience: Experience[] = [
  {
    id: 1,
    role: "",
    company: "",
    duration: "",
    desc: "",
  },
];

const defaultEducation: Education[] = [
  {
    id: 1,
    degree: "",
    college: "",
    year: "",
  },
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getKeywords = (jobDesc: string): string[] => {
  const words: string[] = jobDesc.toLowerCase().match(/[a-z0-9+#.]+/g) || [];
  return Array.from(
    new Set(words.filter((word: string) => word.length > 2))
  ).slice(0, 100);
};
function HighlightText({
  text,
  keywords,
}: {
  text: string;
  keywords: string[];
}) {
  const validKeywords = keywords
    .filter((word) => word.length > 2)
    .sort((a, b) => b.length - a.length);

  if (!text || validKeywords.length === 0) return <>{text}</>;

  const pattern = new RegExp(
    `(${validKeywords.map(escapeRegExp).join("|")})`,
    "gi"
  );

  return (
    <>
      {text.split(pattern).map((part, index) => {
        const matched = validKeywords.some(
          (word) => word.toLowerCase() === part.toLowerCase()
        );

        return matched ? (
          <mark
            key={`${index}-${part}`}
            className="rounded bg-emerald-300/70 px-0.5 text-zinc-900 print:bg-transparent print:text-black"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${index}-${part}`}>
            {part}
          </React.Fragment>
        );
      })}
    </>
  );
}

function downloadBlob(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const safeFilename = (name: string) =>
  (name.trim() || "Resume")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, "_");

const buildResumeText = (
  data: Basics,
  experiences: Experience[],
  educations: Education[],
  skills: string
) => {
  const sections = [
    data.name,
    data.title,
    [data.email, data.phone, data.location].filter(Boolean).join(" | "),
    data.linkedin,
    data.website,
    "",
    "PROFESSIONAL SUMMARY",
    data.summary,
    "",
    "WORK EXPERIENCE",
    ...experiences
      .filter((item) => item.role || item.company || item.desc)
      .flatMap((item) => [
        `${item.role}${item.company ? ` — ${item.company}` : ""}`,
        item.duration,
        item.desc,
        "",
      ]),
    "EDUCATION",
    ...educations
      .filter((item) => item.degree || item.college || item.year)
      .flatMap((item) => [
        `${item.degree}${item.college ? ` — ${item.college}` : ""}`,
        item.year,
      ]),
    "",
    "SKILLS",
    skills,
  ];

  return sections.join("\n").trim();
};

const seoSections = [
  {
    title: "How to create a professional resume",
    content: `Start with accurate contact information, a clear professional title, and a short summary that describes your experience and the value you can bring to an employer. Organize your work experience in reverse chronological order so that your latest role appears first. Include your responsibilities, projects, tools, and outcomes where they are relevant.

Use concise language and make every bullet point specific. Instead of writing a long paragraph about routine duties, explain what you did, how you did it, and what changed as a result. Use measurable results only when you can verify them. If you do not have formal work experience, include internships, personal projects, volunteer work, coursework, and relevant practical training.

Choose a resume template that fits the job and industry. A simple, readable layout is often a safer choice for applications processed by applicant tracking systems. Before exporting, check spelling, dates, links, headings, and contact details.`,
  },
  {
    title: "What is an ATS-friendly resume?",
    content: `An applicant tracking system (ATS) is software employers may use to collect, organize, search, and manage job applications. Different employers use different systems and configurations, so there is no single formatting rule that guarantees a resume will pass every ATS.

For better readability, use standard section headings such as Professional Summary, Work Experience, Education, and Skills. Include relevant terminology from the job description when it accurately describes your skills and experience. Avoid keyword stuffing, hidden text, and claims you cannot support. Make sure your resume communicates the same qualifications clearly to both software and human reviewers.

This builder provides a local keyword comparison that identifies words appearing in the job description but not in selected resume text. Its percentage is an estimate generated by this tool, not a score from a real employer ATS. It cannot predict interview selection, hiring decisions, or compatibility with every recruitment platform.`,
  },
  {
    title: "How to tailor a resume to a job description",
    content: `Read the job description carefully and identify its core responsibilities, required skills, preferred qualifications, and industry terminology. Compare these requirements with your actual experience. Move the most relevant skills and achievements into the sections where a recruiter can find them easily.

Use the job description as a guide, not as a script to copy. Do not list a technology, certificate, language, or responsibility unless it genuinely applies to you. If a requirement is missing from your background, consider whether a related project or transferable skill provides honest evidence of your ability.

After tailoring your resume, read it from the employer's perspective. Can a reader quickly understand your role, the work you performed, the tools you used, and the outcomes you achieved? Keep dates consistent and explain gaps or transitions when relevant to the application.`,
  },
  {
    title: "Writing stronger resume bullet points",
    content: `A useful resume bullet typically starts with a clear action verb and describes a specific contribution. Depending on your role, verbs such as developed, designed, organized, analyzed, maintained, taught, tested, coordinated, or improved may be appropriate.

Add context where it helps the reader understand the scope of your work. Include a result, metric, or outcome when you have reliable evidence. For example, if you actually reduced a process from five steps to three, explain that improvement. If you cannot measure the result, describe the deliverable or responsibility accurately instead.

Avoid vague phrases such as “responsible for everything” or “hard-working team player” when a concrete example would be more informative. Do not invent revenue, user counts, percentages, rankings, or performance gains. This builder's bullet enhancement is a writing aid; always review its output before using it in an application.`,
  },
  {
    title: "Resume skills, education, and projects",
    content: `List skills that are relevant to the target role and that you can discuss confidently in an interview. Group related tools or abilities when this improves readability. Be specific where useful: naming a programming language, software package, teaching method, or analytical tool is often clearer than writing “computer skills.”

For education, include your degree or qualification, institution, and completion date or expected graduation date. Add grades, certifications, awards, or coursework when they are relevant and accurate. Recent graduates may place education and projects higher on the page than candidates with extensive professional experience.

Projects can demonstrate practical ability, particularly for entry-level candidates and career changers. Describe the project's purpose, your contribution, the technologies or methods used, and the result. Include a working portfolio or project link if you have one. Never imply that a personal project was paid employment or that a team result was solely your own work.`,
  },
  {
    title: "Resume PDF, Word, and plain-text formats",
    content: `A PDF is useful when you want to preserve the visual appearance of a document. A Word document may be requested by employers or recruitment agencies that need an editable file. Plain text can help you inspect the content order and identify layout problems. A JSON export is useful for retaining structured data or transferring it to compatible tools.

Always follow the employer's application instructions. After exporting, open the file and check that text has not been cut off, special characters display correctly, and links and dates remain readable. PDF export from a browser-based editor may render the resume as a visual page, while a plain-text export prioritizes text. Different formats can therefore look different.

Keep a copy of the editable information as well as the final version you submit. Use clear filenames, update the document for each relevant role, and avoid including sensitive personal information that the employer does not need.`,
  },
  {
    title: "Resume privacy and local storage",
    content: `Resume information can contain personal data such as your phone number, email address, employment history, and education. This version saves drafts and version history in the browser's local storage on the device you use. It does not include a server-based account or cloud synchronization system.

Anyone with access to the same browser profile or device may be able to access locally saved information. Avoid using a shared or public computer for sensitive resume work. Downloaded exports and uploaded profile photos may remain in your device's files or browser session. Remove saved information from the browser when appropriate, and be careful when sharing resume links, files, or screenshots.

The share function uses your device's native share menu when available and may share the text you choose with an app or person you select. Review the content and destination before confirming a share.`,
  },
];

const faqs = [
  {
    q: "Is this resume builder free to use?",
    a: "The component runs in your browser and does not require a paid API for its built-in editing, keyword comparison, and exports. Your hosting environment or other services may have separate costs.",
  },
  {
    q: "Does the ATS score guarantee that my resume will pass an ATS?",
    a: "No. The displayed score is a basic local estimate based on contact details, skills, summary length, work history, and keyword overlap. Employers use different systems, and this tool cannot reproduce their private screening rules.",
  },
  {
    q: "Can I export my resume as a PDF?",
    a: "Yes. The PDF action captures the resume preview and creates a PDF file. Always open the downloaded PDF to check page breaks, text size, and layout before submitting it.",
  },
  {
    q: "Can I share my resume directly?",
    a: "Yes. Use Share Resume to open your device's native share sheet when supported. If that feature is unavailable, the tool copies the resume text so you can paste it into a message or document.",
  },
  {
    q: "Does the builder upload my resume to a server?",
    a: "The code below stores drafts in local browser storage and performs its built-in comparisons in the browser. Hosting, analytics, or third-party code added separately to your website may have their own data practices.",
  },
  {
    q: "Should I include a photo and QR code on every resume?",
    a: "Not necessarily. Expectations vary by country, industry, and employer. Use a photo only when appropriate for the application. A LinkedIn QR code is optional and should point to a correct, professional profile.",
  },
  {
    q: "How should I use keywords from a job description?",
    a: "Include relevant terms only when they accurately describe your skills or experience. Do not stuff keywords or claim qualifications you do not have. Review the missing keyword list as a prompt for tailoring, not as a requirement to add every word.",
  },
  {
    q: "Why should I review AI-enhanced bullet points?",
    a: "Automated writing suggestions can improve clarity but may misrepresent the work if accepted without review. Verify every responsibility, tool, metric, date, and achievement before submitting the resume.",
  },
];

export default function ResumeBuilderUltimate() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [showATS, setShowATS] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [atsDetails, setAtsDetails] = useState<{
    matched: number;
    total: number;
    missing: string[];
    jdScore: number;
    tips: string[];
  }>({
    matched: 0,
    total: 0,
    missing: [],
    jdScore: 0,
    tips: [],
  });

  const [data, setData] = useState<Basics>(defaultData);
  const [experiences, setExperiences] =
    useState<Experience[]>(defaultExperience);
  const [educations, setEducations] =
    useState<Education[]>(defaultEducation);
  const [skills, setSkills] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(true);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [lastSaved, setLastSaved] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const resumeRef = useRef<HTMLDivElement>(null);
  const photoUrlRef = useRef<string | null>(null);

  const keywords = useMemo(() => getKeywords(jobDesc), [jobDesc]);

  const filteredExperiences = experiences.filter((item) =>
    `${item.role} ${item.company} ${item.desc}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const resumeText = useMemo(
    () => buildResumeText(data, experiences, educations, skills),
    [data, experiences, educations, skills]
  );

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(data.name.trim()),
      Boolean(data.title.trim()),
      Boolean(data.email.includes("@")),
      Boolean(data.phone.trim()),
      Boolean(data.summary.trim()),
      experiences.some((item) => Boolean(item.role.trim() || item.desc.trim())),
      educations.some((item) => Boolean(item.degree.trim())),
      Boolean(skills.trim()),
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [data, experiences, educations, skills]);

  // Restore saved draft and history.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed.data) setData({ ...defaultData, ...parsed.data });
        if (Array.isArray(parsed.experiences)) {
          setExperiences(parsed.experiences);
        }
        if (Array.isArray(parsed.educations)) {
          setEducations(parsed.educations);
        }
        if (typeof parsed.skills === "string") setSkills(parsed.skills);
        if (typeof parsed.jobDesc === "string") setJobDesc(parsed.jobDesc);
      }

      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) setHistory(parsedHistory);
      }
    } catch {
      setStatusMessage("Saved data could not be restored from this browser.");
    }
  }, []);

  // Auto-save and keep a maximum of 10 distinct snapshots.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const payload: Snapshot = {
          data,
          experiences,
          educations,
          skills,
          jobDesc,
          date: new Date().toLocaleString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

        const previous = localStorage.getItem(HISTORY_KEY);
        const previousHistory: Snapshot[] = previous
          ? JSON.parse(previous)
          : [];

        const signature = JSON.stringify({
          data,
          experiences,
          educations,
          skills,
          jobDesc,
        });

        const previousSignature = previousHistory[0]
          ? JSON.stringify({
              data: previousHistory[0].data,
              experiences: previousHistory[0].experiences,
              educations: previousHistory[0].educations || [],
              skills: previousHistory[0].skills,
              jobDesc: previousHistory[0].jobDesc,
            })
          : "";

        let nextHistory = previousHistory;

        if (signature !== previousSignature) {
          nextHistory = [payload, ...previousHistory].slice(0, 10);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
          setHistory(nextHistory);
        }

        setLastSaved(new Date().toLocaleTimeString());
      } catch {
        setStatusMessage(
          "Auto-save is unavailable. Your browser storage may be full or disabled."
        );
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [data, experiences, educations, skills, jobDesc]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  const updateData = (key: keyof Basics, value: string) => {
    setData((previous) => ({ ...previous, [key]: value }));
  };

  const calculateATS = () => {
    const text = [
      data.title,
      data.summary,
      experiences.map((item) => `${item.role} ${item.desc}`).join(" "),
      educations.map((item) => `${item.degree} ${item.college}`).join(" "),
      skills,
    ]
      .join(" ")
      .toLowerCase();

    const uniqueJD = getKeywords(jobDesc);
    const matched = uniqueJD.filter((word) => text.includes(word));
    const missing = uniqueJD.filter((word) => !text.includes(word)).slice(0, 15);

    const tips: string[] = [];

    if (!data.email.includes("@")) tips.push("Add a valid email address.");
    if (!data.phone.trim()) tips.push("Add your phone number.");
    if (data.summary.trim().length < 80) {
      tips.push("Consider writing a more informative professional summary.");
    }
    if (!skills.trim()) tips.push("Add skills relevant to your target role.");
    if (!experiences.some((item) => item.role.trim() || item.desc.trim())) {
      tips.push("Add relevant work experience, internships, or projects.");
    }
    if (jobDesc.trim() && uniqueJD.length > 0 && missing.length > 0) {
      tips.push("Review missing keywords and add only those that accurately describe your experience.");
    }

    const completeness =
      (data.name.trim() ? 10 : 0) +
      (data.title.trim() ? 10 : 0) +
      (data.email.includes("@") ? 10 : 0) +
      (data.phone.trim() ? 5 : 0) +
      (data.linkedin.trim() ? 5 : 0) +
      (data.summary.trim().length >= 80 ? 15 : data.summary.trim() ? 8 : 0) +
      (skills.split(",").filter((item) => item.trim()).length >= 5 ? 15 : skills.trim() ? 8 : 0) +
      (experiences.some((item) => item.role.trim() || item.desc.trim()) ? 15 : 0) +
      (educations.some((item) => item.degree.trim()) ? 5 : 0);

    const jdScore = uniqueJD.length
      ? Math.round((matched.length / uniqueJD.length) * 25)
      : 0;

    const score = Math.min(
      100,
      completeness + jdScore
    );

    setAtsScore(score);
    setAtsDetails({
      matched: matched.length,
      total: uniqueJD.length,
      missing,
      jdScore,
      tips,
    });
    setShowATS(true);
    playSound("success");
  };

  const enhanceBullet = (text: string) => {
    const clean = text.trim();
    if (!clean) return text;

    // Writing assistance only: do not invent metrics, users, or outcomes.
    const firstLetter = clean.charAt(0).toLowerCase();
    const rest = clean.slice(1);
    const normalized = `${firstLetter}${rest}`;

    const verbs = [
      "Developed",
      "Designed",
      "Built",
      "Created",
      "Managed",
      "Improved",
      "Analyzed",
      "Implemented",
      "Coordinated",
      "Maintained",
      "Delivered",
      "Led",
      "Tested",
      "Optimized",
      "Supported",
    ];

    if (verbs.some((verb) => clean.startsWith(verb))) return clean;

    return `Developed ${normalized}`;
  };

  const updateExperience = (
    id: number,
    key: keyof Experience,
    value: string
  ) => {
    setExperiences((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  const updateEducation = (
    id: number,
    key: keyof Education,
    value: string
  ) => {
    setEducations((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  const moveExperience = (from: number, to: number) => {
    setExperiences((previous) => {
      const next = [...previous];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    playSound("click");
  };

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage("Please choose an image smaller than 5 MB.");
      return;
    }

    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);

    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;
    setPhoto(url);
    setStatusMessage("Profile photo selected. It is not included in local-storage autosave.");
    playSound("success");
  };
  const downloadPDF = async () => {
    playSound("click");
    if (!resumeRef.current) return;
    const canvas = await html2canvas(resumeRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${safeFilename(data.name)}_resume.pdf`);
  };

  const downloadTextPDF = () => {
    playSound("click");
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 15;
    let y = 20;
    const pageH = pdf.internal.pageSize.getHeight();

    const addText = (text: string, size = 11, bold = false) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      const lines = pdf.splitTextToSize(text, 180);
      if (y + lines.length * 5 > pageH - 15) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines, margin, y);
      y += lines.length * 5 + 3;
    };

    addText(data.name || "Your Name", 22, true);
    addText(data.title || "Professional Title", 12, true);
    addText([data.email, data.phone, data.location].filter(Boolean).join(" | "), 9);
    addText("", 2);
    addText("PROFESSIONAL SUMMARY", 10, true);
    addText(data.summary || "", 10);
    addText("", 2);
    addText("WORK EXPERIENCE", 10, true);
    experiences
      .filter((i) => i.role || i.desc)
      .forEach((e) => {
        addText(`${e.role} — ${e.company}`, 10, true);
        addText(e.duration, 8);
        addText(e.desc, 10);
      });
    addText("", 2);
    addText("EDUCATION", 10, true);
    educations
      .filter((i) => i.degree)
      .forEach((e) => {
        addText(`${e.degree}`, 10, true);
        addText(`${e.college} ${e.year}`, 9);
      });
    addText("", 2);
    addText("SKILLS", 10, true);
    addText(skills, 10);

    pdf.save(`${safeFilename(data.name)}_ATS_Text.pdf`);
  };

  const downloadTXT = () => {
    playSound("click");
    downloadBlob(
      `${safeFilename(data.name)}_ATS.txt`,
      resumeText,
      "text/plain;charset=utf-8"
    );
  };

  const downloadJSON = () => {
    playSound("click");

    const payload = {
      basics: data,
      work: experiences,
      education: educations,
      skills: skills.split(",").map((item) => item.trim()).filter(Boolean),
      jobDescription: jobDesc,
      atsEstimate: atsScore,
      exportedAt: new Date().toISOString(),
    };

    downloadBlob(
      `${safeFilename(data.name)}_Resume.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
  };
  const downloadDOC = () => {
    playSound("click");

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[char];
      });

    const experienceHTML = experiences
      .filter((item) => item.role || item.company)
      .map(
        (item) => `
        <h3>${escapeHtml(item.role)}</h3>
        <p><strong>${escapeHtml(item.company)}</strong> ${escapeHtml(item.duration)}</p>
        <p>${escapeHtml(item.desc).replace(/\n/g, "<br/>")}</p>
      `
      )
      .join("");

    const educationHTML = educations
      .filter((item) => item.degree || item.college)
      .map(
        (item) => `
        <p><strong>${escapeHtml(item.degree)}</strong></p>
        <p>${escapeHtml(item.college)} ${escapeHtml(item.year)}</p>
      `
      )
      .join("");

    const html = `
      <!doctype html>
      <html>
      <head><meta charset="utf-8"><title>${escapeHtml(data.name)} Resume</title></head>
      <body style="font-family:Arial,sans-serif">
        <h1>${escapeHtml(data.name)}</h1>
        <h2>${escapeHtml(data.title)}</h2>
        <p>${escapeHtml([data.email, data.phone, data.location].filter(Boolean).join(" | "))}</p>
        <p>${escapeHtml(data.linkedin)} ${escapeHtml(data.portfolio)}</p>
        <h2>Professional Summary</h2>
        <p>${escapeHtml(data.summary).replace(/\n/g, "<br/>")}</p>
        <h2>Work Experience</h2>${experienceHTML}
        <h2>Education</h2>${educationHTML}
        <h2>Skills</h2><p>${escapeHtml(skills)}</p>
      </body>
      </html>
    `;

    downloadBlob(
      `${safeFilename(data.name)}_Resume.doc`,
      `\ufeff${html}`,
      "application/msword"
    );
  };
  
  const shareResume = async () => {
    const text = resumeText;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${data.name || "My"} Resume`,
          text,
        });
        setStatusMessage("Share menu opened.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setStatusMessage("Resume text copied. Paste it into a message or app.");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        textArea.remove();
        setStatusMessage(
          copied ? "Resume text copied." : "Copy the resume text from the preview or TXT export."
        );
      }

      playSound("success");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatusMessage("Sharing was unavailable. You can download TXT and share the file.");
    }
  };

  const copyResumeText = async () => {
    try {
      await navigator.clipboard.writeText(resumeText);
      setStatusMessage("Resume text copied to clipboard.");
      playSound("success");
    } catch {
      setStatusMessage("Clipboard access failed. Use the TXT export instead.");
    }
  };

  const restoreSnapshot = (snapshot: Snapshot) => {
    setData({ ...defaultData, ...snapshot.data });
    setExperiences(snapshot.experiences || []);
    setEducations(snapshot.educations || []);
    setSkills(snapshot.skills || "");
    setJobDesc(snapshot.jobDesc || "");
    setStatusMessage(`Restored version from ${snapshot.date}`);
    playSound("click");
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
      setStatusMessage("Version history cleared.");
    } catch {
      setStatusMessage("Could not clear history in this browser.");
    }
  };

  const resetResume = () => {
    const confirmed = window.confirm(
      "Reset all resume fields? This cannot be undone unless you restore a saved version."
    );

    if (!confirmed) return;

    setData(defaultData);
    setExperiences([]);
    setEducations([]);
    setSkills("");
    setJobDesc("");
    setStatusMessage("Resume fields reset.");
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Resume Builder Ultimate Pro",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "A browser-based resume builder with editable templates, keyword comparison, local autosave, version history, and multi-format exports.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  const pageClasses =
    theme === "dark"
      ? "bg-[#090b13] text-white"
      : "bg-slate-50 text-slate-900";

  const panelClasses =
    theme === "dark"
      ? "border-white/10 bg-white/[0.04]"
      : "border-slate-200 bg-white";

  const inputClasses =
    theme === "dark"
      ? "border-white/10 bg-black/30 text-white placeholder:text-zinc-500"
      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400";

  const templates = [
    "Minimal",
    "Left Border",
    "Serif",
    "Two Tone",
    "Photo",
    "Compact",
  ];

  return (
    <main className={`min-h-screen ${pageClasses}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <style>{`
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden; }
          #resume-print, #resume-print * { visibility: visible; }
          #resume-print {
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
            min-height: 0;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-lg font-black text-white">
              R
            </div>
            <div>
              <p className="font-black">
                Resume Builder{" "}
                <span className="text-violet-400">ULTIMATE PRO</span>
              </p>
              <p className="text-xs opacity-60">
                {lastSaved ? `Saved ${lastSaved}` : "Autosave enabled"} ·{" "}
                {history.length} saved versions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              🖨️ Print
            </button>
            <button
              onClick={shareResume}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
            >
              ↗ Share Resume
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-white/10 px-4 py-2 text-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={calculateATS}
              className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-bold text-white"
            >
              ATS Estimate: {atsScore}%
            </button>
          </div>
        </div>
      </header>

      {statusMessage && (
        <div
          role="status"
          className="no-print mx-auto mt-3 flex max-w-[1700px] items-center justify-between gap-3 px-4 text-sm text-emerald-500"
        >
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} aria-label="Dismiss message">
            ✕
          </button>
        </div>
      )}

      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-6 p-4 md:p-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT: EDITOR */}
        <motion.section
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`no-print max-h-[92vh] space-y-7 overflow-y-auto rounded-3xl border p-5 shadow-2xl md:p-6 ${panelClasses}`}
        >
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Resume Editor</h2>
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-400">
                {profileCompletion}% complete
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <section>
            <h3 className="font-bold">🎨 Templates (6 Premium Styles)</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {templates.map((template, index) => (
                <button
                  key={template}
                  onClick={() => {
                    setActiveTemplate(index);
                    playSound("click");
                  }}
                  className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
                    activeTemplate === index
                      ? "bg-violet-600 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <h3 className="font-bold">📸 Profile Photo + LinkedIn QR</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="block w-full text-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              {photo && (
                <>
                  <img
                    src={photo}
                    alt="Selected profile"
                    className="h-16 w-16 rounded-full border-2 border-violet-500 object-cover"
                  />
                  <button
                    onClick={() => {
                      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
                      photoUrlRef.current = null;
                      setPhoto(null);
                    }}
                    className="text-xs text-red-400"
                  >
                    Remove photo
                  </button>
                </>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showQR}
                  onChange={(event) => setShowQR(event.target.checked)}
                />
                Show LinkedIn QR
              </label>
            </div>
            <p className="text-xs opacity-60">
              Photo files are limited to 5 MB. Your selected photo remains in
              this browser session and is not saved in the version history.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold">Personal & Contact Information</h3>
            {(
              [
                ["name", "Full name"],
                ["title", "Professional title"],
                ["email", "Email address"],
                ["phone", "Phone number"],
                ["location", "City / Country"],
                ["linkedin", "LinkedIn URL"],
                ["website", "Portfolio / Website URL"],
                ["summary", "Professional summary"],
              ] as [keyof Basics, string][]
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide opacity-60">
                  {label}
                </label>
                {key === "summary" ? (
                  <textarea
                    value={data[key]}
                    onChange={(event) => updateData(key, event.target.value)}
                    rows={4}
                    placeholder="Write a concise, truthful summary of your experience and strengths..."
                    className={`w-full rounded-xl border p-3 outline-none focus:border-violet-500 ${inputClasses}`}
                  />
                ) : (
                  <input
                    value={data[key]}
                    onChange={(event) => updateData(key, event.target.value)}
                    placeholder={label}
                    className={`w-full rounded-xl border p-3 outline-none focus:border-violet-500 ${inputClasses}`}
                  />
                )}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">💼 Work Experience & Projects</h3>
              <button
                onClick={() =>
                  setExperiences((previous) => [
                    ...previous,
                    {
                      id: Date.now(),
                      role: "",
                      company: "",
                      duration: "",
                      desc: "",
                    },
                  ])
                }
                className="rounded-full bg-violet-600 px-3 py-2 text-xs font-bold text-white"
              >
                + Add Experience
              </button>
            </div>

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search roles, companies or bullets..."
              className={`w-full rounded-xl border p-3 text-sm ${inputClasses}`}
            />

            {filteredExperiences.map((experience) => {
              const originalIndex = experiences.findIndex(
                (item) => item.id === experience.id
              );

              return (
                <div
                  key={experience.id}
                  draggable
                  onDragStart={() => setDragIndex(originalIndex)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) {
                      moveExperience(dragIndex, originalIndex);
                      setDragIndex(null);
                    }
                  }}
                  className="space-y-2 rounded-2xl border border-white/10 bg-black/10 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs opacity-50">
                      Drag to reorder · Experience {originalIndex + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateExperience(
                            experience.id,
                            "desc",
                            enhanceBullet(experience.desc)
                          )
                        }
                        className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500"
                      >
                        ✨ Enhance bullet
                      </button>
                      <button
                        onClick={() =>
                          setExperiences((previous) =>
                            previous.filter((item) => item.id !== experience.id)
                          )
                        }
                        className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <input
                    value={experience.role}
                    onChange={(event) =>
                      updateExperience(experience.id, "role", event.target.value)
                    }
                    placeholder="Job title / Project role"
                    className={`w-full rounded-lg border p-2 text-sm ${inputClasses}`}
                  />
                  <input
                    value={experience.company}
                    onChange={(event) =>
                      updateExperience(experience.id, "company", event.target.value)
                    }
                    placeholder="Company / Organization / Project"
                    className={`w-full rounded-lg border p-2 text-sm ${inputClasses}`}
                  />
                  <input
                    value={experience.duration}
                    onChange={(event) =>
                      updateExperience(experience.id, "duration", event.target.value)
                    }
                    placeholder="Duration, e.g. Jan 2024 – Dec 2025"
                    className={`w-full rounded-lg border p-2 text-sm ${inputClasses}`}
                  />
                  <textarea
                    value={experience.desc}
                    onChange={(event) =>
                      updateExperience(experience.id, "desc", event.target.value)
                    }
                    rows={3}
                    placeholder="Responsibilities, tools, projects and verified outcomes"
                    className={`w-full rounded-lg border p-2 text-sm ${inputClasses}`}
                  />
                </div>
              );
            })}

            {filteredExperiences.length === 0 && (
              <p className="text-sm opacity-60">No matching experience entries.</p>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">🎓 Education</h3>
              <button
                onClick={() =>
                  setEducations((previous) => [
                    ...previous,
                    {
                      id: Date.now(),
                      degree: "",
                      college: "",
                      year: "",
                    },
                  ])
                }
                className="rounded-full bg-violet-600 px-3 py-2 text-xs font-bold text-white"
              >
                + Add Education
              </button>
            </div>

            {educations.map((education) => (
              <div
                key={education.id}
                className="space-y-2 rounded-2xl border border-white/10 p-3"
              >
                <input
                  value={education.degree}
                  onChange={(event) =>
                    updateEducation(education.id, "degree", event.target.value)
                  }
                  placeholder="Degree / Qualification"
                  className={`w-full rounded-lg border p-2 text-sm ${inputClasses}`}
                />
                <input
                  value={education.college}
                  onChange={(event) =>
                    updateEducation(education.id, "college", event.target.value)
                  }
                  placeholder="College / Institution"
                  className={`w-full rounded-lg border p-2 text-sm ${inputClasses}`}
                />
                <div className="flex gap-2">
                  <input
                    value={education.year}
                    onChange={(event) =>
                      updateEducation(education.id, "year", event.target.value)
                    }
                    placeholder="Year / Grade"
                    className={`min-w-0 flex-1 rounded-lg border p-2 text-sm ${inputClasses}`}
                  />
                  <button
                    onClick={() =>
                      setEducations((previous) =>
                        previous.filter((item) => item.id !== education.id)
                      )
                    }
                    className="rounded-lg bg-red-500/10 px-3 text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3 className="mb-2 font-bold">🧠 Skills</h3>
            <textarea
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              rows={3}
              placeholder="HTML, CSS, JavaScript, MS Office, Communication..."
              className={`w-full rounded-xl border p-3 ${inputClasses}`}
            />
            <p className="mt-1 text-xs opacity-60">
              Separate skills with commas. Include only skills you can demonstrate.
            </p>
          </section>

          <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <h3 className="font-bold text-violet-400">🎯 Job Description Matcher</h3>
            <textarea
              value={jobDesc}
              onChange={(event) => setJobDesc(event.target.value)}
              rows={5}
              placeholder="Paste the job description here to compare keywords..."
              className={`mt-3 w-full rounded-xl border p-3 text-sm ${inputClasses}`}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
              <span>{keywords.length} unique keywords detected</span>
              <button onClick={calculateATS} className="font-bold text-violet-400">
                Analyze resume →
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-bold">📦 Export & Share</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={downloadPDF}
                className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-black hover:opacity-80"
              >
                📄 PDF
              </button>
              </button>
<button
  onClick={downloadTextPDF}
  className="rounded-xl bg-zinc-900 border border-white/20 px-3 py-3 text-sm font-bold text-white hover:opacity-80"
>
  📄 Text PDF
</button>

              <button
                onClick={downloadDOC}
                className="rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:opacity-80"
              >
                📝 Word DOC
              </button>
              <button
                onClick={downloadTXT}
                className="rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white hover:opacity-80"
              >
                📃 ATS TXT
              </button>
              <button
                onClick={downloadJSON}
                className="rounded-xl bg-zinc-700 px-3 py-3 text-sm font-bold text-white hover:opacity-80"
              >
                🧾 JSON
              </button>
              <button
                onClick={shareResume}
                className="rounded-xl bg-violet-600 px-3 py-3 text-sm font-bold text-white hover:opacity-80"
              >
                ↗ Share Resume
              </button>
              <button
                onClick={copyResumeText}
                className="rounded-xl border border-white/15 px-3 py-3 text-sm font-bold hover:bg-white/10"
              >
                📋 Copy Text
              </button>
            </div>
            <p className="mt-2 text-xs opacity-60">
              Share sends resume text through your device's share menu where
              supported. It does not create a public, hosted resume URL.
            </p>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">🕘 Version History</h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-400">
                  Clear history
                </button>
              )}
            </div>
            <p className="mt-1 text-xs opacity-60">
              Draft snapshots are stored locally in this browser.
            </p>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {history.slice(0, 10).map((snapshot, index) => (
                <div
                  key={`${snapshot.date}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-xs"
                >
                  <span>{snapshot.date}</span>
                  <button
                    onClick={() => restoreSnapshot(snapshot)}
                    className="font-bold text-violet-400"
                  >
                    Restore
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs opacity-60">No saved versions yet.</p>
              )}
            </div>
          </section>

          <button
            onClick={resetResume}
            className="w-full rounded-xl border border-red-500/30 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10"
          >
            Reset Resume Fields
          </button>
        </motion.section>

        {/* RIGHT: LIVE PREVIEW */}
        <motion.section
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="h-fit lg:sticky lg:top-24"
        >
          <div
            id="resume-print"
            ref={resumeRef}
            className={`min-h-[850px] overflow-hidden bg-white p-7 text-zinc-900 shadow-2xl sm:p-10 ${
              activeTemplate === 1
                ? "border-l-[10px] border-violet-600"
                : activeTemplate === 2
                  ? "font-serif"
                  : activeTemplate === 3
                    ? "bg-gradient-to-br from-white to-violet-50"
                    : activeTemplate === 4
                      ? "border-t-8 border-zinc-900"
                      : activeTemplate === 5
                        ? "p-6 text-sm"
                        : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                {photo && (
                  <img
                    src={photo}
                    alt="Profile"
                    className="h-20 w-20 shrink-0 rounded-full border border-zinc-200 object-cover"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="break-words text-3xl font-black">
                    {data.name || "Your Name"}
                  </h2>
                  <p className="mt-1 font-bold text-violet-700">
                    {data.title || "Professional Title"}
                  </p>
                  <p className="mt-2 break-words text-xs text-zinc-600">
                    {[data.email, data.phone, data.location]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                  {data.linkedin && (
                    <p className="mt-1 break-all text-xs text-zinc-600">
                      LinkedIn: {data.linkedin}
                    </p>
                  )}
                  {data.website && (
                    <p className="mt-1 break-all text-xs text-zinc-600">
                      Website: {data.website}
                    </p>
                  )}
                </div>
              </div>

              {showQR && data.linkedin.trim() && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    /^https?:\/\//i.test(data.linkedin)
                      ? data.linkedin
                      : `https://${data.linkedin}`
                  )}`}
                  alt="LinkedIn QR code"
                  className="h-[70px] w-[70px] shrink-0 border border-zinc-200 p-1"
                  crossOrigin="anonymous"
                />
              )}
            </div>

            <div className="mt-6 h-[2px] bg-gradient-to-r from-violet-700 to-transparent" />

            <div className="mt-6">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-zinc-500">
                PROFESSIONAL SUMMARY
              </h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                <HighlightText text={data.summary} keywords={keywords} />
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-zinc-500">
                WORK EXPERIENCE & PROJECTS
              </h3>
              {experiences
                .filter((item) => item.role || item.company || item.desc)
                .map((item) => (
                  <div key={item.id} className="mt-4 break-inside-avoid">
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="font-bold">
                        {item.role}
                        {item.company && (
                          <span className="font-normal text-zinc-600">
                            {" "}
                            — {item.company}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{item.duration}</p>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                      <HighlightText text={item.desc} keywords={keywords} />
                    </p>
                  </div>
                ))}
            </div>

            <div className="mt-6 break-inside-avoid">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-zinc-500">
                EDUCATION
              </h3>
              {educations
                .filter((item) => item.degree || item.college || item.year)
                .map((item) => (
                  <div key={item.id} className="mt-3">
                    <p className="font-bold">{item.degree}</p>
                    <p className="text-sm text-zinc-600">{item.college}</p>
                    <p className="text-xs text-zinc-500">{item.year}</p>
                  </div>
                ))}
            </div>

            <div className="mt-6 break-inside-avoid">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-zinc-500">
                SKILLS
              </h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                <HighlightText text={skills} keywords={keywords} />
              </p>
            </div>
          </div>

          <p className="no-print mt-3 text-center text-xs opacity-60">
            Live preview · Review the exported document before sending it
          </p>
        </motion.section>
      </div>

      {/* ATS MODAL */}
      <AnimatePresence>
        {showATS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setShowATS(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl sm:p-8"
            >
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                  Resume analysis
                </p>
                <div className="my-3 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-7xl font-black text-transparent">
                  {atsScore}%
                </div>
                <h2 className="text-xl font-bold">ATS Readiness Estimate</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                  This is a local checklist and keyword-overlap estimate, not
                  an official ATS result or a hiring prediction.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-zinc-400">Keywords matched</p>
                  <p className="mt-1 text-xl font-black text-emerald-400">
                    {atsDetails.matched}/{atsDetails.total}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-zinc-400">Keyword contribution</p>
                  <p className="mt-1 text-xl font-black text-violet-400">
                    {atsDetails.jdScore}/25
                  </p>
                </div>
              </div>

              {atsDetails.missing.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold">Potentially missing keywords</h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Add a keyword only if it truthfully applies to your experience.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {atsDetails.missing.map((word) => (
                      <span
                        key={word}
                        className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-300"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-bold">Suggestions</h3>
                {atsDetails.tips.length ? (
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                    {atsDetails.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-emerald-400">
                    No basic checklist issues detected. Review the resume manually
                    before applying.
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowATS(false)}
                className="mt-7 w-full rounded-full bg-white py-3 font-bold text-black"
              >
                Close analysis
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO INFORMATIONAL CONTENT */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-8">
        <article className="rounded-3xl border border-white/10 bg-black/[0.03] p-5 md:p-8">
          <header className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
              Resume writing guide
            </p>
            <h1 className="text-3xl font-black leading-tight md:text-4xl">
              Free Online Resume Builder and ATS-Friendly Resume Guide
            </h1>
            <p className="mt-4 max-w-3xl leading-7 opacity-75">
              Create, edit, preview, and export a professional resume using
              editable templates, job-description keyword comparison, resume
              tips, and browser-based version history. Use this resume builder
              to organize your skills, experience, education, and projects into
              a clear document for your next job application.
            </p>
          </header>

          <div className="space-y-3">
            {seoSections.map((section, index) => {
              const isOpen = openSections.includes(index);

              return (
                <section
                  key={section.title}
                  className="overflow-hidden rounded-2xl border border-zinc-500/20"
                >
                  <h2>
                    <button
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenSections((previous) =>
                          isOpen
                            ? previous.filter((item) => item !== index)
                            : [...previous, index]
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-bold md:px-5"
                    >
                      <span>{section.title}</span>
                      <span className="text-xl text-violet-500">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h2>

                  {isOpen && (
                    <div className="border-t border-zinc-500/15 px-4 py-4 md:px-5">
                      <p className="whitespace-pre-line text-sm leading-7 opacity-80">
                        {section.content}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-black">
              Frequently Asked Questions About Resume Building
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFAQs.includes(index);

                return (
                  <section
                    key={faq.q}
                    className="overflow-hidden rounded-2xl border border-zinc-500/20"
                  >
                    <h3>
                      <button
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenFAQs((previous) =>
                            isOpen
                              ? previous.filter((item) => item !== index)
                              : [...previous, index]
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-bold"
                      >
                        <span>{faq.q}</span>
                        <span className="text-xl text-violet-500">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                    </h3>

                    {isOpen && (
                      <p className="border-t border-zinc-500/15 px-4 py-4 text-sm leading-7 opacity-80">
                        {faq.a}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          </section>

          <section className="mt-10 border-t border-zinc-500/20 pt-6">
            <h2 className="text-xl font-black">Use this resume builder responsibly</h2>
            <p className="mt-3 text-sm leading-7 opacity-75">
              Your resume should accurately represent your own experience,
              qualifications, and achievements. Review all generated text,
              check every date and contact detail, and verify the downloaded
              file before sending it to an employer. The tool provides writing
              assistance and basic keyword analysis; it does not guarantee an
              interview, ATS acceptance, or employment.
            </p>
          </section>
        </article>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs opacity-60">
        Resume Builder Ultimate Pro · Browser-based draft storage · Review your
        privacy settings before sharing personal information.
      </footer>
    </main>
  );
}
