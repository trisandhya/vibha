VIBHA - Copilot Development Instructions
Project Vision
VIBHA is a self-discovery and self-reflection web application.

The application acts as a simple mirror for users to assess their current situation, reflect on their progress, and generate awareness about their own journey.

VIBHA is NOT:

A therapy platform
A medical system
A social network
A data collection service
A cloud-dependent application
VIBHA IS:

A self-assessment tool
A reflection platform
A local-first application
Privacy focused
Mobile friendly
Easy to understand
Multi-language capable
Core Philosophy
Keep everything simple.

Users should be able to:

Open the website
Select language
Answer a few questions
View reflection results
Download their report
Close the browser
No sign-in.

No registration.

No mandatory cloud storage.

No user tracking.

No advertisements.

No dark patterns.

Technical Constraints
Hosting
Target Platform:

GitHub Pages
Deployment:

Static Website Only
No backend server.

No database.

No API dependency for core functionality.

Technology Stack
Use only:

HTML5
CSS3
Vanilla JavaScript (ES6+)
Avoid:

React
Angular
Vue
NextJS
Nuxt
Svelte
Bootstrap dependency
CSS should be lightweight and custom.

Mobile First Design
Design for mobile devices first.

Target screen width: 360px (smallest common mobile width)
Use responsive design techniques to adapt to larger screens.

Requirements:

Large touch targets
High contrast
Accessible fonts
Simple navigation

Local First Architecture

All user data remains inside browser storage.

Use:

JavaScript
localStorage

for persistence.

Never require a backend service.

Never collect personal information.

Application Flow
Plain Text
Home
↓
 
Language Selection
↓
 
Questionnaire
↓
 
Analysis
↓
 
Reflection
↓
 
Report Download
