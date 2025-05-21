import Index from "views/Index.js";
import Maps from "views/examples/Maps.js";
import Trucks from "views/examples/Trucks.js";
import Workers from "views/examples/Workers.js";
import Employees from "views/examples/employees.js";
import Containers from "views/examples/Containers.js";
import Locations from "views/examples/Locations.js";
import Complaints from "views/examples/Complaints.js";
import Users from "views/examples/Users.js";
import Drivers from "views/examples/Drivers.js";
import AddComplaints from "views/examples/AddComplaints.js";
import Trips from "views/examples/Trips.js"
import PendingChanges from "views/examples/PendingChanges";
import Permissions from "views/examples/permission";
import Excel from "views/examples/excel";

var routes = [
  {
    path: "/index",
    name: "الإحصائيات",
    icon: "ni ni-chart-bar-32 text-green",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/users",
    name: "المستخدمين",
    icon: "ni ni-circle-08",
    component: <Users />,
    layout: "/admin",
  },
  {
    path: "/permissions",
    name: "الصلاحيات",
    icon: "ni ni-lock-circle-open text-yellow",
    component: <Permissions />,
    layout: "/admin",
  },
  {
    path: "/PendingChanges",
    name: "طلبات التعديل",
    icon: "ni ni-settings-gear-65 text-silver",
    component: <PendingChanges />,
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "الخرائط",
    icon: "ni ni-pin-3 text-red",
    component: <Maps />,
    layout: "/admin",
  },
  {
    path: "/excel",
    name: "استيراد ملفات Excel",
    icon: "ni ni-single-copy-04",
    component: <Excel />,
    layout: "/admin",
  },
  {
    collapse: true,
    name: "الجداول",
    icon: "ni ni-bullet-list-67 text-blue",
    state: "tablesCollapse",
    layout: "/admin",
    views: [
      {
        path: "/trucks",
        name: "جدول الشاحنات",
        component: <Trucks />,
        layout: "/admin",
      },
      {
        path: "/trips",
        name: "جدول الرحلات",
        component: <Trips />,
        layout: "/admin",
      },
      {
        path: "/workers",
        name: "جدول العمال",
        component: <Workers />,
        layout: "/admin",
      },
      {
        path: "/employees",
        name: "جدول الموظفين",
        component: <Employees />,
        layout: "/admin",
      },
      {
        path: "/Drivers",
        name: "جدول السائقين",
        component: <Drivers />,
        layout: "/admin",
      },
      {
        path: "/Containers",
        name: "جدول المكبات",
        component: <Containers />,
        layout: "/admin",
      },
      {
        path: "/Locations",
        name: "جدول المواقع",
        component: <Locations />,
        layout: "/admin",
      },
    ],
  },
  {
    path: "/complaints",
    name: "الشكاوى",
    icon: "ni ni-notification-70",
    component: <Complaints />,
    layout: "/admin",
  },

  {
    path: "/index",
    name: "الإحصائيات",
    icon: "ni ni-chart-bar-32",
    component: <Index />,
    layout: "/manager_user",
  },
  {
    path: "/maps",
    name: "الخرائط",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/manager_user",
  },
  {
    collapse: true,
    name: "الجداول",
    icon: "ni ni-bullet-list-67 text-red",
    state: "tablesCollapse",
    layout: "/manager_user",
    views: [
      {
        path: "/trucks",
        name: "جدول الشاحنات",
        component: <Trucks />,
        layout: "/manager_user",
      },
      {
        path: "/trips",
        name: "جدول الرحلات",
        component: <Trips />,
        layout: "/manager_user",
      },
      {
        path: "/workers",
        name: "جدول العمال",
        component: <Workers />,
        layout: "/manager_user",
      },
      {
        path: "/employees",
        name: "جدول الموظفين",
        component: <Employees />,
        layout: "/manager_user",
      },
      {
        path: "/Drivers",
        name: "جدول السائقين",
        component: <Drivers />,
        layout: "/manager_user",
      },
      {
        path: "/Containers",
        name: "جدول المكبات",
        component: <Containers />,
        layout: "/manager_user",
      },
      {
        path: "/Locations",
        name: "جدول المواقع",
        component: <Locations />,
        layout: "/manager_user",
      },
    ],
  },
  {
    path: "/complaints",
    name: "الشكاوى",
    icon: "ni ni-notification-70",
    component: <Complaints />,
    layout: "/manager_user",
  },


  {
    path: "/index",
    name: "الإحصائيات",
    icon: "ni ni-chart-bar-32",
    component: <Index />,
    layout: "/employee_user",
  },
  {
    path: "/maps",
    name: "الخرائط",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/employee_user",
  },
  {
    collapse: true,
    name: "الجداول",
    icon: "ni ni-bullet-list-67 text-red",
    state: "tablesCollapse",
    layout: "/employee_user",
    views: [
      {
        path: "/trucks",
        name: "جدول الشاحنات",
        component: <Trucks />,
        layout: "/employee_user",
      },
      {
        path: "/trips",
        name: "جدول الرحلات",
        component: <Trips />,
        layout: "/employee_user",
      },
      {
        path: "/workers",
        name: "جدول العمال",
        component: <Workers />,
        layout: "/employee_user",
      },
      {
        path: "/employees",
        name: "جدول الموظفين",
        component: <Employees />,
        layout: "/employee_user",
      },
      {
        path: "/Drivers",
        name: "جدول السائقين",
        component: <Drivers />,
        layout: "/employee_user",
      },
      
      {
        path: "/Containers",
        name: "جدول المكبات",
        component: <Containers />,
        layout: "/employee_user",
      },
      {
        path: "/Locations",
        name: "جدول المواقع",
        component: <Locations />,
        layout: "/employee_user",
      },
    ],
  },
  {
    path: "/complaints",
    name: "الشكاوى",
    icon: "ni ni-notification-70",
    component: <Complaints />,
    layout: "/employee_user",
  },
  {
    path: "/add-complaints",
    name: "تقديم شكوى",
    component: <AddComplaints />,
    layout: "/auth",
    },
];

export default routes;
