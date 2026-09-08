const DEMO = {
  organization: { id: 'demo-org', name: 'Demo Workspace', currency: 'USD' },
  accounts: [
    { id: 'acct-1', name: 'Operating Account', currency: 'USD', currentBalance: 64240, availableBalance: 62100, status: 'CONNECTED' },
    { id: 'acct-2', name: 'Reserve Account', currency: 'USD', currentBalance: 20000, availableBalance: 20000, status: 'CONNECTED' }
  ],
  transactions: [
    { date: '2026-09-07', merchant: 'Acme Ltd', category: 'Invoice payment', direction: 'INCOME', amount: 28400, currency: 'USD' },
    { date: '2026-09-06', merchant: 'Meta Ads', category: 'Marketing', direction: 'EXPENSE', amount: -3200, currency: 'USD' },
    { date: '2026-09-05', merchant: 'Northstar', category: 'Subscription', direction: 'INCOME', amount: 8900, currency: 'USD' },
    { date: '2026-09-04', merchant: 'Team payroll', category: 'Payroll', direction: 'EXPENSE', amount: -18400, currency: 'USD' },
    { date: '2026-09-03', merchant: 'AWS', category: 'Infrastructure', direction: 'EXPENSE', amount: -2700, currency: 'USD' },
    { date: '2026-09-02', merchant: 'Vertex Co.', category: 'Supplier', direction: 'EXPENSE', amount: -7600, currency: 'USD' }
  ],
  receivables: [
    { customer: 'Acme Ltd', due: '2026-09-12', amount: 28400, status: 'DUE_SOON' },
    { customer: 'Northstar', due: '2026-09-18', amount: 8900, status: 'DUE_SOON' },
    { customer: 'Vertex Media', due: '2026-08-15', amount: 12600, status: 'OVERDUE' }
  ],
  payables: [
    { vendor: 'Team payroll', due: '2026-09-15', amount: 18400, status: 'UPCOMING' },
    { vendor: 'Vertex Co.', due: '2026-09-16', amount: 7600, status: 'UPCOMING' },
    { vendor: 'AWS', due: '2026-09-20', amount: 2700, status: 'UPCOMING' }
  ]
};

function cashSummary() {
  const currentCash = DEMO.accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const inflows = DEMO.receivables.reduce((sum, r) => sum + r.amount, 0);
  const outflows = DEMO.payables.reduce((sum, p) => sum + p.amount, 0);
  return { currentCash, availableCash: DEMO.accounts.reduce((sum, a) => sum + a.availableBalance, 0), expectedInflows: inflows, expectedOutflows: outflows, projectedMonthEnd: currentCash + inflows - outflows, netCashFlow: inflows - outflows, currency: 'USD' };
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function route(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/v1/health') return json(res, 200, { status: 'ok', api: 'v1', dataMode: 'demo' });
  if (url.pathname === '/api/v1/organization') return json(res, 200, DEMO.organization);
  if (url.pathname === '/api/v1/cash/summary') return json(res, 200, cashSummary());
  if (url.pathname === '/api/v1/accounts') return json(res, 200, { data: DEMO.accounts });
  if (url.pathname === '/api/v1/transactions') return json(res, 200, { data: DEMO.transactions });
  if (url.pathname === '/api/v1/receivables') return json(res, 200, { data: DEMO.receivables });
  if (url.pathname === '/api/v1/payables') return json(res, 200, { data: DEMO.payables });
  if (url.pathname === '/api/v1/forecast') {
    const s = cashSummary();
    return json(res, 200, { horizonDays: Number(url.searchParams.get('days')) || 30, confidence: 0.86, scenarios: { best: s.projectedMonthEnd + 18400, base: s.projectedMonthEnd, worst: s.projectedMonthEnd - 12600 }, currency: 'USD' });
  }
  return false;
}

module.exports = { route };
