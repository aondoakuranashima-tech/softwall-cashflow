const organizationId = process.env.SOFTWALL_ORGANIZATION_ID || process.env.ORGANIZATION_ID;
let databasePromise;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = import('@softwall/database').then(({ prisma }) => prisma);
  }
  return databasePromise;
}

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function number(value) {
  return value == null ? 0 : Number(value);
}

function mapAccount(account) {
  return {
    id: account.id,
    name: account.name,
    currency: account.currency || 'USD',
    currentBalance: number(account.currentBalance),
    availableBalance: number(account.availableBalance),
    status: account.connection?.status || 'UNKNOWN'
  };
}

function mapTransaction(transaction) {
  const amount = number(transaction.amount);
  const signedAmount = transaction.direction === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount);
  return {
    id: transaction.id,
    date: transaction.occurredAt.toISOString().slice(0, 10),
    merchant: transaction.merchantName || transaction.description || 'Unknown',
    category: transaction.category || 'Uncategorized',
    direction: transaction.direction,
    amount: signedAmount,
    currency: transaction.currency,
    pending: transaction.isPending
  };
}

function mapReceivable(item) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(item.dueDate);
  due.setHours(0, 0, 0, 0);
  const status = item.status === 'PAID' ? 'PAID' : due < today ? 'OVERDUE' : 'DUE_SOON';
  return {
    id: item.id,
    customer: item.customerName,
    due: item.dueDate.toISOString().slice(0, 10),
    amount: number(item.amount),
    currency: item.currency,
    status
  };
}

function mapPayable(item) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(item.dueDate);
  due.setHours(0, 0, 0, 0);
  const status = item.status === 'PAID' ? 'PAID' : due < today ? 'OVERDUE' : 'UPCOMING';
  return {
    id: item.id,
    vendor: item.vendorName,
    due: item.dueDate.toISOString().slice(0, 10),
    amount: number(item.amount),
    currency: item.currency,
    status
  };
}

function requireOrganization(res) {
  if (!organizationId) {
    json(res, 503, {
      error: 'Organization context is not configured',
      code: 'ORGANIZATION_CONTEXT_REQUIRED',
      message: 'Set SOFTWALL_ORGANIZATION_ID before using financial API routes.'
    });
    return false;
  }
  return true;
}

async function loadData(prisma) {
  const [organization, accounts, transactions, receivables, payables] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId } }),
    prisma.bankAccount.findMany({
      where: { organizationId },
      include: { connection: { select: { status: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.transaction.findMany({
      where: { organizationId },
      orderBy: { occurredAt: 'desc' },
      take: 100
    }),
    prisma.receivable.findMany({
      where: { organizationId },
      orderBy: { dueDate: 'asc' },
      take: 100
    }),
    prisma.payable.findMany({
      where: { organizationId },
      orderBy: { dueDate: 'asc' },
      take: 100
    })
  ]);

  if (!organization) return null;
  return { organization, accounts, transactions, receivables, payables };
}

function buildCashSummary(data) {
  const accounts = data.accounts.map(mapAccount);
  const receivables = data.receivables.map(mapReceivable);
  const payables = data.payables.map(mapPayable);
  const currentCash = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const availableCash = accounts.reduce((sum, account) => sum + account.availableBalance, 0);
  const expectedInflows = receivables.filter((item) => item.status !== 'PAID').reduce((sum, item) => sum + item.amount, 0);
  const expectedOutflows = payables.filter((item) => item.status !== 'PAID').reduce((sum, item) => sum + item.amount, 0);
  const projectedMonthEnd = currentCash + expectedInflows - expectedOutflows;

  return {
    currentCash,
    availableCash,
    expectedInflows,
    expectedOutflows,
    projectedMonthEnd,
    netCashFlow: expectedInflows - expectedOutflows,
    currency: data.organization.defaultCurrency || accounts[0]?.currency || 'USD'
  };
}

async function route(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/v1/health') {
    return json(res, 200, { status: 'ok', api: 'v1', dataMode: 'postgresql' });
  }

  if (!requireOrganization(res)) return true;

  try {
    const prisma = await getDatabase();
    const data = await loadData(prisma);

    if (!data) {
      return json(res, 404, { error: 'Organization not found', code: 'ORGANIZATION_NOT_FOUND' });
    }

    if (url.pathname === '/api/v1/organization') {
      return json(res, 200, {
        id: data.organization.id,
        name: data.organization.name,
        currency: data.organization.defaultCurrency || 'USD',
        countryCode: data.organization.countryCode || null
      });
    }

    if (url.pathname === '/api/v1/cash/summary') {
      return json(res, 200, buildCashSummary(data));
    }

    if (url.pathname === '/api/v1/accounts') {
      return json(res, 200, { data: data.accounts.map(mapAccount) });
    }

    if (url.pathname === '/api/v1/transactions') {
      return json(res, 200, { data: data.transactions.map(mapTransaction) });
    }

    if (url.pathname === '/api/v1/receivables') {
      return json(res, 200, { data: data.receivables.map(mapReceivable) });
    }

    if (url.pathname === '/api/v1/payables') {
      return json(res, 200, { data: data.payables.map(mapPayable) });
    }

    if (url.pathname === '/api/v1/forecast') {
      const summary = buildCashSummary(data);
      const horizonDays = Number(url.searchParams.get('days')) || 30;
      const recurringNet = data.transactions.slice(0, 30).reduce((sum, transaction) => {
        const amount = number(transaction.amount);
        return sum + (transaction.direction === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount));
      }, 0);
      const monthlySignal = recurringNet / Math.max(1, data.transactions.length) * 30;
      return json(res, 200, {
        horizonDays,
        confidence: data.transactions.length ? 0.86 : 0,
        scenarios: {
          best: summary.projectedMonthEnd + Math.max(0, summary.expectedInflows * 0.15),
          base: summary.projectedMonthEnd,
          worst: summary.projectedMonthEnd - Math.max(0, summary.expectedOutflows * 0.15)
        },
        monthlySignal,
        currency: summary.currency
      });
    }

    return false;
  } catch (error) {
    console.error('Softwall Cashflow API error:', error);
    return json(res, 500, {
      error: 'Database request failed',
      code: 'DATABASE_REQUEST_FAILED'
    });
  }
}

module.exports = { route };
