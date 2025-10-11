# 🚀 Quick Upload Commands

Copy and paste these commands to upload to GitHub:

## 1️⃣ Create GitHub Repository
Go to: https://github.com/new
- Name: `rootine`
- Visibility: Private (or Public)
- Don't initialize with anything

## 2️⃣ Link Your Repository
```powershell
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/rootine.git
```

## 3️⃣ Push to GitHub
```powershell
git push -u origin master
```

When prompted:
- **Username**: Your GitHub username
- **Password**: Personal Access Token (create at https://github.com/settings/tokens)

## ✅ Verify Upload
After pushing, visit:
```
https://github.com/YOUR_USERNAME/rootine
```

You should see:
- ✅ README.md with full documentation
- ✅ All 60+ project files
- ✅ Latest commit: "docs: Add repository upload summary"

---

## 🆘 Troubleshooting

### "Authentication Failed"
→ Use Personal Access Token, not password
→ Get token: https://github.com/settings/tokens (need `repo` scope)

### "Remote Already Exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/rootine.git
```

### "Updates Were Rejected"
```powershell
git pull origin master --allow-unrelated-histories
git push -u origin master
```

---

## 📱 Share Your Repository
After upload, share this link:
```
https://github.com/YOUR_USERNAME/rootine
```

---

**That's it! Your app is now on GitHub! 🎉**
