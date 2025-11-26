export interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  imageUrl?: string;
}

export const initialQuestions: Question[] = [
  {
    id: '1',
    question: 'What was the Big Announcement at Sitecore Symposium this year?',
    correctAnswer: 'SitecoreAI',
    incorrectAnswers: ['XM Cloud', 'OrderCloud', 'Content Hub'],
  },
  {
    id: '2',
    question: 'What is the core concept behind the newly announced SitecoreAI?',
    correctAnswer: 'A next-gen AI-first composable SaaS platform unifying content, data, personalization, and search',
    incorrectAnswers: [
      'A traditional CMS with AI features',
      'A headless CMS solution',
      'A commerce-only platform',
    ],
  },
  {
    id: '3',
    question: 'Which workspace is central to building AI workflows in SitecoreAI?',
    correctAnswer: 'Agentic Studio',
    incorrectAnswers: ['Content Studio', 'Experience Editor', 'Marketing Control Panel'],
  },
  {
    id: '4',
    question: 'How many pre-built AI agents did Sitecore say would ship with Agentic Studio at launch?',
    correctAnswer: '20',
    incorrectAnswers: ['10', '30', '50'],
  },
  {
    id: '5',
    question: 'What major change does SitecoreAI bring to the licensing model, according to Symposium 2025?',
    correctAnswer: 'One metric licensing with full access — no extra cost for AI agents',
    incorrectAnswers: [
      'Per-user licensing model',
      'Usage-based pricing',
      'Fixed annual fee',
    ],
  },
  {
    id: '6',
    question: 'What is SitecoreAI Pathway?',
    correctAnswer: 'A content-migration tool using generative AI to migrate from XP or XM to SitecoreAI',
    incorrectAnswers: [
      'A new authentication system',
      'A deployment pipeline',
      'A content modeling tool',
    ],
  },
  {
    id: '7',
    question: 'Which of these Sitecore XP versions ends mainstream support at the end of this year?',
    correctAnswer: '10.3',
    incorrectAnswers: ['10.1', '10.2', '10.4'],
  },
  {
    id: '8',
    question: 'What is the Sitecore AI Innovation Lab highlighted on the Sitecore platform site?',
    correctAnswer: 'A co-innovation program where customers experiment with emerging AI features before general release',
    incorrectAnswers: [
      'A physical event venue for Symposium keynotes',
      'Sitecore’s public GitHub repository of open-source code',
      'A marketing certification track for partners',
    ],
  },
  {
    id: '9',
    question: "Which of these is not a component included in SitecoreAI's unified platform?",
    correctAnswer: 'OrderCloud',
    incorrectAnswers: ['Content Hub', 'Personalize', 'Search'],
  },
  {
    id: '10',
    question: 'Which of these is a dedicated program to help businesses transition from PAAS to SAAS?',
    correctAnswer: 'Sitecore Accelerate',
    incorrectAnswers: ['Sitecore Migration', 'Sitecore Upgrade', 'Sitecore Transform'],
  },
  {
    id: '11',
    question: 'At Symposium 2025, which new component of Sitecore Studio was not explicitly announced?',
    correctAnswer: 'Data Studio – a new no-code analytics tool',
    incorrectAnswers: [
      'Content Studio',
      'Experience Studio',
      'Marketing Studio',
    ],
  },
  {
    id: '12',
    question: 'What significant performance or usability enhancement was announced for XM Cloud in the 2025 release?',
    correctAnswer: 'Support for Angular and .NET Core frameworks',
    incorrectAnswers: [
      'Improved caching',
      'Better CDN integration',
      'Enhanced security features',
    ],
  },
  {
    id: '13',
    question: 'Which of these statements about migration to SitecoreAI is true as per the 2025 announcements?',
    correctAnswer: 'XM Cloud customers get automatic, seamless upgrade to SitecoreAI with data and continuity preserved.',
    incorrectAnswers: [
      'Migration requires manual data export',
      'Only XP customers can migrate',
      'Migration is not available yet',
    ],
  },
  {
    id: '14',
    question: 'What Sitecore API service gives you globally replicated, scalable access to your items, layout + media with headless development in mind?',
    correctAnswer: 'Experience Edge',
    incorrectAnswers: ['Content API', 'GraphQL API', 'REST API'],
  },
  {
    id: '15',
    question: 'The new Content SDK allows what platforms to be targeted?',
    correctAnswer: 'SitecoreAI/XM Cloud',
    incorrectAnswers: ['XP only', 'XM only', 'Commerce only'],
  },
  {
    id: '16',
    question: 'Which Sitecore solution delivers a fully managed, composable CMS in the cloud with auto-scaling and continuous updates?',
    correctAnswer: 'Sitecore XM Cloud',
    incorrectAnswers: ['Sitecore XP', 'Sitecore Commerce', 'Sitecore Connect'],
  },
  {
    id: '17',
    question: 'Sitecore Content Hub is primarily positioned as what type of solution on the Sitecore platform site?',
    correctAnswer: 'A unified content operations platform spanning planning, production, and delivery',
    incorrectAnswers: [
      'A legacy on-prem CMS',
      'A payment processing gateway',
      'A low-code automation builder',
    ],
  },
  {
    id: '18',
    question: 'Which Sitecore product delivers API-first digital commerce with marketplace, product, and order management out of the box?',
    correctAnswer: 'Sitecore OrderCloud',
    incorrectAnswers: ['Sitecore Personalize', 'Sitecore Send', 'Sitecore Search'],
  },
  {
    id: '19',
    question: 'Sitecore Personalize and Sitecore CDP combine to offer which key capability according to the Sitecore platform overview?',
    correctAnswer: 'Real-time customer data activation with AI-driven experimentation',
    incorrectAnswers: [
      'Static customer segments refreshed nightly',
      'On-premise analytics dashboards only',
      'Batch email sending without personalization',
    ],
  },
  {
    id: '20',
    question: 'Which Sitecore service gives headless teams instant, global delivery of content, layouts, and media via API?',
    correctAnswer: 'Sitecore Experience Edge',
    incorrectAnswers: ['Sitecore Cortex', 'Sitecore Discover', 'Sitecore Accelerate'],
  },
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomQuestions(count: number = 5): Question[] {
  const shuffled = shuffleArray(initialQuestions);
  return shuffled.slice(0, count);
}

export function shuffleAnswers(question: Question): string[] {
  const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];
  return shuffleArray(allAnswers);
}

