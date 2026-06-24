import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
  type SeriesType,
} from "lightweight-charts";

export interface OHLCBar {
  time: string; // "YYYY-MM-DD"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceLines {
  entry?: number;
  stop?: number;
  target?: number;
}

interface Props {
  data: OHLCBar[];
  priceLines?: PriceLines;
  height?: number;
}

const CHART_BG = "#0E1B30";
const SURFACE = "#16264A";
const GRID = "rgba(39,183,200,0.08)";
const TEXT = "rgba(244,247,250,0.4)";
const UP = "#49B06E";
const DOWN = "#ef4444";
const TEAL = "#27B7C8";

export function CandlestickChart({ data, priceLines, height = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: CHART_BG },
        textColor: TEXT,
        fontFamily: "'Inter', 'ui-monospace', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: GRID },
        horzLines: { color: GRID },
      },
      crosshair: {
        vertLine: { color: TEAL, labelBackgroundColor: SURFACE },
        horzLine: { color: TEAL, labelBackgroundColor: SURFACE },
      },
      rightPriceScale: {
        borderColor: GRID,
        textColor: TEXT,
      },
      timeScale: {
        borderColor: GRID,
        timeVisible: false,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    // Candle series — occupies top 75% via pane 0
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceScaleId: "right",
    });
    candleRef.current = candles;

    // Volume histogram in its own price scale
    const volume = chart.addSeries(HistogramSeries, {
      color: TEAL,
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderVisible: false,
    });
    volumeRef.current = volume;

    const candleData: CandlestickData<Time>[] = data.map(b => ({
      time: b.time as Time,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    const volumeData: HistogramData<Time>[] = data.map(b => ({
      time: b.time as Time,
      value: b.volume,
      color: b.close >= b.open ? `${UP}55` : `${DOWN}55`,
    }));

    candles.setData(candleData);
    volume.setData(volumeData);
    chart.timeScale().fitContent();

    // Resize observer
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) chart.applyOptions({ width: w });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, height]);

  // Update price lines when priceLines prop changes
  useEffect(() => {
    const series = candleRef.current;
    if (!series || !priceLines) return;

    // Remove old lines by recreating — simplest approach since lightweight-charts
    // doesn't have a "remove all lines" API, track them manually
    // We'll handle this via a separate ref pattern below
  }, [priceLines]);

  // Track price line objects to remove them
  const linesRef = useRef<ReturnType<ISeriesApi<SeriesType>["createPriceLine"]>[]>([]);

  useEffect(() => {
    const series = candleRef.current;
    if (!series) return;

    // Remove old lines
    linesRef.current.forEach(l => series.removePriceLine(l));
    linesRef.current = [];

    if (!priceLines) return;

    if (priceLines.entry != null) {
      linesRef.current.push(series.createPriceLine({
        price: priceLines.entry,
        color: UP,
        lineWidth: 1,
        lineStyle: 0, // solid
        axisLabelVisible: true,
        title: "Entry",
      }));
    }
    if (priceLines.stop != null) {
      linesRef.current.push(series.createPriceLine({
        price: priceLines.stop,
        color: DOWN,
        lineWidth: 1,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: "Stop",
      }));
    }
    if (priceLines.target != null) {
      linesRef.current.push(series.createPriceLine({
        price: priceLines.target,
        color: TEAL,
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Target",
      }));
    }
  }, [priceLines, data]);

  return <div ref={containerRef} style={{ width: "100%", height }} />;
}
