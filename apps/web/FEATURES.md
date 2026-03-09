# SzPOS - Professional Point of Sale System

## 🎉 New Features (Updated UI System)

This is now a **professional-grade POS system** with authentication, multiple features, and a modern UI design.

### ✨ Features

#### 1. **Authentication System**
- Secure login page with demo credentials
- Role-based access control (Admin, Cashier, Manager)
- Protected routes - unauthorized users are redirected
- Session management

**Demo Login Credentials:**
```
Username: admin
Password: 1234
```
(Any other username with password 1234+ will also work as a cashier)

#### 2. **Dashboard**
- Welcome screen with feature access
- Quick navigation to all modules
- User profile display
- Logout functionality

#### 3. **Point of Sale (POS)**
- Product selection with search
- Shopping cart management
- Real-time price calculations
- Tax calculations (5% by default)
- Multiple payment methods:
  - Cash 💵
  - UPI 📱
  - Card 💳
- Print receipt functionality
- Sync with offline queue
- Status messaging

#### 4. **Reports & Analytics**
- Real-time sales statistics
- Daily, weekly, and revenue summaries
- Sales breakdown by payment method
- Transaction history
- Statistical cards with trending data

#### 5. **Inventory Management**
- Product database management
- Stock level tracking
- Low stock indicators
- Product SKU management
- Add/Edit/Delete products

#### 6. **User Management**
- Staff management system
- Role assignment (Admin, Cashier, Manager)
- User status tracking (Active/Inactive)
- User profile management

#### 7. **Settings**
- Business information configuration
- Tax rate configuration
- Currency customization
- GST number management
- Business address and contact details

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

1. **Navigate to the web directory:**
```bash
cd apps/web
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx          # Login authentication page
│   │   ├── Dashboard.tsx          # Main dashboard/home
│   │   ├── SaleScreenPage.tsx     # Point of Sale interface
│   │   ├── ReportsPage.tsx        # Reports & Analytics
│   │   ├── InventoryPage.tsx      # Inventory management
│   │   ├── UsersPage.tsx          # User management
│   │   ├── SettingsPage.tsx       # Settings configuration
│   │   ├── PageLayout.tsx         # Reusable page layout component
│   │   └── ProtectedRoute.tsx     # Route protection component
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── data/
│   │   └── localQueue.ts          # Offline queue
│   ├── sync/
│   │   └── syncEngine.ts          # Data synchronization
│   ├── styles.css                 # Professional styling
│   └── main.tsx                   # Entry point with routing
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient accents
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark-friendly**: Light background with good contrast
- **Interactive Elements**: Hover effects, transitions, and visual feedback
- **Consistent Styling**: Unified color scheme and typography
- **Icons**: Lucide React icons for professional appearance

### Color Scheme
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Secondary**: Gray (#6b7280)

---

## 🔐 Security Notes

**Important:** This is a demo system. For production:
1. Implement proper backend authentication (JWT, OAuth, etc.)
2. Secure all API endpoints
3. Use HTTPS
4. Implement proper data encryption
5. Add rate limiting and input validation
6. Use secure password hashing

---

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router DOM** - Client-side routing
- **Vite** - Build tool
- **Lucide React** - Icons
- **CSS3** - Styling with CSS variables

---

## 📝 Development Notes

### Authentication Flow
1. User visits `/` → LoginPage
2. Enters credentials → `useAuth().login()`
3. AuthContext updates user state
4. Router redirects to `/dashboard`
5. All routes are protected via `ProtectedRoute` component

### Adding New Features
Each feature page uses the `PageLayout` component for consistency:

```tsx
<PageLayout title="Feature Name">
  {/* Your content here */}
</PageLayout>
```

### Styling Guidelines
- Use CSS variables for consistency
- Follow mobile-first responsive design
- Keep component-specific styles in styles.css
- Use consistent padding/margin values

---

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

---

## 📞 Support

For issues or questions, please check the main project README.md

---

**Version:** 2.0.0 (Professional UI Release)  
**Last Updated:** March 2026
