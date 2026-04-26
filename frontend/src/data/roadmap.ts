export type Phase = {
  id: number;
  title: string;
  duration: string;
  weeks: string;
  tasks: { title: string; description: string }[];
  milestone: { title: string; description: string };
};

export const phases: Phase[] = [
  {
    id: 1,
    title: "Project Setup & Planning",
    weeks: "Week 1–2",
    duration: "2 weeks",
    tasks: [
      { title: "Initialize Git Repository", description: "Set up GitHub/GitLab repo with proper .gitignore and README" },
      { title: "Create Project Structure", description: "Set up MERN boilerplate: client/, server/, and config folders" },
      { title: "Design Database Schema", description: "Create MongoDB schemas for Users, Events, and Approval History" },
      { title: "Design UI/UX Mockups", description: "Create wireframes for all user dashboards and event forms (Figma/Sketch)" },
      { title: "Set Up Development Environment", description: "Install Node.js, MongoDB, set up ESLint, Prettier, and environment variables" },
    ],
    milestone: { title: "Project Foundation Ready", description: "Repository initialized, schemas designed, development environment configured" },
  },
  {
    id: 2,
    title: "Backend Development — Core",
    weeks: "Week 3–5",
    duration: "3 weeks",
    tasks: [
      { title: "Set Up Express Server", description: "Create Express app with middleware (CORS, body-parser, helmet)" },
      { title: "MongoDB Connection & Models", description: "Connect to MongoDB, create User and Event models with Mongoose" },
      { title: "JWT Authentication System", description: "Implement JWT-based auth with login, register, token verification middleware" },
      { title: "Role-Based Access Control (RBAC)", description: "Create middleware to restrict routes based on user roles" },
      { title: "User Management APIs", description: "CRUD endpoints for users (Admin → Faculty → Students)" },
      { title: "Password Hashing & Security", description: "Use bcrypt for password hashing, implement secure password reset flow" },
    ],
    milestone: { title: "Authentication & User Management Complete", description: "Secure login system, role-based access, user hierarchy established" },
  },
  {
    id: 3,
    title: "Backend Development — Event System",
    weeks: "Week 6–8",
    duration: "3 weeks",
    tasks: [
      { title: "Event Creation API", description: "Students can create events with title, description, contact info, banner upload" },
      { title: "File Upload with Multer & Cloudinary", description: "Implement banner image upload to Cloudinary with compression" },
      { title: "Multi-Level Approval Workflow", description: "Build approval logic: Advisor → HOD → ED → Principal with status tracking" },
      { title: "Approval History Tracking", description: "Store approval history with timestamp, approver, action, comments" },
      { title: "Event Status Management", description: "Handle Pending-Advisor, Pending-HOD, Pending-ED, Pending-Principal, Approved, Rejected, Cancelled" },
      { title: "Event Cancellation System", description: "Allow students/faculty/admin to cancel events with reason storage" },
      { title: "Event Query & Filtering APIs", description: "Get events by status, creator, date range, approval level" },
    ],
    milestone: { title: "Event Management System Complete", description: "Full event lifecycle, approval workflow, file uploads functional" },
  },
  {
    id: 4,
    title: "Email Notification System",
    weeks: "Week 9",
    duration: "1 week",
    tasks: [
      { title: "Set Up Nodemailer", description: "Configure Nodemailer with SMTP (Gmail/SendGrid) for email sending" },
      { title: "Email Templates", description: "Create HTML email templates for submission, approval, rejection, cancellation" },
      { title: "Notification Triggers", description: "Trigger emails on event submission, status change, approval/rejection" },
      { title: "Test Email Delivery", description: "Test all email scenarios in development and staging environments" },
    ],
    milestone: { title: "Automated Email Notifications Working", description: "All stakeholders receive timely email updates" },
  },
  {
    id: 5,
    title: "Frontend Development — Core UI",
    weeks: "Week 10–12",
    duration: "3 weeks",
    tasks: [
      { title: "React App Setup", description: "Create React app with React Router, Redux/Context API for state management" },
      { title: "Authentication Pages", description: "Build Login, Register, Password Reset pages with form validation" },
      { title: "Role-Based Dashboard Layouts", description: "Separate dashboards for Admin, Principal, ED, HOD, Advisor, Student" },
      { title: "Protected Routes & Navigation", description: "Route guards based on authentication and user role" },
      { title: "UI Component Library", description: "Set up Tailwind CSS / Material-UI for consistent styling" },
    ],
    milestone: { title: "Core Frontend Architecture Ready", description: "Authentication flow, role-based routing, dashboard layouts complete" },
  },
  {
    id: 6,
    title: "Frontend — Event Management UI",
    weeks: "Week 13–15",
    duration: "3 weeks",
    tasks: [
      { title: "Event Creation Form", description: "Form with title, description, date, contact info, banner upload with preview" },
      { title: "Event List & Filtering", description: "Display events with filters: status, date range, search by title" },
      { title: "Event Detail View", description: "Show event info, banner, contact details, approval history timeline" },
      { title: "Approval Action Interface", description: "For faculty: Approve/Reject/Forward buttons with comment input" },
      { title: "Status Badge & Visual Indicators", description: "Color-coded status badges, progress bar showing approval stage" },
      { title: "Event Cancellation UI", description: "Cancel button with reason modal for students/faculty/admin" },
    ],
    milestone: { title: "Event Management UI Complete", description: "Students create events, faculty approve/reject, all users track status" },
  },
  {
    id: 7,
    title: "Frontend — User Management UI",
    weeks: "Week 16–17",
    duration: "2 weeks",
    tasks: [
      { title: "Admin: Faculty Management", description: "Admin can view, create, approve/reject faculty registrations" },
      { title: "Faculty: Student Management", description: "Faculty can view and create students under their supervision" },
      { title: "User Profile Pages", description: "View/edit profile, change password, view created events" },
      { title: "User List Tables", description: "Searchable, sortable tables for viewing users with role filters" },
    ],
    milestone: { title: "User Management Complete", description: "Full user hierarchy management functional" },
  },
  {
    id: 8,
    title: "Testing & Quality Assurance",
    weeks: "Week 18–19",
    duration: "2 weeks",
    tasks: [
      { title: "Unit Testing — Backend", description: "Write tests for API endpoints using Jest/Mocha" },
      { title: "Integration Testing", description: "Test complete workflows: registration → event creation → approval chain" },
      { title: "Frontend Testing", description: "Component tests with React Testing Library" },
      { title: "Cross-Browser Testing", description: "Test on Chrome, Firefox, Safari, Edge" },
      { title: "Responsive Design Testing", description: "Test on mobile, tablet, desktop screen sizes" },
      { title: "Security Audit", description: "Check for SQL injection, XSS, CSRF; validate JWT implementation" },
      { title: "Performance Testing", description: "Load testing with multiple concurrent users, optimize DB queries" },
      { title: "Bug Fixing Sprint", description: "Create bug tracker, prioritize and fix critical issues" },
    ],
    milestone: { title: "Application Tested & Stable", description: "All major bugs fixed, security validated, performance optimized" },
  },
  {
    id: 9,
    title: "Deployment & Documentation",
    weeks: "Week 20",
    duration: "1 week",
    tasks: [
      { title: "Set Up Production Environment", description: "Configure MongoDB Atlas, set up environment variables for production" },
      { title: "Deploy Backend", description: "Deploy Node.js API to Heroku/AWS/DigitalOcean" },
      { title: "Deploy Frontend", description: "Build React app, deploy to Vercel/Netlify/AWS S3" },
      { title: "Domain & SSL Setup", description: "Configure custom domain, enable HTTPS with SSL certificate" },
      { title: "API Documentation", description: "Create API docs with Swagger/Postman collections" },
      { title: "User Manual", description: "Write documentation for students, faculty, admin usage" },
      { title: "Technical Documentation", description: "Document system architecture, database schema, deployment process" },
      { title: "Demo Video & Presentation", description: "Create project demo video and presentation slides" },
    ],
    milestone: { title: "Production Deployment Complete", description: "Application live, documented, ready for use" },
  },
  {
    id: 10,
    title: "Post-Launch & Maintenance",
    weeks: "Week 21+",
    duration: "Ongoing",
    tasks: [
      { title: "User Training Sessions", description: "Conduct training for faculty and admin users" },
      { title: "Monitor Application Performance", description: "Set up logging, monitoring (PM2, New Relic, DataDog)" },
      { title: "Gather User Feedback", description: "Collect feedback from students and faculty for improvements" },
      { title: "Bug Fixes & Patches", description: "Address reported issues, release patches" },
      { title: "Feature Enhancements", description: "Plan and implement requested features (analytics, calendar, reports)" },
    ],
    milestone: { title: "Continuous Improvement", description: "Sustained operations with feedback-driven enhancements" },
  },
];

