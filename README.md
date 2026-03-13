# مساحاتك – Mesahatak

A full-stack space rental platform built for the Saudi market, allowing property owners to list spaces and users to browse, book, and review them.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Database:** MySQL with Sequelize ORM
- **Auth:** Session-based authentication with bcryptjs
- **File Uploads:** Multer
- **Deployment:** cPanel / Passenger (production-ready)

## Features

- **Browse & Search** – Filter available spaces by city, category, and subcategory
- **Space Listings** – Owners can create, manage, and upload images for their spaces
- **Booking System** – Users can book spaces with date/time selection
- **Payment Tracking** – Payment status management per booking
- **Reviews** – Users can leave ratings and reviews after their stay
- **Dashboard** – Owner dashboard with booking management and rent performance analytics
- **Admin Panel** – Full admin control over users, spaces, bookings, and financials
- **Arabic UI** – Fully right-to-left (RTL) interface in Arabic

## Project Structure

```
├── config/          # Database connection (Sequelize)
├── controllers/     # Route logic (auth, spaces, booking, reviews, admin)
├── middleware/      # Auth guards (requireAuth, requireAdmin)
├── models/          # Sequelize models (User, Space, Booking, Review, Payment…)
├── routes/          # Express routers
├── seeds/           # Static data seeder (cities, categories)
├── views/           # EJS templates
├── public/          # CSS, JS, images
└── uploads/         # User-uploaded space images
```

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/EssaBoobaid/mesahatak.git
cd mesahatak
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
SESSION_SECRET=your_random_secret_key
NODE_ENV=development
PORT=3000
```

### 4. Import the database schema
Import `mesawiqm_mesahatak_db.sql` into your MySQL server:
```bash
mysql -u root -p your_database_name < mesawiqm_mesahatak_db.sql
```

### 5. Run the app
```bash
# Development
npm run dev

# Production
npm start
```

The app will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (default: `localhost`) |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASS` | Database password |
| `SESSION_SECRET` | Secret key for session encryption |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: `3000`) |

## Default Admin Account

After importing the SQL file, an admin account is available:
- **Email:** `admin@ksa.sa`
- **Password:** set your own after first login
