# ⚡ ShortURL

A high-performance, modern URL shortener built with **Node.js**, **PostgreSQL**, and **Redis**. ShortURL allows users to shorten long URLs, create custom alias codes, and track detailed click analytics including geolocation and referrer data.

![ShortURL Interface Demo]

## 🚀 Features

- **Lightning Fast Redirects:** Utilizes Redis caching (Upstash) to ensure instant redirects without hitting the primary database.
- **Custom Short Links:** Create custom, branded short codes (e.g., `short.url/my-sale`).
- **Comprehensive Analytics:** A beautiful dashboard tracking total clicks, top locations, and click trends over the last 30 days.
- **Geo-IP Tracking:** Automatically resolves incoming IPs to countries and cities to give you better audience insights.
- **Premium UI:** A Canva-inspired, responsive front-end dashboard built with HTML/CSS and Chart.js.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Primary Database:** PostgreSQL (hosted on Supabase)
- **Caching Layer:** Redis (hosted on Upstash)
- **Frontend:** Vanilla HTML/CSS, Chart.js

## 📦 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- A [Supabase](https://supabase.com/) account for PostgreSQL
- An [Upstash](https://upstash.com/) account for Serverless Redis

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Environment Variables

Create a `.env` file in the root directory and add the following keys. Make sure to use the **Connection Pooler URL (IPv4)** from Supabase and the **Read-Write Token** from Upstash.

```env
PORT=3000
BASE_URL=http://localhost:3000

# Supabase (Ensure you use the Connection Pooler URL with your encoded password)
DATABASE_URL="postgresql://postgres.[project-ref]:[URL-ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-database-id.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_read_write_token"
```

### 5. Run Database Migrations

You will need to create the necessary tables in your Supabase SQL Editor:

```sql
-- Create URLs table
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0
);

-- Create Clicks table for analytics
CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(20) REFERENCES urls(short_code) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  user_agent TEXT,
  referer TEXT
);
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`. You can visit this URL in your browser to start shortening links!

## 📡 API Reference

### Create a Short URL
- **Endpoint:** `POST /shorten`
- **Body:**
  ```json
  {
    "url": "https://example.com/very-long-link",
    "customCode": "optional-custom-code",
    "expiresIn": 30
  }
  ```

### Get Analytics Data
- **Endpoint:** `GET /analytics/api/:code`
- **Response:** JSON object containing total clicks, location data, and a 30-day timeline.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
