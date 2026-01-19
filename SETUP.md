# 🎨 Frontend Setup Guide - Rate Your CV

Welcome to the frontend for your CV Matcher! This is a beautiful, modern web interface that connects to your existing backend.

---

## 📦 **What You Got**

A complete Next.js frontend with:
- ✅ Clean, attractive UI with Tailwind CSS
- ✅ File upload for CVs (PDF/DOCX/TXT)
- ✅ Job description input
- ✅ Beautiful results display
- ✅ CV optimization flow
- ✅ PDF download
- ✅ Connects to your existing backend

---

## 🚀 **Quick Setup (5 Steps)**

### **Step 1: Navigate to Frontend Folder**

```bash
cd cv-matcher-frontend
```

### **Step 2: Install Dependencies**

```bash
npm install
```

This will take 1-2 minutes to download all packages.

### **Step 3: Update Backend (Important!)**

Your backend needs two new endpoints. Replace your `server.js` file with the updated one I provided, or add these endpoints manually.

**The updated `server.js` is already in your `cv-matcher` folder.**

### **Step 4: Start Backend First**

Open a terminal and run:
```bash
cd cv-matcher
npm start
```

Backend will run on **http://localhost:3000**

### **Step 5: Start Frontend**

Open a NEW terminal and run:
```bash
cd cv-matcher-frontend
npm run dev
```

Frontend will run on **http://localhost:3001**

---

## 🌐 **Access the App**

Open your browser and go to:
```
http://localhost:3001
```

You should see the "Rate Your CV" landing page! 🎉

---

## 📋 **How to Use**

### **1. Upload CV**
- Click the upload area or drag and drop your CV file
- Supported formats: PDF, DOCX, DOC, TXT

### **2. Paste Job Description**
- Copy any job posting
- Paste it in the text area

### **3. Click "Analyze My CV"**
- Wait 15-20 seconds for AI analysis
- See your interview chance percentage!

### **4. View Results**
- Overall interview chance score
- Detailed breakdown
- Strengths and weaknesses
- AI summary

### **5. Optimize (Optional)**
- Click "Yes, Optimize My CV"
- Choose: Honest or Aggressive mode
- Wait 20-30 seconds
- Preview your optimized CV
- Download as PDF

---

## 🎨 **UI Features**

**Landing Page:**
- Clean hero section
- Easy file upload with drag-and-drop
- Large text area for job description
- Prominent "Analyze" button

**Results Page:**
- Big score display with color coding:
  - 🟢 Green (80-100%): Excellent
  - 🔵 Blue (65-79%): Good
  - 🟡 Yellow (45-64%): Moderate
  - 🟠 Orange (30-44%): Low
  - 🔴 Red (0-29%): Very Low
- Score breakdown cards
- Detailed analysis sections
- Strengths/Weaknesses cards
- Optimization CTA

**Optimization Page:**
- Success message
- Changes summary
- CV preview
- Download button

---

## 🔧 **Project Structure**

```
cv-matcher-frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page (landing + flow)
│   └── globals.css         # Global styles
├── components/
│   ├── UploadSection.tsx   # CV upload + JD input
│   ├── ResultsSection.tsx  # Analysis results display
│   ├── OptimizationSection.tsx # Optimized CV display
│   └── LoadingSpinner.tsx  # Loading states
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎯 **Running Both Together**

**Terminal 1 (Backend):**
```bash
cd cv-matcher
npm start
```
Output: `🚀 CV Matcher API Server Started on Port 3000`

**Terminal 2 (Frontend):**
```bash
cd cv-matcher-frontend
npm run dev
```
Output: `ready - started server on 0.0.0.0:3001`

**Browser:**
```
http://localhost:3001
```

---

## 🐛 **Troubleshooting**

### **"npm install" fails**
- Make sure you're in the `cv-matcher-frontend` folder
- Delete `node_modules` and try again:
  ```bash
  rm -rf node_modules
  npm install
  ```

### **"Cannot connect to backend"**
- Make sure backend is running on port 3000
- Check `http://localhost:3000/health` in browser
- If it shows JSON, backend is working

### **"Port 3001 already in use"**
- Kill the process using port 3001:
  ```bash
  lsof -ti:3001 | xargs kill -9
  ```
- Or change the port in `package.json`:
  ```json
  "dev": "next dev -p 3002"
  ```

### **Changes not showing up**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache
- Restart the dev server

### **PDF download not working**
- Make sure both endpoints are added to backend
- Check backend console for errors
- Ensure `cvOptimizer.js` and `pdfGenerator.js` are in `services/`

---

## 🎨 **Customization**

### **Change Colors**

Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',    // Change to your color
      secondary: '#8B5CF6',  // Change to your color
      accent: '#10B981',     // Change to your color
    },
  },
}
```

### **Change Name/Title**

Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Your Custom Title',
  description: 'Your custom description',
}
```

Edit `components/UploadSection.tsx` for the hero heading.

### **Change Port**

Edit `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3002",  // Change 3001 to any port
}
```

---

## 📊 **Performance Tips**

1. **File Size**: Keep CV files under 5MB for fast uploads
2. **Network**: Backend and frontend on same machine = fastest
3. **Browser**: Chrome/Firefox work best
4. **Internet**: Stable connection needed for Claude API calls

---

## 🚢 **Deployment (Later)**

When ready to deploy publicly:

1. **Frontend**: Deploy to Vercel (easiest)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Backend**: Deploy to Railway, Render, or your server
   - Add CORS settings for your frontend URL
   - Set environment variables

3. **Update API URL**: Change `API_BASE_URL` in `app/page.tsx`

---

## ✅ **Testing Checklist**

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Can access http://localhost:3001
- [ ] Can upload a CV file
- [ ] Can paste job description
- [ ] "Analyze" button works
- [ ] Results display correctly
- [ ] Can click "Optimize"
- [ ] Optimization completes
- [ ] Can download PDF
- [ ] PDF opens correctly

---

## 💡 **Tips**

1. **Keep Both Terminals Open**: Backend + Frontend must both run
2. **Test with Real CV**: Use an actual CV for best results
3. **Try Both Modes**: Test "Honest" and "Aggressive" optimization
4. **Share with Friends**: Get feedback on UI/UX
5. **Monitor Console**: Check browser console (F12) for any errors

---

## 🎯 **Next Steps**

Once this works locally:
1. ✅ Test with multiple CVs
2. ✅ Get user feedback
3. ✅ Add user authentication (optional)
4. ✅ Add history tracking (optional)
5. ✅ Deploy publicly
6. ✅ Share with the world! 🚀

---

**You're all set!** Run the commands and enjoy your beautiful CV Matcher frontend! 🎉

Need help? Check the console logs or let me know!
