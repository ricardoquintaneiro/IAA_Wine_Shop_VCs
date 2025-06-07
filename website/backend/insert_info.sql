-- Wine Verifiable Credentials Direct Insert Script
-- This script allows you to insert wine VCs directly into the database
-- Replace the placeholder values with actual VC data

-- Example 1: Insert a complete wine VC with certifications
INSERT INTO wines (
    verifiable_credential_id,
    name,
    type,
    wine_type,
    vintage,
    country,
    region,
    subregion,
    producer_name,
    producer_did,
    grape_variety,
    price,
    batch_code,
    description,
    image_url,
    bottle_size_ml,
    alcohol_content_percentage,
    fixed_acidity,
    volatile_acidity,
    citric_acid,
    residual_sugar,
    chlorides,
    free_sulfur_dioxide,
    total_sulfur_dioxide,
    density,
    pH,
    sulphates,
    product_id,
    issuance_date,
    expiration_date,
    issuer,
    proof_type,
    proof_value,
    verification_method
) VALUES (
    'vc:wine:123456789',                    -- verifiable_credential_id
    'Quinta do Vale Reserva',               -- name
    'Wine',                                 -- type
    'Red Wine',                            -- wine_type
    2020,                                  -- vintage
    'Portugal',                            -- country
    'Douro',                               -- region
    'Cima Corgo',                          -- subregion
    'Quinta do Vale Vineyards',            -- producer_name
    'did:web:quintadovale.com',            -- producer_did
    '["Touriga Nacional", "Tinta Roriz", "Touriga Franca"]', -- grape_variety (JSON array)
    45.99,                                 -- price
    'QDV-2020-001',                        -- batch_code
    'Premium red wine with complex tannins and rich fruit flavors', -- description
    '/src/assets/wine_photos/quinta_do_vale_reserva.jpg', -- image_url
    750,                                   -- bottle_size_ml
    14.5,                                  -- alcohol_content_percentage
    7.8,                                   -- fixed_acidity
    0.52,                                  -- volatile_acidity
    0.45,                                  -- citric_acid
    2.1,                                   -- residual_sugar
    0.076,                                 -- chlorides
    32.0,                                  -- free_sulfur_dioxide
    145.0,                                 -- total_sulfur_dioxide
    0.9956,                                -- density
    3.4,                                   -- pH
    0.68,                                  -- sulphates
    'PROD-QDV-2020-RES',                   -- product_id
    '2023-01-15T10:30:00Z',                -- issuance_date
    '2030-01-15T10:30:00Z',                -- expiration_date
    'did:web:certifier.wine.gov.pt',       -- issuer
    'Ed25519Signature2020',                -- proof_type
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...', -- proof_value
    'did:web:certifier.wine.gov.pt#key-1'  -- verification_method
);

-- Get the wine_id for the certifications (last inserted wine)
-- Note: In a real scenario, you'd want to use the actual wine ID

-- Insert certifications for the wine
INSERT INTO wine_certifications (
    id,
    wine_id,
    type,
    certifying_body,
    certification_date,
    certificate_id
) VALUES 
-- Organic certification
(
    'cert-organic-123456',                  -- id
    (SELECT id FROM wines WHERE verifiable_credential_id = 'vc:wine:123456789'), -- wine_id
    '["Organic"]',                          -- type (JSON array)
    'Instituto dos Vinhos do Douro e do Porto', -- certifying_body
    '2020-03-15',                           -- certification_date
    'ORG-2020-QDV-001'                      -- certificate_id
),
-- DOC certification
(
    'cert-doc-789012',                      -- id
    (SELECT id FROM wines WHERE verifiable_credential_id = 'vc:wine:123456789'), -- wine_id
    '["DOC", "Protected Designation of Origin"]', -- type (JSON array)
    'Instituto dos Vinhos do Douro e do Porto', -- certifying_body
    '2020-05-20',                           -- certification_date
    'DOC-2020-DOURO-789'                    -- certificate_id
);

-- ============================================================================
-- TEMPLATE FOR BULK INSERTS
-- ============================================================================

-- Example 2: Template for multiple wines (replace with actual data)
/*
INSERT INTO wines (
    verifiable_credential_id, name, type, wine_type, vintage, country, region, 
    subregion, producer_name, producer_did, grape_variety, price, batch_code, 
    description, image_url, bottle_size_ml, alcohol_content_percentage,
    fixed_acidity, volatile_acidity, citric_acid, residual_sugar, chlorides,
    free_sulfur_dioxide, total_sulfur_dioxide, density, pH, sulphates,
    product_id, issuance_date, expiration_date, issuer, proof_type, 
    proof_value, verification_method
) VALUES 
('vc:wine:111111', 'Wine Name 1', 'Wine', 'Red Wine', 2021, 'Portugal', 'Douro', NULL, 'Producer 1', 'did:web:producer1.com', '["Grape1", "Grape2"]', 35.50, 'BATCH001', 'Description 1', '/path/to/image1.jpg', 750, 13.5, 7.2, 0.45, 0.35, 2.5, 0.065, 28.0, 120.0, 0.9945, 3.3, 0.72, 'PROD001', '2023-01-01T00:00:00Z', '2030-01-01T00:00:00Z', 'did:web:issuer.com', 'Ed25519Signature2020', 'proof1...', 'did:web:issuer.com#key-1'),
('vc:wine:222222', 'Wine Name 2', 'Wine', 'White Wine', 2022, 'Portugal', 'Vinho Verde', NULL, 'Producer 2', 'did:web:producer2.com', '["Grape3", "Grape4"]', 25.99, 'BATCH002', 'Description 2', '/path/to/image2.jpg', 750, 11.5, 6.8, 0.38, 0.42, 3.2, 0.058, 35.0, 105.0, 0.9935, 3.1, 0.65, 'PROD002', '2023-02-01T00:00:00Z', '2030-02-01T00:00:00Z', 'did:web:issuer.com', 'Ed25519Signature2020', 'proof2...', 'did:web:issuer.com#key-1');
*/

-- ============================================================================
-- UTILITY QUERIES
-- ============================================================================

-- Check if a wine VC already exists
-- SELECT COUNT(*) FROM wines WHERE verifiable_credential_id = 'vc:wine:123456789';

-- Get wine with certifications (similar to your GET method)
-- SELECT w.*, GROUP_CONCAT(wc.type) as certification_types 
-- FROM wines w 
-- LEFT JOIN wine_certifications wc ON w.id = wc.wine_id 
-- WHERE w.id = 1 
-- GROUP BY w.id;

-- Update wine data (if needed)
-- UPDATE wines 
-- SET price = 49.99, updated_at = CURRENT_TIMESTAMP 
-- WHERE verifiable_credential_id = 'vc:wine:123456789';

-- Delete wine and its certifications (CASCADE should handle certifications)
-- DELETE FROM wines WHERE verifiable_credential_id = 'vc:wine:123456789';

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Check for duplicate verifiable_credential_id before inserting
-- SELECT verifiable_credential_id FROM wines WHERE verifiable_credential_id IN ('vc:wine:123456789', 'vc:wine:111111');

-- Validate JSON format in grape_variety field
-- SELECT id, name, grape_variety, 
--        CASE 
--            WHEN json_valid(grape_variety) THEN 'Valid JSON' 
--            ELSE 'Invalid JSON' 
--        END as json_status
-- FROM wines;

-- Count wines by country/region
-- SELECT country, region, COUNT(*) as wine_count 
-- FROM wines 
-- GROUP BY country, region 
-- ORDER BY wine_count DESC;