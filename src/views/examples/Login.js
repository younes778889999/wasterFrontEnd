import React, { useState } from 'react';
import { Button, FormGroup, Form, Input, InputGroupAddon, InputGroupText, InputGroup, Col } from "reactstrap";
import { useNavigate } from "react-router-dom";
import '../../assets/css/LoginStyle.css';

const Login = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
      e.preventDefault();
    const payload = { username, password };
    try {
      let response = await fetch(`${backendUrl}/Staff/user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('truck_id', data.truck_id);
        localStorage.setItem('employee_id', data.employee_id);
        document.cookie = `user_role=${data.role}; path=/; SameSite=Lax;`;
        document.cookie = `access_token=${data.access_token}; path=/; SameSite=Lax;`;
  
        switch (data.role) {
          case 'admin':
            window.location.href = "/admin/index"; 
            break;
          case 'manager_user':
            window.location.href = "/manager_user/index"; 
            break;
          case 'employee_user':
            window.location.href = "/employee_user/index"; 
            break;
          case 'truck_user':
            window.location.href = "/truck_user/panel"; 
            break;
          default:
            setError("Unknown user type");
        }
      } else {
        setError("Invalid credentials, please try again");
      }
    } catch (error) {
      setError("Error occurred during login. Please try again later");
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-header">تسجيل الدخول</h2>
          <Form role="form" onSubmit={handleLogin}>
          <FormGroup className="login-input-group">
            <InputGroup className="input-group-alternative">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-single-02" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup className="login-input-group">
            <InputGroup className="input-group-alternative">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-lock-circle-open" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="كلمة السر"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <div className="text-center">
            <Button className="login-btn" type="submit">
              تسجيل الدخول
            </Button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </Form>
        <div className="text-center mt-3">
          <Button
            className="anonymous-complaint-btn"
            onClick={() => navigate("/add-complaints")}
          >
            تقديم شكوى 
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
