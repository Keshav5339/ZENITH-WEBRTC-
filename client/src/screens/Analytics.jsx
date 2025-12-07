import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./Analytics.css";

const AnalyticsPage = () => {
  // Dummy stats data
  const stats = [
    {
      id: 1,
      title: "Total Meetings",
      value: "247",
      change: "+12%",
      isPositive: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Total Participants",
      value: "1,234",
      change: "+8%",
      isPositive: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Avg Duration",
      value: "32 min",
      change: "+5%",
      isPositive: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Engagement Rate",
      value: "87%",
      change: "+3%",
      isPositive: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  // Dummy chart data - Last 30 days
  const generateChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate random meeting count between 5-15
      const meetingCount = Math.floor(Math.random() * 11) + 5;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        meetings: meetingCount,
        fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{payload[0].payload.fullDate}</p>
          <p className="tooltip-value">
            <span className="tooltip-label">Meetings:</span>
            <span className="tooltip-number">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle export report
  const handleExportReport = () => {
    alert("Export Report feature coming soon! This will allow you to download your analytics data as a CSV file.");
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights into your meeting activity and performance</p>
        </div>
        <button onClick={handleExportReport} className="btn-export-report">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className="analytics-stat-card">
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-header">
                <span className="stat-title">{stat.title}</span>
              </div>
              <div className="stat-value-row">
                <span className="stat-value">{stat.value}</span>
                <span className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                  <svg className="change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                  </svg>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Trends Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <div>
            <h2>Meeting Trends</h2>
            <p>Last 30 days activity</p>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                label={{ 
                  value: 'Number of Meetings', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Bar 
                dataKey="meetings" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats Summary */}
      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="summary-content">
            <h3>Peak Meeting Time</h3>
            <p className="summary-value">2:00 PM - 3:00 PM</p>
            <p className="summary-description">Most meetings occur during this hour</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="summary-content">
            <h3>Average Meeting Length</h3>
            <p className="summary-value">32 minutes</p>
            <p className="summary-description">Optimal duration for productivity</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="summary-content">
            <h3>Busiest Day</h3>
            <p className="summary-value">Tuesday</p>
            <p className="summary-description">Highest meeting volume this month</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
          <div className="summary-content">
            <h3>Meeting Satisfaction</h3>
            <p className="summary-value">4.6/5.0</p>
            <p className="summary-description">Based on participant feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;