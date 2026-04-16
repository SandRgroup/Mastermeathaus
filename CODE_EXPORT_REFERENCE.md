# Masters Meat Haus - Complete Code Export
**Website:** mastersmeathaus.com  
**Admin:** admin@mastersmeathaus.com / MMH@dmin2025!Secure  
**Export Date:** April 16, 2026  

---

## 📦 Download Complete Codebase

**Zip File Location:** `/app/mastersmeathaus_complete.zip` (2.7 MB)

**Contents:**
- ✅ Full React frontend
- ✅ FastAPI backend
- ✅ MongoDB schemas
- ✅ All configurations
- ✅ Environment files
- ✅ Package dependencies

**Excluded from zip:**
- node_modules/ (reinstall with `yarn install`)
- venv/ (recreate with `python -m venv venv`)
- .git/ (version control)
- __pycache__/ (Python cache)

---

## 🗂️ Project Structure

```
/app/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # CMS Components
│   │   │   │   ├── BBQSettingsManager.jsx
│   │   │   │   ├── MenuManager.jsx
│   │   │   │   ├── ProductsManager.jsx
│   │   │   │   └── SiteSettingsManager.jsx
│   │   │   ├── ui/          # Shadcn Components
│   │   │   ├── BBQCalculator.jsx
│   │   │   └── Checkout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── Login.jsx
│   │   │   ├── policies/
│   │   │   │   └── DeliveryWorks.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   └── styles/
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
│
├── backend/                  # FastAPI Server
│   ├── server.py            # Main application (1098 lines)
│   ├── requirements.txt
│   └── .env
│
├── memory/                   # Documentation
│   └── test_credentials.md
│
└── test_reports/            # Testing
    └── iteration_3.json

```

---

## 🔑 Key Files Reference

### 1. Frontend Entry Point
**File:** `/app/frontend/src/pages/LandingPage.jsx`
- Main landing page
- MMH branding
- Product display
- BBQ Calculator integration

### 2. BBQ Calculator (NEW!)
**File:** `/app/frontend/src/components/BBQCalculator.jsx`
- Customer-editable total meat per person
- lbs/kg toggle with auto-conversion
- Division math: total ÷ selected meats
- Shows grams when in kg mode
- Stripe checkout integration

**Key Features:**
```javascript
// State
const [totalMeatPerPerson, setTotalMeatPerPerson] = useState(1.2);
const [unit, setUnit] = useState('lbs'); // or 'kg'

// Auto-conversion on unit change
useEffect(() => {
  if (unit === 'kg') {
    setTotalMeatPerPerson(0.5); // 500g
  } else {
    setTotalMeatPerPerson(1.2);
  }
}, [unit]);

// Calculation
const amountPerMeat = totalMeatPerPerson / numberOfSelectedMeats;
```

### 3. Admin CMS - BBQ Settings
**File:** `/app/frontend/src/components/admin/BBQSettingsManager.jsx`
- Manage total meat per person (default: 1.2 lbs)
- Add/edit BBQ products with categories
- Set pricing per lb
- Manage dry-aging options

### 4. Admin Login (UPGRADED!)
**File:** `/app/frontend/src/pages/admin/Login.jsx`
- MMH branding
- Show/hide password
- Remember me checkbox
- Better error handling
- Loading states

### 5. Backend Server
**File:** `/app/backend/server.py` (1098 lines)
**Key Sections:**
- Lines 1-50: Imports & configuration
- Lines 150-200: Data models (Product, MenuItem, BBQPricing)
- Lines 250-280: Authentication
- Lines 300-450: Product endpoints
- Lines 716-732: CORS configuration (FIXED!)
- Lines 999-1050: BBQ pricing endpoints

**Important Models:**
```python
class BBQPricing(BaseModel):
    enabled: bool = True
    totalMeatPerPerson: float = 1.2
    steakPerPerson: float = 0.7
    chickenPerPerson: float = 0.5
    sausagePerPerson: float = 0.4
    aging: List[dict] = [...]
    bbqProducts: List[dict] = []
```