export const features = [
  { icon: "🔐", title: "Authentication & Security", items: ["JWT-based authentication", "Secure password hashing (bcrypt)", "Password reset functionality", "Session management", "Role-based access control"] },
  { icon: "👥", title: "User Management", items: ["Hierarchical user creation", "Admin manages faculty", "Faculty manages students", "User approval workflow", "Profile management"] },
  { icon: "📅", title: "Event Management", items: ["Create events with details", "Upload event banners", "Add contact information", "Track event status", "View approval history"] },
  { icon: "✅", title: "Approval Workflow", items: ["Multi-level approval chain", "Approve/Reject/Forward actions", "Add approval comments", "Flexible workflow termination", "Approval history tracking"] },
  { icon: "📧", title: "Email Notifications", items: ["Event submission alerts", "Approval notifications", "Rejection alerts with reasons", "Cancellation notifications", "Custom email templates"] },
  { icon: "🗂️", title: "Status Tracking", items: ["Real-time status updates", "Pending at each level", "Approved/Rejected states", "Cancelled status", "Visual progress indicators"] },
  { icon: "🖼️", title: "File Management", items: ["Banner image upload", "Cloudinary integration", "Image optimization", "Preview before upload", "Secure file storage"] },
  { icon: "🎯", title: "Dashboards", items: ["Role-specific dashboards", "Event statistics", "Pending approvals count", "Recent activity feed", "Quick action buttons"] },
  { icon: "🔍", title: "Search & Filter", items: ["Search events by title", "Filter by status", "Filter by date range", "Filter by creator", "Advanced search options"] },
];

