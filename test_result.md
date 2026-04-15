#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: "Create a single-page, premium e-commerce landing page for Mastermeatbox with product display, cart functionality, admin CMS for products/memberships/discount codes, Stripe checkout, and discount code system (mutually exclusive with Subscribe & Save)"

backend:
  - task: "JWT Authentication System"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 33-88, 205-251)"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "previous"
        comment: "Auth system created in previous job with JWT tokens, bcrypt hashing, and refresh tokens"
      - working: "unknown"
        agent: "main"
        comment: "NEVER TESTED by previous agent. Needs comprehensive testing of login, logout, token refresh, and protected routes"

  - task: "Products CRUD API"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 253-280)"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "previous"
        comment: "Products CRUD endpoints created"
      - working: "unknown"
        agent: "main"
        comment: "NEVER TESTED. Need to verify GET, POST, PUT, DELETE operations"

  - task: "Memberships CRUD API"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 281-308)"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "previous"
        comment: "Memberships CRUD endpoints created"
      - working: "unknown"
        agent: "main"
        comment: "NEVER TESTED. Need to verify all CRUD operations"

  - task: "Discount Codes CRUD API"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 309-346)"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "unknown"
        agent: "previous"
        comment: "Discount code routes created but never tested"
      - working: "unknown"
        agent: "main"
        comment: "Backend complete. Needs testing of: CREATE (with duplicate check), READ all codes, UPDATE code, DELETE code. Verify auth protection on all routes."

  - task: "Discount Code Validation API"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 348-388)"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "unknown"
        agent: "main"
        comment: "Created in previous job. Test edge cases: expired codes, max uses reached, min purchase not met, inactive codes, case-insensitive code matching"

  - task: "Stripe Checkout with Discount Codes"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 410-509)"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "unknown"
        agent: "previous"
        comment: "Stripe integration done but NEVER tested"
      - working: "unknown"
        agent: "main"
        comment: "Updated to enforce mutual exclusivity: Subscribe & Save items cannot be combined with discount codes. Backend should reject checkout if both are present. Discount code increments used_count. Test: checkout with discount, checkout with Subscribe & Save, attempt both together (should fail), verify used_count increments"

  - task: "Image Upload API"
    implemented: true
    working: "unknown"
    file: "/app/backend/server.py (lines 389-408)"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "unknown"
        agent: "previous"
        comment: "Image upload endpoint created but NEVER tested"
      - working: "unknown"
        agent: "main"
        comment: "Needs testing with actual image files, verify auth protection, check file type validation"

frontend:
  - task: "Admin Login UI"
    implemented: true
    working: "unknown"
    file: "/app/frontend/src/pages/admin/Login.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "previous"
        comment: "Admin login page created"
      - working: "unknown"
        agent: "main"
        comment: "Needs E2E test: login with correct credentials, verify redirect to dashboard, login with wrong credentials"

  - task: "Products Manager UI"
    implemented: true
    working: "unknown"
    file: "/app/frontend/src/components/admin/ProductsManager.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "previous"
        comment: "Products CMS UI created with image upload"
      - working: "unknown"
        agent: "main"
        comment: "Test: create product, edit product, delete product, upload image"

  - task: "Memberships Manager UI"
    implemented: true
    working: "unknown"
    file: "/app/frontend/src/components/admin/MembershipsManager.jsx"
    stuck_count: 0
    priority: "low"
    needs_retesting: true
    status_history:
      - working: true
        agent: "previous"
        comment: "Memberships CMS UI created"
      - working: "unknown"
        agent: "main"
        comment: "Test full CRUD operations"

  - task: "Discounts Manager UI"
    implemented: true
    working: "unknown"
    file: "/app/frontend/src/components/admin/DiscountsManager.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "unknown"
        agent: "main"
        comment: "Just created. Full discount code management UI with usage statistics (X/Y used), expiry dates, min purchase, max uses. Test: create code, edit code, delete code, verify usage stats display, verify status badges (active/inactive/expired/limit reached)"

  - task: "Checkout Discount Code UI"
    implemented: true
    working: "unknown"
    file: "/app/frontend/src/pages/checkout/Checkout.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "unknown"
        agent: "main"
        comment: "Just created. Discount code input on checkout page with validation. Test: apply valid code, apply invalid code, apply expired code, try to apply code with Subscribe & Save items (should show warning and disable input), verify discount appears in order summary, verify final total calculation"

  - task: "Shopping Cart"
    implemented: true
    working: true
    file: "/app/frontend/src/contexts/CartContext.jsx, /app/frontend/src/components/Cart.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: false
        agent: "previous"
        comment: "Previous agent reported items not showing in cart"
      - working: true
        agent: "main"
        comment: "TESTED with screenshot tool. Cart is working perfectly. Items add correctly, badge shows count (1), localStorage persists data, cart sidebar displays items. The bug was a false alarm or already fixed."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: true

test_plan:
  current_focus:
    - "BBQ Calculator Component"
    - "Landing Page BBQ Calculator Integration"
    - "Complete Frontend E2E Testing"
    - "Backend API Stability"
    - "CRM System"
    - "Site Settings Manager"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"
  test_credentials:
    admin_email: "admin@mastermeatbox.com"
    admin_password: "MMB@dmin2025!Secure"
  special_instructions: |
    CRITICAL TESTING PRIORITIES:
    1. NEW: BBQ Calculator - multi-step wizard functionality
       - Step 1: People count slider (1-100)
       - Step 2: Experience selection (standard/premium/casual)
       - Step 3: Protein selection (beef/chicken/sausage)
       - Step 4: Results calculation and box recommendation
       - Final CTA: Redirect to /shop-boxes
    
    2. Landing Page Integration
       - BBQ Calculator renders correctly
       - Positioned above footer section
       - Dark theme styling matches landing page
       - All step transitions work smoothly
    
    3. Previous Massive Changes Need Validation:
       - Complete landing page overhaul (LandingPage.jsx + CSS)
       - New CRM system (CustomersManager.jsx)
       - New Site Settings (SiteSettingsManager.jsx)
       - Product Manager oz/lb weight selector
       - Admin link removed from header
    
    4. Backend Stability Check:
       - All existing APIs still working after frontend changes
       - CRM endpoints (/api/crm/customers)
       - Site Settings endpoints (/api/settings)
       - Products, Memberships, Discounts, Checkout
    
    IMPORTANT: Previous agent did MASSIVE frontend rewrite without running testing subagent.
    This is the first comprehensive test since the major overhaul.

agent_communication:
  - agent: "main"
    message: "Discount code feature implementation COMPLETE. Created DiscountsManager.jsx for admin CMS with full CRUD and usage statistics display. Updated Checkout.jsx with discount code input, validation, and mutual exclusivity warning. Modified backend checkout endpoint to enforce Subscribe & Save vs discount code mutual exclusivity (returns 400 error if both present). All frontend linting passed. Ready for comprehensive testing. CRITICAL: Previous agent never tested backend - this is first test pass for auth, stripe, uploads, and discounts."
