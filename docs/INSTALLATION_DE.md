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
/opt/sites//app
/etc/kaninchen/kaninchen.env
/opt/logs/kaninchen
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

Beispiel für:

```bash
sudo mkdir -p /opt/sites/kaninchen/app
sudo chown -R webapps:webadmins /opt/sites/kaninchen/app
sudo chmod 2770 /opt/sites/kaninchen/app
```

Projektdateien nach `/opt/sites/kaninchen/app` kopieren.

## 4. Environment-Datei

```bash
sudo mkdir -p /etc/kaninchen
sudo cp /opt/sites/kaninchen/app/.env.example /etc/kaninchen/kaninchen.env
sudo chown root:webapps /etc/kaninchen
sudo chown root:webapps /etc/kaninchen/kaninchen.env
sudo chmod 750 /etc/kaninchen
sudo chmod 640 /etc/kaninchen/kaninchen.env
```

Danach Werte anpassen:

```bash
sudo nano /etc/kaninchen/kaninchen.env
```

Mindestens setzen:

```env
AUTH_URL=https://kaninchen.yourdomain.com
NEXTAUTH_URL=https://kaninchen.yourdomain.com
AUTH_SECRET="RANDOM_SECRET"
NEXTAUTH_SECRET="RANDOM_SECRET"
DATABASE_URL="postgresql://kaninchen_app:CHANGE_ME@postgres:5432/kaninchen?schema=public"
AUTH_KEYCLOAK_ID="kaninchen"
AUTH_KEYCLOAK_SECRET="CHANGE_ME_CLIENT_SECRET"
AUTH_KEYCLOAK_ISSUER="https://login.yourdomain.com/realms/richter-familie"
```

Secret erzeugen:

```bash
openssl rand -base64 32
```

## 5. Abhängigkeiten installieren

```bash
cd /opt/sites/kaninchen/app
npm install
```

## 6. Prisma vorbereiten

```bash
cd /opt/sites/kaninchen/app
set -a
source /etc/kaninchen/kaninchen.env
set +a
npx prisma generate
npx prisma migrate deploy
```

## 7. Build erstellen

```bash
cd /opt/sites/kaninchen/app
set -a
source /etc/knninchen/kaninchen.env
set +a
npm run build
```

## 8. systemd Service

Beispieldatei liegt unter:

```text
deploy/systemd/kaninchen.service
```

Installieren:

```bash
sudo cp /opt/sites/kaninchen/app/deploy/systemd/kaninchen.service /etc/systemd/system/kaninchen.service
sudo systemctl daemon-reload
sudo systemctl enable --now kaninchen.service
sudo systemctl status kaninchen.service
```

Logs:

```bash
journalctl -u kaninchen.service -f
```

## 9. NGINX Reverse Proxy

Beispielkonfiguration:

```text
deploy/nginx/kaninchen.conf
```

Installieren:

```bash
sudo cp /opt/sites/kaninchen/app/deploy/nginx/kaninchen.conf /etc/nginx/sites-available/kaninchen.conf
sudo ln -s /etc/nginx/sites-available/kaninchen.conf /etc/nginx/sites-enabled/kaninchen.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Keycloak Client

In Keycloak einen confidential OpenID Connect Client erstellen:

```text
Client ID: kaninchen
Client authentication: On
Standard flow: On
Valid redirect URIs: https://kaninchen.yourdomain.com/api/auth/callback/keycloak
Web origins: https://kaninchen.yourdomain.com
```

Den Client Secret Wert in `/etc/kaninchen/kaninchen.env` eintragen.

## Manuelle Änderungen

cd /opt/sites/kanninchen/app

set -a
source /etc/kanninchen/kanninchen.env
set +a

git stash
git pull --ff-only
npm install
npx --no-install prisma generate
npx --no-install prisma migrate deploy
npm run build

sudo systemctl restart kanninchen.service
sudo systemctl status kanninchen.service