export const techCore = [
  { icon: "💚", name: "MongoDB", items: ["NoSQL Database", "Mongoose ODM", "Schema validation", "Indexing for performance", "Atlas cloud hosting"] },
  { icon: "⚡", name: "Express.js", items: ["Web application framework", "RESTful API design", "Middleware architecture", "Error handling", "CORS configuration"] },
  { icon: "⚛️", name: "React.js", items: ["Component-based UI", "React Hooks", "React Router", "Context API / Redux", "Responsive design"] },
  { icon: "🟢", name: "Node.js", items: ["JavaScript runtime", "Asynchronous I/O", "NPM package management", "Environment variables", "Event-driven architecture"] },
];

export const techExtras = [
  { icon: "🔐", name: "Authentication", items: ["JSON Web Tokens (JWT)", "bcrypt.js (password hashing)", "Passport.js (optional)"] },
  { icon: "📁", name: "File Upload", items: ["Multer (file handling)", "Cloudinary (cloud storage)", "Sharp (image optimization)"] },
  { icon: "📧", name: "Email Service", items: ["Nodemailer", "Gmail SMTP / SendGrid", "HTML email templates"] },
  { icon: "🎨", name: "UI Styling", items: ["Tailwind CSS / Material-UI", "React Icons", "CSS Modules"] },
  { icon: "🧪", name: "Testing", items: ["Jest (unit testing)", "React Testing Library", "Supertest (API testing)"] },
  { icon: "🚀", name: "Deployment", items: ["Vercel / Netlify (frontend)", "Heroku / AWS (backend)", "MongoDB Atlas (database)"] },
];

export const timeline = [
  { weeks: "Weeks 1–2", title: "Setup", desc: "Project initialization, planning, environment setup, schema design" },
  { weeks: "Weeks 3–5", title: "Backend Core", desc: "Authentication, user management, JWT, RBAC implementation" },
  { weeks: "Weeks 6–8", title: "Event System", desc: "Event CRUD, approval workflow, file uploads, status tracking" },
  { weeks: "Week 9", title: "Email System", desc: "Nodemailer setup, email templates, notification triggers" },
  { weeks: "Weeks 10–12", title: "Frontend Core", desc: "React setup, authentication UI, dashboards, routing" },
  { weeks: "Weeks 13–15", title: "Event UI", desc: "Event forms, lists, approval interfaces, status displays" },
  { weeks: "Weeks 16–17", title: "User UI", desc: "User management interfaces, profiles, tables" },
  { weeks: "Weeks 18–19", title: "Testing", desc: "Unit tests, integration tests, security audit, bug fixes" },
  { weeks: "Week 20", title: "Deployment", desc: "Production setup, deployment, documentation, demo" },
  { weeks: "Week 21+", title: "Maintenance", desc: "Training, monitoring, feedback, enhancements" },
];

export const workflow = ["Student", "Class Advisor", "HOD", "ED", "Principal"];
