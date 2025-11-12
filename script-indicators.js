// Moving Averages
export function MA(data, period) {
  const res = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      res.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.Close, 0);
      res.push(sum / period);
    }
  }
  return res;
}

export function EMA(data, period) {
  const res = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i === 0) res.push(data[0].Close);
    else res.push(data[i].Close * k + res[i - 1] * (1 - k));
  }
  return res;
}

export function WMA(data, period) {
  const res = [];
  const denom = (period * (period + 1)) / 2;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) res.push(null);
    else {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j].Close * (period - j);
      res.push(sum / denom);
    }
  }
  return res;
}

// RSI
export function RSI(data, period) {
  const res = [];
  let gain = 0, loss = 0;
  for (let i = 1; i < data.length; i++) {
    const diff = data[i].Close - data[i - 1].Close;
    if (i <= period) {
      gain += Math.max(diff, 0);
      loss += Math.max(-diff, 0);
      res.push(null);
    } else if (i === period + 1) {
      gain /= period;
      loss /= period;
      res.push(100 - (100 / (1 + gain / loss)));
    } else {
      gain = (gain * (period - 1) + Math.max(diff, 0)) / period;
      loss = (loss * (period - 1) + Math.max(-diff, 0)) / period;
      res.push(100 - (100 / (1 + gain / loss)));
    }
  }
  return res;
}

// ATR
export function ATR(data, period) {
  const res = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) res.push(data[i].High - data[i].Low);
    else {
      const tr = Math.max(
        data[i].High - data[i].Low,
        Math.abs(data[i].High - data[i - 1].Close),
        Math.abs(data[i].Low - data[i - 1].Close)
      );
      res.push(i < period ? null : tr);
    }
  }
  return res;
}

// Bollinger Bands
export function BollingerBands(data, period = 20, mult = 2) {
  const mid = MA(data, period);
  const upper = [], lower = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1).map(d => d.Close);
      const mean = mid[i];
      const sd = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
      upper.push(mean + mult * sd);
      lower.push(mean - mult * sd);
    }
  }
  return { mid, upper, lower };
}

// Keltner Channel
export function KeltnerChannel(data, period = 20, mult = 2) {
  const ema = EMA(data, period);
  const atr = ATR(data, period);
  const upper = ema.map((v, i) => v + mult * (atr[i] || 0));
  const lower = ema.map((v, i) => v - mult * (atr[i] || 0));
  return { ema, upper, lower };
}

// SuperTrend (basic version)
export function SuperTrend(data, period = 10, mult = 3) {
  const atr = ATR(data, period);
  const trend = [], up = [], dn = [];
  for (let i = 0; i < data.length; i++) {
    const hl2 = (data[i].High + data[i].Low) / 2;
    const upBand = hl2 + mult * (atr[i] || 0);
    const dnBand = hl2 - mult * (atr[i] || 0);
    up.push(upBand); dn.push(dnBand);
    if (i === 0) trend.push(1);
    else trend.push(data[i].Close > upBand ? 1 : data[i].Close < dnBand ? -1 : trend[i - 1]);
  }
  return { trend, upper: up, lower: dn };
}