# Softwall CashFlow — Additional User Billing

## Pricing model

Softwall CashFlow uses a **base-plan + additional-user add-on** model.

The old standalone `Per User` subscription is removed from the product catalog.

Current base plans:

| Plan | Monthly | Annual discount |
|---|---:|---:|
| Basic | $59 | 2% |
| Super | $139 | 2% |
| Pro | $229 | 2% |
| Premium | $319 | 1.5% |
| Enterprise | $409 | 1.5% |
| Enterprise Plus | $499 | 1.5% |

Additional user add-on:

- **$39/user/month**
- Annual reference discount: 2.5% for the add-on pricing policy
- Quantity-based recurring add-on
- Exact included-user allowances per base plan remain **TBD** and must be decided before checkout is implemented.

## Billing behavior

A customer always has a base plan. Additional users are separate billing quantities attached to that subscription.

Example:

`Pro ($229/month) + 4 additional users ($39 each) = $385/month`

Formula:

`monthly_total = base_plan_price + (additional_user_quantity × additional_user_price)`

The billing engine must not hard-code plan prices in application authorization logic. Pricing is catalog data; entitlements determine access.

## Seat/user lifecycle

1. Organization owner/admin chooses a base plan.
2. Organization has its plan-defined included user allowance once that allowance is finalized.
3. When more users are required, the admin purchases additional-user quantities.
4. The entitlement engine grants access only after the billing state is confirmed by a verified provider event.
5. Adding users during a monthly billing period is prorated.
6. Removing users does not immediately revoke access that has already been paid for; the billing engine applies the configured end-of-period/proration policy.
7. Annual additional-user changes are prorated against the remaining annual term where supported by the provider.

## Important distinction

A **user account**, an **organization member**, and a **billable additional user** are different concepts.

- A user account can exist without belonging to a paid organization.
- An organization member consumes an entitlement according to the organization's plan.
- An additional user is a member beyond the finalized included allowance and creates a recurring add-on quantity.

This prevents billing from being coupled directly to authentication.

## Provider independence

The billing engine remains provider-agnostic. Payment providers are adapters behind Softwall's payment router.

Stripe is explicitly excluded.

The billing flow remains:

`Checkout → Payment Router → Provider → Verified Webhook → Billing Engine → Subscription → Add-on Quantity → Entitlement`

Browser redirects must never activate a paid user entitlement.

## Required implementation components

- `PlanCatalog`
- `Subscription`
- `SubscriptionAddOn`
- `OrganizationMember`
- `Entitlement`
- `Invoice`
- `InvoiceLine`
- `Payment`
- `PaymentAttempt`
- `WebhookEvent`
- `IdempotencyRecord`
- `ReconciliationRecord`

## Guardrails

- No negative user quantities.
- No duplicate add-on line items for the same subscription/add-on; update quantity instead.
- No entitlement activation from client-side payment success pages.
- No hard-coded provider logic in the product application.
- No raw card data stored by Softwall.
- Pricing changes must be versioned rather than silently mutating active customer contracts.
