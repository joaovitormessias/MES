'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardBody, CardHeader, Button, ButtonGroup, Spinner } from '@heroui/react';

interface TelemetryData {
    device: string;
    ts: string;
    values: {
        temperature?: number;
        beltSpeed?: number;
        vibration?: number;
        woodCount?: number;
        status?: string;
        sawRpm?: number;
        motorCurrent?: number;
    };
}

interface TelemetryResponse {
    success: boolean;
    data: TelemetryData[];
    meta: {
        device: string;
        count: number;
    };
}

type TimeRange = '5m' | '15m' | '1h' | '6h' | '24h';

const TIME_RANGES: Record<TimeRange, { label: string; minutes: number }> = {
    '5m': { label: '5 Min', minutes: 5 },
    '15m': { label: '15 Min', minutes: 15 },
    '1h': { label: '1 Hour', minutes: 60 },
    '6h': { label: '6 Hours', minutes: 360 },
    '24h': { label: '24 Hours', minutes: 1440 },
};

export default function TelemetryDashboard() {
    const [data, setData] = useState<TelemetryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1h');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchTelemetry = async () => {
        try {
            setLoading(true);
            setError(null);

            const minutes = TIME_RANGES[timeRange].minutes;
            const from = new Date(Date.now() - minutes * 60 * 1000).toISOString();
            const to = new Date().toISOString();

            const response = await fetch(
                `/api/v1/telemetry?device=serra_01&from=${from}&to=${to}&limit=200`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result: TelemetryResponse = await response.json();
            setData(result.data.reverse()); // Reverse to show chronological order
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch telemetry');
            console.error('Telemetry fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTelemetry();
    }, [timeRange]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchTelemetry, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, timeRange]);

    const chartData = data.map((item) => ({
        time: new Date(item.ts).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        temperature: item.values.temperature || 0,
        rpm: item.values.sawRpm || 0,
        vibration: item.values.vibration || 0,
        current: item.values.motorCurrent || 0,
        beltSpeed: item.values.beltSpeed || 0,
    }));

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Digital Twin Telemetry
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Real-time monitoring - Device: serra_01
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        color={autoRefresh ? 'success' : 'default'}
                        variant={autoRefresh ? 'solid' : 'bordered'}
                        onPress={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? '● Live' : 'Paused'}
                    </Button>

                    <ButtonGroup size="sm">
                        {(Object.keys(TIME_RANGES) as TimeRange[]).map((range) => (
                            <Button
                                key={range}
                                variant={timeRange === range ? 'solid' : 'bordered'}
                                onPress={() => setTimeRange(range)}
                            >
                                {TIME_RANGES[range].label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="border-l-4 border-red-500">
                    <CardBody>
                        <p className="text-red-600 dark:text-red-400 font-medium">
                            ⚠️ {error}
                        </p>
                    </CardBody>
                </Card>
            )}

            {/* Loading State */}
            {loading && data.length === 0 && (
                <div className="flex items-center justify-center h-96">
                    <Spinner size="lg" label="Loading telemetry data..." />
                </div>
            )}

            {/* Charts Grid */}
            {!loading || data.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Temperature Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-semibold">Temperature (°C)</h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="temperature"
                                        stroke="#EF4444"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Temp (°C)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* RPM Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-semibold">Saw RPM</h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="rpm"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={false}
                                        name="RPM"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* Vibration Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-semibold">Vibration (mm/s)</h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="vibration"
                                        stroke="#F59E0B"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Vibration"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* Motor Current Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-semibold">Motor Current (A)</h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="current"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Current (A)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </div>
            ) : null}

            {/* Stats Footer */}
            {data.length > 0 && (
                <Card>
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
                                <p className="text-2xl font-bold">{data.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Temp</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {chartData.length > 0
                                        ? (chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length).toFixed(1)
                                        : '—'}°C
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg RPM</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {chartData.length > 0
                                        ? Math.round(chartData.reduce((sum, d) => sum + d.rpm, 0) / chartData.length)
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Max Vibration</p>
                                <p className="text-2xl font-bold text-amber-500">
                                    {chartData.length > 0
                                        ? Math.max(...chartData.map((d) => d.vibration)).toFixed(2)
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Current</p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {chartData.length > 0
                                        ? (chartData.reduce((sum, d) => sum + d.current, 0) / chartData.length).toFixed(1)
                                        : '—'}A
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
