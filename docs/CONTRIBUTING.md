# Contributing to Stay Caffeinated

First off, thank you for considering contributing to Stay Caffeinated! It's people like you that make Stay Caffeinated such a great game and community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat everyone with respect. No harassment, discrimination, or inappropriate behavior.
- **Be collaborative**: Work together to resolve conflicts and build a welcoming environment.
- **Be constructive**: Provide helpful feedback and accept criticism gracefully.
- **Be patient**: Remember that everyone was new once.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots (if applicable)**
- **System information** (browser, OS, device)
- **Console errors** (if any)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - Why is this enhancement needed?
- **Proposed solution** - How should it work?
- **Alternative solutions** - What other approaches did you consider?
- **Additional context** - Any mockups, examples, or references

### Contributing Code

#### First Time Contributors

1. **Find an issue** labeled `good first issue` or `help wanted`
2. **Comment** on the issue to claim it
3. **Fork** the repository
4. **Create a branch** for your work
5. **Make your changes**
6. **Test thoroughly**
7. **Submit a pull request**

#### Areas for Contribution

- 🐛 **Bug fixes**: Help us squash bugs
- ✨ **Features**: Implement new game features
- 🎨 **UI/UX**: Improve the game interface
- ⚡ **Performance**: Optimize game performance
- 📝 **Documentation**: Improve or translate docs
- 🧪 **Testing**: Write or improve tests
- ♿ **Accessibility**: Enhance accessibility features

## 💻 Development Process

### Setting Up Your Development Environment

1. **Fork and clone** the repository:
```bash
git clone https://github.com/your-username/stay-caffeinated.git
cd stay-caffeinated
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

4. **Start development server**:
```bash
npm run dev
```

### Development Workflow

1. **Make your changes** in your feature branch
2. **Write/update tests** for your changes
3. **Run tests** to ensure everything passes:
```bash
npm test
npm run lint
npm run typecheck
```

4. **Build the project** to catch any build issues:
```bash
npm run build
```

5. **Commit your changes** with a descriptive commit message
6. **Push to your fork** and create a pull request

## 🎨 Style Guidelines

### TypeScript Style Guide

- Use TypeScript for all new code
- Enable strict mode
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Use enums for constants
- Document complex types

```typescript
// Good
interface GameState {
  score: number;
  level: Difficulty;
  isPlaying: boolean;
}

// Bad
const gameState: any = {
  score: 0,
  level: 'easy',
  isPlaying: false
};
```

### React/Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use proper prop types
- Implement error boundaries where appropriate

```tsx
// Good
const GameButton: React.FC<GameButtonProps> = ({ onClick, children, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="game-button"
    >
      {children}
    </button>
  );
};
```

### CSS/Styling Guidelines

- Use Tailwind CSS utility classes
- Keep custom CSS to a minimum
- Follow mobile-first responsive design
- Ensure dark mode compatibility
- Maintain consistent spacing

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">

// Avoid
<div style={{ display: 'flex', alignItems: 'center' }}>
```

### Testing Guidelines

- Write tests for all new features
- Maintain > 80% code coverage
- Use descriptive test names
- Test edge cases
- Mock external dependencies

```typescript
// Good test name
describe('CaffeineBar', () => {
  it('should display warning when caffeine level drops below 20%', () => {
    // test implementation
  });
});
```

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Test additions or corrections
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples
```
feat(game): add power-up system

- Implement three types of power-ups
- Add power-up spawning logic
- Create power-up UI indicators

Closes #123
```

```
fix(ui): correct caffeine bar animation glitch

The caffeine bar was not properly animating when
transitioning between states. This fix ensures smooth
animations in all scenarios.
```

## 🚀 Pull Request Process

### Before Submitting

1. **Update documentation** if you changed functionality
2. **Add tests** for new features
3. **Run the full test suite** and ensure it passes
4. **Update the CHANGELOG.md** with your changes
5. **Ensure your branch is up to date** with main

### PR Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Screenshots**: Include before/after screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Issues**: Reference any related issues

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
```

### Review Process

1. **Automated checks** run on all PRs
2. **Code review** by at least one maintainer
3. **Testing** in multiple browsers/devices
4. **Approval** required before merging
5. **Squash and merge** to keep history clean

## 🌟 Recognition

Contributors are recognized in several ways:

- Listed in the [Contributors](https://github.com/yourusername/stay-caffeinated/graphs/contributors) section
- Mentioned in release notes
- Special badges for regular contributors
- Featured in the game's credits

## 🤔 Questions?

Feel free to:

- Open a [Discussion](https://github.com/yourusername/stay-caffeinated/discussions)
- Join our [Discord server](https://discord.gg/staycaffeinated)
- Email us at contribute@staycaffeinated.game

## 📚 Additional Resources

- [Project Roadmap](https://github.com/yourusername/stay-caffeinated/projects)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Game Design Document](docs/GAME_DESIGN.md)

---

Thank you for contributing to Stay Caffeinated! Your efforts help make this game better for everyone. ☕❤️