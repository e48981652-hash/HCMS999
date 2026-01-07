# GitHub Setup Guide | دليل إعداد GitHub

This guide will help you set up the project on GitHub.

هذا الدليل سيساعدك في إعداد المشروع على GitHub.

## Step 1: Create a New Repository | الخطوة 1: إنشاء مستودع جديد

1. Go to GitHub and create a new repository
   اذهب إلى GitHub وأنشئ مستودعًا جديدًا

2. Choose a repository name (e.g., `horizon-cms`)
   اختر اسمًا للمستودع (مثل: `horizon-cms`)

3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
   **لا** تقم بتهيئة المشروع بـ README أو .gitignore أو الترخيص (لأننا لدينا هذه الملفات بالفعل)

4. Click "Create repository"
   انقر على "إنشاء مستودع"

## Step 2: Initialize Git | الخطوة 2: تهيئة Git

If you haven't already initialized git in your project:

إذا لم تكن قد قمت بتهيئة git في مشروعك بعد:

```bash
cd horizon-cms1.0

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Horizon CMS v1.0"
```

## Step 3: Add Remote Repository | الخطوة 3: إضافة المستودع البعيد

```bash
# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Verify remote
git remote -v
```

## Step 4: Push to GitHub | الخطوة 4: رفع المشروع إلى GitHub

```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 5: Configure Repository Settings | الخطوة 5: إعدادات المستودع

### Branch Protection | حماية الفروع

1. Go to Settings → Branches
2. Add a branch protection rule for `main`
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

### GitHub Actions | إجراءات GitHub

The CI/CD pipeline will automatically run on push/PR. Make sure:
- GitHub Actions are enabled in Settings → Actions
- PostgreSQL service is properly configured in `.github/workflows/ci.yml`

### Secrets | الأسرار

Add the following secrets in Settings → Secrets and variables → Actions (if needed):
- `DEPLOY_KEY`: SSH key for deployment
- `DATABASE_URL`: Database connection string for tests

## Step 6: Enable Features | الخطوة 6: تفعيل الميزات

### Issues | المشاكل
- Enable Issues in Settings → General → Features

### Discussions | النقاشات
- Optionally enable Discussions for community engagement

### Wiki | الويكي
- Optionally enable Wiki for additional documentation

### Projects | المشاريع
- Enable Projects for project management

## Step 7: Configure Dependabot | الخطوة 7: إعداد Dependabot

Dependabot is already configured via `.github/dependabot.yml`. It will:
- Check for npm updates weekly (Frontend)
- Check for Composer updates weekly (Backend)
- Create pull requests automatically

## Step 8: Set Up Labels | الخطوة 8: إعداد التسميات

Recommended labels:
- `bug`: For bug reports
- `enhancement`: For feature requests
- `documentation`: For documentation updates
- `dependencies`: For dependency updates
- `frontend`: For frontend-related issues
- `backend`: For backend-related issues
- `urgent`: For urgent issues
- `wontfix`: For issues that won't be fixed
- `duplicate`: For duplicate issues
- `question`: For questions

## Step 9: Create Initial Release | الخطوة 9: إنشاء الإصدار الأولي

1. Go to Releases → Create a new release
2. Tag version: `v1.0.0`
3. Release title: `Horizon CMS v1.0.0`
4. Description: Copy from `CHANGELOG.md`
5. Publish release

## Step 10: Verify Everything | الخطوة 10: التحقق من كل شيء

✅ Repository is public/private as intended
✅ README.md displays correctly
✅ License is set correctly
✅ .gitignore is working (vendor/, node_modules/ not tracked)
✅ Issues are enabled
✅ Pull requests are enabled
✅ GitHub Actions are enabled
✅ Branch protection is set
✅ Labels are configured

## Next Steps | الخطوات التالية

1. **Add collaborators** (Settings → Collaborators)
2. **Set up project board** for issue tracking
3. **Configure webhooks** if needed
4. **Set up deployment** pipeline
5. **Create development branch** for ongoing work

## Troubleshooting | استكشاف الأخطاء

### Large Files | الملفات الكبيرة

If you have large files (>100MB), consider using Git LFS:
```bash
git lfs install
git lfs track "*.pdf"
git lfs track "*.zip"
git add .gitattributes
```

### Authentication Issues | مشاكل المصادقة

If you encounter authentication issues:
- Use personal access token instead of password
- Or set up SSH keys

### Push Errors | أخطاء الدفع

If you get errors when pushing:
```bash
# Fetch remote changes first
git fetch origin

# Merge if needed
git merge origin/main

# Then push
git push origin main
```

---

**Your repository is now ready! 🎉**

مستودعك جاهز الآن! 🎉

