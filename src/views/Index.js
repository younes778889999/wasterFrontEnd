import React, { useEffect ,useState } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Card, CardHeader, CardBody, NavItem, NavLink, Nav, Container, Row, Col, CardTitle,FormGroup, Label, Input
} from "reactstrap";
import 'rsuite/dist/rsuite.min.css';
import {
  chartOptions,
  parseOptions,
} from "variables/charts.js";
import '@fortawesome/fontawesome-free/css/all.min.css';

import Header from "components/Headers/Header.js";

const Index = (props) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [solvedComplaintsCount, setSolvedComplaintsCount] = useState(0);
  const [containersCount, setContainersCount] = useState(0);
  const [trucksCount, setTrucksCount] = useState(0);
  const [fuelData, setFuelData] = useState({
    year: null,
    total_fuel: 0,
    monthly_fuel: []
  });
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  useEffect(() => {

    // Fetch unsolved complaints count
    fetch(`${backendUrl}/Staff/complaints/unsolved/count/`)
      .then((res) => res.json())
      .then((data) => setComplaintsCount(data.count))
      .catch((err) => console.error("Error fetching complaints count:", err));
    // Fetch solved complaints count
    fetch(`${backendUrl}/Staff/complaints/solved/count/`)
      .then((res) => res.json())
      .then((data) => setSolvedComplaintsCount(data.count))
      .catch((err) => console.error("Error fetching solved complaints count:", err));
    // Fetch Trucks count
    fetch(`${backendUrl}/Staff/trucks/on_trip/count/`)
      .then((res) => res.json())
      .then((data) => setTrucksCount(data.count))
      .catch((err) => console.error("Error fetching complaints count:", err));

    // Fetch containers count
    fetch(`${backendUrl}/Staff/containers/count/`)
      .then((res) => res.json())
      .then((data) => setContainersCount(data.count))
      .catch((err) => console.error("Error fetching containers count:", err));
    // Fetch fuel data
    fetch(`${backendUrl}/Staff/trips/fuel-per-month/?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setFuelData(data))
      .catch((err) => console.error("Error fetching fuel data:", err));
    fetch(`${backendUrl}/Staff/trips/years/`)
      .then((res) => res.json())
      .then((data) => setYears(data.years))
      .catch((err) => console.error("Error fetching years:", err));
  }, [selectedYear]); 
const monthsArabic = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const monthlyTotals = fuelData.monthly_fuel.map(item => item.total_fuel);
console.log(monthlyTotals)

const chartData = {
  labels: monthsArabic,  // Labels are static months in Arabic
  datasets: [
    {
      label: `كمية الوقود المستهلكة  `,  // Dynamic label based on the selected year
      data: monthlyTotals,  // Array of total fuel consumption for each month
      backgroundColor: "rgba(54, 162, 235, 0.6)",  // Bar color
      borderColor: "rgba(54, 162, 235, 1)",  // Border color
      borderWidth: 1,  // Border width of bars
    }
  ]
};
const handleYearChange = (e) => {
  setSelectedYear(e.target.value); // Update selected year
};




  return (
    <>
      <Header />
      <Container className="mt--7 mb-5" fluid>
      <Row className="justify-content-center">
          <Col lg="6" xl="4" className="mb-4">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <div className="col text-right">
                    <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                      إجمالي الحاويات
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">
                      {containersCount} حاوية
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                      <i className="fas fa-dumpster" />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="6" xl="4" className="mb-4">
  <Card className="card-stats">
    <CardBody>
      <Row>
      <div className="col text-right">
          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
            الشكاوى
          </CardTitle>
          <span className="h2 font-weight-bold d-block text-danger">
            {complaintsCount} شكوى غير محلولة
          </span>
          <span className="h2 font-weight-bold d-block text-success">
            {solvedComplaintsCount} شكوى محلولة
          </span>
        </div>
        <Col className="col-auto">
          <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
            <i className="fas fa-exclamation-triangle" />
          </div>
        </Col>
      </Row>
    </CardBody>
  </Card>
</Col>
          <Col lg="6" xl="4" className="mb-4">
  <Card className="card-stats">
    <CardBody>
      <Row>
        <div className="col text-right">
          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
           الشاحنات في رحلات
          </CardTitle>
          <span className="h2 font-weight-bold mb-0">
            {trucksCount} شاحنة
          </span>
        </div>
        <Col className="col-auto">
          <div className="icon icon-shape bg-success text-white rounded-circle shadow">
            <i className="fas fa-truck" />
          </div>
        </Col>
      </Row>
    </CardBody>
  </Card>
</Col>
        </Row>
        <Row className="mt-3">
  <Col sm="auto" className="ml-auto">
    <Card className="shadow">
      <CardBody className="py-2 px-3 text-left"> {/* Align content inside the card to the left */}
        <FormGroup className="mb-0">
          <Label for="yearSelect" className="mb-1">اختر السنة</Label>
          <Input
            type="select"
            id="yearSelect"
            value={selectedYear}
            onChange={handleYearChange}
            style={{ width: "100px", fontSize: "0.9rem" , textAlign: "left", direction: "ltr" }}
          >
            {years.map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
          </Input>
        </FormGroup>
      </CardBody>
    </Card>
  </Col>
</Row>


        <Row className="mt-5 justify-content-center">
  <Col xl="8" lg="10" className="mb-4">  {/* Increase the column width */}
    <Card className="shadow">
      <CardHeader className="bg-transparent">
        <Row className="align-items-center">
          <div className="col text-right">
            <h6 className="text-uppercase text-muted ls-1 mb-1">
              الأداء
            </h6>
            <h2 className="mb-0">إجمالي الوقود المستخدم لسنة {selectedYear}</h2>
          </div>
        </Row>
      </CardHeader>
      <CardBody>
        <div className="chart" style={{ width: "100%", height: "400px" }}> {/* Increase height if needed */}
          <Bar
            data={chartData}
            options={chartOptions}
          />
        </div>
        <div className="text-center mt-4">
  <h4 className="text-muted">
    <i className="fas fa-gas-pump text-primary mr-2"></i>
    إجمالي الاستهلاك السنوي:
  </h4>
  <h3 className="font-weight-bold text-primary">{fuelData.total_fuel} لتر</h3>
</div>
      </CardBody>
    </Card>
  </Col>
</Row>
       
      </Container>
    </>
  );
};

export default Index;