const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbType = 'sqlite'; // 'pg' or 'sqlite'
let pgClient = null;
let sqliteDb = null;

// Initial mock jobs to populate the database
const initialJobs = [
  {
    title: "Senior Full Stack Engineer",
    company: "Google",
    description: "Lead development of next-generation AI-powered web applications. Collaborate with AI researchers, design scalable systems, and build real-time interactive experiences used by millions worldwide.",
    requirements: "Experience with React, Node.js, and distributed systems. Ability to lead architectural decisions, design scalable microservices, and mentor junior engineers.",
    skills: "React, Node.js, TypeScript, Kubernetes, PostgreSQL, gRPC, System Design",
    salary: "$160,000 - $210,000",
    location: "Mountain View, CA (Hybrid)",
    experience_level: "Senior (5+ years)",
    apply_url: "https://careers.google.com",
    recruiter_id: 1
  },
  {
    title: "Data Scientist - Recommendations",
    company: "Netflix",
    description: "Build and optimize recommendation algorithms that power content personalization for 250M+ subscribers. Design A/B tests and analyze user behavior at massive scale.",
    requirements: "MS/PhD in Statistics, Computer Science, or related field. Deep expertise in recommendation systems, causal inference, and experimentation platforms.",
    skills: "Python, SQL, Spark, TensorFlow, A/B Testing, Statistical Modeling, Recommender Systems",
    salary: "$170,000 - $240,000",
    location: "Los Gatos, CA (Hybrid)",
    experience_level: "Mid-Senior (3-6 years)",
    apply_url: "https://jobs.netflix.com",
    recruiter_id: 1
  },
  {
    title: "Product Manager - Azure AI",
    company: "Microsoft",
    description: "Define the product vision and roadmap for Azure AI services. Drive cross-functional teams to deliver enterprise-grade AI/ML solutions to Fortune 500 customers.",
    requirements: "5+ years of product management experience with cloud or AI/ML products. Strong technical background and ability to communicate complex concepts to diverse stakeholders.",
    skills: "Product Strategy, Azure, AI/ML, Agile, Stakeholder Management, Data Analysis",
    salary: "$145,000 - $195,000",
    location: "Redmond, WA (Hybrid)",
    experience_level: "Senior (5+ years)",
    apply_url: "https://careers.microsoft.com",
    recruiter_id: 1
  },
  {
    title: "UX Designer - Spatial Computing",
    company: "Apple",
    description: "Design elegant, intuitive interfaces for visionOS and spatial computing experiences. Push the boundaries of human-computer interaction with immersive 3D design.",
    requirements: "Strong portfolio demonstrating exceptional UI/UX craft, spatial design thinking, and prototyping skills. Experience with AR/VR design is highly valued.",
    skills: "UI/UX, Figma, Prototyping, Design Systems, 3D Design, Motion Design, User Research",
    salary: "$140,000 - $190,000",
    location: "Cupertino, CA (On-site)",
    experience_level: "Mid-Senior (4+ years)",
    apply_url: "https://jobs.apple.com",
    recruiter_id: 1
  },
  {
    title: "Growth Marketing Manager",
    company: "Spotify",
    description: "Drive user acquisition and engagement strategies across global markets. Own the marketing funnel from awareness to conversion and optimize campaigns using data-driven insights.",
    requirements: "4+ years in growth or performance marketing. Experience with paid social, SEO/SEM, marketing automation, and analytics platforms.",
    skills: "Growth Marketing, Google Ads, Meta Ads, SEO, Analytics, SQL, Marketing Automation",
    salary: "$110,000 - $150,000",
    location: "New York, NY (Hybrid)",
    experience_level: "Mid (3-5 years)",
    apply_url: "https://www.lifeatspotify.com/jobs",
    recruiter_id: 1
  },
  {
    title: "Cybersecurity Engineer",
    company: "Amazon",
    description: "Protect AWS infrastructure and customer data by building automated threat detection systems. Conduct security reviews, penetration testing, and incident response at cloud scale.",
    requirements: "Experience with cloud security, SIEM tools, network security, and vulnerability management. Security certifications (CISSP, CEH, or AWS Security Specialty) preferred.",
    skills: "AWS Security, SIEM, Penetration Testing, IAM, Python, Threat Modeling, Incident Response",
    salary: "$140,000 - $185,000",
    location: "Seattle, WA (Hybrid)",
    experience_level: "Mid-Senior (4-7 years)",
    apply_url: "https://www.amazon.jobs",
    recruiter_id: 1
  },
  {
    title: "Cloud Platform Engineer",
    company: "Salesforce",
    description: "Design and maintain large-scale cloud infrastructure on Kubernetes. Build CI/CD pipelines, automate infrastructure provisioning, and ensure 99.99% uptime for mission-critical SaaS platforms.",
    requirements: "Strong experience with Kubernetes, Terraform, and cloud platforms (AWS/GCP/Azure). Expertise in infrastructure as code and observability tooling.",
    skills: "Kubernetes, Terraform, AWS, GCP, Docker, CI/CD, Prometheus, Grafana",
    salary: "$135,000 - $180,000",
    location: "San Francisco, CA (Remote)",
    experience_level: "Senior (5+ years)",
    apply_url: "https://careers.salesforce.com",
    recruiter_id: 1
  },
  {
    title: "Junior Frontend Developer",
    company: "Meta",
    description: "Join the React UI platform team to build reusable component libraries and design system tooling. Work on performance optimization and accessibility improvements across Meta's product suite.",
    requirements: "Strong understanding of React, modern JavaScript/TypeScript, CSS-in-JS, and responsive web design. Passion for clean code and user experience.",
    skills: "React, TypeScript, CSS, HTML, Responsive Design, Accessibility, Git",
    salary: "$95,000 - $125,000",
    location: "Menlo Park, CA (Remote)",
    experience_level: "Junior (1-3 years)",
    apply_url: "https://www.metacareers.com",
    recruiter_id: 1
  },
  {
    title: "Machine Learning Engineer - Autonomy",
    company: "Tesla",
    description: "Develop and deploy deep learning models for autonomous driving perception and planning. Work with petabytes of real-world driving data to train and validate neural networks.",
    requirements: "MS/PhD in CS, EE, or related field. Strong expertise in deep learning, computer vision, and deploying models on edge hardware.",
    skills: "Python, PyTorch, Computer Vision, Deep Learning, C++, CUDA, TensorRT",
    salary: "$155,000 - $220,000",
    location: "Palo Alto, CA (On-site)",
    experience_level: "Senior (4+ years)",
    apply_url: "https://www.tesla.com/careers",
    recruiter_id: 1
  },
  {
    title: "GPU Systems Architect",
    company: "NVIDIA",
    description: "Architect next-generation GPU computing platforms for AI and high-performance computing workloads. Define hardware-software co-design strategies for data center accelerators.",
    requirements: "Deep expertise in computer architecture, parallel computing, and GPU programming models. Experience with CUDA, hardware simulation, and performance modeling.",
    skills: "Computer Architecture, CUDA, C++, GPU Programming, HPC, Verilog, Performance Optimization",
    salary: "$180,000 - $250,000",
    location: "Santa Clara, CA (Hybrid)",
    experience_level: "Senior (7+ years)",
    apply_url: "https://www.nvidia.com/en-us/about-nvidia/careers",
    recruiter_id: 1
  },
  {
    title: "Backend Engineer - Payments",
    company: "Stripe",
    description: "Build and scale the payment processing infrastructure that powers millions of businesses. Design low-latency, fault-tolerant distributed systems handling billions of dollars in transactions.",
    requirements: "Strong experience with distributed systems, API design, and financial technology. Proficiency in Ruby, Go, or Java and expertise with relational databases.",
    skills: "Ruby, Go, Distributed Systems, API Design, PostgreSQL, Redis, AWS, Microservices",
    salary: "$150,000 - $200,000",
    location: "San Francisco, CA (Hybrid)",
    experience_level: "Mid-Senior (3-6 years)",
    apply_url: "https://stripe.com/jobs",
    recruiter_id: 1
  },
  {
    title: "Creative Technologist - Design Tools",
    company: "Adobe",
    description: "Innovate at the intersection of design and technology by building next-gen creative tools powered by generative AI. Prototype new features for Photoshop, Illustrator, and emerging products.",
    requirements: "Experience with creative coding, generative AI, and web technologies. Understanding of image processing, vector graphics, and creative workflows.",
    skills: "JavaScript, Python, WebGL, Generative AI, Image Processing, React, Creative Coding",
    salary: "$125,000 - $170,000",
    location: "San Jose, CA (Hybrid)",
    experience_level: "Mid (3-5 years)",
    apply_url: "https://careers.adobe.com",
    recruiter_id: 1
  },
  {
    title: "Staff Software Engineer - Marketplace",
    company: "Airbnb",
    description: "Lead the technical vision for Airbnb's marketplace matching and pricing systems. Build algorithms that connect travelers with perfect stays and optimize host earnings.",
    requirements: "8+ years of software engineering experience with a track record of leading large-scale system design. Expertise in search, ranking, or marketplace dynamics.",
    skills: "Java, Python, Microservices, Search & Ranking, System Design, Kafka, Elasticsearch",
    salary: "$190,000 - $260,000",
    location: "San Francisco, CA (Remote-friendly)",
    experience_level: "Staff (8+ years)",
    apply_url: "https://careers.airbnb.com",
    recruiter_id: 1
  },
  {
    title: "Mobile Engineer - Rider Experience",
    company: "Uber",
    description: "Build and enhance the Uber rider app used by 130M+ monthly users. Develop real-time mapping features, ride tracking, and seamless payment flows on iOS and Android.",
    requirements: "3+ years of mobile development experience with Swift/Kotlin. Understanding of mobile architecture patterns (MVVM, Clean Architecture) and real-time data handling.",
    skills: "Swift, Kotlin, iOS, Android, Mobile Architecture, GraphQL, CI/CD, Unit Testing",
    salary: "$130,000 - $175,000",
    location: "Chicago, IL (Hybrid)",
    experience_level: "Mid (3-5 years)",
    apply_url: "https://www.uber.com/us/en/careers",
    recruiter_id: 1
  },
  {
    title: "Data Engineer - Trust & Safety",
    company: "LinkedIn",
    description: "Build scalable data pipelines and analytics platforms to detect and prevent fraud, spam, and abuse across LinkedIn's professional network of 1B+ members.",
    requirements: "Experience with large-scale data processing frameworks, stream processing, and data warehousing. Familiarity with fraud detection or trust & safety systems is a plus.",
    skills: "Spark, Kafka, Python, SQL, Hadoop, Airflow, Data Modeling, Machine Learning",
    salary: "$135,000 - $180,000",
    location: "Sunnyvale, CA (Hybrid)",
    experience_level: "Mid-Senior (4-6 years)",
    apply_url: "https://careers.linkedin.com",
    recruiter_id: 1
  }
];

