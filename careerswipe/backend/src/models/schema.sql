-- Careerswipe Relational Database Schema (PostgreSQL)
-- This file documents the table configurations used inside Careerswipe.
-- These tables are automatically created on startup by the db.js dual-driver manager.

-- 1. Users Table (Job Seekers & Recruiters)
CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'seeker' | 'recruiter'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resumes Table (Job Seeker Resume parsed ATS profiles)
CREATE TABLE IF NOT EXISTS resumes (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_text TEXT,
  parsed_data JSONB, -- Stores detailed ATS analysis metrics
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Jobs Table (Job vacancies posted by Recruiters)
CREATE TABLE IF NOT EXISTS jobs (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  skills TEXT, -- Comma separated skill tags
  salary VARCHAR(100),
  location VARCHAR(255),
  experience_level VARCHAR(100),
  recruiter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Swipes Table (Tinder card swipe registry)
CREATE TABLE IF NOT EXISTS swipes (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL, -- 'left' (Skip) | 'right' (Like)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_swipe UNIQUE (user_id, job_id)
);

-- 5. Applications Table (Track submissions created on swiping right)
CREATE TABLE IF NOT EXISTS applications (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_id INT REFERENCES resumes(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'applied', -- 'applied' | 'interview' | 'accepted' | 'rejected'
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance optimizations
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
