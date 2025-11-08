import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Smartphone, Monitor, Tablet, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface VisitorAnalyticsProps {
  dateRange?: {
    from: string | null;
    to: string | null;
  };
}

export function VisitorAnalytics({ dateRange }: VisitorAnalyticsProps) {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalTimeSpent: 0,
    avgTimeSpent: 0,
    totalPageViews: 0,
  });
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [regionStats, setRegionStats] = useState<any[]>([]);
  const [cityStats, setCityStats] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let query = supabase.from('visitor_sessions').select('*');

      // Apply date filters if provided
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        query = query.gte('started_at', fromDate.toISOString());
      }

      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('started_at', toDate.toISOString());
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.warn('Failed to fetch visitor analytics:', error);
        setLoading(false);
        return;
      }

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate statistics
      const totalSessions = sessions.length;
      const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);
      const avgTimeSpent = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;
      const totalPageViews = sessions.reduce((sum, s) => {
        const pageViews = Array.isArray(s.page_views) ? s.page_views : [];
        return sum + pageViews.length;
      }, 0);

      setStats({
        totalSessions,
        totalTimeSpent,
        avgTimeSpent,
        totalPageViews,
      });

      // Device statistics
      const deviceCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const device = s.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      const deviceData = Object.entries(deviceCounts).map(([device, count]) => ({
        name: device.charAt(0).toUpperCase() + device.slice(1),
        value: count,
        percentage: ((count / totalSessions) * 100).toFixed(1),
      }));

      setDeviceStats(deviceData);

      // Region statistics
      const regionCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const region = s.region || s.country || 'Unknown';
        if (region !== 'Unknown') {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        }
      });

      const regionData = Object.entries(regionCounts)
        .map(([region, count]) => ({
          name: region,
          value: count,
          percentage: ((count / totalSessions) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setRegionStats(regionData);

      // City statistics
      const cityCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const city = s.city || 'Unknown';
        if (city !== 'Unknown') {
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        }
      });

      const cityData = Object.entries(cityCounts)
        .map(([city, count]) => ({
          name: city,
          value: count,
          percentage: ((count / totalSessions) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setCityStats(cityData);

      // Time distribution (by hour)
      const hourCounts: Record<number, number> = {};
      sessions.forEach((s) => {
        if (s.started_at) {
          const hour = new Date(s.started_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      const timeData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}h`,
        sessions: hourCounts[i] || 0,
      }));

      setTimeStats(timeData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chargement des analytics...</p>
      </div>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune donnée de visiteurs disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessions Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Temps Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.avgTimeSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Temps Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pages Vues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Répartition par Appareil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceStats.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {deviceStats.map((device, index) => (
                    <div key={device.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.name)}
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{device.value} sessions</span>
                        <span className="text-sm font-semibold text-gray-900">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée d'appareil</p>
            )}
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Distribution par Heure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Regions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Régions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regionStats.length > 0 ? (
              <div className="space-y-3">
                {regionStats.map((region, index) => (
                  <div key={region.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{region.name}</div>
                        <div className="text-xs text-gray-500">{region.value} sessions</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{region.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée de région</p>
            )}
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Villes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityStats.length > 0 ? (
              <div className="space-y-3">
                {cityStats.map((city, index) => (
                  <div key={city.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-xs text-gray-500">{city.value} sessions</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{city.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée de ville</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}








