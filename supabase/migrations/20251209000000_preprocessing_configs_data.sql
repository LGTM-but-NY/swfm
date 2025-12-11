-- Insert preprocessing configurations based on the training notebook
-- These configurations define the feature engineering pipeline

-- 1. Lag Features Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config") 
VALUES (
    'lag_features',
    true,
    '{
        "description": "Historical water level lag features",
        "lag_periods": [1, 2, 3, 6, 12, 24],
        "unit": "hours",
        "features_generated": [
            "water_level_lag_1h",
            "water_level_lag_2h", 
            "water_level_lag_3h",
            "water_level_lag_6h",
            "water_level_lag_12h",
            "water_level_lag_24h"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 2. Rolling Statistics Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'rolling_statistics',
    true,
    '{
        "description": "Rolling mean and standard deviation over time windows",
        "windows": [3, 6, 12, 24],
        "unit": "hours",
        "statistics": ["mean", "std"],
        "min_periods": 1,
        "features_generated": [
            "water_level_rolling_mean_3h",
            "water_level_rolling_mean_6h",
            "water_level_rolling_mean_12h",
            "water_level_rolling_mean_24h",
            "water_level_rolling_std_3h",
            "water_level_rolling_std_6h",
            "water_level_rolling_std_12h",
            "water_level_rolling_std_24h"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 3. Rate of Change Features
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'rate_of_change',
    true,
    '{
        "description": "Water level differences showing trend",
        "diff_periods": [1, 3, 6],
        "unit": "hours",
        "features_generated": [
            "water_level_diff_1h",
            "water_level_diff_3h",
            "water_level_diff_6h"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 4. Time Features Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'time_features',
    true,
    '{
        "description": "Temporal features with cyclical encoding",
        "cyclical_features": ["hour", "month"],
        "hour_cycle": 24,
        "month_cycle": 12,
        "features_generated": [
            "hour",
            "day_of_week",
            "day_of_month",
            "month",
            "is_weekend",
            "hour_sin",
            "hour_cos",
            "month_sin",
            "month_cos"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 5. Rainfall Features Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'rainfall_features',
    true,
    '{
        "description": "Cumulative rainfall over different time windows",
        "windows": [3, 6, 12, 24],
        "unit": "hours",
        "features_generated": [
            "rainfall_sum_3h",
            "rainfall_sum_6h",
            "rainfall_sum_12h",
            "rainfall_sum_24h"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 6. Weather Interaction Features
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'weather_interactions',
    true,
    '{
        "description": "Weather feature interactions and derived metrics",
        "interactions": [
            {
                "name": "temp_humidity_interaction",
                "formula": "temperature * humidity / 100"
            },
            {
                "name": "pressure_diff_3h",
                "formula": "pressure_current - pressure_3h_ago"
            }
        ],
        "features_generated": [
            "temp_humidity_interaction",
            "pressure_diff_3h"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 7. Station Statistics Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'station_statistics',
    true,
    '{
        "description": "Station-specific statistical features",
        "statistics": ["mean", "std"],
        "compute_deviation": true,
        "features_generated": [
            "station_water_mean",
            "station_water_std",
            "water_level_deviation"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 8. Data Cleaning Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'data_cleaning',
    true,
    '{
        "description": "Handle missing values and outliers",
        "missing_value_strategy": "median",
        "remove_rows_with_missing_lags": true,
        "min_required_history_hours": 24,
        "outlier_detection": {
            "enabled": false,
            "method": "iqr",
            "threshold": 3.0
        }
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 9. Scaling Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'feature_scaling',
    true,
    '{
        "description": "Feature scaling using StandardScaler",
        "method": "standard",
        "with_mean": true,
        "with_std": true,
        "exclude_features": ["station_id", "id", "measured_at", "created_at"]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 10. Target Creation Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'target_creation',
    true,
    '{
        "description": "Create target variables for multiple prediction horizons",
        "prediction_horizons": [15, 30, 45, 60, 90],
        "unit": "minutes",
        "method": "shift",
        "targets_generated": [
            "target_15min",
            "target_30min",
            "target_45min",
            "target_60min",
            "target_90min"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 11. Train/Test Split Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'train_test_split',
    true,
    '{
        "description": "Time-based train/test split configuration",
        "test_size": 0.2,
        "method": "time_based",
        "shuffle": false,
        "random_state": 42
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();

-- 12. Weather Data Merge Configuration
INSERT INTO "public"."preprocessing_configs" ("method_id", "enabled", "config")
VALUES (
    'weather_merge',
    true,
    '{
        "description": "Merge station measurements with weather data",
        "weather_source": "open-meteo",
        "tolerance_hours": 2,
        "fill_missing": true,
        "weather_features": [
            "temperature",
            "humidity",
            "pressure",
            "wind_speed",
            "rainfall_1h",
            "rainfall_6h",
            "rainfall_12h",
            "rainfall_24h"
        ]
    }'::jsonb
) ON CONFLICT (method_id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = now();
