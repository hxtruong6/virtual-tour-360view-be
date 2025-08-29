# CWGame API Setup Guide

## TODO List

- [ ] Pagination for notifications, sort by createdAt desc
- [ ] Pagination for messages, sort by createdAt desc
- [ ] Pagination for chats, sort by lastMessageAt desc

# Prerequisites

- Node.js (v22.11.0), pnpm, pm2
- PostgreSQL (v16.1) - PostGIS extension
- Redis (v7.4)
- Nginx
- Certbot
<!-- - Docker (v26.0.7)
- Docker Compose (v2.17.2) -->

```bash
# Check PostgreSQL version
psql --version
#psql (PostgreSQL) 16.6 (Ubuntu 16.6-1.pgdg24.04+1)

# Install PostGIS extension
sudo apt install postgis postgresql-16-postgis-3
```

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone {{URL}}/cwgame-api.git
   cd cwgame-api
   ```

2. Create environment variables file:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Set up the database:

   ```bash
   # Create the database
   createdb -U postgres cwgame_dev

   # Run migrations
   pnpm run migrations
   ```

5. Start the development server:

   ```bash
   pnpm start:dev
   ```

   The API will be available at <http://localhost:3000>

## Production VPS Server Setup

1. SSH into your VPS server.

2. Install Docker and Docker Compose if not already installed.

3. Clone the repository:

   ```bash
   git clone {{URL}}/cwgame-api.git
   cd cwgame-api
   ```

4. Create production environment variables file:

   ```bash
   cp .env.example .env.production
   ```

   Edit `.env.production` with your production settings.

5. Create the Docker Compose service:

   ```bash
   # Create the script
   cat << EOF > create_docker_compose_service.sh
   #!/bin/bash
   # ... [paste the script content here] ...
   EOF

   # Make it executable
   chmod +x create_docker_compose_service.sh

   # Run the script
   sudo ./create_docker_compose_service.sh
   ```

   When prompted, enter the full path to your project directory.

6. Start the Docker Compose stack:

   ```bash
   docker-compose up --build -d
   ```

7. Verify the services are running:

   ```bash
   docker-compose ps
   ```

8. The API should now be accessible via the configured domain or server IP.

## Useful Commands

- View logs:

  ```bash
  # All services
  docker-compose logs

  # Specific service
  docker-compose logs cwgame_backend
  ```

- Restart services:

  ```bash
  docker-compose restart
  ```

- Stop services:

  ```bash
  docker-compose down
  ```

- Update and redeploy:

  ```bash
  git pull
  docker-compose up --build -d
  ```

- Remove volumes to reset the database:

  ```bash
  docker volume ls
  docker volume rm <volume-name>
  ```

## Migration Guide

- Create new migration:

  ```bash
  npx kysely migrate:make <migration-name>
  # Write migration script in <migration-name>.ts then run migrations
  pnpm run migrations
  # or
  npx kysely migrate:up

  # Rollback migrations
  npx kysely migrate:down
  ```

- 1st time setup: Drop the existing database and create a new one then run migrations:

    ```bash
    dropdb -U postgres cwgame_dev && createdb -U postgres cwgame_dev && pnpm run migrations
    ```

- Update database schema:

    ```bash
    pnpm run migrations
    ```

Docker:

```bash
# Enter nginx container
docker exec -it cwgame_nginx /bin/bash

# Logs 10 lines and keep tailing
docker logs -t --tail 10 cwgame_nginx
```

# SSL Certificates

Install certbot:

- <https://certbot.eff.org/instructions?ws=nginx&os=pip>
- <https://www.digitalocean.com/community/tutorials/how-to-use-certbot-standalone-mode-to-retrieve-let-s-encrypt-ssl-certificates-on-ubuntu-20-04>

```bash
# Allow 443 port
sudo ufw allow 443

# Create SSL certificates
# certbot --nginx -d cwgame.asia -d www.cwgame.asia
sudo certbot certonly --standalone -d cwgame.asia -d www.cwgame.asia

# Test nginx configuration in docker container
docker exec -it cwgame_nginx nginx -t

# Check SSL certificates
ls -l /etc/letsencrypt/live/cwgame.asia/

# Make sure the directory is writable
sudo chmod -R 755 /etc/letsencrypt

# Renew SSL certificates (dry-run: check if it will work)
sudo certbot renew --dry-run

# Add to crontab to renew SSL certificates automatically
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

# Seed Database

```bash
npx kysely seed:make <seed-name> # Create a new seed file
npx kysely seed:run # Run all seeds
```

# Setup on-premise server

```sh
# install postgres
# install redis
# install node
# install pnpm
# install pm2
# install nginx
# install certbot

# -----------
pnpm install
pnpm run build:prod

# create database
# dropdb -U postgres cwgame_dev  # just in case you need to drop the database
createdb -U postgres cwgame_dev

# run migrations
pnpm run migrations:prod

# run the app
pm2 start dist/main.js --name cwgame_backend
```

# Useful commands

```sh
# update and restart all services
git pull && pnpm install && pnpm run build:prod && pm2 restart all

# show logs
pm2 logs cwgame_backend

# show all services
pm2 list

# reload nginx
sudo nginx -s reload

# show nginx logs
sudo tail -f /var/log/nginx/error.log

# deploy to production f
pnpm run pm2:deploy:prod

```

# on production server

```sh
cd cwgame-be-prod
# update and restart all services
git pull && pnpm install && pnpm run build:prod
pm2 start scripts/deploy/ecosystem-prod.config.js --env production
```

To setup run server, you need to create `.env.production` file and put the production environment variables in it. In the `ecosystem.config.js` file also need to add the production environment variables which is the same as the `.env.production` file.

**Note:** whenere having new tables/module, you need to write migration to add action on resource. Example: module `referral`, you need to add action `read`/`create`/`update`/`delete` on resource `referral`.
