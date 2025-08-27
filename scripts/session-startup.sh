#!/bin/bash

# Sigalit Project - Session Startup Script
# This script helps developers start their development session properly

echo "🚀 Welcome to Sigalit Development Session!"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the sigalit-new directory"
    echo "   Please navigate to the project root and try again"
    exit 1
fi

echo "✅ Project directory confirmed"
echo ""

# Display mandatory reading files
echo "📚 MANDATORY READING - DO NOT SKIP:"
echo "===================================="
echo ""

if [ -f "SESSION_STARTUP.md" ]; then
    echo "📖 SESSION_STARTUP.md - Session startup guide"
    echo "   This file contains the session startup checklist"
    echo ""
fi

if [ -f "PROJECT.md" ]; then
    echo "📖 PROJECT.md - Project overview and current status"
    echo "   This file shows what's been completed and what's planned"
    echo ""
fi

if [ -f "tasks/README.md" ]; then
    echo "📖 tasks/README.md - Task management overview"
    echo "   This file shows current task status and workflow"
    echo ""
fi

echo ""

# Check current task status
echo "📊 CURRENT TASK STATUS:"
echo "======================="

if [ -d "tasks/completed" ]; then
    completed_count=$(ls -1 tasks/completed/*.md 2>/dev/null | wc -l)
    echo "✅ Completed tasks: $completed_count"
fi

if [ -d "tasks/in-progress" ]; then
    in_progress_count=$(ls -1 tasks/in-progress/*.md 2>/dev/null | wc -l)
    echo "🚀 In progress tasks: $in_progress_count"
fi

if [ -d "tasks/planned" ]; then
    planned_count=$(ls -1 tasks/planned/*.md 2>/dev/null | wc -l)
    echo "📋 Planned tasks: $planned_count"
fi

echo ""

# Show recent completed tasks
echo "📝 RECENT COMPLETED WORK:"
echo "========================="
if [ -d "tasks/completed" ] && [ "$(ls -A tasks/completed)" ]; then
    ls -1t tasks/completed/*.md | head -3 | while read file; do
        basename "$file" .md
    done
else
    echo "No completed tasks found"
fi

echo ""

# Check if there are any in-progress tasks
if [ -d "tasks/in-progress" ] && [ "$(ls -A tasks/in-progress)" ]; then
    echo "🚀 IN-PROGRESS TASKS:"
    echo "===================="
    ls -1 tasks/in-progress/*.md | while read file; do
        basename "$file" .md
    done
    echo ""
    echo "💡 You may want to continue working on these tasks"
    echo ""
fi

# Show workflow reminder
echo "🔄 WORKFLOW REMINDER:"
echo "====================="
echo "1. 📝 PLANNING - Create plan and get approval"
echo "2. 🚀 DEVELOPMENT - Implement according to plan"
echo "3. ✅ REVIEW - Document what was accomplished"
echo "4. 📚 DOCUMENTATION - Update project docs"
echo ""

# Check if project builds
echo "🔍 PROJECT HEALTH CHECK:"
echo "========================"

if command -v npm &> /dev/null; then
    echo "✅ npm is available"
    
    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        echo "✅ Dependencies are installed"
        
        # Quick build check
        echo "🔨 Checking if project builds..."
        if npm run build --silent > /dev/null 2>&1; then
            echo "✅ Project builds successfully"
        else
            echo "⚠️  Project build check failed - you may need to fix issues"
        fi
    else
        echo "⚠️  Dependencies not installed - run 'npm install' first"
    fi
else
    echo "❌ npm is not available - please install Node.js"
fi

echo ""

# Final instructions
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Read the mandatory files listed above"
echo "2. Understand current project status"
echo "3. Decide what work to do this session"
echo "4. If starting new feature: create planning document"
echo "5. If continuing work: read in-progress task document"
echo "6. Start your session notes using tasks/SESSION_NOTES_TEMPLATE.md"
echo ""

echo "🚫 REMEMBER: NO DEVELOPMENT WITHOUT APPROVED PLAN!"
echo ""

echo "🎉 You're ready to start your development session!"
echo "   Good luck and maintain quality standards!"
echo ""

# Mark session startup as completed
echo "📝 Marking session startup as completed..."
touch .session_startup_completed
echo "✅ Session startup marked as complete"
echo ""

# Optional: Open the session startup guide
if command -v open &> /dev/null; then
    echo "💡 Tip: You can open SESSION_STARTUP.md to read the guide"
elif command -v xdg-open &> /dev/null; then
    echo "💡 Tip: You can open SESSION_STARTUP.md to read the guide"
fi

echo ""
echo "💡 Next time you start a session, just run: npm run session:start"
echo "   The system will remember that you've completed startup!"
