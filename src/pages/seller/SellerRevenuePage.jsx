import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, RefreshCw, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import RevenueSummaryCards from '../../components/revenue/RevenueSummaryCards';
import RevenueChartCard from '../../components/revenue/RevenueChartCard';
import RevenueDetailsTable from '../../components/revenue/RevenueDetailsTable';
import { revenueApi } from '../../api/revenueApi';

function toIsoDateTimeStart(dateValue) {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

function toIsoDateTimeEnd(dateValue) {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T23:59:59`).toISOString();
}

function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function SellerRevenuePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Math.max(Number(searchParams.get('page') || 1) - 1, 0);
  const initialFrom = searchParams.get('from') || getDefaultFromDate();
  const initialTo = searchParams.get('to') || getToday();
  const initialChartType = searchParams.get('chartType') || 'month';

  const [page, setPage] = useState(initialPage);
  const [size] = useState(10);

  const [fromDateInput, setFromDateInput] = useState(initialFrom);
  const [toDateInput, setToDateInput] = useState(initialTo);

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [chartType, setChartType] = useState(initialChartType);

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [details, setDetails] = useState([]);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);

  const filterRange = useMemo(
    () => ({
      from: toIsoDateTimeStart(fromDate),
      to: toIsoDateTimeEnd(toDate),
    }),
    [fromDate, toDate],
  );

  useEffect(() => {
    const params = {};

    if (page > 0) params.page = String(page + 1);
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    if (chartType && chartType !== 'month') params.chartType = chartType;

    setSearchParams(params, { replace: true });
  }, [page, fromDate, toDate, chartType, setSearchParams]);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await revenueApi.getSummary();
      setSummary(response?.result || null);
    } catch (error) {
      console.error('Lỗi khi tải tổng quan doanh thu:', error);
      toast.error(
        error?.response?.data?.message ||
          'Không thể tải dữ liệu tổng quan doanh thu',
      );
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchDetails = async ({
    currentPage = page,
    currentFrom = filterRange.from,
    currentTo = filterRange.to,
  } = {}) => {
    try {
      setDetailsLoading(true);

      const response = await revenueApi.getDetails({
        page: currentPage,
        size,
        from: currentFrom,
        to: currentTo,
      });

      const result = response?.result;
      setDetails(Array.isArray(result?.content) ? result.content : []);
      setTotalPages(result?.totalPages ?? 0);
      setTotalElements(result?.totalElements ?? 0);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết doanh thu:', error);
      toast.error(
        error?.response?.data?.message || 'Không thể tải chi tiết doanh thu',
      );
      setDetails([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchChart = async ({
    currentChartType = chartType,
    currentFrom = filterRange.from,
    currentTo = filterRange.to,
  } = {}) => {
    try {
      setChartLoading(true);

      const response = await revenueApi.getChart({
        type: currentChartType,
        from: currentChartType === 'day' ? currentFrom : undefined,
        to: currentChartType === 'day' ? currentTo : undefined,
      });

      setChartData(Array.isArray(response?.result) ? response.result : []);
    } catch (error) {
      console.error('Lỗi khi tải biểu đồ doanh thu:', error);
      toast.error(
        error?.response?.data?.message || 'Không thể tải biểu đồ doanh thu',
      );
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [page, filterRange.from, filterRange.to]);

  useEffect(() => {
    fetchChart();
  }, [chartType, filterRange.from, filterRange.to]);

  const handleSearch = () => {
    if (fromDateInput && toDateInput && fromDateInput > toDateInput) {
      toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
      return;
    }

    setPage(0);
    setFromDate(fromDateInput);
    setToDate(toDateInput);
  };

  const handleResetFilter = () => {
    const defaultFrom = getDefaultFromDate();
    const defaultTo = getToday();

    setFromDateInput(defaultFrom);
    setToDateInput(defaultTo);
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setChartType('month');
    setPage(0);
  };

  return (
    <div className="min-w-0 space-y-6 py-5">
      <div className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex min-w-0 flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:w-auto">
            <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 h-11">
              <CalendarRange size={16} className="shrink-0 text-slate-400" />
              <input
                type="date"
                value={fromDateInput}
                onChange={(e) => setFromDateInput(e.target.value)}
                className="min-w-0 w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 h-11">
              <CalendarRange size={16} className="shrink-0 text-slate-400" />
              <input
                type="date"
                value={toDateInput}
                onChange={(e) => setToDateInput(e.target.value)}
                className="min-w-0 w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Search size={15} />
              Áp dụng
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <RevenueSummaryCards summary={summary} loading={summaryLoading} />

      <RevenueChartCard
        data={chartData}
        loading={chartLoading}
        chartType={chartType}
        onChangeChartType={setChartType}
      />

      <RevenueDetailsTable
        loading={detailsLoading}
        data={details}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />
    </div>
  );
}
