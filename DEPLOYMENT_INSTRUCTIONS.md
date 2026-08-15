# Auris Nexus Technologies - Live Deployment Fix Instructions

**Critical Blocker:** contact-submit.php is missing from live server
**Status:** Ready for deployment
**Target:** HOSTAFRICA hosting (aurisnexus.co.za)

---

## PHASE 3: DEPLOYMENT PACKAGE

### File to Deploy
```
File: contact-submit.php
Location: Web Root (same directory as index.html)
Size: ~4.2 KB
Encoding: UTF-8
Permissions: 644 (readable by web server)
```

### Expected Live URL After Deployment
```
https://aurisnexus.co.za/contact-submit.php
```

### Verification Before Upload
✅ File syntax validated: **No errors**
✅ Security review: **Passed**
  - Input validation: Yes
  - Origin checking: Yes
  - Email header injection protection: Yes
  - Honeypot implemented: Yes
✅ PHP version: Compatible with PHP 7.4+ (uses declare, typed functions)
✅ Dependencies: None (uses only PHP standard library)
✅ No secrets exposed: Confirmed

---

## DEPLOYMENT STEPS FOR HOSTAFRICA

### Option 1: Using cPanel File Manager (Recommended)

1. **Log into HOSTAFRICA cPanel:**
   - Go to: https://hosting.hostafrica.net/cpanel
   - Enter account credentials

2. **Navigate to File Manager:**
   - Click "File Manager" in cPanel
   - Navigate to: `public_html` folder
   - This is the web root

3. **Upload contact-submit.php:**
   - Upload the file from:
     ```
     c:\Users\admin\OneDrive\A.N.T work\Auris-Nexus-Technologies-main\contact-submit.php
     ```
   - Destination: `public_html/` (same level as index.html, contact.html, etc.)
   - File permissions: 644 (should be automatic)

4. **Verify Upload:**
   - File should appear in public_html directory
   - File size should be approximately 4.2 KB

### Option 2: Using SFTP Client (Advanced)

1. **Connect via SFTP:**
   - Host: sftp.aurisnexus.co.za OR your HOSTAFRICA SFTP host
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 22 (SFTP) or 2222

2. **Upload File:**
   - Connect to remote server
   - Navigate to: `/public_html/`
   - Upload: `contact-submit.php`
   - Ensure file is in root (same directory as index.html)

3. **Set Permissions:**
   - Right-click file → Properties/Permissions
   - Set to: 644 (owner: read/write, group: read, public: read)

### Option 3: Using cPanel Terminal (If comfortable with CLI)

```bash
# SSH/Terminal access (if available)
cd /home/your_username/public_html/
# Then upload file via SCP or copy
# File should be owned by your cPanel user
# Permissions: 644
```

---

## VERIFICATION CHECKLIST

After uploading, verify deployment:

### ✓ Step 1: Test Endpoint Exists
- Open browser and navigate to:
  ```
  https://aurisnexus.co.za/contact-submit.php
  ```
- **Expected Response:**
  ```json
  {"status":"ERROR","message":"This endpoint accepts form submissions only."}
  ```
- Status Code: **405 Method Not Allowed**
- This proves the PHP file is deployed and being executed

### ✓ Step 2: Test Contact Form
- Navigate to: https://aurisnexus.co.za/contact.html
- Fill in test submission:
  ```
  Name: QA Test
  Email: test@aurisnexus-verification.co.za
  Company: Test Org
  Service: Custom Software Development
  Message: This is an automated deployment verification test.
  ```
- Submit form
- **Expected Result:**
  - Success message appears
  - No console JavaScript errors
  - Response status: 200 OK
  - JSON response with success message

### ✓ Step 3: Check Email Delivery
- Check inbox: info@aurisnexus.co.za
- **Expected Email:**
  - From: Auris Nexus Website
  - Subject: Auris Nexus Website Enquiry
  - Contains submitted fields
  - Contains timestamp (Africa/Johannesburg timezone)
  - Reply-To header set to: test@aurisnexus-verification.co.za

