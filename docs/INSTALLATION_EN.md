# Kaninchen Quest – Ubuntu 24.04 LTS Installation

<!--
Meta:
  Version: 0.1.0
  Created: 2026-06-07
  Updated: 2026-06-07
  Owner: Alvestrasza Corporation
  Purpose: English installation guide for Kaninchen Quest.
-->

## 1. Target paths

Recommended paths following the existing web application conventions:

```text
/opt/sites/kanninchen.dev/app
/opt/sites/kanninchen.prod/app
/etc/kanninchen.dev/kanninchen.env
/etc/kanninchen.prod/kanninchen.env
/opt/logs/kanninchen.dev
/opt/logs/kanninchen.prod
```

## 2. System packages

```bash
sudo apt update
sudo apt install -y git nodejs npm postgresql-client nginx
```

Check versions:

```bash
node -v
npm -v
```

Node.js 22 LTS or newer is recommended.

## 3. Place the application

DEV example:

```bash
sudo mkdir -p /opt/sites/kanninchen.dev/app
sudo chown -R webapps:kanninchen_dev_editors /opt/sites/kanninchen.dev/app
sudo chmod 2770 /opt/sites/kanninchen.dev/app
```

Copy the project files into `/opt/sites/kanninchen.dev/app`.

## 4. Environment file

```bash
sudo mkdir -p /etc/kanninchen.dev
sudo cp /opt/sites/kanninchen.dev/app/.env.example /etc/kanninchen.dev/kanninchen.env
sudo chown root:webapps /etc/kanninchen.dev
sudo chown root:webapps /etc/kanninchen.dev/kanninchen.env
sudo chmod 750 /etc/kanninchen.dev
sudo chmod 640 /etc/kanninchen.dev/kanninchen.env
```

Edit values:

```bash
sudo nano /etc/kanninchen.dev/kanninchen.env
```

Required variables:

```env
AUTH_URL=https://kanninchen-dev.alvestrasza.com
NEXTAUTH_URL=https://kanninchen-dev.alvestrasza.com
AUTH_SECRET="RANDOM_SECRET"
NEXTAUTH_SECRET="RANDOM_SECRET"
DATABASE_URL="postgresql://kanninchen_app:CHANGE_ME@postgres.services.alvestrasza.prod:5432/kanninchen_dev?schema=public"
AUTH_KEYCLOAK_ID="kanninchen-dev"
AUTH_KEYCLOAK_SECRET="CHANGE_ME_CLIENT_SECRET"
AUTH_KEYCLOAK_ISSUER="https://login.alvestrasza.com/realms/flightclub"
```

Generate a secret:

```bash
openssl rand -base64 32
```

## 5. Install dependencies

```bash
cd /opt/sites/kanninchen.dev/app
npm install
```

## 6. Prepare Prisma

```bash
cd /opt/sites/kanninchen.dev/app
set -a
source /etc/kanninchen.dev/kanninchen.env
set +a
npx prisma generate
npx prisma migrate deploy
```

## 7. Build

```bash
cd /opt/sites/kanninchen.dev/app
set -a
source /etc/kanninchen.dev/kanninchen.env
set +a
npm run build
```

## 8. systemd service

Example file:

```text
deploy/systemd/kanninchen-dev.service
```

Install it:

```bash
sudo cp /opt/sites/kanninchen.dev/app/deploy/systemd/kanninchen-dev.service /etc/systemd/system/kanninchen-dev.service
sudo systemctl daemon-reload
sudo systemctl enable --now kanninchen-dev.service
sudo systemctl status kanninchen-dev.service
```

Logs:

```bash
journalctl -u kanninchen-dev.service -f
```

## 9. NGINX reverse proxy

Example file:

```text
deploy/nginx/kanninchen-dev.conf
```

Install it:

```bash
sudo cp /opt/sites/kanninchen.dev/app/deploy/nginx/kanninchen-dev.conf /etc/nginx/sites-available/kanninchen-dev.conf
sudo ln -s /etc/nginx/sites-available/kanninchen-dev.conf /etc/nginx/sites-enabled/kanninchen-dev.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Keycloak client

Create a confidential OpenID Connect client in Keycloak:

```text
Client ID: kanninchen-dev
Client authentication: On
Standard flow: On
Valid redirect URIs: https://kanninchen-dev.alvestrasza.com/api/auth/callback/keycloak
Web origins: https://kanninchen-dev.alvestrasza.com
```

Store the client secret in `/etc/kanninchen.dev/kanninchen.env`.
