import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import { useAuth } from "contexts/AuthContext";
import routes from "routes.js";


const App = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { getUserType } = useAuth();
  const usertype = getUserType();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.flatMap((prop, key) => {
      if (prop.collapse && prop.views) {
        return getRoutes(prop.views);
      } else if (prop.layout === `/${usertype}`) {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return [];
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props?.location?.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: `/${usertype}/index`,
          imgAlt: "...",
        }}
        userRole={usertype}
      />
      <div className="main-content" ref={mainContent}>
        <Navbar
          {...props}
          brandText={getBrandText(props?.location?.pathname)}
        />
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to={`/${usertype}/index`} replace />} />
        </Routes>
        <Container fluid>
        </Container>
      </div>
    </>
  );
};

export default App;