async function fetchHuggingFaceJobs() {
  try {
    console.log("Fetching live job dataset from Hugging Face...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
    
    const response = await fetch("https://datasets-server.huggingface.co/rows?dataset=Yash514311%2Fnexus-jobs&config=default&split=train&offset=0&length=100", { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data || !data.rows || !Array.isArray(data.rows)) {
      throw new Error("Invalid response format from Hugging Face API");
    }
    
    console.log(`Successfully fetched ${data.rows.length} jobs from Hugging Face.`);
    
    // Parse rows and convert to jobs
    const parsedJobs = data.rows.map(rowObj => {
      const row = rowObj.row;
      const title = row.title || "Software Engineer";
      const company = row.company || "Technology Corp";
      const location = row.location || "Remote";
      const applyUrl = row.applyLink || "https://careerswipe.com";
      
      // Map details dynamically based on title
      const titleLower = title.toLowerCase();
      let skills = "Problem Solving, Communication, Collaboration, Adaptability";
      let description = "Execute daily operations, collaborate across teams, and contribute to company milestones. Deliver high-quality output in a fast-paced environment.";
      let requirements = "Relevant degree or equivalent experience. Proactive attitude and willingness to learn.";
      let experience_level = "Any Experience";
      let salaryRange = [90, 130];
      
      if (titleLower.includes("frontend") || titleLower.includes("react") || titleLower.includes("ui") || titleLower.includes("ux") || titleLower.includes("designer")) {
        skills = "React, TypeScript, CSS, HTML, JavaScript, TailwindCSS, Figma";
        description = `Join the UI/UX product engineering team at ${company} as a ${title}. You will design and implement beautiful, interactive, and responsive web user interfaces. Work closely with product designers and backend engineers to build a seamless client experience.`;
        requirements = "Strong experience with React.js, TypeScript, modern CSS, and UI tools like Figma. Ability to implement complex visual designs and micro-animations.";
        experience_level = "Mid-Level (2-4 years)";
        salaryRange = [95, 140];
      } else if (titleLower.includes("backend") || titleLower.includes("node") || titleLower.includes("go") || titleLower.includes("python") || titleLower.includes("database") || titleLower.includes("infrastructure") || titleLower.includes("protocol") || titleLower.includes("systems") || titleLower.includes("engineer")) {
        skills = "Node.js, Go, PostgreSQL, Redis, Docker, AWS, System Design, REST APIs";
        description = `We are looking for a skilled ${title} to join our backend systems division at ${company}. You will architect and maintain robust backend systems, REST/gRPC APIs, databases, and microservices. Focus will be on high scalability, low latency, and systems reliability.`;
        requirements = "Proficiency in backend environments (Node.js/Go/Python) and relational databases (PostgreSQL/MySQL). Experience with containerization, API design, and system architecture.";
        experience_level = "Senior (4+ years)";
        salaryRange = [120, 180];
      } else if (titleLower.includes("controller") || titleLower.includes("finance") || titleLower.includes("accounting") || titleLower.includes("operations") || titleLower.includes("manager") || titleLower.includes("business") || titleLower.includes("analyst") || titleLower.includes("lead")) {
        skills = "Financial Analysis, Budgeting, QuickBooks, Excel, Operations Management, Strategy";
        description = `Manage and oversee operations, financial planning, budgeting, or administrative alignment as a ${title} at ${company}. Work with executive leadership to streamline internal processes, ensure financial accuracy, and drive cross-functional alignment.`;
        requirements = "Bachelor's/Master's degree in Business Administration, Finance, accounting or related field. Analytical mindset, excellent leadership qualities, and top-tier organization skills.";
        experience_level = "Mid-Senior (3-6 years)";
        salaryRange = [100, 160];
      }
      
      // Format a realistic salary
      const minSalary = salaryRange[0];
      const maxSalary = salaryRange[1];
      const salary = `$${minSalary.toLocaleString()},000 - $${maxSalary.toLocaleString()},000`;
      
      return {
        title,
        company,
        description,
        requirements,
        skills,
        salary,
        location,
        experience_level,
        apply_url: applyUrl,
        recruiter_id: 1 // default recruiter ID
      };
    });
    
    return parsedJobs;
  } catch (err) {
    console.error("Hugging Face API request failed, using standard mock data:", err.message);
    return null;
  }
}

async function initDb() {
  // Try connecting to PostgreSQL
  const pgConnectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careerswipe';
  console.log('Connecting to database...');
  
  try {
    const client = new Client({
      connectionString: pgConnectionString,
      connectionTimeoutMillis: 3000
    });
    await client.connect();
    pgClient = client;
    dbType = 'pg';
    console.log('Successfully connected to PostgreSQL database!');
  } catch (err) {
    console.warn('PostgreSQL connection failed or port closed. Falling back to SQLite3 for seamless execution.');
    dbType = 'sqlite';
    const sqlitePath = path.join(__dirname, 'db.sqlite');
    sqliteDb = new sqlite3.Database(sqlitePath, (sqliteErr) => {
      if (sqliteErr) {
        console.error('Failed to initialize SQLite database:', sqliteErr.message);
      } else {
        console.log(`SQLite database connected successfully at: ${sqlitePath}`);
      }
    });
  }

  // Pre-fetch Hugging Face jobs
  let jobsToSeed = await fetchHuggingFaceJobs();
  if (!jobsToSeed || jobsToSeed.length === 0) {
    jobsToSeed = initialJobs;
  }

  // Create tables query
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY ${dbType === 'pg' ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createResumesTable = `
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY ${dbType === 'pg' ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      raw_text TEXT,
      parsed_data TEXT, -- Stores JSON analysis as string in SQLite, JSONB in PG
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY ${dbType === 'pg' ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT,
      skills TEXT,
      salary VARCHAR(100),
      location VARCHAR(255),
      experience_level VARCHAR(100),
      apply_url TEXT,
      recruiter_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createSwipesTable = `
    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY ${dbType === 'pg' ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      direction VARCHAR(10) NOT NULL, -- 'left' or 'right'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createApplicationsTable = `
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY ${dbType === 'pg' ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      resume_id INTEGER,
      status VARCHAR(50) DEFAULT 'applied', -- 'applied', 'interview', 'rejected'
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createFeedbacksTable = `
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY ${dbType === 'pg' ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      author VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      company VARCHAR(255),
      quote TEXT NOT NULL,
      avatar VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const initialFeedbacks = [
    {
      quote: "CareerSwipe totally reinvented my job hunt. The resume analysis gave me clear items to fix. In 2 weeks of right-swiping, I landed three interviews!",
      author: "Alex Rivers",
      role: "Senior React Engineer",
      company: "Stripe",
      avatar: "AR"
    },
    {
      quote: "As a recruiter, finding candidates who fit our criteria used to take hours of manual filtering. CareerSwipe's ATS alignment matches them automatically.",
      author: "Sarah Jenkins",
      role: "Director of Talent Acquisition",
      company: "Linear",
      avatar: "SJ"
    },
    {
      quote: "The interface is addictive and efficient. Swiping on matching cards is so much faster than scrolling endless pages of job boards.",
      author: "Marcus Chen",
      role: "Machine Learning Graduate",
      company: "Anthropic",
      avatar: "MC"
    }
  ];

  if (dbType === 'pg') {
    try {
      console.log('Dropping old PostgreSQL tables (swipes, applications, jobs) to sync schema...');
      await pgClient.query('DROP TABLE IF EXISTS swipes');
      await pgClient.query('DROP TABLE IF EXISTS applications');
      await pgClient.query('DROP TABLE IF EXISTS jobs');

      await pgClient.query(createUsersTable);
      await pgClient.query(createResumesTable);
      await pgClient.query(createJobsTable);
      await pgClient.query(createSwipesTable);
      await pgClient.query(createApplicationsTable);
      await pgClient.query(createFeedbacksTable);
      
      console.log('Seeding dataset jobs into PostgreSQL...');
      for (const job of jobsToSeed) {
        await pgClient.query(
          `INSERT INTO jobs (title, company, description, requirements, skills, salary, location, experience_level, apply_url, recruiter_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [job.title, job.company, job.description, job.requirements, job.skills, job.salary, job.location, job.experience_level, job.apply_url, job.recruiter_id]
        );
      }
      console.log(`Inserted ${jobsToSeed.length} dataset jobs into PostgreSQL database.`);

      // Seed feedbacks if empty
      const fbCheck = await pgClient.query('SELECT COUNT(*) FROM feedbacks');
      if (parseInt(fbCheck.rows[0].count, 10) === 0) {
        console.log('Seeding initial testimonials into PostgreSQL...');
        for (const fb of initialFeedbacks) {
          await pgClient.query(
            `INSERT INTO feedbacks (author, role, company, quote, avatar) VALUES ($1, $2, $3, $4, $5)`,
            [fb.author, fb.role, fb.company, fb.quote, fb.avatar]
          );
        }
      }
    } catch (err) {
      console.error('Error setting up PG database tables:', err.message);
    }
  } else {
    // Run sequentially for SQLite
    sqliteDb.serialize(() => {
      console.log('Dropping old SQLite tables (swipes, applications, jobs) to sync schema...');
      sqliteDb.run('DROP TABLE IF EXISTS swipes');
      sqliteDb.run('DROP TABLE IF EXISTS applications');
      sqliteDb.run('DROP TABLE IF EXISTS jobs');
      
      // Now create tables
      sqliteDb.run(createUsersTable);
      sqliteDb.run(createResumesTable);
      sqliteDb.run(createJobsTable);
      sqliteDb.run(createSwipesTable);
      sqliteDb.run(createApplicationsTable);
      sqliteDb.run(createFeedbacksTable);

      sqliteDb.run('SELECT 1', (err) => {
        if (err) {
          console.error('Failed to create SQLite tables:', err.message);
          return;
        }
        console.log('Seeding dataset jobs into SQLite...');
        const stmt = sqliteDb.prepare(`
          INSERT INTO jobs (title, company, description, requirements, skills, salary, location, experience_level, apply_url, recruiter_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const job of jobsToSeed) {
          stmt.run(job.title, job.company, job.description, job.requirements, job.skills, job.salary, job.location, job.experience_level, job.apply_url, job.recruiter_id);
        }
        stmt.finalize();
        console.log(`Inserted ${jobsToSeed.length} dataset jobs into SQLite database.`);

        // Seed feedbacks if empty
        sqliteDb.get('SELECT COUNT(*) as count FROM feedbacks', (checkErr, row) => {
          if (checkErr || !row) return;
          if (row.count === 0) {
            console.log('Seeding initial testimonials into SQLite...');
            const fbStmt = sqliteDb.prepare(`
              INSERT INTO feedbacks (author, role, company, quote, avatar)
              VALUES (?, ?, ?, ?, ?)
            `);
            for (const fb of initialFeedbacks) {
              fbStmt.run(fb.author, fb.role, fb.company, fb.quote, fb.avatar);
            }
            fbStmt.finalize();
            console.log('Successfully seeded initial testimonials into SQLite.');
          }
        });
      });
    });
  }
}

// Helper query function to make DB queries uniform in controllers
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Convert $1, $2 (PG style) to ?, ? (SQLite style) if SQLite
    let querySql = sql;
    let queryParams = params;

    if (dbType === 'sqlite') {
      querySql = sql.replace(/\$(\d+)/g, '?');
    }

    if (dbType === 'pg') {
      pgClient.query(querySql, queryParams, (err, res) => {
        if (err) return reject(err);
        resolve({ rows: res.rows, rowCount: res.rowCount });
      });
    } else {
      const isInsert = querySql.trim().toUpperCase().startsWith('INSERT');
      const isSelect = querySql.trim().toUpperCase().startsWith('SELECT');

      if (isSelect) {
        sqliteDb.all(querySql, queryParams, (err, rows) => {
          if (err) return reject(err);
          resolve({ rows, rowCount: rows.length });
        });
      } else {
        sqliteDb.run(querySql, queryParams, function(err) {
          if (err) return reject(err);
          resolve({
            rows: [],
            rowCount: this.changes,
            lastID: this.lastID
          });
        });
      }
    }
  });
}

module.exports = {
  initDb,
  query,
  getDbType: () => dbType
};
