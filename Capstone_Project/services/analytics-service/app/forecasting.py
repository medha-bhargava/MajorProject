def moving_average_forecast(values: list[int], periods: int = 6) -> list[dict]:
    if not values:
        values = [20, 22, 24, 26]
    window = min(3, len(values))
    forecast = []
    series = list(values)
    for index in range(periods):
        avg = round(sum(series[-window:]) / window)
        trend = 0 if len(series) < 2 else max(-5, min(5, series[-1] - series[-2]))
        predicted = max(0, avg + trend)
        series.append(predicted)
        forecast.append({'period': f'P+{index + 1}', 'predictedDemand': predicted})
    return forecast

