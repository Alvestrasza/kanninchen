# Kaninchen Quest – Installation unter Ubuntu 24.04 LTS

<!--
Meta:
  Version: 0.1.0
  Created: 2026-06-07
  Updated: 2026-06-07
  Owner: Alvestrasza Corporation
  Purpose: German installation guide for Kaninchen Quest.
-->

## 1. Zielpfade

Empfohlene Pfade analog zu den bisherigen Webprojekten:

```text
/opt/sites/kanninchen.dev/app
/opt/sites/kanninchen.prod/app
/etc/kanninchen.dev/kanninchen.env
/etc/kanninchen.prod/kanninchen.env
/opt/logs/kanninchen.dev
/opt/logs/kanninchen.prod
```

## 2. Systempakete

```bash
sudo apt update
sudo apt install -y git nodejs npm postgresql-client nginx
```

Prüfen:

```bash
node -v
npm -v
```

Empfohlen ist Node.js 22 LTS oder neuer.

## 3. Anwendung ablegen

Beispiel für DEV:

```bash
sudo mkdir -p /opt/sites/kanninchen.dev/app
sudo chown -R webapps:kanninchen_dev_editors /opt/sites/kanninchen.dev/app
sudo chmod 2770 /opt/sites/kanninchen.dev/app
```

Projektdateien nach `/opt/sites/kanninchen.dev/app` kopieren.

## 4. Environment-Datei

```bash
sudo mkdir -p /etc/kanninchen.dev
sudo cp /opt/sites/kanninchen.dev/app/.env.example /etc/kanninchen.dev/kanninchen.env
sudo chown root:webapps /etc/kanninchen.dev
sudo chown root:webapps /etc/kanninchen.dev/kanninchen.env
sudo chmod 750 /etc/kanninchen.dev
sudo chmod 640 /etc/kanninchen.dev/kanninchen.env
```

Danach Werte anpassen:

```bash
sudo nano /etc/kanninchen.dev/kanninchen.env
```

Mindestens setzen:

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

Secret erzeugen:

```bash
openssl rand -base64 32
```

## 5. Abhängigkeiten installieren

```bash
cd /opt/sites/kanninchen.dev/app
npm install
```

## 6. Prisma vorbereiten

```bash
cd /opt/sites/kanninchen.dev/app
set -a
source /etc/kanninchen.dev/kanninchen.env
set +a
npx prisma generate
npx prisma migrate deploy
```

## 7. Build erstellen

```bash
cd /opt/sites/kanninchen.dev/app
set -a
source /etc/kanninchen.dev/kanninchen.env
set +a
npm run build
```

## 8. systemd Service

Beispieldatei liegt unter:

```text
deploy/systemd/kanninchen-dev.service
```

Installieren:

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

## 9. NGINX Reverse Proxy

Beispielkonfiguration:

```text
deploy/nginx/kanninchen-dev.conf
```

Installieren:

```bash
sudo cp /opt/sites/kanninchen.dev/app/deploy/nginx/kanninchen-dev.conf /etc/nginx/sites-available/kanninchen-dev.conf
sudo ln -s /etc/nginx/sites-available/kanninchen-dev.conf /etc/nginx/sites-enabled/kanninchen-dev.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Keycloak Client

In Keycloak einen confidential OpenID Connect Client erstellen:

```text
Client ID: kanninchen-dev
Client authentication: On
Standard flow: On
Valid redirect URIs: https://kanninchen-dev.alvestrasza.com/api/auth/callback/keycloak
Web origins: https://kanninchen-dev.alvestrasza.com
```

Den Client Secret Wert in `/etc/kanninchen.dev/kanninchen.env` eintragen.
