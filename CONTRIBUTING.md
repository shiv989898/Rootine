# Contributing to Rootine

Thank you for your interest in contributing to Rootine! This document provides guidelines and instructions for contributing to the project.

## 🎯 Ways to Contribute

- **Code**: Implement new features, fix bugs, improve performance
- **Documentation**: Improve or write new documentation
- **Design**: Create UI/UX improvements, icons, or assets
- **Testing**: Write tests, report bugs, test on different devices
- **Ideas**: Suggest new features or improvements

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```powershell
   git clone https://github.com/your-username/rootine.git
   cd rootine
   ```
3. **Set up the project**
   ```powershell
   .\install.ps1
   ```
4. **Create a branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Process

### Before You Start
1. Check existing issues and pull requests
2. Create an issue to discuss major changes
3. Follow the project structure and conventions
4. Read DEVELOPMENT.md for coding guidelines

### While Developing
1. Write clean, readable code
2. Follow TypeScript best practices
3. Use existing utilities and components
4. Keep commits small and focused
5. Write meaningful commit messages

### Before Submitting
1. Test your changes thoroughly
2. Ensure TypeScript compiles: `npm run type-check`
3. Run linter: `npm run lint`
4. Test on both iOS and Android (if possible)
5. Update documentation if needed

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(habits): add habit completion toggle
fix(auth): resolve login validation error
docs(readme): update setup instructions
style(theme): adjust spacing constants
refactor(services): simplify Firebase queries
perf(list): implement virtualized list
test(utils): add tests for date helpers
chore(deps): update dependencies
```

## 🏗️ Project Structure

```
src/
├── screens/        # Full-screen components
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── services/       # External service integrations
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── constants/      # App constants and theme
```

### Where to Add Your Code

| Feature | Location |
|---------|----------|
| New screen | `src/screens/main/` or `src/screens/auth/` |
| Reusable component | `src/components/common/` |
| Feature-specific component | `src/components/[feature]/` |
| API integration | `src/services/api/` |
| Firebase operation | `src/services/firebase/` |
| Utility function | `src/utils/` |
| Type definition | `src/types/index.ts` |
| Theme/constant | `src/constants/theme.ts` |

## 🎨 Code Style

### TypeScript
- Always use explicit types
- Avoid `any` type
- Use interfaces for object shapes
- Export types from `src/types/index.ts`

```typescript
// ✅ Good
interface Props {
  userId: string;
  onComplete: (success: boolean) => void;
}

const MyComponent: React.FC<Props> = ({ userId, onComplete }) => {
  // ...
};

// ❌ Bad
const MyComponent = ({ userId, onComplete }) => {
  // implicit any types
};
```

### React Components
- Use functional components with hooks
- Extract complex logic to custom hooks
- Keep components focused and small
- Use meaningful variable names

```typescript
// ✅ Good - Single responsibility
const HabitCard: React.FC<Props> = ({ habit }) => {
  const { completeHabit } = useHabits();
  
  const handleComplete = () => {
    completeHabit(habit.id);
  };
  
  return (
    <Card>
      <Title>{habit.title}</Title>
      <Button onPress={handleComplete}>Complete</Button>
    </Card>
  );
};

// ❌ Bad - Too much responsibility
const HabitCard: React.FC<Props> = ({ habit }) => {
  // Mixing UI, logic, API calls, navigation...
};
```

### Styling
- Use StyleSheet.create
- Use theme constants
- Follow mobile-first approach
- Consider accessibility

```typescript
// ✅ Good
const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
});

// ❌ Bad
const styles = StyleSheet.create({
  container: {
    padding: 16,  // Magic number
    backgroundColor: '#FFFFFF',  // Hardcoded color
    borderRadius: 12,  // Magic number
  },
});
```

## 🧪 Testing Guidelines

### What to Test
- Utility functions
- Complex calculations
- API service methods
- Navigation flows
- Component rendering

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test
  });

  it('should handle user interaction', () => {
    // Test
  });

  it('should handle error state', () => {
    // Test
  });
});
```

## 📦 Pull Request Process

1. **Update documentation** if you changed APIs or added features
2. **Add tests** for new functionality
3. **Update PROJECT_STATUS.md** if you completed a major feature
4. **Create pull request** with clear description

### PR Title Format
```
[Type] Brief description

Example:
[Feature] Add habit completion calendar view
[Fix] Resolve authentication token expiry issue
[Docs] Update Firebase setup instructions
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web
- [ ] Added/updated tests

## Screenshots (if applicable)
Add screenshots or videos

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests passing
```

## 🐛 Bug Reports

### Before Reporting
1. Search existing issues
2. Try to reproduce on latest version
3. Check if it's a known issue

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- Device: [e.g. iPhone 12, Pixel 5]
- OS: [e.g. iOS 15, Android 12]
- App Version: [e.g. 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you've thought of

**Additional Context**
Mockups, examples, etc.
```

## 📚 Documentation

### When to Update Docs
- Adding new features
- Changing existing APIs
- Adding new dependencies
- Changing project structure
- Updating setup process

### Documentation Files
- **README.md**: Project overview and basic info
- **SETUP.md**: Setup and installation instructions
- **DEVELOPMENT.md**: Development guidelines
- **PROJECT_STATUS.md**: Implementation status
- **Code comments**: Complex logic explanation

## 🎯 Priorities

### High Priority
1. Bug fixes
2. Security improvements
3. Performance optimizations
4. Core features (Habits, Diet, Social)

### Medium Priority
1. UI/UX improvements
2. Additional features
3. Code refactoring
4. Test coverage

### Low Priority
1. Nice-to-have features
2. Experimental features
3. Documentation improvements

## 🤝 Code Review

### As a Reviewer
- Be respectful and constructive
- Explain why changes are needed
- Acknowledge good code
- Test the changes if possible

### As an Author
- Respond to all comments
- Make requested changes
- Ask questions if unclear
- Thank reviewers

## 📞 Questions?

- Create an issue for questions
- Tag with `question` label
- Be specific and provide context

## 🙏 Thank You!

Every contribution helps make Rootine better. Whether it's code, documentation, design, or ideas - we appreciate your effort!

---

**Happy Contributing! 🚀**
