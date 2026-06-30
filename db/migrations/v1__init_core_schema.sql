CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) ,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK(type in ('EVENT','MOVIE','DINING','SPORTS')),
    name VARCHAR(255) NOT NULL,
    venue_id UUID NOT NULL REFERENCES venues(id),
    sale_starts_at TIMESTAMP NOT NULL,
    event_at TIMESTAMP,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_sale_start ON providers(sale_starts_at);
CREATE INDEX idx_providers_type ON providers(type);

CREATE TABLE inventory_units(
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id),
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('SEAT','TABLE_SLOT')),
    label VARCHAR(50) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','LOCKED','BOOKED')),
    version INT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_provider_status ON inventory_units(provider_id,status);

CREATE TABLE bookings (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES providers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONFIRMED','FAILED','CANCELLED')),
    total_amount NUMERIC(10,2) NOT NULL,
    idempotency_key VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_user ON bookings(user_id);

CREATE TABLE booking_units(
    booking_id UUID NOT NULL REFERENCES bookingS(id),
    inventory_unit_id UUID NOT NULL REFERENCES inventory_units(id),
    PRIMARY KEY (booking_id,inventory_unit_id)
);

CREATE TABLE payments(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUCCESS','FAILED')),
    provider_txn_id VARCHAR(200),
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);