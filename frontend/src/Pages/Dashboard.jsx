// Complete Dashboard.jsx (updated)
// NOTE: Imports unchanged except added icons if desired.
import { useEffect, useState } from "react";
import {
  BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,
  PieChart,Pie,Cell,LineChart,Line,CartesianGrid,Legend,
} from "recharts";

export default function Dashboard() {

  const [stats,setStats]=useState({
    employees:0,salary:0,projects:0,completedProjects:0,pendingProjects:0,
  });
  const [employeeGrowthData,setEmployeeGrowthData]=useState([]);
  const [salaryData,setSalaryData]=useState([]);

  useEffect(()=>{
    fetchDashboardStats();
    fetchEmployeeGrowth();
    fetchSalaryOverview();
  },[]);

  const fetchDashboardStats=async()=>{
    try{
      const res=await fetch("http://localhost:5000/api/dashboard-stats");
      setStats(await res.json());
    }catch(e){console.log(e);}
  };

  const fetchEmployeeGrowth=async()=>{
    try{
      const res=await fetch("http://localhost:5000/api/employee-growth");
      setEmployeeGrowthData(await res.json());
    }catch(e){console.log(e);}
  };

  const fetchSalaryOverview=async()=>{
    try{
      const res=await fetch("http://localhost:5000/api/salary-overview");
      setSalaryData(await res.json());
    }catch(e){console.log(e);}
  };

  const logout=()=>{
    localStorage.clear();
    window.location.href="/";
  };

  const projectData=[
    {name:"Completed",value:stats.completedProjects},
    {name:"Pending",value:stats.pendingProjects},
  ];
  const COLORS=["#10B981","#F59E0B"];

  const Card=({title,value,color,sub})=>(
    <div 
      className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 p-6">
        <p 
         className="text-gray-500">{title}
        </p>
        <h2 
         className={`text-3xl font-bold mt-2 ${color}`}>{value}
        </h2>
        <p
         className="text-sm text-gray-400 mt-2">{sub}
        </p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening in your organization today.</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-2x1 font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card title="Total Employees" value={stats.employees} color="text-blue-600" sub="Active workforce"/>
        <Card title="Total Salary" value={`₹ ${stats.salary}`} color="text-green-600" sub="Payroll"/>
        <Card title="Total Projects" value={stats.projects} color="text-purple-600" sub="All projects"/>
        <Card title="Completed Projects" value={stats.completedProjects} color="text-emerald-600" sub="Successfully delivered"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6">
          <h2 className="text-xl font-bold mb-4">Employee Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeGrowthData}>
              <XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/>
              <Bar dataKey="employees" fill="#3B82F6"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6">
          <h2 className="text-xl font-bold mb-4">Salary Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/>
              <Line type="monotone" dataKey="salary" stroke="#10B981" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Employees</span><span>{stats.employees}</span></div>
            <div className="flex justify-between"><span>Projects</span><span>{stats.projects}</span></div>
            <div className="flex justify-between"><span>Completed</span><span>{stats.completedProjects}</span></div>
            <div className="flex justify-between"><span>Pending</span><span>{stats.pendingProjects}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
          <h2 className="text-xl font-bold">AI Insights</h2>
          <p className="mt-3 text-blue-100">Predictive analytics and smart ERP recommendations will appear here.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Project Status</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={projectData} dataKey="value" outerRadius={120} label>
                {projectData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
