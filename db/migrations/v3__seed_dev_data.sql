

-- ===========================
-- VENUES
-- ===========================

INSERT INTO venues (id, name, city, address)
VALUES
('11111111-1111-1111-1111-111111111111','Wankhede Stadium','Mumbai','Churchgate, Mumbai'),
('22222222-2222-2222-2222-222222222222','M. Chinnaswamy Stadium','Bengaluru','Cubbon Road'),
('33333333-3333-3333-3333-333333333333','Narendra Modi Stadium','Ahmedabad','Motera');



-- ===========================
-- PROVIDERS (EVENTS)
-- ===========================

INSERT INTO providers (
    id,
    type,
    name,
    venue_id,
    sale_starts_at,
    event_at,
    metadata
)
VALUES
(
'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
'SPORTS',
'MI vs RCB',
'11111111-1111-1111-1111-111111111111',
NOW() - INTERVAL '1 day',
NOW() + INTERVAL '10 day',
'{
    "league":"IPL 2026",
    "homeTeam":"Mumbai Indians",
    "awayTeam":"Royal Challengers Bengaluru",
    "banner":"mi_rcb.jpg"
}'
),

(
'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
'SPORTS',
'CSK vs KKR',
'22222222-2222-2222-2222-222222222222',
NOW() - INTERVAL '1 day',
NOW() + INTERVAL '15 day',
'{
    "league":"IPL 2026",
    "homeTeam":"Chennai Super Kings",
    "awayTeam":"Kolkata Knight Riders",
    "banner":"csk_kkr.jpg"
}'
),

(
'cccccccc-cccc-cccc-cccc-cccccccccccc',
'SPORTS',
'GT vs RR',
'33333333-3333-3333-3333-333333333333',
NOW() - INTERVAL '1 day',
NOW() + INTERVAL '20 day',
'{
    "league":"IPL 2026",
    "homeTeam":"Gujarat Titans",
    "awayTeam":"Rajasthan Royals",
    "banner":"gt_rr.jpg"
}');

INSERT INTO inventory_units
(provider_id,unit_type,label,price)
VALUES

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','VIP-A1',7500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','VIP-A2',7500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','PREM-B1',4500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','PREM-B2',4500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','GOLD-C1',2500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','GOLD-C2',2500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','SILVER-D1',1500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','SILVER-D2',1500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','GEN-E1',800),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SEAT','GEN-E2',800);

INSERT INTO inventory_units
(provider_id,unit_type,label,price)
VALUES

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','VIP-A1',7000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','VIP-A2',7000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','PREM-B1',4200),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','PREM-B2',4200),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','GOLD-C1',2200),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','GOLD-C2',2200),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','SILVER-D1',1400),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','SILVER-D2',1400),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','GEN-E1',700),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','SEAT','GEN-E2',700);

INSERT INTO inventory_units
(provider_id,unit_type,label,price)
VALUES

('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','VIP-A1',6500),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','VIP-A2',6500),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','PREM-B1',4000),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','PREM-B2',4000),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','GOLD-C1',2000),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','GOLD-C2',2000),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','SILVER-D1',1200),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','SILVER-D2',1200),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','GEN-E1',600),
('cccccccc-cccc-cccc-cccc-cccccccccccc','SEAT','GEN-E2',600); 