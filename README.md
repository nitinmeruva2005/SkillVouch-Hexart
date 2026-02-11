# SkillVouch AI - Quiz Generation Platform

<div align="center">
  <img src="SkillVouch Logo.jpg" alt="SkillVouch AI Logo" width="600" height="400">
</div>

An AI-powered quiz generation platform that creates personalized assessments based on user skills and requirements.Works seamlessly on **MacOS,Windows,Linux**

## 🚀 Features

- AI-driven quiz generation using Mistral AI
- Skill assessment and matching
- Real-time quiz creation and evaluation
- Modern React + TypeScript frontend
- Express.js backend with MySQL database

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **AI Services:** Mistral AI
- **Database:** MySQL
- **Icons:** Lucide React
- **Charts:** Recharts

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm 
- MySQL database
- Mistral AI API key

##🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd skillvouch-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit backend/.env and add your API keys:
   MISTRAL_API_KEY=your-mistral-api-key-here


   # Configure database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=skillvouch
   ```

4. **Set up your database:**

   **For macOS:**
   ```bash
   # Install MySQL
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   
   # Login to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE backend/sql/schema.sql;
   ```
   
   **For Windows:**
   ```bash
   # Download and install MySQL from: https://dev.mysql.com/downloads/mysql/
   # During installation, set root password and note it down
   
   # Open MySQL Command Line Client (from Start Menu)
   # Enter your root password when prompted
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE C:/path/to/your/project/backend/sql/schema.sql;
   ```

   **For Linux (Ubuntu/Debian):**
   ```bash
   # Install MySQL
   sudo apt update
   sudo apt install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # Secure MySQL (optional but recommended)
   sudo mysql_secure_installation
   
   # Login to MySQL
   sudo mysql -u root -p
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE /path/to/your/project/backend/sql/schema.sql;
   ```

   **For Linux (Fedora/CentOS):**
   ```bash
   # Install MySQL
   sudo dnf install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysqld
   sudo systemctl enable mysqld
   
   # Login to MySQL
   sudo mysql -u root -p
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE /path/to/your/project/backend/sql/schema.sql;
   ```

5. **Run the application:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`
   The backend API will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Environment Variables

### Required API Keys

1. **Mistral AI API Key:**
   - Get your key from: https://console.mistral.ai/
   - Used for quiz generation

### Database Configuration

Make sure your MySQL server is running and the database credentials in `backend/.env` are correct.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
- Check the existing issues
- Create a new issue with detailed information
- Include your environment details and error messages

---


