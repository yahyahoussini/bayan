import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  totalRevenue: number;
  avgOrderValue: number;
  growth: number;
}

export const RevenueChart = ({ data, totalRevenue, avgOrderValue, growth }: RevenueChartProps) => {
  const formatCurrency = (value: number) => `${value.toLocaleString()} MAD`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { month: 'short', day: 'numeric' });
  };

  // Revenue distribution data
  const revenueDistribution = [
    { range: "0-200 MAD", value: 25, count: 45, color: "#ef4444" },
    { range: "200-500 MAD", value: 35, count: 62, color: "#f59e0b" },
    { range: "500-1000 MAD", value: 28, count: 38, color: "#10b981" },
    { range: "1000+ MAD", value: 12, count: 18, color: "#8b5cf6" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Revenue Trend */}
      <Card className="lg:col-span-2 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">Évolution du chiffre d'affaires</CardTitle>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalRevenue)}</p>
              <p className={`text-sm font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs période précédente
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value: number) => [formatCurrency(value), 'Chiffre d\'affaires']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Panier moyen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-3xl font-bold text-emerald-700">{formatCurrency(avgOrderValue)}</p>
            <p className="text-sm text-emerald-600 font-medium">Moyenne sur 30 jours</p>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="aov" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value: number) => [formatCurrency(value), 'Panier moyen']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #10b981',
                    borderRadius: '8px'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution */}
      <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Distribution des commandes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.range}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-500">({item.value}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Pourcentage']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #8b5cf6',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};











