export const profile = {
  name: 'Aaditya Bhatnagar',
  monogram: 'AB',
  location: 'Dubai, UAE',
  email: '11aadityab@gmail.com',
  graduation: 'September 2026',
  university: 'BITS Pilani, Dubai Campus',
  degree: 'Bachelor of Engineering in Computer Science',
  cgpa: '9.25/10.00',
  headline: 'ML Engineer and Data Scientist building reliable AI systems, research tools, and quantitative platforms.',
  description:
    'I’m a final-year Computer Science student at BITS Pilani Dubai Campus. I have worked on production forecasting systems at MSD, machine unlearning for vision-language models, grounded AI products, and quantitative research platforms.',
  availability:
    'Open to graduate opportunities in machine learning, data science, AI research, quantitative research, and software engineering.',
  links: {
    linkedin: 'https://www.linkedin.com/in/aadi11z/',
    github: 'https://github.com/Aadi11z',
    codeforces: 'https://codeforces.com/profile/Aadi11z',
    leetcode: 'https://leetcode.com/u/aadi11z/',
  },
} as const;

export const about = {
  paragraphs: [
    'I enjoy working where machine learning, data, and software systems meet. My projects range from production forecasting and grounded AI products to machine-unlearning research and quantitative platforms.',
    'I care about understanding the full system: how data is collected, how models are evaluated, how APIs expose results, and how users make decisions from them. I’m particularly interested in reliable AI, machine-learning research, energy and financial markets, and tools that make complex systems easier to inspect.',
  ],
  principles: [
    { title: 'Build end to end', text: 'I like moving from raw data and experiments to tested APIs, interfaces, and reproducible outputs.' },
    { title: 'Evaluate honestly', text: 'I value temporal validation, meaningful baselines, failure analysis, and metrics tied to the actual problem.' },
    { title: 'Keep learning', text: 'My work spans ML research, data engineering, backend systems, quantitative analysis, and lower-level programming.' },
  ],
} as const;

export const education = {
  institution: 'BITS Pilani, Dubai Campus',
  degree: 'Bachelor of Engineering in Computer Science',
  expectedGraduation: 'September 2026',
  cgpa: '9.25/10.00',
  coursework: {
    'Computer Science': ['Generative AI', 'Natural Language Processing', 'Deep Learning', 'Data Mining', 'Software Architecture', 'Data Structures and Algorithms', 'Database Systems', 'Operating Systems'],
    'Mathematics and Statistics': ['Numerical Analysis', 'Linear Algebra', 'Probability and Statistics'],
    'Finance and Economics': ['Derivatives and Risk Management', 'Security Analysis and Portfolio Management'],
  },
} as const;

export const achievement = {
  title: '1st Place — BITS Tech Fest Hackathon',
  description: 'Built RescuMe, an emergency-response MVP using geolocation mapping to coordinate rescue teams and disaster victims.',
} as const;
