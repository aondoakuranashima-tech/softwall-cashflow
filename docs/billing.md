# Softwall CashFlow Billing

Softwall CashFlow uses organization-level subscriptions plus recurring additional-user add-ons. The former standalone Per User plan is removed.

See `config/pricing.json` for the canonical pricing configuration.

## Plans

- Basic — $59/month — 2% annual discount
- Super — $139/month — 2% annual discount
- Pro — $229/month — 2% annual discount
- Premium — $319/month — 1.5% annual discount
- Enterprise — $409/month — 1.5% annual discount
- Enterprise Plus — $499/month — 1.5% annual discount

## Additional user add-on

- $39/user/month
- 2.5% annual discount
- Not a standalone plan
- Requires a base organization subscription
- Seat quantity is metered
- Seat increases are immediately effective and prorated where applicable
- Seat decreases normally take effect at renewal

## Trial

- 14-day Basic trial

## Annual pricing

Annual charges are calculated from the configured monthly price × 12, less the configured annual discount. Annual prices are not hard-coded in frontend components.

## Payment architecture

Supported providers:

1. Paystack
2. Flutterwave
3. Dodo Payments
4. Paddle
5. PayPal

Stripe is permanently excluded.

Paid access is activated only after a verified provider webhook is processed through idempotency, the billing engine, subscription state, ledger/invoice processing, and entitlement evaluation.
