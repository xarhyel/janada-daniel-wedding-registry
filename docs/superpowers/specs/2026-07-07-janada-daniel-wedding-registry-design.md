# Janada & Daniel Wedding Registry — Design Doc

## Overview

An interactive wedding registry website for Janada and Daniel, hosted on Railway. Guests can browse registry items and claim/unclaim gifts to prevent duplicate purchases. The site is simple, elegant, and mobile-first.

## Tech Stack

- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL (Railway Postgres plugin)
- **Frontend:** Vanilla HTML + CSS + JavaScript (single-page app)
- **Deployment:** Railway (single service, auto-deploy from GitHub)

## Architecture

```
Client Browser
     ↕ HTTP/HTTPS
Express.js (serves static frontend + REST API)
     ↕ pg (node-postgres)
Railway Postgres
```

### Project Structure

```
janada-daniel-wedding-registry/
├── public/
│   ├── index.html          # Main page - registry listing
│   └── style.css            # All styles
├── server.js                # Express entry point
├── db/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Default registry items
├── routes/
│   └── items.js             # API routes for items
├── railway.json             # Railway deployment config
├── package.json
└── Procfile                 # Railway start command
```

## Database Schema

### Table: `items`

| Column      | Type         | Notes                              |
|-------------|--------------|------------------------------------|
| id          | SERIAL PK    | Auto-increment                     |
| name        | VARCHAR(200) | Item name                          |
| description | TEXT         | Short description                  |
| category    | VARCHAR(100) | e.g. Kitchen, Bed & Bath, Home     |
| price_range | VARCHAR(50)  | e.g. "$25-$50", "$100-$200"        |
| image_url   | VARCHAR(500) | Placeholder or custom image        |
| sort_order  | INTEGER      | Display ordering                   |
| claimed     | BOOLEAN      | Whether the item is claimed        |
| claimed_by  | VARCHAR(100) | Guest name who claimed it          |
| claim_message | TEXT       | Optional message from claimer      |
| created_at  | TIMESTAMP    | Auto-set                           |
| updated_at  | TIMESTAMP    | Auto-set                           |

## API Endpoints

| Method | Path                | Description                       |
|--------|---------------------|-----------------------------------|
| GET    | /api/items          | List all registry items           |
| POST   | /api/items/:id/claim| Claim an item (body: {name, message?}) |
| POST   | /api/items/:id/unclaim | Unclaim an item (body: {name})  |

## Registry Items (Defaults)

~20 items across these categories:

- **Kitchen & Dining** — Cookware Set, Chef's Knife Set, Blender, Coffee Maker, Dinnerware Set, Glassware Set, Flatware Set, Mixing Bowls, Slow Cooker, Baking Sheet Set
- **Bed & Bath** — Premium Towel Set, Sheet Set, Comforter, Throw Blankets
- **Home & Decor** — Picture Frames, Vases, Candle Set, Planters
- **Experiences** — Honeymoon Fund ($50/$100/$250), Date Night Gift Card

## UI Design

### Layout
- Single scrollable page, mobile-first responsive design
- Hero section with couple's names at top
- Items displayed in a responsive card grid (1 column mobile, 2 tablet, 3-4 desktop)

### Color Scheme
- Background: Warm cream (#FDF8F5)
- Primary: Sage green (#8BA888)
- Accent: Soft gold (#D4AF37)
- Text: Dark charcoal (#2C2C2C)
- Claimed badge: Sage green with white text

### Typography
- Headings: Playfair Display (serif, elegant)
- Body: System font stack (clean, fast loading)

## Claim Flow

1. Available items show a "Claim Gift" button (sage green)
2. Click opens a small modal with name input + optional message textarea
3. On submit, POST to /api/items/:id/claim — item updates live
4. Claimed items show "Claimed by [Name]" with a ribbon badge and a "Remove my claim" link
5. Unclaim requires entering the same name (simple match, no auth)

## Deployment (Railway)

- Connect GitHub repo to Railway
- Railway auto-provisions PostgreSQL and injects `DATABASE_URL` environment variable
- `railway.json` defines the build/start commands
- On first start, `server.js` reads `db/schema.sql` and executes it against the database (idempotent — uses `CREATE TABLE IF NOT EXISTS`), then seeds default data if the items table is empty

## Future Considerations (not in scope for v1)

- Admin interface to add/edit items
- Photo uploads (currently placeholder images)
- Guest RSVP integration
- Honeymoon fund with Stripe payments
