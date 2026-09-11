# rosterup-sit725
SIT725 group project - RosterUp shift-cover coordination platform

## Local setup

1. `npm install`
2. `cp .env.example .env`
3. `docker compose up -d` (starts a local MongoDB on port 27017)
4. `npm run seed` (optional, loads mock data)
5. `node server.js` — then open http://localhost:3000

Stop the database with `docker compose down` (add `-v` to also wipe its data).
