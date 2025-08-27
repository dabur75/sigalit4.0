# 🚀 Session Startup Guide

## ⚠️ **MANDATORY READING BEFORE STARTING WORK**

**Every time you start a new development session, you MUST read this guide to understand the current project status and workflow requirements.**

---

## 📋 **Session Startup Checklist**

### 1. **Read Current Project Status** 📖
- [ ] Read `PROJECT.md` - Understand current tech stack, file structure, and completed features
- [ ] Read `tasks/README.md` - Check current task status and workflow overview
- [ ] Review `tasks/completed/` - Understand what's been accomplished

### 2. **Understand Workflow Requirements** 🔄
- [ ] Read `tasks/WORKFLOW.md` - Know the development process
- **CRITICAL**: NO DEVELOPMENT without approved planning document
- **CRITICAL**: All tasks must follow the 4-phase workflow

### 3. **Check Current Session Context** 🔍
- [ ] What was the last completed task?
- [ ] What is currently in progress?
- [ ] What are the next planned features?
- [ ] Are there any blocking issues or dependencies?

---

## 🚫 **What NOT to Do in a New Session**

- ❌ **Don't start coding immediately** - Always check current status first
- ❌ **Don't assume previous work** - Review what's been completed
- ❌ **Don't skip planning** - Every feature needs an approved plan
- ❌ **Don't ignore workflow** - Follow the established process

---

## ✅ **What to Do in a New Session**

### **If Continuing Previous Work:**
1. Read the in-progress task document
2. Understand what was accomplished and what remains
3. Continue following the approved plan
4. Update progress as you work

### **If Starting New Feature:**
1. **MANDATORY**: Create planning document using `tasks/PLANNING_TEMPLATE.md`
2. **MANDATORY**: Submit for stakeholder review and approval
3. **MANDATORY**: Wait for approval before starting development
4. Follow the approved plan exactly

### **If Reviewing Completed Work:**
1. Read the completed task review
2. Understand lessons learned
3. Note any future considerations
4. Update project documentation if needed

---

## 🔍 **Quick Status Check Commands**

```bash
# Check current project status
cat PROJECT.md | grep -A 10 "Current Status"

# List all tasks and their status
ls -la tasks/completed/ tasks/in-progress/ tasks/planned/

# Check what was last worked on
ls -la tasks/completed/ | tail -5

# View workflow requirements
head -20 tasks/WORKFLOW.md
```

---

## 📚 **Essential Files to Read**

### **Project Overview**
- `PROJECT.md` - Complete project status and architecture
- `README.md` - Setup and usage instructions

### **Workflow & Process**
- `tasks/WORKFLOW.md` - Development workflow guide
- `tasks/README.md` - Task management overview

### **Templates**
- `tasks/PLANNING_TEMPLATE.md` - For new features
- `tasks/TASK_TEMPLATE.md` - For task completion

---

## 🎯 **Session Goals**

### **By the End of This Session, You Should:**
- [ ] Understand current project status
- [ ] Know what work is expected
- [ ] Have an approved plan (if starting new feature)
- [ ] Be following the established workflow
- [ ] Be updating documentation as you work

---

## 🚨 **Emergency Contacts**

### **If You're Confused About:**
- **Project Status**: Read `PROJECT.md`
- **Workflow**: Read `tasks/WORKFLOW.md`
- **Current Tasks**: Check `tasks/README.md`
- **Templates**: Use files in `tasks/` directory

### **If Something is Broken:**
1. Check the last completed task for known issues
2. Review error logs and console output
3. Document the problem in your task review
4. Don't continue until the issue is resolved

---

## 📝 **Session Notes Template**

Use this template to track your session:

```markdown
# Session Notes - [Date]

## Session Goals
- [ ] Goal 1
- [ ] Goal 2

## What I Accomplished
- 

## What I Learned
- 

## Issues Encountered
- 

## Next Session Plan
- 

## Documentation Updated
- [ ] PROJECT.md
- [ ] Task documents
- [ ] Other files
```

---

## 🔄 **Workflow Reminder**

### **Remember the 4 Phases:**
1. **📝 Planning** - Create and get approval for plan
2. **🚀 Development** - Implement according to plan
3. **✅ Review** - Document what was accomplished
4. **📚 Documentation** - Update project docs

### **Quality Gates:**
- **Before Development**: Complete plan + stakeholder approval
- **During Development**: Follow standards + test as you go
- **Before Completion**: All criteria met + quality standards passed

---

## 🎉 **You're Ready to Work!**

After completing this startup checklist, you should have:
- ✅ Clear understanding of current project status
- ✅ Knowledge of workflow requirements
- ✅ Approved plan (if starting new feature)
- ✅ Context for your work

**Now you can proceed with confidence, knowing you're following the established process and maintaining project quality.**

---

**Last Updated**: August 24, 2024
**Version**: 1.0
**Required Reading**: Every session
