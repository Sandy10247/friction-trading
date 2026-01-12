

-- name: CountInstruments :one
SELECT COUNT(*) FROM instruments;

-- name: InsertInstrument :one
INSERT INTO instruments (
    instrument_token, exchange_token, tradingsymbol,
    name, last_price, expiry, strike, tick_size, 
    lot_size, instrument_type, segment, exchange) VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    RETURNING *;

-- name: TruncateInstrument :one
TRUNCATE TABLE instruments;


