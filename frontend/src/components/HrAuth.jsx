import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api/user'; // Replace with your backend URL
const AuthPage = () => {
  const [formType, setFormType] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'HR',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formType === 'login') {
        const response = await axios.post(`${API_BASE_URL}/login`, {
          email: formData.email,
          password: formData.password,
        });
        alert('Login Successful!');
        console.log("response:",response);
      } else {
        const response = await axios.post(`${API_BASE_URL}/register`, formData);
        alert('Signup Successful!');
        console.log(response.data);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div>
      <h1>{formType === 'login' ? 'Login' : 'Signup'} Page</h1>
      <form onSubmit={handleSubmit}>
        {formType === 'signup' && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
            </select>
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{formType === 'login' ? 'Login' : 'Signup'}</button>
      </form>
      <button onClick={() => setFormType(formType === 'login' ? 'signup' : 'login')}>
        Switch to {formType === 'login' ? 'Signup' : 'Login'}
      </button>
    </div>
  );
};

export default AuthPage;