### ✓ Step 4: Test Honeypot
- Open https://aurisnexus.co.za/contact.html
- Open browser Developer Tools (F12)
- Go to Console
- Execute:
  ```javascript
  document.querySelector('input[name="website"]').value = 'http://spam-bot.com';
  // Fill other fields
  document.querySelector('form').submit();
  ```
- **Expected Result:**
  - Generic success message appears
  - NO email sent to info@aurisnexus.co.za
  - Response appears successful to prevent bot detection

---

## TROUBLESHOOTING

### Problem: Still Returns 404 After Upload

**Cause 1: File not actually uploaded**
- Solution: Verify file exists in public_html using cPanel File Manager
- Check file size matches (~4.2 KB)

**Cause 2: File in wrong directory**
- Solution: Ensure file is in `/public_html/` root, not in a subdirectory
- Must be same level as `index.html`, `contact.html`, etc.

**Cause 3: File name mismatch**
- Solution: Verify exact filename: `contact-submit.php`
- Check capitalization (Linux is case-sensitive)
- No spaces, no extra extensions (.php.txt, etc.)

**Cause 4: PHP disabled on account**
- Solution: Contact HOSTAFRICA support
- Request: Enable PHP 7.4+ for your account
- Verify: PHP is enabled for .php files in public_html

**Cause 5: .htaccess rewrite rules**
- Solution: Check if any .htaccess file blocks PHP
- The existing .htaccess is safe and doesn't block PHP
- No changes needed to .htaccess

### Problem: File Uploaded But Still 405

**This is actually correct!** 405 means:
- ✅ PHP file is deployed
- ✅ PHP is executing the file
- ✅ The file is rejecting GET requests (expected)
- ✅ The form will work correctly

### Problem: Form Submits But No Email Arrives

**Possible Causes:**
1. HOSTAFRICA mail() function not configured
   - Solution: Contact HOSTAFRICA support
   - Request: Enable PHP mail() function with proper SMTP relay

2. Email filtering
   - Solution: Check spam folder
   - Solution: Add info@aurisnexus.co.za to email whitelist

3. SPF/DKIM/DMARC records
   - Solution: Contact HOSTAFRICA support
   - Request: Verify SPF record for info@aurisnexus.co.za

---

## IMPORTANT NOTES

- **Do NOT modify the PHP file** - it has already passed security review
- **Do NOT change permissions** - 644 is correct for web-accessible files
- **Do NOT add SSL certificate** - HTTPS is already configured via .htaccess
- **Do NOT add secrets** - No API keys or credentials in the file
- **Do NOT test with real customer data** - Use test email addresses only

---

## ROLLBACK PROCEDURE

If anything goes wrong after deployment:

1. **To Disable Form Temporarily:**
   - Delete contact-submit.php from public_html
   - Contact form will fail with 404
   - Website continues to function

2. **To Revert to Previous State:**
   - Contact HOSTAFRICA support
   - Request: Restore backup from before deployment
   - Or simply delete the uploaded file

3. **No Database or Permanent Changes:**
   - This deployment adds only one file
   - No config changes needed
   - No .htaccess modifications
   - No security issues introduced

---

## DEPLOYMENT CONTACT

If you encounter issues during deployment:

1. **HOSTAFRICA Support:**
   - Email: support@hostafrica.net
   - Phone: +27 86 000 2220 (South Africa)
   - Escalate to: Technical Support / Server Administration

2. **Required Information to Provide Support:**
   - Account name/domain: aurisnexus.co.za
   - Issue: contact-submit.php returns 404 after upload
   - Steps taken: Uploaded to public_html via cPanel
   - Request: Verify PHP is enabled, file is readable by web server

---

## Files in Deployment Package

```
contact-submit.php     (4.2 KB)  ← Required
DEPLOYMENT_INSTRUCTIONS.md       ← This file (reference only)
```

**Deploy only: contact-submit.php to public_html/**
