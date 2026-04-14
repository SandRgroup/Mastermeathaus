# MasterMeatBox - Deployment & Migration Guide

## 🚀 Deployment Checklist

### **Pre-Deployment Steps**

1. **Environment Variables**
   - ✅ All `.env` files configured
   - ✅ `REACT_APP_BACKEND_URL` set to production domain
   - ✅ `MONGO_URL` points to production MongoDB
   - ✅ `CORS_ORIGINS` configured for production domain
   - ✅ Stripe API keys (use production keys for live deployment)

2. **Database Setup**
   - ✅ MongoDB Atlas or production database ready
   - ✅ Admin user created (email: admin@mastermeatbox.com)
   - ✅ Collections initialized (will auto-create on first API call)

3. **Build Process**
   ```bash
   # Frontend build
   cd /app/frontend
   yarn build
   
   # Backend - already production ready (FastAPI)
   cd /app/backend
   pip freeze > requirements.txt
   ```

---

## 📦 Migration to Another Emergent Account

### **Option 1: Export Current Project**

1. **Download Project Files**
   - Use Emergent's "Download Code" feature
   - Or use Git integration to push to your repository

2. **Database Export**
   ```bash
   # Export all collections
   mongodump --uri="YOUR_MONGO_URL" --out=/tmp/mmb-backup
   
   # Export specific collections
   mongoexport --uri="YOUR_MONGO_URL" --collection=products --out=products.json
   mongoexport --uri="YOUR_MONGO_URL" --collection=memberships --out=memberships.json
   mongoexport --uri="YOUR_MONGO_URL" --collection=steak_boxes --out=steak_boxes.json
   mongoexport --uri="YOUR_MONGO_URL" --collection=discount_codes --out=discount_codes.json
   mongoexport --uri="YOUR_MONGO_URL" --collection=menu_items --out=menu_items.json
   ```

3. **Assets Export**
   - Download all uploaded images from `/app/backend/uploads/`
   - Or use cloud storage URLs (images already hosted externally)

---

### **Option 2: Import to New Emergent Account**

1. **Create New Emergent Project**
   - Choose React + FastAPI + MongoDB stack
   - Upload your downloaded code

2. **Database Import**
   ```bash
   # Import all collections
   mongorestore --uri="NEW_MONGO_URL" /tmp/mmb-backup
   
   # Import specific collections
   mongoimport --uri="NEW_MONGO_URL" --collection=products --file=products.json
   mongoimport --uri="NEW_MONGO_URL" --collection=memberships --file=memberships.json
   mongoimport --uri="NEW_MONGO_URL" --collection=steak_boxes --file=steak_boxes.json
   mongoimport --uri="NEW_MONGO_URL" --collection=discount_codes --file=discount_codes.json
   mongoimport --uri="NEW_MONGO_URL" --collection=menu_items --file=menu_items.json
   ```

3. **Create Admin User**
   ```bash
   # In new Emergent project, run:
   python /app/backend/create_admin.py
   ```

4. **Update Environment Variables**
   - Update `REACT_APP_BACKEND_URL` in frontend/.env
   - Update `MONGO_URL` in backend/.env
   - Update `CORS_ORIGINS` for new domain

---

## 🗄️ Database Collections

### **Collections Used:**
1. **admins** - Admin user accounts (JWT auth)
2. **products** - Product catalog (14 cuts)
3. **steak_boxes** - Steak box products (4 boxes)
4. **memberships** - Membership plans (4 tiers)
5. **discount_codes** - Discount codes with usage tracking
6. **menu_items** - Dynamic navigation and CTAs

### **Sample Data Structure:**

**Product:**
```json
{
  "id": "uuid",
  "name": "Filet Mignon",
  "grade": "Prime",
  "description": "Ultra-tender, buttery texture",
  "price": "45",
  "originalPrice": "55",
  "image": "https://...",
  "weight_unit": "oz",
  "cookingTemp": "135°F",
  "badge": "Best Seller",
  "created_at": "2026-04-14T..."
}
```

**Steak Box:**
```json
{
  "id": "uuid",
  "name": "Prime Cut Box",
  "tagline": "Highest-grade selection only",
  "description": "All premium steaks...",
  "price": "$249",
  "features": ["100% USDA Prime", "Ribeye, Filet, NY Strip"],
  "icon": "⭐",
  "highlight": true,
  "created_at": "2026-04-14T..."
}
```

