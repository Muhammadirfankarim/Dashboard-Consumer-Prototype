"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BadDataCase } from "@/types";
import {
  countBy,
  monthlyTrend,
  slaOverdueDistribution
} from "@/lib/analytics";
import { ChartCard } from "@/components/charts/ChartCard";

const COLORS = ["#00529C", "#0072CE", "#F58220", "#64748B", "#0F766E", "#DC2626", "#7C3AED"];

export function DashboardCharts({ cases }: { cases: BadDataCase[] }) {
  const issueData = countBy(cases, (item) => item.issue_category);
  const statusData = countBy(cases, (item) => item.status);
  const productData = countBy(cases, (item) => item.product);
  const rmData = countBy(cases, (item) => item.rm_name).slice(0, 8);
  const sourceData = countBy(cases, (item) => item.source_system);
  const trendData = monthlyTrend(cases);
  const slaData = slaOverdueDistribution(cases);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Cases by Issue Category" subtitle="Kategori kendala paling sering muncul.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={issueData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" name="Kasus" fill="#00529C" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cases by Status" subtitle="Distribusi status follow-up cabang.">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95} label>
              {statusData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cases by Product" subtitle="Pantauan KPR, Briguna, dan Others.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Kasus" fill="#0072CE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cases by RM" subtitle="Top RM berdasarkan jumlah kasus dummy.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rmData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Kasus" fill="#0F766E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cases by Source System" subtitle="Sumber data yang membutuhkan koordinasi.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sourceData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Kasus" fill="#F58220" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Trend" subtitle="Tren pembuatan kasus berdasarkan bulan.">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              name="Kasus"
              stroke="#00529C"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="SLA Overdue Distribution" subtitle="Sebaran keterlambatan terhadap target SLA.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={slaData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Kasus" fill="#DC2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
