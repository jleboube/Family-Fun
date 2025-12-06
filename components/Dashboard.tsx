import React, { useMemo } from 'react';
import { getLeaderboard } from '../services/storageService';
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const leaderboard = useMemo(() => getLeaderboard(), []);
  
  const chartData = leaderboard.slice(0, 5).map(entry => ({
    name: entry.user.username,
    score: entry.totalScore
  }));

  const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <Trophy className="absolute -right-4 -bottom-4 opacity-20 w-32 h-32" />
          <h3 className="text-lg font-semibold opacity-90 mb-1">Current Leader</h3>
          <p className="text-3xl font-bold">{leaderboard[0]?.user.username || "No one yet"}</p>
          <p className="text-sm opacity-75 mt-2">{leaderboard[0]?.totalScore || 0} pts</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-semibold uppercase mb-2">Total Games Played</h3>
          <p className="text-4xl font-bold text-gray-800">
            {leaderboard.reduce((acc, curr) => acc + curr.gamesPlayed, 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
           <h3 className="text-gray-500 text-sm font-semibold uppercase mb-2">Cheaters Caught</h3>
           <div className="flex items-center text-red-500">
             <AlertTriangle size={24} className="mr-2" />
             <p className="text-4xl font-bold">
               {leaderboard.reduce((acc, curr) => acc + curr.cheaterCount, 0)}
             </p>
           </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="mr-2 text-primary" size={20} />
          Performance Overview
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Family Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Member</th>
                <th className="px-6 py-3 text-right">Score</th>
                <th className="px-6 py-3 text-right">Games</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.map((entry, idx) => (
                <tr key={entry.user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {idx === 0 ? <span className="text-2xl">🥇</span> : 
                     idx === 1 ? <span className="text-2xl">🥈</span> :
                     idx === 2 ? <span className="text-2xl">🥉</span> :
                     <span className="font-mono text-gray-400">#{idx + 1}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full bg-gray-200" src={entry.user.avatar} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{entry.user.username}</div>
                        <div className="text-xs text-gray-500">Joined {new Date(entry.user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-800">
                    {entry.totalScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                    {entry.gamesPlayed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {entry.cheaterCount > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Suspect
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Clean
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No games played yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
