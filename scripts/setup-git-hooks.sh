#!/bin/bash
#
# Setup Git Hooks
# This script sets up Git hooks to prevent commits to protected branches
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "Setting up Git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/sh
#
# Git pre-commit hook to prevent commits to protected branches
# This hook prevents direct commits to main and develop branches
#

# Get the current branch name
current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)

# Protected branches
protected_branches="main develop"

# Check if current branch is protected
for branch in $protected_branches; do
  if [ "$current_branch" = "$branch" ]; then
    echo "❌ Error: Direct commits to '$branch' branch are not allowed."
    echo ""
    echo "Please create a feature branch and submit a pull request:"
    echo "  git checkout -b feature/your-feature-name"
    echo ""
    echo "Protected branches: $protected_branches"
    exit 1
  fi
done

exit 0
EOF

# Make hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Git hooks setup complete!"
echo ""
echo "Protected branches: main, develop"
echo "You can now test by trying to commit to a protected branch."

