# Testing Protocol and Workflow

## Next Test Run: BBQ Planner Customization & CRM Settings
**Features to Test:**
1. ✅ **Per-Steak Grade Selection** - Each steak can have different beef quality grade (Prime, Wagyu, etc.)
2. ✅ **Per-Steak Dry Aging** - Each steak can have different dry aging options (flat pricing, not per lb)
3. ✅ **BBQ Event Portions CRM** - Admin can configure portion sizes per event type in Settings
4. ✅ **Price Calculation** - Verify grade modifier (per lb) + dry aging (flat fee) calculate correctly
5. ✅ **Checkout Payload** - Verify customizations are included in product names for checkout

---

## Last Test Run: Iteration 9 - Customer Portal & Security Fix
**Date:** April 17, 2026
**Status:** ✅ ALL TESTS PASSED (17/17 backend, 100% frontend)
**Testing Agent:** testing_agent_v3_fork

### Features Tested:
1. ✅ **Membership Security Fix** - POST/PUT/DELETE endpoints now require authentication (401 without auth)
2. ✅ **Customer Portal Registration** - New accounts created successfully with JWT tokens
3. ✅ **Customer Portal Login** - Email/password authentication working
4. ✅ **Customer Dashboard** - Displays membership tier, benefits, and profile link
5. ✅ **Customer Profile Management** - View and edit personal information (phone, address, etc.)
6. ✅ **Navigation Integration** - "Sign In" when logged out, "My Account" when logged in
7. ✅ **Logout Functionality** - Clears session and returns to homepage

### Test Results Summary:
- Backend: 17/17 tests passed (100%)
- Frontend: All customer portal flows working perfectly
- Security: Membership endpoints properly protected
- Auth: JWT Bearer token authentication working for customers
- UI: Dark luxury theme consistent across all customer portal pages

### Files Modified:
- `/app/backend/routes/customer_auth.py` - Customer authentication with JWT
- `/app/backend/routes/memberships.py` - Re-secured with auth dependencies
- `/app/frontend/src/pages/customer/CustomerLogin.jsx` - Login/Register UI
- `/app/frontend/src/pages/customer/CustomerDashboard.jsx` - Portal main page
- `/app/frontend/src/pages/customer/CustomerProfile.jsx` - Profile management
- `/app/frontend/src/components/admin/MembershipsManager.jsx` - Fixed auth headers
- `/app/frontend/src/pages/LandingPage.jsx` - Added customer navigation
- `/app/frontend/src/App.js` - Added customer routes

### Known Issues: NONE

### Next Testing Focus:
- Integration with Stripe subscriptions (future task)
- Order history display (future task)

---

## Incorporate User Feedback
(User feedback from latest testing will be added here)

