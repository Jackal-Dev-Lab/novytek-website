// src/pages/Analytics.tsx
// Tableau de bord des statistiques (protégé par mot de passe)

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const [stats, setStats] = useState<any>(null);
  const [visitsBySource, setVisitsBySource] = useState<any[]>([]);
  const [visitsByDay, setVisitsByDay] = useState<any[]>([]);
  const [conversionRates, setConversionRates] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Statistiques générales
      const { data: visits } = await supabase
        .from('visits')
        .select('*');

      const { data: conversions } = await supabase
        .from('conversions')
        .select('*');

      // Calculs des stats
      const uniqueIPs = new Set(visits?.map(v => v.ip_address)).size;
      const uniqueSessions = new Set(visits?.map(v => v.session_id)).size;
      const conversionRate = visits && conversions 
        ? ((conversions.length / visits.length) * 100).toFixed(2)
        : 0;

      setStats({
        totalVisits: visits?.length || 0,
        uniqueVisitors: uniqueIPs,
        uniqueSessions: uniqueSessions,
        totalConversions: conversions?.length || 0,
        conversionRate: conversionRate,
      });

      // Visites par source
      const { data: sourceData } = await supabase
        .from('visits_by_source')
        .select('*');
      setVisitsBySource(sourceData || []);

      // Visites par jour (7 derniers jours)
      const { data: dayData } = await supabase
        .from('visits_by_day')
        .select('*')
        .limit(7)
        .order('visit_date', { ascending: false });
      setVisitsByDay(dayData?.reverse() || []);

      // Taux de conversion par source
      const { data: convData } = await supabase
        .from('conversion_rate_by_source')
        .select('*');
      setConversionRates(convData || []);

      // Top pages
      const { data: pagesData } = await supabase
        .from('top_pages')
        .select('*')
        .limit(10);
      setTopPages(pagesData || []);

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Tableau de bord Analytics</h1>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Visites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVisits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Visiteurs Uniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueVisitors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConversions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Visites par source */}
          <Card>
            <CardHeader>
              <CardTitle>Visites par Source</CardTitle>
              <CardDescription>D'où viennent vos visiteurs ?</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitsBySource}
                    dataKey="total_visits"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {visitsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Visites par jour */}
          <Card>
            <CardHeader>
              <CardTitle>Visites par Jour</CardTitle>
              <CardDescription>7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="visit_date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_visits" fill="#8884d8" name="Visites" />
                  <Bar dataKey="unique_sessions" fill="#82ca9d" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Taux de conversion par source */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Taux de Conversion par Source</CardTitle>
            <CardDescription>Quelle source convertit le mieux ?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversion_rate" fill="#00C49F" name="Taux (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top pages */}
        <Card>
          <CardHeader>
            <CardTitle>Pages les Plus Visitées</CardTitle>
            <CardDescription>Top 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{page.page_title || page.page_url}</p>
                    <p className="text-sm text-gray-500">{page.page_url}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{page.visits} visites</p>
                    <p className="text-sm text-gray-500">{page.avg_time}s en moyenne</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Détails par source */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Détails par Source</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Source</th>
                  <th className="text-right py-2">Visites</th>
                  <th className="text-right py-2">Sessions</th>
                  <th className="text-right py-2">Temps Moyen</th>
                  <th className="text-right py-2">Scroll Moyen</th>
                </tr>
              </thead>
              <tbody>
                {visitsBySource.map((source, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{source.source}</td>
                    <td className="text-right">{source.total_visits}</td>
                    <td className="text-right">{source.unique_sessions}</td>
                    <td className="text-right">{source.avg_time_on_page}s</td>
                    <td className="text-right">{source.avg_scroll_depth}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