// Pool of common Sitecore-related terms for generating incorrect answers
export const sitecoreTerms = [
  'Sitecore XP',
  'Sitecore XM',
  'Sitecore Commerce',
  'Sitecore Content Hub',
  'Sitecore OrderCloud',
  'Sitecore Personalize',
  'Sitecore Search',
  'Sitecore Send',
  'Sitecore Connect',
  'Sitecore Discover',
  'Experience Editor',
  'Content Editor',
  'Marketing Control Panel',
  'Sitecore Forms',
  'Sitecore Analytics',
  'Sitecore Cortex',
  'Sitecore JSS',
  'Sitecore Headless',
  'Sitecore Horizon',
  'Sitecore SXA',
  'Sitecore MVC',
  'Sitecore Helix',
  'Sitecore Habitat',
  'Sitecore Docker',
  'Sitecore Kubernetes',
];

// Generate additional incorrect answers if needed
export function generateIncorrectAnswers(
  correctAnswer: string,
  existingIncorrect: string[],
  count: number = 3
): string[] {
  const used = new Set([correctAnswer, ...existingIncorrect]);
  const available = sitecoreTerms.filter((term) => !used.has(term));
  const shuffled = shuffleArray(available);
  return [...existingIncorrect, ...shuffled.slice(0, Math.max(0, count - existingIncorrect.length))];
}

