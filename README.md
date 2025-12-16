# Crowd Management System – Frontend

Frontend implementation of the Crowd Management System assignment, built using Angular.  
The application visualizes crowd analytics and entry/exit data by consuming backend-provided APIs.

---

##  Live Demo
https://crowd-management-system-smoky.vercel.app/login

---

## Features
- Login with authentication flow
- Overview dashboard with:
  - Live occupancy
  - Today’s footfall
  - Average dwell time
  - Time-series analytics charts
- Crowd entries page with paginated entry/exit records
- Global alerts UI with severity indicators
- Persistent layout with sidebar and topbar

---

##  Technical Notes
- Built with Angular (standalone components)
- UI strictly consumes backend APIs (no metric computation in frontend)
- Alerts UI is transport-agnostic (REST polling / WebSockets)
- API contracts assumed as per Swagger

---

##  Setup & Run Locally

### Prerequisites
- Node.js (LTS)
- npm

### Install dependencies
```bash
npm install
