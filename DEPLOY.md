# 🏥 Adinath Hospital - Deployment Guide

## Quick Deploy from Cursor

Once set up, deploying is as simple as:
```bash
git add -A && git commit -m "Update" && git push
```

AWS Amplify will automatically build and deploy!

---

## First-Time Setup (10 minutes)

### Prerequisites
- AWS Account (free tier: https://aws.amazon.com/free)
- GitHub account with repo access
- Mac with Homebrew

### Step 1: Install AWS CLI

```bash
brew install awscli
```

### Step 2: Get AWS Credentials

1. Go to: https://console.aws.amazon.com/iam/
2. Click **Users** → **Add user**
3. Username: `amplify-deployer`
4. Check: **Programmatic access**
5. Attach policy: `AdministratorAccess-Amplify`
6. Create user and **save the Access Key ID and Secret**

### Step 3: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID: `[paste your key]`
- AWS Secret Access Key: `[paste your secret]`
- Default region: `ap-south-1`
- Output format: `json`

### Step 4: Connect to Amplify (Easiest via Console)

1. Open: https://console.aws.amazon.com/amplify/home?region=ap-south-1
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub**
4. Authorize AWS Amplify to access your GitHub
5. Select repository: `adinath-hospital`
6. Select branch: `main`
7. Build settings: Leave default (auto-detected from amplify.yml)
8. Click **"Save and deploy"**

### Step 5: Wait for Deployment (~2-3 minutes)

You'll get a URL like:
```
https://main.d1234abcd.amplifyapp.com
```

---

## Make Repo Private (Recommended for Healthcare)

```bash
gh repo edit pratiksajnani/adinath-hospital --visibility private
```

---

## Custom Domain (Optional)

1. In Amplify Console → Domain Management
2. Add domain: `adinathhealth.com`
3. Follow DNS instructions

---

## Daily Workflow

```bash
# Make changes in Cursor, then:
cd /Users/psaj/src/adinath-hospital
git add -A
git commit -m "Your change description"
git push

# ✅ Auto-deploys in ~1-2 minutes!
```

---

## Environment Variables (For Production)

In Amplify Console → Environment Variables, add:
- `SMS_API_KEY` - For MSG91/Twilio SMS
- `ANALYTICS_ID` - For Google Analytics

---

## India Data Compliance Notes

✅ **Region**: ap-south-1 (Mumbai) - Data stays in India
✅ **HTTPS**: Automatic SSL certificate
✅ **Patient Data**: Stored in browser localStorage (demo) - Production needs encrypted database
✅ **DISHA Compliance**: For production, implement proper consent & encryption

---

## Support

- AWS Amplify Docs: https://docs.amplify.aws/
- Issues: Contact pratik.sajnani@gmail.com

