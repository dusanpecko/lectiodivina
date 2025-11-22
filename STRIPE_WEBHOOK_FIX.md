# Stripe Webhook Fix - Použitie Stripe CLI Forward

## Problém
Stripe sa nedokáže pripojiť priamo k vášmu serveru ("Failed to connect to remote host").

## Riešenie: Stripe CLI Forward Mode

### 1. Nainštalujte Stripe CLI na serveri

```bash
ssh root@38.242.254.173
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_Latest_linux_x86_64.tar.gz
tar -xvf stripe_Latest_linux_x86_64.tar.gz
mv stripe /usr/local/bin/
stripe login
```

### 2. Spustite Stripe forward (forwad webhooks na localhost)

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Tento príkaz vytlačí **webhook signing secret** (začína `whsec_`). 

### 3. Aktualizujte `.env` na serveri

```bash
cd /srv/lectio/app
nano .env
```

Pridajte/aktualizujte:
```
STRIPE_WEBHOOK_SECRET=whsec_...secret_z_stripe_listen...
```

### 4. Reštartujte aplikáciu

```bash
pm2 restart lectio
```

### 5. Otestujte

V inom termináli:
```bash
stripe trigger checkout.session.completed
```

## Alternatívne riešenie: Manuálny import donácií

Ak Stripe CLI nefunguje, môžeme vytvoriť admin rozhranie na manuálny import donácií zo Stripe Dashboardu.

Stačí skopírovať JSON z Stripe eventu a vložiť do admin panelu.
