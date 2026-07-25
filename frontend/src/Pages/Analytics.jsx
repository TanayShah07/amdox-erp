import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Analytics() {

  const [report, setReport] = useState({
    employees: 0,
    projects: 0,
    inventoryValue: 0,
    invoiceValue: 0,
    ledgerBalance: 0,
  });

  useEffect(() => {

    const load = () => {
        fetch("http://localhost:5000/analytics")
        .then((res) => res.json())
        .then((data) => setReport(data));
    };

    load();

    const interval = setInterval(load, 30000);

    return () => clearInterval(interval);

    }, []);

  const barData = [
    {
      name: "Employees",
      value: Number(report.employees),
    },
    {
      name: "Projects",
      value: Number(report.projects),
    },
  ];

  const pieData = [
    {
      name: "Inventory",
      value: Number(report.inventoryValue),
    },
    {
      name: "Invoices",
      value: Number(report.invoiceValue),
    },
  ];

  const financeData = [
    {
        name: "Inventory",
        value: Number(report.inventoryValue),
    },
    {
        name: "Invoices",
        value: Number(report.invoiceValue),
    },
    {
        name: "Ledger",
        value: Number(report.ledgerBalance),
    },
  ];

  const COLORS = ["#3B82F6", "#10B981"];

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
            Reports & Analytics
        </h1>

        <div className="flex gap-3">

            <a href="http://localhost:5000/analytics/pdf">
            <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl">
                Export PDF
            </button>
            </a>

            <a href="http://localhost:5000/analytics/excel">
            <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl">
                Export Excel
            </button>
            </a>

        </div>

        </div>

      <div className="grid md:grid-cols-5 gap-5 mb-8">

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">
          <p>Employees</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {report.employees}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">
          <p>Projects</p>
          <h2 className="text-3xl font-bold text-green-600">
            {report.projects}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">
          <p>Inventory</p>
          <h2 className="text-2xl font-bold text-purple-600">
            ₹{Number(report.inventoryValue).toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">
          <p>Invoices</p>
          <h2 className="text-2xl font-bold text-yellow-600">
            ₹{Number(report.invoiceValue).toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">
          <p>Ledger</p>
          <h2 className="text-2xl font-bold text-red-600">
            ₹{Number(report.ledgerBalance).toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">

          <h2 className="font-bold mb-5">
            Employees vs Projects
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip
                formatter={(value) => [value, "Count"]}
              />
              <Bar dataKey="value" radius={[8,8,0,0]}>
                <Cell fill="#3B82F6" />
                <Cell fill="#10B981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">

          <h2 className="font-bold mb-5">
            Inventory vs Invoices
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                innerRadius={45}
                paddingAngle={5}
                label={({ percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Amount",
                ]}
              />
              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5">

            <h2 className="font-bold mb-5">
                Financial Overview
            </h2>

            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        "Amount",
                      ]}
                    />
                    <Bar dataKey="value" radius={[8,8,0,0]}>
                      <Cell fill="#8B5CF6" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#EF4444" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}