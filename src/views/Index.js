import { useState } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Button, Card, CardHeader, CardBody, NavItem, NavLink, Nav, Container, Row, Col, CardTitle,
} from "reactstrap";
import 'rsuite/dist/rsuite.min.css';
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";

const Index = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  return (
    <>
      <Header />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col lg="6" xl="3" className="mb-4">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <div className="col text-right">
                    <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                      إجمالي كمية النفايات
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">2,356 طن</span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                      <i className="fas fa-chart-pie" />
                    </div>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-muted text-sm text-right">
                  <span className="text-danger mr-2">
                    <i className="fas fa-arrow-down" /> 3.48%
                  </span>{" "}
                  <span className="text-nowrap">منذ الأسبوع الماضي</span>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" xl="3" className="mb-4">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <div className="col text-right">
                    <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                      كمية الوقود المستخدمة
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">924 لتر</span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                      <i className="fas fa-percent" />
                    </div>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-muted text-sm text-right">
                  <span className="text-warning mr-2">
                    <i className="fas fa-arrow-down" /> 1.10%
                  </span>{" "}
                  <span className="text-nowrap">منذ البارحة</span>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" xl="3" className="mb-4">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <div className="col text-right">
                    <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                      الشكاوى
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">49</span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                      <i className="fas fa-users" />
                    </div>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-muted text-sm text-right">
                  <span className="text-success mr-2">
                    <i className="fas fa-arrow-up" /> 12%
                  </span>{" "}
                  <span className="text-nowrap">منذ الشهر الماضي</span>
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="bg-gradient-default shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col text-right">
                    <h6 className="text-uppercase text-light ls-1 mb-1">
                      نظرة عامة
                    </h6>
                    <h2 className="text-white mb-0">إجمالي النفقات</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 1,
                          })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 1)}
                        >
                          <span className="d-none d-md-block">شهر</span>
                          <span className="d-md-none">م</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 2,
                          })}
                          data-toggle="tab"
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 2)}
                        >
                          <span className="d-none d-md-block">أسبوع</span>
                          <span className="d-md-none">أ</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Line
                    data={chartExample1[chartExample1Data]}
                    options={chartExample1.options}
                    getDatasetAtEvent={(e) => console.log(e)}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5 justify-content-center">
          <Col xl="4" className="mb-4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col text-right">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      الأداء
                    </h6>
                    <h2 className="mb-0">إجمالي الوقود المستخدم</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Bar
                    data={chartExample2.data}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col text-right">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      الأداء
                    </h6>
                    <h2 className="mb-0">إجمالي الرواتب المدفوعة</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Bar
                    data={chartExample2.data}
                    options={chartExample2.options}
                  />
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
