# Fake Data Generation System

This system provides fake controllers and a structured database population script to populate your FlashFood database with test data for the admin dashboard.

## 🎯 Purpose

The admin dashboard needs real data to display charts, tables, and statistics. This system allows you to quickly populate the database with realistic fake data, including **signable admin accounts** and realistic restaurant/customer data.

## 📁 Files Created

### Main Population Script

- `structured-database-populator.js` - **MAIN SCRIPT** - Creates complete database with signable accounts
- `test-structured-approach.js` - Pre-validation script to check system readiness
- `start-ultimate.bat` - Automated runner for the population script

### Fake Controllers (in main backend `/src2`)

- `src2/customers/customers.controller.fake.ts` - Bypasses auth for customer operations
- `src2/restaurants/restaurants.controller.fake.ts` - Bypasses auth for restaurant operations
- `src2/customer_cares/customer_cares.controller.fake.ts` - Bypasses auth for customer care operations

### Debug & Test Scripts

- `debug-restaurant.js` - Tests restaurant creation functionality
- `check-count.js` - Quick count checker for all entities
- `quick-test.js` - General endpoint testing

## 🚀 Quick Start - RECOMMENDED METHOD

### 1. Use the Structured Populator (Recommended)

This is the **complete solution** that creates everything you need:

```bash
node structured-database-populator.js
```

**What it creates:**

- ✅ **Signable admin accounts** (Super Admin, Finance Admins, Companion Admins)
- ✅ **Signable customer care accounts**
- ✅ **Address books** (foundation data)
- ✅ **Food categories** (foundation data)
- ✅ **Restaurants** using existing users as owners
- ✅ **Customers** using existing users
- ✅ **Finance rules** (configuration data)

**Execution Order:**

```
🏠 Address Books → 🍔 Food Categories → 👑 Admin Hierarchy → 📞 Customer Care → 🏪 Restaurants → 👥 Customers → 💰 Finance Rules
```

### 2. Get Your Sign-In Credentials

After running, you'll get **actual working credentials**:

```
👑 SUPER ADMIN:
   Email: superadmin_xxx@flashfood.com
   Password: Admin123!
   Endpoint: POST /auth/login-super-admin

💰 FINANCE ADMINS:
   Email: financeadmin_xxx@flashfood.com
   Password: Finance123!
   Endpoint: POST /auth/login-finance-admin

📞 CUSTOMER CARE REPS:
   Email: customercare_xxx@flashfood.com
   Password: CustomerCare123!
   Endpoint: POST /auth/login-customer-care
```

## 🔧 Available Endpoints

### Admin Authentication (SIGNABLE ACCOUNTS)

- `POST /auth/register-super-admin` - Creates signable Super Admin
- `POST /auth/register-finance-admin` - Creates signable Finance Admin
- `POST /auth/register-companion-admin` - Creates signable Companion Admin
- `POST /auth/register-customer-care` - Creates signable Customer Care Rep

### Data Creation Endpoints

- `POST /address_books` - Creates address books
- `POST /food-categories` - Creates food categories
- `POST /finance-rules` - Creates finance rules

### Fake Endpoints (No Auth Required)

#### Customers

- `GET /customers-fake` - Get all customers
- `POST /customers-fake` - Create a customer
- `POST /customers-fake/bulk` - Create multiple customers

#### Restaurants

- `GET /restaurants-fake` - Get all restaurants
- `POST /restaurants-fake` - Create a restaurant
- `POST /restaurants-fake/bulk` - Create multiple restaurants

#### Customer Cares

- `GET /customer-cares-fake` - Get all customer care agents
- `POST /customer-cares-fake` - Create a customer care agent

## 📊 Data Structure & Relationships

### Smart User Assignment

The system intelligently assigns users to roles:

- **Restaurants**: Looks for `RESTAURANT_OWNER` users, falls back to any available users
- **Customers**: Looks for `CUSTOMER` users, falls back to any available users
- **Relationships**: Creates realistic connections between customers, restaurants, and categories

### Customer Data Sample

```json
{
  "user_id": "USR_12345",
  "first_name": "John",
  "last_name": "Doe",
  "address": "123 Main St",
  "avatar": {
    "url": "https://example.com/avatar.jpg",
    "key": "avatar-key"
  },
  "app_preferences": {
    "theme": "light"
  },
  "address_ids": ["FF_AB_123"],
  "preferred_category_ids": ["FF_FC_456"],
  "favorite_restaurant_ids": ["FF_RES_789"]
}
```

### Restaurant Data Sample

```json
{
  "owner_id": "USR_67890",
  "owner_name": "Restaurant Owner",
  "restaurant_name": "Amazing Restaurant",
  "description": "Great food and service",
  "address_id": "FF_AB_123",
  "contact_email": [
    {
      "title": "Primary",
      "is_default": true,
      "email": "restaurant@example.com"
    }
  ],
  "contact_phone": [
    {
      "title": "Primary",
      "number": "+1234567890",
      "is_default": true
    }
  ],
  "status": {
    "is_open": true,
    "is_active": true,
    "is_accepted_orders": true
  },
  "opening_hours": {
    "mon": { "from": 8, "to": 22 }
    // ... other days
  },
  "food_category_ids": ["FF_FC_456", "FF_FC_789"]
}
```

## 🛠 Customization

### Modify Data Generation

Edit `structured-database-populator.js` to customize:

- **User assignment logic**: Change how users are assigned to restaurants/customers
- **Data relationships**: Modify how entities are linked together
- **Creation counts**: Adjust how many of each entity to create

### Technical Configuration

```javascript
// Base URL configuration
this.baseURL = 'http://127.0.0.1:1310'; // IPv4 for compatibility

// Creation counts
const restaurantsNeeded = 8;
const customersNeeded = 15;
```

## ⚠️ Important Notes

- **IPv4 Required**: Uses `127.0.0.1` instead of `localhost` for Windows compatibility
- **Proper Auth Flow**: Admin accounts use real registration endpoints for sign-in capability
- **Non-blocking**: Restaurant/customer creation won't stop the process if it fails
- **Development Only**: Fake endpoints should NOT be deployed to production
- **Smart Fallbacks**: System adapts to available users and data

## 🔒 Security

**CRITICAL**: Before deploying to production:

1. Remove fake controllers from modules
2. Delete fake controller files
3. Remove debug scripts from production builds
4. Change all default passwords

## 🧹 Cleanup

To remove fake data, you can:

1. **Truncate specific tables** in your database
2. **Use the fake DELETE endpoints** for individual records
3. **Reset your database** and re-run population

## 🚀 Next Steps

After running the structured populator:

1. ✅ **Sign in to admin dashboard** with provided credentials
2. ✅ **Check data displays** - charts, tables, statistics should show data
3. ✅ **Test restaurant management** features with fake restaurant data
4. ✅ **Test customer management** features with fake customer data
5. ✅ **Continue development** with realistic test data

## 🎊 Success Indicators

You know it worked when:

- ✅ You can sign in with admin credentials
- ✅ Dashboard shows restaurants, customers, and statistics
- ✅ All charts and tables display meaningful data
- ✅ Admin functions work with realistic test data

---

**Happy coding with your fully populated FlashFood database!** 🎉
