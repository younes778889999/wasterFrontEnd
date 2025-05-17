import React, { useState } from "react";
import { Button, Form, FormGroup, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import '../../assets/css/AddComplaints.css'; // Import the CSS file

const AddComplaints = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images[0]) console.log('hi')

  
    // const formData = new FormData();
    // images.forEach((image) => formData.append("images", image)); // Upload images
    // console.log(formData)

  
    try {
      // Step 1: Upload images first
      // const uploadResponse = await fetch(`${backendUrl}/Staff/upload-image/`, {
      //   method: "POST",
      //   body: formData,
      // });
  
      // if (!uploadResponse.ok) throw new Error("Image upload failed");
  
      // const { urls } = await uploadResponse.json(); // Get uploaded image URLs
      // console.log(urls[0])
  
      // Step 2: Save complaint with image URLs
      const data = new FormData();
      data.append("Title", title);
      data.append("Description", description);
      data.append("Name", name);
      data.append("Number", phoneNumber);
      data.append("Status", "U");

      if (images[0]) data.append("picture1", images[0]); 
      if (images[1]) data.append("picture2", images[1]); 
  
      const response = await fetch(`${backendUrl}/Staff/complaints/`, {
        method: "POST",
        body: data,
      });
  
      if (!response.ok) throw new Error("Failed to submit complaint");
  

      setSuccess(true);
      setError(null);
      setTimeout(() => navigate("/auth/login"), 2000); // Redirect to login after success
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
        <h2 className="add-complaint-header">تقديم شكوى</h2>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="text"
              placeholder="عنوان الشكوى"
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
              placeholder="وصف الشكوى"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="complaint-textarea"
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple // Allow multiple files
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
              onClick={() => navigate("/auth/login")} // Navigate back to login page
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