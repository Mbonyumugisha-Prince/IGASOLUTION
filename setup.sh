#!/bin/bash

# IGA Solution Quick Setup Script
# This script helps you set up the development environment quickly

set -e  # Exit on any error

echo "🚀 IGA Solution - Quick Setup Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 17 or higher."
        exit 1
    else
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
        if [[ "$JAVA_VERSION" -lt 17 ]]; then
            print_error "Java version 17 or higher is required. Current version: $JAVA_VERSION"
            exit 1
        fi
        print_success "Java $JAVA_VERSION found"
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_VERSION" -lt 18 ]]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
        print_success "Node.js v$(node -v) found"
    fi
    
    # Check Maven
    if ! command -v mvn &> /dev/null; then
        print_error "Maven is not installed. Please install Maven 3.8 or higher."
        exit 1
    else
        print_success "Maven $(mvn -v | head -n1 | cut -d' ' -f3) found"
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found. Make sure PostgreSQL is installed and running."
    else
        print_success "PostgreSQL client found"
    fi
    
    print_success "All prerequisites are met!"
}

# Setup backend environment
setup_backend() {
    print_status "Setting up backend environment..."
    
    cd IgaBackend
    
    # Copy environment template if .env doesn't exist
    if [[ ! -f .env ]]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit IgaBackend/.env file with your actual configuration before running the backend"
    else
        print_warning ".env file already exists. Skipping template copy."
    fi
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    ./mvnw clean compile
    print_success "Backend dependencies installed"
    
    cd ..
}

# Setup frontend environment
setup_frontend() {
    print_status "Setting up frontend environment..."
    
    cd Igafrontend
    
    # Copy environment template if .env.local doesn't exist
    if [[ ! -f .env.local ]]; then
        cp .env.example .env.local
        print_success "Created .env.local file from template"
        print_warning "Please edit Igafrontend/.env.local file with your actual configuration"
    else
        print_warning ".env.local file already exists. Skipping template copy."
    fi
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    cd ..
}

# Create database setup instructions
create_database_instructions() {
    print_status "Creating database setup instructions..."
    
    cat > database_setup.sql << EOF
-- IGA Solution Database Setup
-- Run these commands in your PostgreSQL instance

-- Create database
CREATE DATABASE iga_database;

-- Create user (optional, you can use existing user)
CREATE USER iga_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE iga_database TO iga_user;

-- Connect to the database
\c iga_database;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO iga_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iga_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iga_user;

-- Create initial admin user (optional)
-- Note: Replace 'your_hashed_password' with actual bcrypt hash
-- You can generate one at: https://bcrypt-generator.com/
/*
INSERT INTO user_schema (id, first_name, last_name, email, password, role, created_at) 
VALUES (
    gen_random_uuid(), 
    'Admin', 
    'User', 
    'admin@iga.com', 
    '\$2a\$10\$your_hashed_password_here', 
    'ADMIN', 
    NOW()
);
*/

EOF

    print_success "Database setup instructions created in database_setup.sql"
}

# Create run scripts
create_run_scripts() {
    print_status "Creating run scripts..."
    
    # Backend run script
    cat > run_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting IGA Backend..."
cd IgaBackend
./mvnw spring-boot:run
EOF
    chmod +x run_backend.sh
    
    # Frontend run script
    cat > run_frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting IGA Frontend..."
cd Igafrontend
npm run dev
EOF
    chmod +x run_frontend.sh
    
    # Combined run script
    cat > run_both.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting IGA Solution (Backend + Frontend)..."

# Function to kill background processes on script exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup EXIT INT TERM

# Start backend
echo "Starting backend..."
cd IgaBackend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd Igafrontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:8080"
echo "Press Ctrl+C to stop both servers"

# Wait for either process to finish
wait $BACKEND_PID $FRONTEND_PID
EOF
    chmod +x run_both.sh
    
    print_success "Run scripts created (run_backend.sh, run_frontend.sh, run_both.sh)"
}

# Main setup function
main() {
    print_status "Starting IGA Solution setup..."
    
    # Check if we're in the right directory
    if [[ ! -d "IgaBackend" ]] || [[ ! -d "Igafrontend" ]]; then
        print_error "This script must be run from the IgaSolution root directory"
        print_error "Expected directories: IgaBackend, Igafrontend"
        exit 1
    fi
    
    check_prerequisites
    setup_backend
    setup_frontend
    create_database_instructions
    create_run_scripts
    
    print_success "Setup completed successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "1. Set up PostgreSQL database using: database_setup.sql"
    echo "2. Edit configuration files:"
    echo "   - IgaBackend/.env"
    echo "   - Igafrontend/.env.local"
    echo "3. Run the application:"
    echo "   - Backend only: ./run_backend.sh"
    echo "   - Frontend only: ./run_frontend.sh" 
    echo "   - Both: ./run_both.sh"
    echo ""
    print_status "Application URLs:"
    echo "   - Frontend: http://localhost:8080"
    echo "   - Backend API: http://localhost:5000/api/v1"
    echo "   - Admin Login: http://localhost:8080/admin/login"
    echo ""
    print_warning "Don't forget to configure your database and environment variables!"
}

# Run main function
main "$@"