# Softwall CashFlow Billing & Pricing

## Billing principle

Softwall CashFlow uses a base subscription plus optional **Additional User** add-ons.

The previous `Per User` plan is removed. Users are no longer a standalone subscription tier.

Stripe is permanently excluded from the Softwall billing architecture.

## Plans

| Plan | Monthly | Annual formula |
|---|---:|---:|
| Basic | $59/month | $59 × 12 − 2% |
| Super | $139/month | $139 × 12 − 2% |
| Pro | $229/month | $229 × 12 − 2% |
| Premium | $319/month | $319 × 12 − 1.5% |
| Enterprise | $409/month | $409 × 12 − 1.5% |
| Enterprise Plus | $499/month | $499 × 12 − 1.5% |
| Additional User | $39/user/month | $39 × 12 − 2.5% per additional user |

Basic has a 14-day trial with limited features.

## Additional-user model

`Additional User` is a recurring add-on, not a subscription plan.

- Quantity is configurable per organization.
- Quantity can increase or decrease over the subscription lifecycle.
- The application owns seat entitlement state; the payment provider is the billing processor.
- Seat changes must be reflected in the billing ledger and entitlement engine.
- Monthly add-ons must attach to monthly subscriptions.
- Annual add-ons must attach to annual subscriptions.
- Mid-cycle changes use the provider's supported proration mechanism where available; otherwise Softwall's billing engine records the change for the next billing event.
- Never create a separate subscription for each user.

Dodo Payments explicitly supports recurring seat add-ons with configurable quantities, and Paddle supports changing recurring item quantities on an existing subscription. These capabilities align with this architecture.

## Important unresolved pricing decision

The number of users included in each base plan is intentionally **not hard-coded yet**. This must be validated before production pricing is finalized.

Do not silently invent included-seat limits in application code.

## Canonical billing calculation

Monthly:

`total = base_plan_price + (additional_user_quantity × 39)`

Annual:

`total = discounted_base_plan_annual_price + (additional_user_quantity × discounted_annual_additional_user_price)`

The exact annual prices must be calculated using integer minor units and stored as immutable price versions rather than recalculated from floating-point values at runtime.

## Billing providers

The provider abstraction remains:

1. Paystack
2. Flutterwave
3. Dodo Payments
4. Paddle
5. PayPal

No Stripe adapter.

The payment router chooses a provider based on actual availability, supported currency/payment methods, provider health, cost, settlement capability and risk rules.

## Entitlement flow

Payment event → verified webhook → idempotency → billing engine → invoice/ledger → subscription → entitlement → product access.

Browser redirects never determine payment success.
