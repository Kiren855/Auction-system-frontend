import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

export default function RevenueChartCard({
  data = [],
  loading,
  chartType,
  onChangeChartType,
}) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <TrendingUp size={20} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-slate-900">
              Biểu đồ doanh thu
            </div>
            <div className="text-sm text-slate-500">
              Theo dõi xu hướng doanh thu theo thời gian
            </div>
          </div>
        </div>

        <div className="inline-flex w-fit max-w-full shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onChangeChartType?.('month')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              chartType === 'month'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Theo tháng
          </button>

          <button
            type="button"
            onClick={() => onChangeChartType?.('day')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              chartType === 'day'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Theo ngày
          </button>
        </div>
      </div>

      <div className="min-w-0 w-full">
        <div className="h-85 w-full min-w-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Đang tải biểu đồ doanh thu...
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
              Chưa có dữ liệu doanh thu để hiển thị biểu đồ
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  width={60}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(Number(value || 0))
                  }
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
