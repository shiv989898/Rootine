# 🚀 GitHub Upload Instructions

Follow these steps to upload your Rootine app to GitHub:

## Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Fill in the details:
   - **Repository name**: `rootine` (or your preferred name)
   - **Description**: "Lifestyle & Wellness App with AI-powered diet plans and gamified habit tracking"
   - **Visibility**: 
     - ✅ **Private** (recommended if you want to keep it private)
     - ⬜ Public (if you want to make it open source)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **Create repository**

## Step 2: Link Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add GitHub as remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rootine.git

# Verify the remote was added
git remote -v
```

## Step 3: Push Your Code to GitHub

```powershell
# Push your code to GitHub
git push -u origin master
```

You'll be prompted to authenticate:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your password)

### How to Create a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: "Rootine App Upload"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **Generate token**
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

## Step 4: Verify Upload

After pushing, go to your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/rootine
```

You should see:
- ✅ All your code files
- ✅ Comprehensive README.md
- ✅ 57 files changed in latest commit
- ✅ All documentation files

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in with your GitHub account
3. Click **File** → **Add Local Repository**
4. Browse to `C:\Rootine`
5. Click **Publish repository** in the top bar
6. Choose visibility (Public/Private) and click **Publish**

---

## 📝 Update README After Upload

After uploading, don't forget to update the README with your actual GitHub username:

1. Go to your repository on GitHub
2. Click on `README.md`
3. Click the pencil icon (Edit)
4. Replace these placeholders:
   - `YOUR_USERNAME` → Your actual GitHub username
   - `your.email@example.com` → Your email
   - `@YOUR_GITHUB_USERNAME` → Your GitHub handle

Or update locally and push again:

```powershell
# Edit README.md and replace placeholders
# Then commit and push:
git add README.md
git commit -m "docs: Update README with actual GitHub info"
git push
```

---

## 🔒 IMPORTANT: Protect Your Secrets

**NEVER commit your `.env` file to GitHub!**

Your `.env` file contains sensitive API keys and is already in `.gitignore`. 

To verify it's not being tracked:
```powershell
git status
```

If you see `.env` listed, remove it:
```powershell
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

---

## ✅ Final Checklist

Before making your repository public:
- [ ] Removed all sensitive data from code
- [ ] `.env` file is NOT tracked by git
- [ ] Updated README with your details
- [ ] Tested that clone + setup instructions work
- [ ] Added repository description on GitHub
- [ ] Added topics/tags (react-native, expo, firebase, typescript)
- [ ] Decided on a license (if making public)

---

## 🎉 You're Done!

Your Rootine app is now on GitHub! 

Share it with:
```
https://github.com/YOUR_USERNAME/rootine
```

### Next Steps:
1. Add screenshots to README
2. Set up GitHub Actions for CI/CD
3. Create releases for APK downloads
4. Add contributing guidelines
5. Set up issue templates

---

Need help? Check the [GitHub Docs](https://docs.github.com/en/get-started/quickstart/create-a-repo)
