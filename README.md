# Google Ads Audit & Optimization – 3 Day Workshop
## Landing Page with Supabase Enrollment Form

A complete, ready-to-deploy landing page with a functional enrollment form connected to Supabase.

---

## 🚀 Quick Start Guide

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up if needed)
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `gads-workshop` (or any name you like)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose the closest to your audience
5. Click **"Create new project"** and wait 1-2 minutes

---

### Step 2: Run the Database Setup

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the `supabase.sql` file from this project
4. **Copy the entire contents** of `supabase.sql`
5. **Paste it** into the Supabase SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see: **"Success. No rows returned"**

✅ Your database is now set up!

---

### Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon in the left sidebar)
2. Click **"API"** under Project Settings
3. You'll see two important values:

   **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy this entire URL

   **anon public** key (under "Project API keys")
   - Click the copy icon next to `anon` `public`
   - This is a long string starting with `eyJ...`

---

### Step 4: Configure Your Landing Page

1. Open the `app.js` file in a text editor
2. Find these lines at the top (around line 6-7):

```javascript
const SUPABASE_URL = "PASTE_HERE";
const SUPABASE_ANON_KEY = "PASTE_HERE";
```

3. Replace `PASTE_HERE` with your actual values:

```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

4. **Save the file**

✅ Your landing page is now connected to Supabase!

---

### Step 5: Test Locally

1. Open `index.html` in your web browser (just double-click it)
2. Scroll down to the enrollment form
3. Fill out the form with test data
4. Click **"Enroll Now"**
5. You should see a success message: **"You're In! 🎉"**

---

### Step 6: Verify the Data

1. Go back to your Supabase dashboard
2. Click **"Table Editor"** in the left sidebar
3. Click on the **"enrollments"** table
4. You should see your test enrollment!

✅ Everything is working!

---

## 📤 Deploy Your Landing Page

You can deploy this to any static hosting service. Here are the easiest options:

### Option A: Netlify (Recommended)

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up or log in
3. Drag and drop your project folder onto the Netlify dashboard
4. Your site will be live in seconds!
5. Netlify will give you a URL like: `https://your-site.netlify.app`

### Option B: Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in
3. Click **"Add New Project"**
4. Import your project folder
5. Click **"Deploy"**

### Option C: GitHub Pages

1. Create a GitHub repository
2. Upload all your files
3. Go to **Settings → Pages**
4. Select your branch and click **"Save"**
5. Your site will be live at: `https://yourusername.github.io/repo-name`

---

## 🔒 Security Notes

### ✅ What's Safe

- The **anon public key** in `app.js` is safe to expose publicly
- Row Level Security (RLS) is enabled to protect your data
- Anonymous users can ONLY insert data (submit the form)
- Anonymous users CANNOT read, update, or delete data

### 🔐 Accessing Your Data

To view enrollments, you have two options:

**Option 1: Supabase Dashboard (Easiest)**
- Go to **Table Editor → enrollments**
- You can view, filter, and export data

**Option 2: Service Role Key (For Admin Tools)**
- Never expose this in frontend code
- Only use server-side (Node.js, Python, etc.)
- Find it in: **Settings → API → service_role key**

---

## 📊 Database Schema

The `enrollments` table has these columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `created_at` | Timestamp | When the enrollment was created |
| `full_name` | Text | Enrollee's full name |
| `email` | Text | Email address (unique) |
| `whatsapp_number` | Text | WhatsApp number |
| `payment_transaction_id` | Text | Payment transaction ID (unique) |
| `source_page` | Text | URL where form was submitted |
| `user_agent` | Text | Browser info |
| `status` | Text | pending/verified/enrolled/rejected |
| `updated_at` | Timestamp | Last update time |

---

## 🛠️ Customization

### Change Form Fields

Edit `index.html` to add/remove fields, then update:
- `app.js` (validation logic)
- `supabase.sql` (database schema)

### Change Design

Edit `styles.css` to customize:
- Colors (see CSS variables at the top)
- Fonts
- Layout
- Spacing

### Add Email Notifications

Use Supabase Edge Functions or integrate with:
- SendGrid
- Mailgun
- Resend
- Postmark

---

## 🐛 Troubleshooting

### "Supabase not connected yet" warning appears

- Check that you pasted the correct URL and anon key in `app.js`
- Make sure there are no extra spaces or quotes
- Refresh the page

### Form submits but no data appears

- Check the browser console for errors (F12 → Console)
- Verify RLS policies are set up correctly
- Make sure you ran the entire `supabase.sql` script

### "Duplicate email" error

- This email is already in the database
- Check the `enrollments` table in Supabase
- You can delete the test entry or use a different email

### Form validation errors

- All required fields must be filled
- Email must be valid format
- Phone must be at least 10 digits
- Consent checkbox must be checked

---

## 📞 Support

If you need help:
1. Check the browser console for error messages (F12 → Console)
2. Check the Supabase logs (Dashboard → Logs)
3. Review the SQL setup in the Table Editor

---

## 📝 Files Included

- `index.html` - Landing page structure
- `styles.css` - All styling and responsive design
- `app.js` - Form logic and Supabase integration
- `supabase.sql` - Database schema and security policies
- `README.md` - This file

---

## ✅ Quality Checklist

Before going live, verify:

- [ ] Supabase credentials are configured in `app.js`
- [ ] Form submits successfully
- [ ] Data appears in Supabase dashboard
- [ ] Success message displays after submission
- [ ] Form validation works (try submitting empty form)
- [ ] Mobile layout looks good (test on phone or resize browser)
- [ ] RLS prevents anonymous users from reading data
- [ ] Duplicate email prevention works
- [ ] All links work correctly
- [ ] Page loads fast

---

## 🎉 You're All Set!

Your landing page is ready to collect enrollments. Share the link and start growing your workshop!

**Questions?** Email: hello@gadsworkshop.com
