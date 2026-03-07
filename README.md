# JobPortal - Professional Job Portal Web Application


## Overview
**JobPortal** is a comprehensive web application designed to connect job seekers and employers efficiently.  
Built for scalability and modern user experience, it allows seamless job posting, application, and management.

Key objectives:
- Provide an intuitive platform for job seekers to explore opportunities.
- Enable employers to post jobs and manage applications efficiently.
- Offer secure authentication and personalized dashboards for all users.

## Features
- User Roles: **Job Seeker**, **Employer**, **Admin**
- Job Posting & Management
- Resume Upload 
- Advanced Job Search & Filters
- Real-time Notifications & Alerts
- Dashboard Analytics for Employers
- Secure Authentication & Role-based Access Control

## Tech Stack
- **Backend:** Django 6.0
- **Frontend:** React / Tailwind CSS
- **Database:** PostgreSQL (Production), SQLite (Development)
- **APIs:** REST Framework (DRF)
- **Authentication:** JWT & Django Auth
- **Version Control:** Git

## Installation
### Prerequisites
- Python 3.10+
- Node.js & npm
- PostgreSQL (optional, SQLite for quick setup)
- Virtualenv (recommended)

### Steps
```bash
# Clone the repository
git clone https://github.com/CODE-WITH-AMUL/jobSarathi.git
cd jobSarathi

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt



# Apply migrations
python manage.py migrate

# Create superuser (Admin)
python manage.py createsuperuser

# Run the development server
python manage.py runserver