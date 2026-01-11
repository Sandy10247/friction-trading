


-- Instruments Table
CREATE TABLE IF NOT EXISTS instruments(
    id                  SERIAL PRIMARY KEY,
    instrument_token    BIGINT NOT NULL,
    exchange_token      BIGINT NOT NULL,
    tradingsymbol       TEXT NOT NULL,
    name                TEXT NOT NULL,
    last_price          FLOAT8 NOT NULL,
    expiry              TIMESTAMP DEFAULT NOW(),
    strike              FLOAT8 NOT NULL,
    tick_size           FLOAT8 NOT NULL,
    lot_size            FLOAT8 NOT NULL,
    instrument_type     TEXT NOT NULL,
    segment             TEXT NOT NULL,
    exchange            TEXT NOT NULL
);