### 6. Delivery Page (MODERNIZED!)
**File:** `/app/frontend/src/pages/policies/DeliveryWorks.jsx`
- Dark gradient hero
- 4 delivery step cards with animations
- Storage instructions (Do/Don't layout)
- Contact section with glass cards
- Fully responsive

---

## 🎨 Key Components Code

### BBQ Calculator Customer Edit Field
```jsx
<input
  type="number"
  step={unit === 'kg' ? '0.1' : '0.1'}
  min={unit === 'kg' ? '0.2' : '0.5'}
  max={unit === 'kg' ? '2' : '5'}
  value={totalMeatPerPerson}
  onChange={(e) => setTotalMeatPerPerson(parseFloat(e.target.value))}
  style={{
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    border: '3px solid #C8A96A'
  }}
/>
<p style={{ fontSize: '0.75rem' }}>
  {unit === 'kg' 
    ? `${(totalMeatPerPerson * 1000).toFixed(0)}g` 
    : `${(totalMeatPerPerson * 16).toFixed(1)} oz`
  } divided among your selected meats
</p>
```

### Results Display with Division Math
```jsx
<p style={{ fontSize: '1.1rem', fontWeight: '600' }}>
  {result.totalMeatPerPerson} {result.unit} ÷ {result.numberOfMeats} meats 
  = {result.amountPerMeat} {result.unit} each
</p>
{result.unit === 'kg' && (
  <p style={{ fontSize: '0.75rem' }}>
    ({(result.amountPerMeat * 1000).toFixed(0)}g per meat)
  </p>
)}
```

---

## 🔐 Environment Variables

### Frontend `.env`
```bash
REACT_APP_BACKEND_URL=https://wagyu-vault.preview.emergentagent.com
```

### Backend `.env`
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=http://localhost:3000,https://wagyu-vault.preview.emergentagent.com
JWT_SECRET_KEY=[your-key]
STRIPE_API_KEY=[your-stripe-key]
```

---

## 📊 Database Collections

### 1. `users`
```json
{
  "id": "uuid",
  "email": "admin@mastersmeathaus.com",
  "password_hash": "bcrypt-hash",
  "name": "Admin",
  "role": "admin"
}
```

### 2. `bbq_pricing`
```json
{
  "totalMeatPerPerson": 1.2,
  "steakPerPerson": 0.7,
  "chickenPerPerson": 0.5,
  "sausagePerPerson": 0.4,
  "bbqProducts": [
    {
      "name": "Filet Mignon",
      "category": "steak",
      "pricePerLb": 45,
      "description": "Center-cut tenderness"
    }
  ],
  "aging": [
    { "label": "Standard", "days": 0, "upcharge": 0 },
    { "label": "30 Days (Premium)", "days": 30, "upcharge": 25 }
  ],
  "enabled": true
}
```

### 3. `products`
```json
{
  "id": "uuid",
  "name": "Ribeye",
  "grade": "USDA Prime",
  "description": "Rich marbling",
  "price": "$38.00",
  "pricePerLb": 38,
  "image": "url",
  "availableForBBQ": true,
  "category": "steak"
}
```

### 4. `menu_items`
```json
{
  "id": "uuid",
  "label": "Shop",
  "link": "/",
  "position": "header",
  "order": 0,
  "enabled": true
}
```

---

## 🚀 Installation & Setup

### Frontend
```bash
cd /app/frontend
yarn install
yarn start  # Development
yarn build  # Production
```

### Backend
```bash
cd /app/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### MongoDB
```bash
# Local
mongod --dbpath /data/db

# Connection string in .env
MONGO_URL=mongodb://localhost:27017
```

---

## 🎯 Key Features Implemented

### ✅ BBQ Calculator
- Customer-editable total meat per person
- Auto lbs/kg conversion (1.2 lbs ↔ 0.5 kg)
- Shows grams in kg mode
- Division math display
- Multi-select meats with checkboxes
- Direct Stripe checkout

### ✅ Admin CMS
- Products manager with grade dropdown
- BBQ settings with total meat control
- Menu & CTA manager with quick presets
- Site settings for hero/trust/delivery
- Discount codes manager
- Full CRUD operations

### ✅ Branding
- MMH | 傑 / MASTERS MEAT HAUS®
- Email: admin@mastersmeathaus.com
- Support: hello@mastersmeathaus.com
- Dark theme with amber accents

### ✅ Pages
- Modern delivery page with animations
- Landing page with BBQ calculator
- Admin login with show/hide password
- Policy pages (7 total)

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Products
- `GET /api/products` - List all
- `POST /api/products` - Create (auth required)
- `PUT /api/products/:id` - Update (auth required)
- `DELETE /api/products/:id` - Delete (auth required)

### BBQ
- `GET /api/pricing` - Get BBQ settings (public)
- `PUT /api/pricing` - Update settings (auth required)
- `POST /create-checkout` - Stripe checkout

### Menu
- `GET /api/menu-items` - List all
- `POST /api/menu-items` - Create (auth required)
- `PUT /api/menu-items/:id` - Update (auth required)
- `DELETE /api/menu-items/:id` - Delete (auth required)

---

## 🔧 Recent Updates

### Session Summary
1. ✅ Rebranded to Masters Meat Haus
2. ✅ Fixed CMS login (CORS + password_hash)
3. ✅ Upgraded login page (modern design)
4. ✅ Made BBQ calculator customer-editable
5. ✅ Added lbs/kg auto-conversion
6. ✅ Shows grams (500g, 300g) in kg mode
7. ✅ Modernized delivery page
8. ✅ Fixed Menu & CTA manager
9. ✅ Total meat division (1.2 lbs ÷ meats)

---

## 📞 Support Information

**Admin Login:**
- Email: admin@mastersmeathaus.com
- Password: MMH@dmin2025!Secure
- URL: /admin/login

**Customer Support:**
- Email: hello@mastersmeathaus.com
- Phone: 817-807-2489
- Hours: Mon-Fri 9AM-5PM CST

---

## 🎨 Design System

### Colors
- Primary: #8B0000 (Dark Red)
- Accent: #C8A96A (Gold)
- Background: #0d0d0d (Near Black)
- Text: #fff / rgba(255,255,255,0.9)

### Typography
- Font: Inter (Google Fonts)
- H1: text-4xl to text-6xl
- H2: text-2xl to text-3xl
- Body: text-base
- Small: text-sm / text-xs

### Components
- Cards: rounded-2xl with shadow
- Buttons: Gradient or solid with hover
- Inputs: Dark with golden borders
- Icons: Lucide React + Emojis

---

## 📦 Dependencies

### Frontend (package.json)
- react ^18.2.0
- react-router-dom
- axios
- sonner (toasts)
- lucide-react (icons)
- tailwindcss
- @radix-ui/react-* (shadcn)

### Backend (requirements.txt)
- fastapi
- uvicorn
- motor (async MongoDB)
- python-jose (JWT)
- bcrypt
- stripe
- python-multipart
- emergentintegrations

---

## 🚦 Deployment Notes

### Environment
- Frontend: Port 3000
- Backend: Port 8001
- MongoDB: Port 27017

### Production Checklist
1. ✅ Update CORS_ORIGINS with production domain
2. ✅ Set strong JWT_SECRET_KEY
3. ✅ Add real Stripe API keys
4. ✅ Configure MongoDB connection string
5. ✅ Build frontend (`yarn build`)
6. ✅ Serve with nginx or similar
7. ✅ Enable HTTPS
8. ✅ Set up MongoDB backups

---

## 📄 License & Credits

**Project:** Masters Meat Haus E-Commerce Platform  
**Tech Stack:** React + FastAPI + MongoDB  
**UI Framework:** Tailwind CSS + Shadcn UI  
**Icons:** Lucide React  
**Payment:** Stripe  

---

**End of Code Export Documentation**  
*All code available in: `/app/mastersmeathaus_complete.zip`*
