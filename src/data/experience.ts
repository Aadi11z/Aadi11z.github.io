export const experience = [
  {
    company: 'Merck Sharp & Dohme GCC',
    monogram: 'MSD',
    role: 'Data Science Intern',
    location: 'Dubai, UAE',
    dates: 'July 2025 – January 2026',
    summary: 'Worked on production forecasting, data automation, scenario analysis, and internal ML tooling for regional planning workflows.',
    bullets: [
      'Built and maintained production forecasting pipelines in Dataiku DSS using models including XGBoost, LightGBM, and Random Forest for the 2026–27 regional planning cycle.',
      'Developed an authenticated API-client interface for dataset modification, model scoring, parameter updates, and business scenario testing.',
      'Automated forecasting-dataset creation and validation, reducing workflows that previously took days to minutes.',
      'Fixed failures in automated production pipelines caused by deprecated functions and helped preserve forecasting-dashboard data quality.',
    ],
    certifications: ['Dataiku Core Designer', 'Dataiku Advanced Designer', 'Dataiku ML Practitioner', 'Dataiku MLOps Practitioner'],
  },
] as const;
