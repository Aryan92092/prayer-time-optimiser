import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap } from 'lucide-react';

const WeeklyAnalytics = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="glass-card p-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-3xl font-black tracking-tight dark:text-white">Momentum</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Your journey over the last 7 days</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Zap className="text-primary" size={24} />
                </div>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-800" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(138, 79, 255, 0.05)', radius: [10, 10, 0, 0] }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl rounded-3xl border border-white/40 dark:border-white/10">
                                            <p className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider text-xs">{payload[0].payload.day}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <p className="text-primary font-black text-2xl">{payload[0].value}%</p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                                                {payload[0].payload.completed} of {payload[0].payload.total} activities
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="percentage"
                            radius={[12, 12, 0, 0]}
                            barSize={40}
                            animationDuration={2000}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.percentage === 100 ? '#14B8A6' : '#8A4FFF'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyAnalytics;
