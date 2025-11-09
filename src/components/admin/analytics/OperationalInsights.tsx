import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Clock, MapPin, TrendingUp, Users, Calendar, Globe } from "lucide-react";

interface OperationalData {
  peakHours: Array<{ hour: string; orders: number; revenue: number }>;
  topCities: Array<{ city: string; orders: number; revenue: number; percentage: number }>;
  weeklyTrends: Array<{ day: string; orders: number; revenue: number; efficiency: number }>;
  monthlyGrowth: Array<{ month: string; growth: number; orders: number }>;
}

interface OperationalInsightsProps {
  data: OperationalData;
}

export const OperationalInsights = ({ data }: OperationalInsightsProps) => {
  const formatCurrency = (value: number) => `${value.toLocaleString()} MAD`;
  
  // Performance radar data
  const performanceData = [
    { subject: 'Taux de confirmation', A: 85, fullMark: 100 },
    { subject: 'Livraison rapide', A: 92, fullMark: 100 },
    { subject: 'Satisfaction client', A: 88, fullMark: 100 },
    { subject: 'Efficacité logistique', A: 94, fullMark: 100 },
    { subject: 'Support client', A: 90, fullMark: 100 },
    { subject: 'Processus commande', A: 87, fullMark: 100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Peak Hours Analysis */}
      <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Heures de pointe</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis dataKey="hour" stroke="#d97706" fontSize={12} />
                <YAxis stroke="#d97706" fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'orders' ? `${value} commandes` : formatCurrency(value),
                    name === 'orders' ? 'Commandes' : 'Chiffre d\'affaires'
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #d97706',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/70 p-3 rounded-lg">
              <p className="font-semibold text-amber-700">Pic d'activité</p>
              <p className="text-2xl font-bold text-amber-800">14h-16h</p>
            </div>
            <div className="bg-white/70 p-3 rounded-lg">
              <p className="font-semibold text-amber-700">Période calme</p>
              <p className="text-2xl font-bold text-amber-800">01h-06h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Cities */}
      <Card className="border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Villes principales</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCities.slice(0, 5).map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-teal-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{city.city}</p>
                    <p className="text-sm text-gray-600">{city.orders} commandes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-700">{formatCurrency(city.revenue)}</p>
                  <p className="text-sm text-gray-500">{city.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Tendances hebdomadaires</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="day" stroke="#4f46e5" fontSize={12} />
                <YAxis stroke="#4f46e5" fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'orders' ? `${value} commandes` : 
                    name === 'efficiency' ? `${value}%` : formatCurrency(value),
                    name === 'orders' ? 'Commandes' : 
                    name === 'efficiency' ? 'Efficacité' : 'Chiffre d\'affaires'
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #4f46e5',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Commandes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-cyan-500 rounded-full"></div>
              <span>Efficacité</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Radar */}
      <Card className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Performance globale</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#fecaca" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11, fill: '#dc2626' }}
                />
                <PolarRadiusAxis 
                  angle={90}
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#dc2626' }}
                />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Performance']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #dc2626',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/70 p-2 rounded text-center">
              <p className="font-semibold text-rose-700">Score moyen</p>
              <p className="text-lg font-bold text-rose-800">89.3%</p>
            </div>
            <div className="bg-white/70 p-2 rounded text-center">
              <p className="font-semibold text-rose-700">Rang</p>
              <p className="text-lg font-bold text-rose-800">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};











