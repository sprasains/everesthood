# 🚀 Beginner-Friendly Setup Guide

## Before You Start

### What You Need
1. **Computer Requirements**
   - Windows 10/11, Mac, or Linux
   - At least 8GB RAM
   - At least 10GB free disk space

2. **Software to Install First**
   - VS Code: Download from https://code.visualstudio.com
   - Node.js: Download the LTS version from https://nodejs.org
   - Git: Download from https://git-scm.com/downloads

### Basic Terms
- **Node.js**: The platform that runs our JavaScript code
- **npm/pnpm**: Tools that help us install other tools and libraries
- **Git**: Helps us track changes in our code
- **VS Code**: The editor we use to write code
- **Terminal**: A text-based way to run commands (like Command Prompt or PowerShell)

## Step-by-Step Setup

### 1. Install Basic Tools

#### Windows:
1. **Install Node.js**
   - Download the "LTS" version from https://nodejs.org
   - Double-click the downloaded file
   - Click "Next" through the installer
   - To verify it worked, open PowerShell and type:
   ```powershell
   node --version
   ```
   You should see something like `v18.x.x`

2. **Install pnpm**
   - Open PowerShell and run:
   ```powershell
   iwr https://get.pnpm.io/install.ps1 -useb | iex
   ```
   - Close and reopen PowerShell
   - Verify by running:
   ```powershell
   pnpm --version
   ```

3. **Install Git**
   - Download from https://git-scm.com/downloads
   - Run the installer
   - Use all default options
   - Verify by opening PowerShell and typing:
   ```powershell
   git --version
   ```

4. **Install VS Code**
   - Download from https://code.visualstudio.com
   - Run the installer
   - Make sure to check "Add to PATH" during installation

#### Mac:
1. **Install Homebrew**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js and pnpm**
   ```bash
   brew install node
   brew install pnpm
   ```

3. **Install Git**
   ```bash
   brew install git
   ```

4. **Install VS Code**
   - Download from https://code.visualstudio.com
   - Move the app to your Applications folder

### 2. Set Up Your Project

1. **Open VS Code**
   - Click "File" → "Open Folder"
   - Create a new folder called "everesthood"
   - Select this folder

2. **Open the Terminal in VS Code**
   - Press `Ctrl + `` (the key above Tab)
   - Or click "View" → "Terminal"

3. **Clone the Project**
   ```bash
   # Copy this command exactly as shown
   git clone https://github.com/sprasains/everesthood.git .
   ```
   - The dot at the end is important! It means "put it in the current folder"

4. **Install Project Tools**
   ```bash
   # Install all the project's needs
   pnpm install
   ```
   - This might take a few minutes
   - You might see some warnings (yellow text) - that's usually OK
   - Red text (errors) might need attention

### 3. Set Up the Database

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: Run `brew install postgresql`
   - During installation:
     - Remember the password you set!
     - Use the default port (5432)
     - Use all other default settings

2. **Start PostgreSQL**
   - Windows: It starts automatically
   - Mac: Run `brew services start postgresql`

3. **Create Your Database**
   ```bash
   # Log into PostgreSQL
   psql -U postgres
   
   # In the PostgreSQL prompt, type:
   CREATE DATABASE everesthood;
   
   # To exit PostgreSQL, type:
   \q
   ```

### 4. Set Up Environment Variables

1. **Create Environment File**
   - In VS Code, create a new file called `.env.local`
   - Copy this content (replace values in caps with your info):
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/everesthood"
   NEXTAUTH_SECRET="make-up-a-long-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Initialize Database**
   ```bash
   # Generate database client
   pnpm prisma generate

   # Create database tables
   pnpm prisma db push
   ```

### 5. Start the Project

1. **Start the Development Server**
   ```bash
   pnpm dev
   ```

2. **Check Your Work**
   - Open your web browser
   - Go to `http://localhost:3000`
   - You should see the EverestHood homepage!

### 6. Install VS Code Extensions

1. Open VS Code
2. Click the "Extensions" icon (looks like four squares)
3. Install these extensions:
   - "ESLint" (helps find code problems)
   - "Prettier" (makes code look nice)
   - "TypeScript and JavaScript Language Features"
   - "Prisma" (for database work)
   - "GitLens" (helps with Git)

## Common Problems and Solutions

### "Command not found"
- Close and reopen your terminal
- On Windows, make sure you're using PowerShell
- Check if the tool is installed:
  ```bash
  pnpm --version
  node --version
  git --version
  ```

### Database Connection Error
- Make sure PostgreSQL is running
- Check your password in `.env.local`
- Make sure the database exists:
  ```bash
  psql -U postgres -l
  ```

### "Port already in use"
- Something's already running on port 3000
- Find and close the other program, or use a different port:
  ```bash
  pnpm dev --port 3001
  ```

### Git Problems
- Make sure you have Git installed:
  ```bash
  git --version
  ```
- If you get authentication errors:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

## Getting Help

### When You're Stuck
1. Read any error messages carefully
2. Check the Common Problems section above
3. Look in our Troubleshooting Guide
4. Ask a team member!

When asking for help, always include:
- What you were trying to do
- The exact error message
- What you've already tried

### Useful VS Code Tips
- `Ctrl + S`: Save your work
- `Ctrl + C`: Stop a running program
- `` Ctrl + ` ``: Open/close terminal
- `Ctrl + Shift + P`: Command palette (search for actions)

## Next Steps
Once everything is set up:
1. Read the `README.md` file
2. Look at our other guides in the `docs` folder
3. Try making a small change to the code
4. Ask questions! We're here to help!

## Daily Workflow
1. Pull latest changes:
   ```bash
   git pull
   ```

2. Install any new dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open in your browser:
   - Go to `http://localhost:3000`

Remember: It's okay to ask questions! Everyone was a beginner once. 😊
