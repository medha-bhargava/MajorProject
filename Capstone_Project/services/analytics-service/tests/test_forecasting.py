from app.forecasting import moving_average_forecast


def test_forecast_generates_requested_periods():
    result = moving_average_forecast([10, 12, 14], 4)
    assert len(result) == 4
    assert result[0]['predictedDemand'] > 0

