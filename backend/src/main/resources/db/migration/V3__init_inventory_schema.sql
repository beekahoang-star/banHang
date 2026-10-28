-- V3: Inventory Schema (Optimistic Locking & Stock Ledger)
CREATE TABLE IF NOT EXISTS inventories (
    variant_id BIGINT PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_on_hand INT NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
    stock_reserved INT NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- IMPORT, ORDER_RESERVE, ORDER_COMMIT, ORDER_RELEASE, RETURN, ADJUSTMENT
    quantity_changed INT NOT NULL,
    stock_on_hand_after INT NOT NULL,
    stock_reserved_after INT NOT NULL,
    reference_type VARCHAR(50), -- ORDER, MANUAL, IMPORT_RECEIPT
    reference_id VARCHAR(100),
    note TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_variant_id ON inventory_logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);
