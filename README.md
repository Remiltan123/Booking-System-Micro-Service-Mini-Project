# Booking-System-Micro-Service-Mini-Project

Group project — Distributed Systems.

A microservices movie ticket booking system: React/Vite frontend, a Spring
Cloud Gateway + Eureka service registry, and four Node.js/Express services
(user, movie, booking, notification) backed by MongoDB, RabbitMQ, and Redis.
Everything runs via Docker Compose.

## Architecture

| Service | Tech | Port | Purpose |
|---|---|---|---|
| frontend | React + Vite | 5173 | UI |
| api-gateway | Spring Cloud Gateway | 8080 | Routes `/{service}/**` to backend services via Eureka, validates JWTs |
| eureka-server | Spring Cloud Netflix Eureka | 8761 | Service registry/discovery |
| user-service | Node/Express | 5000 | Auth, user profile |
| movie-service | Node/Express | 5002 (internal only) | Movie catalog, seats |
| booking-service | Node/Express | 5003 | Bookings |
| nodification-service | Node/Express | 5001 | Emails (RabbitMQ consumer, no HTTP routes) |
| mongo | MongoDB 7 | 27017 | One DB per service |
| rabbitmq | RabbitMQ 3 | 5672 / 15672 (mgmt UI) | Async events between services |
| redis | Redis 7 | 6379 | Rate limiting (user-service) |

All HTTP traffic from the frontend goes through the gateway at
`http://localhost:8080/{service-name}/...` — never call a backend service
directly.

## Prerequisites

- Docker Desktop (with Docker Compose v2)
- That's it — no local Node/Java/Mongo install needed, everything runs in containers.

## 1. Clone and set up env files

```bash
git clone <repo-url>
cd Booking-System-Micro-Service-Mini-Project
```

Most `.env` files are committed, but **`movie-service/.env` and
`booking-service/.env` are gitignored** and won't exist after a fresh clone.
Create them with this content (the `JWT_SECRET` must be identical across
`user-service`, `movie-service`, and `booking-service` — it's how the
gateway and services verify each other's tokens):

**`movie-service/.env`**
```env
MONGODB_URL="mongodb://localhost:27017/movie-service-db"
JWT_SECRET=etwddsabdtw122442@jhjsagdyqudwjdgdw123456
PORT=5002
```

**`booking-service/.env`**
```env
MONGODB_URL="mongodb://localhost:27017/booking-service-db"
JWT_SECRET=etwddsabdtw122442@jhjsagdyqudwjdgdw123456
PORT=5003
MOVIE_SERVICE_URL=http://localhost:5002
```

(These `MONGODB_URL`/`PORT` values are only used for running a service
directly on the host; `docker-compose.yml` overrides them with the
container-network equivalents automatically.)

## 2. Start everything

```bash
docker compose up -d --build
```

First run pulls images and builds all 7 services — give it a few minutes.
Check everything is healthy:

```bash
docker compose ps
```

Open `http://localhost:5173` for the app, `http://localhost:8761` for the
Eureka dashboard (confirm `USER-SERVICE`, `MOVIE-SERVICE`,
`BOOKING-SERVICE`, `NOTIFICATION-SERVICE`, `API-GATEWAY` are all listed as
`UP`).

If a Node service logs `ECONNREFUSED ... :8761` and never registers, it
started before `eureka-server` finished booting (Spring Boot takes longer
than `depends_on` waits for). Fix with:

```bash
docker compose restart user-service movie-service booking-service nodification-service
```

## 3. Seed movies into the local database

The local MongoDB starts empty. Seed the 5 sample movies:

```bash
docker compose exec movie-service node scripts/seedMovies.js
```

This connects directly to Mongo and inserts any movies that don't already
exist (safe to re-run). Verify:

```bash
curl http://localhost:8080/movie-service/api/movies/get-movies
```

There's also `scripts/seedMoviesApi.js`, which seeds the same data through
movie-service's HTTP API instead of touching Mongo directly — useful if
you're testing the `create-movie` endpoint itself:

```bash
docker compose exec movie-service node scripts/seedMoviesApi.js
```

## 4. Scaling movie-service (load balancing)

`movie-service` can run multiple replicas behind Eureka, with the gateway
round-robin load-balancing across them automatically.

```bash
# scale up to 3 replicas
docker compose up -d --scale movie-service=3

# confirm 3 distinct instances registered (look for 3 entries under
# MOVIE-SERVICE, each with a different IP)
curl -s http://localhost:8761/eureka/apps/MOVIE-SERVICE | grep -o '"instanceId":"[^"]*"'

# send traffic through the gateway as usual — it now load-balances
curl http://localhost:8080/movie-service/api/movies/get-movies

# scale back down to 1
docker compose up -d --scale movie-service=1
```

Notes:
- `movie-service` has no fixed host port — it's only reachable through the
  gateway (`localhost:8080`), not directly via `localhost:5002`. This is
  required for scaling (a fixed host port can only be claimed by one
  replica).
- A dead/stopped replica is evicted from Eureka and stops receiving traffic
  within ~10-45 seconds (dev-tuned lease timing — see
  `docker-compose.yml`'s `EUREKA_LEASE_*`/`EUREKA_HEARTBEAT_INTERVAL` env
  vars and `eureka-server`/`api-getway`'s `application.yml`). Right after
  scaling up or down, give it a few seconds for the gateway's registry
  cache to refresh before hammering it with requests.

## Useful commands

```bash
# tail logs for one service
docker compose logs -f movie-service

# rebuild + restart a single service after code changes
docker compose up -d --build movie-service

# stop everything (keeps volumes/data)
docker compose down

# stop everything and wipe the Mongo volume (fresh DB next start)
docker compose down -v
```
