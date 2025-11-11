# Regression Analysis Feature

## Tổng quan

Trang **Regression Analysis** thể hiện cách sử dụng Regression models trong dự báo mực nước sông Mekong.

## Nội dung chính

### 1. **Feature Importance (Mức độ ảnh hưởng)**
Biểu đồ Bar chart thể hiện các features quan trọng nhất:
- **Mực nước hiện tại**: 35% ảnh hưởng
- **Lượng mưa 3 ngày**: 28% ảnh hưởng  
- **Mực nước 7 ngày trước**: 18% ảnh hưởng
- Nhiệt độ, độ ẩm, mùa: ~19%

➡️ **Regression giúp xác định features nào quan trọng nhất**

### 2. **Actual vs Predicted Scatter Plot**
So sánh giá trị thực tế và dự báo:
- Điểm càng gần đường xanh (perfect line) = model càng tốt
- R² = 0.91 (91% variance được giải thích)

➡️ **Đánh giá độ chính xác của regression model**

### 3. **Residual Distribution**
Phân bố sai số:
- Phân bố chuẩn (bell curve) = model tốt
- Sai số tập trung gần 0
- Không có outliers lớn

➡️ **Kiểm tra xem model có bias không**

### 4. **Model Comparison Table**
So sánh 4 loại regression models:

| Model | RMSE | R² | Đặc điểm |
|-------|------|----|----|
| Linear Regression | 0.312 | 0.87 | Baseline, nhanh |
| Polynomial Regression | 0.278 | 0.89 | Non-linear patterns |
| Ridge Regression | 0.289 | 0.88 | Chống overfitting |
| LSTM | 0.267 | 0.91 | Complex patterns |

## Regression vs Classification

### 📊 **Regression**
- **Output**: Giá trị liên tục (continuous)
- **Ví dụ**: Dự báo mực nước 3.52m, 4.15m, 5.21m
- **Metrics**: RMSE, MAE, R²
- **Use case**: Dự báo chính xác số liệu

### 🎯 **Classification**  
- **Output**: Nhóm/lớp (categories)
- **Ví dụ**: Normal, Warning, Critical
- **Metrics**: Accuracy, Precision, F1
- **Use case**: Phân loại mức độ nguy hiểm

## Cách truy cập

1. Đăng nhập với role **Expert** hoặc **Admin**
2. Vào menu **Regression Analysis** 
3. Xem các biểu đồ và metrics

## Technical Details

- Component: `components/pages/regression-analysis.tsx`
- Charts: Recharts (Bar, Scatter, Line)
- Data: Mock data for demonstration
- Role required: Expert, Admin
