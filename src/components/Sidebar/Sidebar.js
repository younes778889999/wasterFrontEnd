import { useState } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import '../../assets/css/SidebarStyles.css';

import {
  Collapse,
  Navbar,
  NavItem,
  NavLink,
  Nav,
} from "reactstrap";

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [collapseState, setCollapseState] = useState({ tablesCollapse: false });
  const [isOpen, setIsOpen] = useState(false); // State for open/close sidebar

  const { routes, logo, userRole } = props; // Destructure userRole from props

  // Toggle collapse for mobile view
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };

  // Toggle specific dropdown state
  const toggleCollapseState = (key) => {
    setCollapseState({
      ...collapseState,
      [key]: !collapseState[key],
    });
  };

  // Close menu after selection
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  // Function to open/close the sidebar
  const toggleNav = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  // Create links for the sidebar, filtered by userRole
  const createLinks = (routes) => {
    const filteredRoutes = routes.filter(
      (route) => !route.layout || route.layout === `/${userRole}`
    );

    return (
      <div dir="rtl" style={{ width: isOpen ? "250px" : "0" }}>
        {filteredRoutes.map((prop, key) => {
          if (prop.collapse) {
            return (
              <NavItem key={key}>
                <NavLink
                  href="#pablo"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCollapseState(prop.state);
                  }}
                >
                  <i className={prop.icon} />
                  {prop.name}
                </NavLink>
                <Collapse isOpen={collapseState[prop.state]}>
                  <ul className="dotted-list">
                    {prop.views.map((view, viewKey) => (
                      <li key={viewKey}>
                        <NavLink
                          to={view.layout + view.path}
                          tag={NavLinkRRD}
                          onClick={closeCollapse}
                        >
                          {view.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </Collapse>
              </NavItem>
            );
          } else {
            return (
              <NavItem key={key}>
                <NavLink
                  to={prop.layout + prop.path}
                  tag={NavLinkRRD}
                  onClick={closeCollapse}
                >
                  <i className={prop.icon} />
                  {prop.name}
                </NavLink>
              </NavItem>
            );
          }
        })}
      </div>
    );
  };

  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <>
      <div
        id="mySidebar"
        className="sidebar"
        style={{ width: isOpen ? "250px" : "0" }}
      >
        <Nav navbar>{createLinks(routes)}</Nav>
      </div>

      <div id="main" className={isOpen ? "sidebar-open" : ""}>
        <button className="togglebtn" onClick={toggleNav} title="فتح القائمة">
          &#9776; {/* Icon for opening */}
        </button>
      </div>
    </>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      collapse: PropTypes.bool,
      name: PropTypes.string,
      icon: PropTypes.string,
      state: PropTypes.string,
      views: PropTypes.arrayOf(
        PropTypes.shape({
          path: PropTypes.string,
          name: PropTypes.string,
          icon: PropTypes.string,
          component: PropTypes.node,
          layout: PropTypes.string,
        })
      ),
    })
  ),
  userRole: PropTypes.string.isRequired, // Add userRole as a required prop
};

export default Sidebar;
