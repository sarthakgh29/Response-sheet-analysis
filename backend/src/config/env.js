import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,

  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbName: process.env.DB_NAME || 'survey_insights',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || '',

  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  llmProvider: process.env.LLM_PROVIDER || 'anthropic',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'claude-sonnet-4-6',
  anthropicVersion: process.env.ANTHROPIC_VERSION || '2023-06-01',
};
