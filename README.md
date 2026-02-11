# SkillVouch AI - Quiz Generation Platform

<div align="center">
  <img src="public/skillvouch-logo.png" alt="SkillVouch AI Logo" width="200" height="200">
</div>

An AI-powered quiz generation platform that creates personalized assessments based on user skills and requirements.

## 🚀 Features

- AI-driven quiz generation using Mistral AI
- Skill assessment and matching
- Real-time quiz creation and evaluation
- Modern React + TypeScript frontend
- Express.js backend with MySQL database

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **AI Services:** Mistral AI, OpenRouter (Llama 3.3 70B)
- **Database:** MySQL
- **Icons:** Lucide React
- **Charts:** Recharts

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database
- Mistral AI API key
- OpenRouter API key (optional, for Llama 3.3 70B)

## 🚀 Quick Start

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
   VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here
   LLAMA_API_KEY=your-openrouter-api-key-here
   
   # Configure database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=skillvouch
   ```

4. **Set up your database:**
   - Create a MySQL database named `skillvouch`
   - Import the database schema (if available)

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

2. **OpenRouter API Key (Optional):**
   - Get your free key from: https://openrouter.ai/settings/keys
   - Provides access to Llama 3.3 70B with generous free limits

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

**Note:** This project uses AI services that may require API keys with associated costs. Please check the pricing details for each service before usage.
