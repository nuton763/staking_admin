# INFINITE Mixer – Admin Pro (Next.js)

**Cookie-based JWT admin panel with top navigation tabs**, matching the user site theme.

## Pages
- `/login` – admin login
- `/dashboard` – metrics
- `/users` – manage users
- `/sessions` – list recent mixing sessions
- `/settings` – sample settings screen

## Run
```
cp .env.example .env.local
# Fill MONGO_URI and JWT_SECRET
npm install
npm run dev
```
Open http://localhost:4000

## Seed first admin
Create an admin user in MongoDB:
- Generate hash: in Node: `require('bcryptjs').hashSync('admin123',10)`
- Insert document:
```
db.users.insertOne({
  email: "admin@example.com",
  passwordHash: "<hash>",
  isAdmin: true,
  createdAt: new Date()
})
```
