# IGA Solution - Integrated Learning Management System

A comprehensive learning management system built with React (Frontend) and Spring Boot (Backend) that enables students to enroll in courses, instructors to create and manage courses, and administrators to oversee the entire platform.

## 🚀 Features

### For Students
- User registration and authentication
- Course browsing and enrollment
- Interactive learning dashboard
- Assignment submission and tracking
- Grade monitoring
- Payment processing integration

### For Instructors
- Instructor application and approval system
- Course creation and management
- Student progress tracking
- Assignment creation and grading
- Earnings dashboard

### For Administrators
- Complete platform oversight
- Instructor approval workflow
- Student management
- Role-based access control
- Platform analytics and reporting

## 🏗️ Architecture

```
IgaSolution/
├── IgaBackend/          # Spring Boot REST API
├── Igafrontend/         # React + Vite Frontend
└── README.md           # This file
```

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Java 17+** (for Spring Boot backend)
- **Node.js 18+** (for React frontend)
- **Maven 3.8+** (for backend dependency management)
- **PostgreSQL 13+** (database)
- **Git** (version control)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IgaSolution
```

### 2. Database Setup

1. Install PostgreSQL
2. Create a database named `iga_database`
3. Update database credentials in backend configuration

```sql
CREATE DATABASE iga_database;
CREATE USER iga_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE iga_database TO iga_user;
```

### 3. Backend Setup (Spring Boot)

```bash
cd IgaBackend

# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
nano .env

# Install dependencies and run
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on: `http://localhost:5000`

### 4. Frontend Setup (React + Vite)

```bash
cd Igafrontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local file with your configurations
nano .env.local

# Start development server
npm run dev
```

The frontend will start on: `http://localhost:8080`

## 🌍 Environment Configuration

### Backend Environment Variables (.env)

Create a `.env` file in the `IgaBackend` directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iga_database
DB_USERNAME=iga_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=5000
APP_URL=http://localhost:5000

# Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# File Storage Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=iga-storage

# Payment Gateway (Optional)
PAYMENT_API_KEY=your-payment-api-key
PAYMENT_SECRET=your-payment-secret
```

### Frontend Environment Variables (.env.local)

Create a `.env.local` file in the `Igafrontend` directory:

```bash
# API Configuration
VITE_APPCONNECTION=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=IGA Learning Platform
VITE_APP_VERSION=1.0.0

# Frontend URL
VITE_FRONTEND_URL=http://localhost:8080

# Payment Configuration (Optional)
VITE_PAYMENT_PUBLIC_KEY=your-payment-public-key
```

## 🚀 Running the Project

### Development Mode

1. **Start Backend:**
```bash
cd IgaBackend
./mvnw spring-boot:run
```

2. **Start Frontend:**
```bash
cd Igafrontend
npm run dev
```

### Production Build

1. **Build Frontend:**
```bash
cd Igafrontend
npm run build
```

2. **Build Backend:**
```bash
cd IgaBackend
./mvnw clean package
java -jar target/iga-backend-1.0.0.jar
```

## 📱 Application URLs

### Frontend Routes
- **Home:** `http://localhost:8080/`
- **Student Login:** `http://localhost:8080/student/login`
- **Student Dashboard:** `http://localhost:8080/student/dashboard`
- **Instructor Login:** `http://localhost:8080/coach/login`
- **Instructor Dashboard:** `http://localhost:8080/coach/dashboard`
- **Admin Login:** `http://localhost:8080/admin/login`
- **Admin Dashboard:** `http://localhost:8080/admin/dashboard`

### Backend API Endpoints
- **API Base:** `http://localhost:5000/api/v1`
- **Authentication:** `http://localhost:5000/api/v1/auth`
- **Admin Endpoints:** `http://localhost:5000/api/v1/admin`
- **Student Endpoints:** `http://localhost:5000/api/v1/student`
- **Instructor Endpoints:** `http://localhost:5000/api/v1/instructor`

## 🗃️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** (students, instructors, admins)
- **Courses** (course information and content)
- **Enrollments** (student-course relationships)
- **Assignments** (course assignments and submissions)
- **Payments** (payment transactions)
- **InstructorData** (instructor application details)

## 🔐 Default Admin Account

For initial setup, you may need to create an admin account manually in the database:

```sql
INSERT INTO user_schema (id, first_name, last_name, email, password, role, created_at) 
VALUES (
    gen_random_uuid(), 
    'Admin', 
    'User', 
    'admin@iga.com', 
    '$2a$10$encrypted_password_here', 
    'ADMIN', 
    NOW()
);
```

## 🧪 Testing

### Backend Testing
```bash
cd IgaBackend
./mvnw test
```

### Frontend Testing
```bash
cd Igafrontend
npm run test
```

## 📦 Build for Production

### Frontend Production Build
```bash
cd Igafrontend
npm run build
```

### Backend Production JAR
```bash
cd IgaBackend
./mvnw clean package -Pprod
```

## 🛠️ Available Scripts

### Backend Scripts
- `./mvnw clean` - Clean build artifacts
- `./mvnw compile` - Compile the project
- `./mvnw test` - Run tests
- `./mvnw spring-boot:run` - Start development server
- `./mvnw package` - Build JAR file

### Frontend Scripts
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development:** React + Vite + TypeScript
- **Backend Development:** Spring Boot + PostgreSQL
- **UI/UX:** Tailwind CSS + shadcn/ui

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Contact the development team

## 📈 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Video streaming integration
- [ ] Multi-language support
- [ ] Advanced payment gateway integration
- [ ] AI-powered course recommendations

---

**Happy Learning! 🎓**