const permissions = {
    admin: {
      users: { edit: true, delete: true, add: true, view: true },
      trucks: { edit: true, delete: true, add: true, view: true },
      workers: { edit: true, delete: true, add: true, view: true },
      drivers: { edit: true, delete: true, add: true, view: true },
      employees: { edit: true, delete: true, add: true, view: true },
      landfills: { edit: true, delete: true, add: true, view: true },
      containers: { edit: true, delete: true, add: true, view: true },
      trips: { edit: true, delete: true, add: true, view: true },
      complaints: { edit: false, delete: true, add: false, view: true },
    },
    manager_user: {
      users: { edit: false, delete: false, add: false, view: false },
      trucks: { edit: true, delete: false, add: true, view: true },
      workers: { edit: true, delete: false, add: true, view: true },
      drivers: { edit: true, delete: false, add: true, view: true },
      employees: { edit: true, delete: false, add: true, view: true },
      landfills: { edit: true, delete: false, add: true, view: true },
      containers: { edit: true, delete: false, add: true, view: true },
      trips: { edit: true, delete: false, add: true, view: true },
      complaints: { edit: false, delete: false, add: false, view: true },
    },
    employee_user: {
      users: { edit: false, delete: false, add: false, view: false },
      trucks: { edit: true, delete: false, add: true, view: true },
      workers: { edit: false, delete: false, add: false, view: false },
      drivers: { edit: false, delete: false, add: false, view: false },
      employees: { edit: false, delete: false, add: false, view: false },
      landfills: { edit: false, delete: false, add: true, view: true },
      containers: { edit: false, delete: false, add: true, view: true },
      trips: { edit: false, delete: false, add: true, view: true },
      complaints: { edit: true, delete: false, add: true, view: true },
    },
    truck_user: {
      users: { edit: false, delete: false, add: false, view: false },
      trucks: { edit: false, delete: false, add: false, view: true },
      workers: { edit: false, delete: false, add: false, view: false },
      drivers: { edit: false, delete: false, add: false, view: false },
      employees: { edit: false, delete: false, add: false, view: false },
      landfills: { edit: false, delete: false, add: false, view: true },
      containers: { edit: false, delete: false, add: false, view: true },
      trips: { edit: false, delete: false, add: false, view: true },
      complaints: { edit: true, delete: false, add: true, view: true },
    },
  };
  
  export default permissions;
  