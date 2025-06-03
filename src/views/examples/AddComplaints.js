import React, { useState } from "react";
import { Button, Form, FormGroup, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import '../../assets/css/AddComplaints.css'; // Import the CSS file
import { Checkbox } from "rsuite";

const AddComplaints = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [images, setImages] = useState([]);
  const [isRequest, setIsRequest] = useState(false); // ✅ NEW STATE for request checkbox
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // ✅ Detect if user is logged in (you can adjust based on your app)
  const isLoggedIn = !!localStorage.getItem("token");
  console.log(isLoggedIn)

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("Title", title);
      data.append("Description", description);
      data.append("Name", name);
      data.append("Number", phoneNumber);
      data.append("Status", "U");
      data.append("request", isRequest); // ✅ Include the request boolean
      data.append("is_employee", isLoggedIn);

      if (images[0]) data.append("picture1", images[0]); 
      if (images[1]) data.append("picture2", images[1]);

      const response = await fetch(`${backendUrl}/Staff/complaints/`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) throw new Error("Failed to submit complaint");

      setSuccess(true);
      setError(null);
      setTimeout(() => navigate("/auth/login"), 2000); // Redirect after success
    } catch (error) {
      setError("Error submitting the complaint. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2); // Limit to 2 images
    setImages(files);
  };

  return (
    <div className="add-complaint-container">
      <div className="add-complaint-card">
      <h2 className="add-complaint-header">
        {isLoggedIn ? "تقديم شكوى / طلب" : "تقديم شكوى"}
      </h2>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="text"
              placeholder={isLoggedIn ? "عنوان الشكوى او الطلب" : "عنوان الشكوى"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="complaint-input"
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="complaint-input"
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="رقم الهاتف"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="complaint-input"
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="textarea"
              placeholder={isLoggedIn ? "وصف الشكوى او الطلب" : "وصف الشكوى"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="complaint-textarea"
            />
          </FormGroup>
          {isLoggedIn && (
          <FormGroup className="mb-3" style={{ direction: "rtl", textAlign: "right" }}>
          <Checkbox
            checked={isRequest}
            onChange={(value, checked) => setIsRequest(checked)}
          >
            هل هذه الشكوى عبارة عن طلب؟
          </Checkbox>
        </FormGroup>
)}

          <FormGroup>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className="complaint-input"
            />
            <small>يمكنك تحميل صورتين كحد أقصى</small>
          </FormGroup>

          

          <div className="text-center">
            <Button type="submit" className="submit-button">
              تقديم الشكوى
            </Button>
            <Button
              className="back-button"
              onClick={() => navigate("/auth/login")}
            >
              العودة إلى تسجيل الدخول
            </Button>
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              تم تقديم الشكوى بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول...
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default AddComplaints;
