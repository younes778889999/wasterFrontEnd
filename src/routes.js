import Index from "views/Index.js";
import Maps from "views/examples/Maps.js";
import Login from "views/examples/Login.js";
import Table1 from "views/examples/Table1.js";
import Table2 from "views/examples/Table2.js";
import Table3 from "views/examples/Table3.js";
import Table4 from "views/examples/Table4.js";
import Table5 from "views/examples/Table5.js";
import Complaints from "views/examples/Complaints.js";
import Icons from "views/examples/Icons.js";

var routes = [
  {
    path: "/index",
    name: "الإحصائيات",
    icon: "ni ni-chart-bar-32",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "الرموز",
    icon: "ni ni-planet text-blue",
    component: <Icons />,
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "خرائط",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/admin",
  },
  {
    collapse: true,
    name: "الجداول",
    icon: "ni ni-bullet-list-67 text-red",
    state: "tablesCollapse",
    views: [
      {
        path: "/table1",
        name: "جدول 1",
        component: <Table1 />,
        layout: "/admin",
      },
      {
        path: "/table2",
        name: "جدول 2",
        component: <Table2 />,
        layout: "/admin",
      },
      {
        path: "/table3",
        name: "جدول 3",
        component: <Table3 />,
        layout: "/admin",
      },
      {
        path: "/table4",
        name: "جدول 4",
        component: <Table4 />,
        layout: "/admin",
      },
      {
        path: "/table5",
        name: "جدول 5",
        component: <Table5 />,
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
    path: "/login",
    name: "تسجيل الدخول",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
];

export default routes;
