import { useAuth } from "contexts/AuthContext";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar as ReactstrapNavbar,
  Nav,
  Container,
  Media,
} from "reactstrap";
import axios from 'axios';
import routes from "../../routes";

const Navbar = (props) => {
  const location = useLocation();
  const { getUserType } = useAuth(); // Get the user type from AuthContext
  const userType = getUserType(); // Retrieve the current user's type

  const getPageName = () => {
    const path = location.pathname.replace(`/${userType}`, ""); // Adjust for each user type's layout
    let routeName = "الرئيسية";

    routes.forEach((route) => {
      if (route.path === path) {
        routeName = route.name;
      }
      if (route.views) {
        route.views.forEach((viewRoute) => {
          if (viewRoute.path === path) {
            routeName = viewRoute.name;
          }
        });
      }
    });

    return routeName;
  };

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleLogout = async () => {
    try {
      await axios.put(backendUrl, { on_trip: false });
    } catch (error) {
      console.error('Error updating truck trip:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('truck_id');
    window.location.href = '/login';
  };

  return (
    <ReactstrapNavbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
      <Container fluid>
        <h4
          className="mb-0 d-none d-lg-inline-block"
          style={{
            color: "black",
            fontWeight: "bold",
            fontSize: "24px",
            marginRight: "30px",
          }}
        >
          {getPageName()}
        </h4>

        <Nav className="align-items-center d-none d-md-flex" navbar>
          <UncontrolledDropdown nav>
            <DropdownToggle className="pl-0" nav>
              <Media className="align-items-center">
                <i className="ni ni-button-power" />
                <Media className="mr-2 d-none d-lg-block"></Media>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow">
              <DropdownItem href="#pablo" onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}>
                <span>تسجيل الخروج</span>
                <i className="ni ni-user-run" />
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Container>
    </ReactstrapNavbar>
  );
};

export default Navbar;
