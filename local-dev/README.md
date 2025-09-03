# Local Development Test Data

### Manual File Creation

Create files in `local-dev/purchases/` with this format:

```json
{
  "sessionId": "cs_test_12345678",
  "purchaseCode": "ESC-12345678",
  "kitType": "ready",
  "theme": "corporate",
  "organization": "Test Organization",
  "contactName": "Test User",
  "email": "test@example.com",
  "specialRequirements": "",
  "amountPaid": 35000,
  "currency": "usd",
  "paymentStatus": "paid",
  "createdAt": "2025-09-03T14:30:00.000Z"
}
```

## Completing a Test Purchase

1. Start the dev server: `npm run dev` (from `astro/` folder)
2. Visit: http://localhost:4321/services/escape-room/purchase
3. Complete a test checkout using Stripe test cards
4. Purchase data will be automatically saved to `local-dev/purchases/`