**Menu Item:**
```json
{
  "id": "uuid",
  "label": "Shop Boxes",
  "link": "/shop-boxes",
  "position": "header",
  "order": 1,
  "enabled": true,
  "created_at": "2026-04-14T..."
}
```

---

## 🌐 Domain Connection

### **Steps to Connect Custom Domain:**

1. **In Emergent Dashboard:**
   - Click "Connect Domain"
   - Enter your domain (e.g., mastermeatbox.com)
   - Emergent uses Entri for automatic DNS configuration

2. **DNS Configuration (if manual):**
   ```
   Type: A Record
   Name: @
   Value: [Emergent Server IP]
   
   Type: CNAME
   Name: www
   Value: [your-app].emergent.app
   ```

3. **SSL Certificate:**
   - Automatically provisioned by Emergent
   - Wait 5-15 minutes for propagation

4. **Update Environment Variables:**
   ```bash
   # frontend/.env
   REACT_APP_BACKEND_URL=https://mastermeatbox.com
   
   # backend/.env
   CORS_ORIGINS=https://mastermeatbox.com,https://www.mastermeatbox.com
   ```

---

## 📋 Pre-Launch Testing Checklist

### **Frontend Testing:**
- [ ] All pages load without errors
- [ ] Navigation menu works (6 items)
- [ ] Shopping cart add/remove items
- [ ] Checkout flow complete
- [ ] Discount code application
- [ ] Monthly/Yearly billing toggle
- [ ] Membership detail pages
- [ ] All policy pages accessible
- [ ] Footer logo displays correctly

### **Backend Testing:**
- [ ] Admin login works
- [ ] Products CRUD operations
- [ ] Steak Boxes CRUD operations
- [ ] Memberships CRUD operations
- [ ] Discount Codes CRUD operations
- [ ] Menu Items CRUD operations
- [ ] Stripe checkout session creation
- [ ] Discount code validation
- [ ] Image upload functionality

### **Integration Testing:**
- [ ] Stripe test checkout completes
- [ ] Discount codes apply correctly
- [ ] Subscribe & Save mutually exclusive with discounts
- [ ] Usage count increments on discount use
- [ ] Email/phone contact info correct everywhere

---

## 🔐 Security Checklist

- [ ] Admin credentials changed from default
- [ ] Stripe keys are in environment variables (not hardcoded)
- [ ] CORS origins set to production domain only
- [ ] MongoDB connection secured with authentication
- [ ] JWT secret key set in environment
- [ ] No sensitive data in Git repository
- [ ] All API routes use HTTPS in production
- [ ] Admin routes protected with JWT authentication

---

## 📊 Performance Optimization

**Already Implemented:**
- ✅ Database queries optimized (projections + limits)
- ✅ CORS configured efficiently
- ✅ Image optimization (quality=20 for screenshots)
- ✅ React code splitting ready
- ✅ Backend async operations
- ✅ MongoDB indexing on frequently queried fields

**Recommended:**
- Add CDN for static assets
- Enable gzip compression
- Add caching headers
- Optimize images before upload

---

## 🆘 Troubleshooting

### **Common Issues:**

**1. Blank Pages After Deployment:**
- Check browser console for errors
- Verify `REACT_APP_BACKEND_URL` is correct
- Ensure CORS origins include production domain

**2. API Calls Failing:**
- Verify backend is running
- Check MongoDB connection string
- Confirm API routes include `/api` prefix

**3. Admin Login Not Working:**
- Ensure admin user exists in database
- Check JWT secret is set
- Verify bcrypt password hashing

**4. Stripe Checkout Errors:**
- Confirm Stripe API keys are production keys
- Verify success/cancel URLs are correct
- Check Stripe webhook configuration

---

## 📞 Support

**Email**: hello@mastermeatbox.com  
**Phone**: 817-807-2489  
**Hours**: Monday – Friday, 9 AM – 5 PM (CST)

---

## 🎯 Post-Deployment

1. **Test Everything:**
   - Complete a test order
   - Create test discount code
   - Verify all email notifications

2. **Monitor:**
   - Check error logs daily
   - Monitor Stripe dashboard
   - Track MongoDB performance

3. **Backup:**
   - Set up automated MongoDB backups
   - Export CMS data weekly
   - Keep code in Git repository

---

**Last Updated**: April 14, 2026  
**Version**: 1.0  
**Stack**: React + FastAPI + MongoDB + Stripe
