-- Seed stations table with all monitoring stations from API endpoints
INSERT INTO
    "public"."stations" (
        "id",
        "station_code",
        "name",
        "latitude",
        "longitude",
        "region",
        "created_at",
        "country",
        "river",
        "alarm_level",
        "flood_level",
        "is_deleted"
    )
VALUES (
        '1',
        '092600',
        'Jinghong',
        '22.02',
        '100.79',
        null,
        '2025-11-29 03:20:22.680455+00',
        'China',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '2',
        '010501',
        'Chiang Saen',
        '20.27',
        '100.08',
        null,
        '2025-11-29 03:20:22.680455+00',
        'Thailand',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '3',
        '011201',
        'Luang Prabang',
        '19.88',
        '102.14',
        null,
        '2025-11-29 03:20:22.680455+00',
        'LaoPDR',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '4',
        '011901',
        'Vientiane',
        '17.97',
        '102.61',
        null,
        '2025-11-29 03:20:22.680455+00',
        'LaoPDR',
        'Mekong',
        '11.5',
        '12.5',
        'false'
    ),
    (
        '5',
        '012703',
        'Pakse',
        '15.12',
        '105.8',
        null,
        '2025-11-29 03:20:22.680455+00',
        'LaoPDR',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '6',
        '014501',
        'Stung Treng',
        '13.57',
        '105.97',
        null,
        '2025-11-29 03:20:22.680455+00',
        'Cambodia',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '7',
        '014901',
        'Kratie',
        '12.49',
        '106.02',
        null,
        '2025-11-29 03:20:22.680455+00',
        'Cambodia',
        'Mekong',
        '22',
        '23',
        'false'
    ),
    (
        '8',
        '019803',
        'Tan Chau',
        '10.78',
        '105.24',
        null,
        '2025-11-29 03:20:22.680455+00',
        'VietNam',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '9',
        '039801',
        'Chau Doc',
        '10.7',
        '105.05',
        null,
        '2025-11-29 03:20:22.680455+00',
        'VietNam',
        'Bassac',
        '3',
        '4',
        'false'
    ),
    -- New stations added from API endpoints
    (
        '10',
        '020102',
        'Prek Kdam',
        '11.81',
        '104.81',
        null,
        '2025-12-06 03:00:00.000000+00',
        'Cambodia',
        'Tonlesap',
        '9.5',
        '10',
        'false'
    ),
    (
        '11',
        '033401',
        'Chaktomuk',
        '11.57',
        '104.93',
        null,
        '2025-12-06 03:00:00.000000+00',
        'Cambodia',
        'Bassac',
        '10.5',
        '12',
        'false'
    ),
    (
        '12',
        '019806',
        'Neak Luong',
        '11.25',
        '105.28',
        null,
        '2025-12-06 03:00:00.000000+00',
        'Cambodia',
        'Mekong',
        '7.5',
        '8',
        'false'
    ),
    (
        '13',
        '033402',
        'Koh Khel',
        '11.30',
        '105.00',
        null,
        '2025-12-06 03:00:00.000000+00',
        'Cambodia',
        'Bassac',
        '7.9',
        '8.4',
        'false'
    ),
    (
        '14',
        '019804',
        'My Thuan',
        '10.27',
        '105.91',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'Mekong',
        '1.6',
        '1.8',
        'false'
    ),
    (
        '15',
        '985203',
        'Vam Kenh',
        '10.01',
        '106.53',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'Mekong',
        null,
        null,
        'false'
    ),
    (
        '16',
        '908001',
        'Cho Lach',
        '10.24',
        '106.15',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'HamLuong',
        null,
        null,
        'false'
    ),
    (
        '17',
        '908002',
        'My Hoa',
        '10.18',
        '106.28',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'HamLuong',
        null,
        null,
        'false'
    ),
    (
        '18',
        '981702',
        'Tra Vinh',
        '9.95',
        '106.34',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'CoChien',
        null,
        null,
        'false'
    ),
    (
        '19',
        '901503',
        'Long Dinh',
        '10.41',
        '106.22',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'Xang',
        null,
        null,
        'false'
    ),
    (
        '20',
        '980601',
        'Vam Nao',
        '10.50',
        '105.45',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'VamNao',
        null,
        null,
        'false'
    ),
    (
        '21',
        '039803',
        'Can Tho',
        '10.04',
        '105.78',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'Bassac',
        '1.7',
        '1.9',
        'false'
    ),
    (
        '22',
        '039812',
        'Dai Ngai',
        '9.78',
        '105.98',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'Bassac',
        null,
        null,
        'false'
    ),
    (
        '23',
        '902602',
        'Vi Thanh',
        '9.78',
        '105.47',
        null,
        '2025-12-06 03:00:00.000000+00',
        'VietNam',
        'XaNo',
        null,
        null,
        'false'
    )
ON CONFLICT ("station_code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "country" = EXCLUDED."country",
    "river" = EXCLUDED."river",
    "alarm_level" = EXCLUDED."alarm_level",
    "flood_level" = EXCLUDED."flood_level";

-- Seed role_permissions table with the default role-to-permission mappings
-- This is critical for RLS policies to work correctly

-- Admin role permissions (all permissions)
INSERT INTO
    "public"."role_permissions" ("role", "permission")
VALUES ('admin', 'users.manage'),
    ('admin', 'data.manage'),
    ('admin', 'models.tune'),
    ('admin', 'data.download')
ON CONFLICT ("role", "permission") DO NOTHING;

-- Data Scientist role permissions (limited permissions)
INSERT INTO
    "public"."role_permissions" ("role", "permission")
VALUES (
        'data_scientist',
        'models.tune'
    ),
    (
        'data_scientist',
        'data.download'
    )
ON CONFLICT ("role", "permission") DO NOTHING;