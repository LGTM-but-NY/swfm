<<<<<<< Updated upstream
# ML Training Service

FastAPI-based ML service with MLflow integration for water level forecasting.

## Quick Start
=======
# SWFM ML Service

FastAPI-based ML service with MLflow integration for water level forecasting.

## 🚀 Quick Start
>>>>>>> Stashed changes

```bash
# Development
pip install -r requirements.txt
uvicorn app.main:app --reload

# Docker
docker build -t swfm-ml-service .
docker run -p 8000:8000 swfm-ml-service
<<<<<<< Updated upstream
```

## API Endpoints
=======

# Docker Compose (includes MLflow UI)
docker-compose up -d
```

## 📡 API Endpoints
>>>>>>> Stashed changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
<<<<<<< Updated upstream
| POST | `/models/upload` | Upload PKL model |
| GET | `/models` | List all models |
| GET | `/models/{name}/versions` | Get model versions |
| POST | `/predict/{model_name}` | Run prediction |

## MLflow UI

Access at `http://localhost:5000` when running with docker-compose.
=======
| POST | `/models/upload` | Upload PKL model file |
| GET | `/models` | List all registered models |
| GET | `/models/{name}/versions` | Get model version history |
| POST | `/predict/{model_name}` | Generate predictions |

## 🎯 Features

- **MLflow Integration**: Model registry and experiment tracking
- **Model Upload**: Upload pre-trained PKL models
- **Predictions**: Generate water level forecasts
- **Version Control**: Automatic model versioning
- **Docker Support**: Containerized deployment

## 📊 Data

The service includes `merged_mekong_dataset.csv` containing merged station and weather data for model training and evaluation.

## 🔧 MLflow UI

Access MLflow UI at `http://localhost:5000` when running with docker-compose.

## 📚 Documentation

- Full API documentation: See `API_README.md`
- Testing guide: See `TESTING.md`
- Quick start: See `QUICKSTART.md`
>>>>>>> Stashed changes
