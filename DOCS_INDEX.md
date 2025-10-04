# 📚 Rootine Documentation Index

Welcome to the Rootine documentation! This index will help you find the information you need.

## 🚀 Getting Started

Start here if you're new to the project:

1. **[README.md](README.md)** - Project overview, features, and comprehensive documentation
2. **[SETUP.md](SETUP.md)** - Step-by-step setup instructions
3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands and common patterns

### Installation
```powershell
# Quick setup (recommended)
.\install.ps1

# Manual setup
npm install
copy .env.example .env
npm start
```

## 📖 Main Documentation

### For Users
- **[README.md](README.md)** - Complete project documentation
  - Features overview
  - Tech stack
  - App structure
  - Key concepts
  - Future enhancements

### For Developers
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide
  - Architecture overview
  - Project structure
  - Core concepts
  - Development workflow
  - Code style & standards
  - Common tasks
  - Troubleshooting

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide
  - Essential commands
  - Common imports
  - File locations
  - Theme quick access
  - Common patterns
  - Debugging tips

### For Contributors
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
  - Ways to contribute
  - Development process
  - Commit message guidelines
  - Code style
  - Pull request process
  - Bug reports
  - Feature requests

## 🔧 Technical Documentation

### Setup & Configuration
- **[SETUP.md](SETUP.md)** - Detailed setup guide
  - Prerequisites
  - Firebase configuration
  - Gemini API setup
  - Environment variables
  - Troubleshooting

- **[FIREBASE_RULES.md](FIREBASE_RULES.md)** - Firebase security rules
  - Firestore rules
  - Storage rules
  - Security best practices
  - Testing rules

### Project Status
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Implementation status
  - Completed features
  - In-progress features
  - Planned features
  - Current progress
  - Next steps

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project summary
  - What has been built
  - Project statistics
  - What's ready to use
  - Next steps for implementation

## 📁 Code Documentation

### Source Code Structure
```
src/
├── screens/           # Screen components
│   ├── auth/         # Authentication screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── ProfileSetupScreen.tsx
│   └── main/         # Main app screens
│       ├── HomeScreen.tsx
│       ├── HabitsScreen.tsx
│       ├── FeedScreen.tsx
│       ├── DietScreen.tsx
│       └── ProfileScreen.tsx
├── components/        # Reusable components
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── services/         # External services
│   ├── firebase/
│   │   ├── config.ts
│   │   └── authService.ts
│   └── api/
│       └── geminiService.ts
├── utils/            # Utility functions
│   ├── helpers.ts
│   └── notifications.ts
├── types/            # TypeScript types
│   └── index.ts
└── constants/        # App constants
    └── theme.ts
```

## 🎯 Quick Navigation

### I want to...

**Set up the project**
→ [SETUP.md](SETUP.md)

**Understand the architecture**
→ [DEVELOPMENT.md](DEVELOPMENT.md)

**See what's implemented**
→ [PROJECT_STATUS.md](PROJECT_STATUS.md)

**Contribute to the project**
→ [CONTRIBUTING.md](CONTRIBUTING.md)

**Configure Firebase**
→ [FIREBASE_RULES.md](FIREBASE_RULES.md)

**Find quick commands**
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**Get project overview**
→ [README.md](README.md)

**See complete summary**
→ [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 🔍 Finding Specific Information

### Setup & Installation
- Initial setup → [SETUP.md](SETUP.md) - Steps 1-10
- Environment variables → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Environment Variables
- Troubleshooting setup → [SETUP.md](SETUP.md) - Troubleshooting

### Development
- Code style → [DEVELOPMENT.md](DEVELOPMENT.md) - Code Style & Standards
- Common patterns → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Common Patterns
- Project structure → [DEVELOPMENT.md](DEVELOPMENT.md) - Project Structure

### Features
- Implemented features → [PROJECT_STATUS.md](PROJECT_STATUS.md) - Completed
- Planned features → [PROJECT_STATUS.md](PROJECT_STATUS.md) - To Be Implemented
- Feature descriptions → [README.md](README.md) - Features

### Firebase
- Security rules → [FIREBASE_RULES.md](FIREBASE_RULES.md)
- Firebase setup → [SETUP.md](SETUP.md) - Steps 2-5
- Firebase services → [DEVELOPMENT.md](DEVELOPMENT.md) - Core Concepts

### API & Services
- Gemini AI integration → [PROJECT_STATUS.md](PROJECT_STATUS.md) - Services
- Authentication → [DEVELOPMENT.md](DEVELOPMENT.md) - Authentication Flow
- Notifications → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Scheduling Notifications

## 📱 Platform-Specific Info

### iOS
- Setup → [SETUP.md](SETUP.md) - Testing on Physical Device
- Running → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Development Commands

### Android
- Setup → [SETUP.md](SETUP.md) - Testing on Physical Device
- Running → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Development Commands

### Web
- Running → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Development Commands
- Notes → [PROJECT_STATUS.md](PROJECT_STATUS.md) - Platform-Specific Notes

## 🐛 Troubleshooting

### Common Issues
- Setup issues → [SETUP.md](SETUP.md) - Troubleshooting
- Development issues → [DEVELOPMENT.md](DEVELOPMENT.md) - Troubleshooting
- Quick fixes → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Debugging

### Getting Help
1. Check troubleshooting sections in docs
2. Search existing documentation
3. Create an issue on GitHub
4. See [CONTRIBUTING.md](CONTRIBUTING.md) - Questions

## 📊 Project Progress

### Current Status
- **Foundation**: ✅ 100% Complete
- **Authentication**: ✅ 100% Complete
- **Core Features**: 🔄 30% Complete
- **Advanced Features**: ⏳ 0% Complete

### Next Steps
1. Implement habit tracking system
2. Build social features
3. Create diet UI
4. Add media uploads
5. Polish and optimize

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed progress.

## 🎓 Learning Resources

### External Documentation
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Firebase](https://firebase.google.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Internal Documentation
- All markdown files in the root directory
- Code comments in source files
- Type definitions in `src/types/index.ts`

## 🤝 Contributing

Want to help? Great! Start here:
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for what needs work
3. Follow guidelines in [DEVELOPMENT.md](DEVELOPMENT.md)
4. Submit a pull request!

## 📝 Documentation Updates

Keep documentation up to date:
- Update relevant docs when changing code
- Add examples for new features
- Keep PROJECT_STATUS.md current
- Update this index when adding new docs

## 💡 Tips

- **New to project?** Start with README.md → SETUP.md → QUICK_REFERENCE.md
- **Developing?** Keep QUICK_REFERENCE.md handy
- **Contributing?** Read CONTRIBUTING.md first
- **Stuck?** Check troubleshooting sections

## 📞 Support

- **Documentation Issues**: Create a PR to fix
- **Questions**: Create a GitHub issue
- **Bugs**: Use the bug report template
- **Features**: Use the feature request template

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 All Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| [README.md](README.md) | Main project documentation | Everyone |
| [SETUP.md](SETUP.md) | Setup instructions | New users |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development guide | Developers |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines | Contributors |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Implementation status | Everyone |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete summary | Everyone |
| [FIREBASE_RULES.md](FIREBASE_RULES.md) | Firebase security rules | Developers |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick reference | Developers |
| [DOCS_INDEX.md](DOCS_INDEX.md) | This file | Everyone |

---

**Happy Building! 🚀**

For the most up-to-date information, always check the relevant documentation file.
