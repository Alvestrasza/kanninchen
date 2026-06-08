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
/opt/sites/kanninchen/app
/etc/kanninchen/kanninchen.env
/opt/logs/kanninchen
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
sudo mkdir -p /opt/sites/kanninchen/app
sudo chown -R webapps:webadmins /opt/sites/kanninchen/app
sudo chmod 2770 /opt/sites/kanninchen/app
```

Projektdateien nach `/opt/sites/kanninchen/app` kopieren.

## 4. Environment-Datei

```bash
sudo mkdir -p /etc/kanninchen
sudo cp /opt/sites/kanninchen/app/.env.example /etc/kanninchen/kanninchen.env
sudo chown root:webapps /etc/kanninchen
sudo chown root:webapps /etc/kanninchen/kanninchen.env
sudo chmod 750 /etc/kanninchen
sudo chmod 640 /etc/kanninchen/kanninchen.env
```

Danach Werte anpassen:

```bash
sudo nano /etc/kanninchen/kanninchen.env
```

Mindestens setzen:

```env
AUTH_URL=https://kanninchen.yourdomain.com
NEXTAUTH_URL=https://kanninchen.yourdomain.com
AUTH_SECRET="RANDOM_SECRET"
NEXTAUTH_SECRET="RANDOM_SECRET"
DATABASE_URL="postgresql://kanninchen_app:CHANGE_ME@postgres:5432/kanninchen?schema=public"
AUTH_KEYCLOAK_ID="kanninchen"
AUTH_KEYCLOAK_SECRET="CHANGE_ME_CLIENT_SECRET"
AUTH_KEYCLOAK_ISSUER="https://login.yourdomain.com/realms/richter-familie"
```

Secret erzeugen:

```bash
openssl rand -base64 32
```

## 5. Abhängigkeiten installieren

```bash
cd /opt/sites/kanninchen/app
npm install
```

## 6. Prisma vorbereiten

```bash
cd /opt/sites/kanninchen/app
set -a
source /etc/kanninchen/kanninchen.env
set +a
npx prisma generate
npx prisma migrate deploy
```

## 7. Build erstellen

```bash
cd /opt/sites/kanninchen/app
set -a
source /etc/kanninchen/kanninchen.env
set +a
npm run build
```

## 8. systemd Service

Beispieldatei liegt unter:

```text
deploy/systemd/kanninchen.service
```

Installieren:

```bash
sudo cp /opt/sites/kanninchen/app/deploy/systemd/kanninchen.service /etc/systemd/system/kanninchen.service
sudo systemctl daemon-reload
sudo systemctl enable --now kanninchen.service
sudo systemctl status kanninchen.service
```

Logs:

```bash
journalctl -u kanninchen.service -f
```

## 9. NGINX Reverse Proxy

Beispielkonfiguration:

```text
deploy/nginx/kanninchen.conf
```

Installieren:

```bash
sudo cp /opt/sites/kanninchen/app/deploy/nginx/kanninchen.conf /etc/nginx/sites-available/kanninchen.conf
sudo ln -s /etc/nginx/sites-available/kanninchen.conf /etc/nginx/sites-enabled/kanninchen.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Keycloak Client

In Keycloak einen confidential OpenID Connect Client erstellen:

```text
Client ID: kanninchen
Client authentication: On
Standard flow: On
Valid redirect URIs: https://kanninchen.yourdomain.com/api/auth/callback/keycloak
Web origins: https://kanninchen.yourdomain.com
```

Den Client Secret Wert in `/etc/kanninchen/kanninchen.env` eintragen.



# Manuelle Änderungen:

cd /opt/sites/kanninchen/app

set -a
source /etc/kanninchen/kanninchen.env
set +a

git pull
npm install
npx --no-install prisma generate
npx --no-install prisma migrate deploy
npm run build

sudo systemctl restart kanninchen.service
sudo systemctl status kanninchen.service