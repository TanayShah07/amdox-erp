import {
  Users,
  CalendarCheck,
  Wallet,
  FolderKanban,
  BarChart3,
  Bot
} from "lucide-react";


const Landing = () => {

const features = [
{
icon:<Users size={35}/>,
title:"Employee Management",
desc:"Manage employees, roles and company records easily."
},
{
icon:<CalendarCheck size={35}/>,
title:"Attendance Tracking",
desc:"Track clock-in, clock-out and attendance reports."
},
{
icon:<Wallet size={35}/>,
title:"Payroll Automation",
desc:"Generate salaries, bonuses and payroll reports."
},
{
icon:<FolderKanban size={35}/>,
title:"Project Management",
desc:"Assign projects and monitor progress."
},
{
icon:<BarChart3 size={35}/>,
title:"Analytics Reports",
desc:"Get business insights with smart dashboards."
},
{
icon:<Bot size={35}/>,
title:"AI ERP Assistant",
desc:"Ask questions and get ERP information instantly."
}
];


return (

<div className="min-h-screen bg-gray-50">


{/* NAVBAR */}

<nav className="flex justify-between items-center px-8 py-5 bg-white shadow">

<h1 className="text-2xl font-bold text-blue-600">
AMDOX ERP
</h1>


<div className="flex gap-4">

<button
className="px-5 py-2 rounded-lg bg-blue-600 text-white"
>
Login
</button>

</div>

</nav>



{/* HERO */}

<section className="px-8 py-20 text-center">


<h1 className="text-5xl font-bold text-gray-800">

Smart ERP Solution For Modern Businesses

</h1>


<p className="mt-5 text-gray-500 text-lg">

Manage employees, projects, attendance,
payroll and business analytics in one powerful platform.

</p>


<div className="mt-8 flex justify-center gap-5">


<button
className="
bg-blue-600 
text-white
px-8
py-3
rounded-xl
hover:bg-blue-700
"
>
Get Started
</button>


<button
className="
border
px-8
py-3
rounded-xl
"
>
Explore Features
</button>


</div>


<div className="
mt-16
bg-white
rounded-3xl
shadow-xl
p-10
max-w-5xl
mx-auto
">


<div className="
grid
grid-cols-3
gap-6
">

<div className="bg-blue-50 p-8 rounded-xl">
<h2 className="text-3xl font-bold">
150+
</h2>
<p>
Employees
</p>
</div>


<div className="bg-green-50 p-8 rounded-xl">
<h2 className="text-3xl font-bold">
25
</h2>
<p>
Projects
</p>
</div>


<div className="bg-purple-50 p-8 rounded-xl">
<h2 className="text-3xl font-bold">
99%
</h2>
<p>
Efficiency
</p>
</div>


</div>


</div>


</section>



{/* FEATURES */}


<section className="px-8 py-16">


<h2 className="
text-4xl
font-bold
text-center
mb-12
">
Powerful Features
</h2>



<div className="
grid
md:grid-cols-3
gap-8
">


{
features.map((item,index)=>(

<div
key={index}
className="
bg-white
rounded-2xl
shadow
p-8
hover:shadow-xl
transition
"
>


<div className="
text-blue-600
mb-5
">

{item.icon}

</div>


<h3 className="
text-xl
font-bold
">
{item.title}
</h3>


<p className="
text-gray-500
mt-3
">
{item.desc}
</p>


</div>

))
}


</div>


</section>



{/* FOOTER */}

<footer className="
bg-gray-900
text-white
text-center
py-6
">

AMDOX ERP © 2026

</footer>



</div>

);

};


export default Landing;