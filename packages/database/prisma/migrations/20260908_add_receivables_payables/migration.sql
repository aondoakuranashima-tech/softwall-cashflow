CREATE TABLE "app"."receivables" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "source_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receivables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "app"."payables" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "source_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "receivables_organization_id_due_date_idx" ON "app"."receivables"("organization_id", "due_date");
CREATE INDEX "receivables_organization_id_status_idx" ON "app"."receivables"("organization_id", "status");
CREATE INDEX "payables_organization_id_due_date_idx" ON "app"."payables"("organization_id", "due_date");
CREATE INDEX "payables_organization_id_status_idx" ON "app"."payables"("organization_id", "status");

ALTER TABLE "app"."receivables" ADD CONSTRAINT "receivables_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "app"."payables" ADD CONSTRAINT "payables_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
