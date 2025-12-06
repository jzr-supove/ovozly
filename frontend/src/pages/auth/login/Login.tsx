/**
 * Login Page Component
 *
 * Provides user authentication with email and password.
 * Displays branded sidebar with logo and welcome message.
 */

import { Row, Col, Button, Checkbox, Form, Input } from "antd";
import type { FormProps } from "antd";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { login, LoginCredentials } from "@/services/auth.service";
import { getErrorMessage } from "@/services/api";
import logo from "@/assets/logo_white_tr.png";
import bgImg from "@/assets/17-dark.png";
import "./login.scss";

/** Form field types */
interface LoginFormFields extends LoginCredentials {
  remember?: boolean;
}

const Login = () => {
  const navigate = useNavigate();

  /**
   * Handle successful form submission.
   * Attempts login and redirects on success.
   */
  const onFinish: FormProps<LoginFormFields>["onFinish"] = async (values) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        confirmButtonText: "Try Again",
      });
    }
  };

  /**
   * Handle form validation failure.
   */
  const onFinishFailed: FormProps<LoginFormFields>["onFinishFailed"] = () => {
    Swal.fire({
      icon: "warning",
      title: "Validation Error",
      text: "Please fill in all required fields correctly.",
      confirmButtonText: "OK",
    });
  };

  return (
    <Row className="h-100">
      <Col span={8}>
        <div
          className="d-flex justify-content-around flex-column text-center px-5 pt-5 p-lg-10 pt-lg-20 h-100"
          style={{ backgroundColor: "#0d0d0d" }}
        >
          <a href="#" className="py-2 py-lg-20">
            <img
              alt="Ovozly Logo"
              src={logo}
              style={{ width: "200px", height: "auto" }}
            />
          </a>

          <h1 className="d-none d-lg-block fw-bold text-white fs-2 mb-4">
            Welcome to Ovozly
          </h1>

          <p className="d-none d-lg-block fw-500 fs-4 text-white">
            Speech analysis using
            <br />
            artificial intelligence
          </p>

          <div>
            <img src={bgImg} alt="Background illustration" className="w-100" />
          </div>
        </div>
      </Col>

      <Col span={16}>
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
          <h2 className="text-dark mb-3">Sign In</h2>

          <div className="d-flex justify-content-center align-items-center w-50">
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
              requiredMark={false}
              className="login-form w-75"
            >
              <div className="login-form__row">
                <Form.Item<LoginFormFields>
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    {
                      type: "email",
                      message: "Please enter a valid email address!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>

              <div>
                <Form.Item<LoginFormFields>
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </div>

              <div>
                <Form.Item<LoginFormFields>
                  name="remember"
                  valuePropName="checked"
                  label={null}
                  className="mb-2 text-end"
                >
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </div>

              <div className="w-100">
                <Form.Item label={null} className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form__submit-btn w-100"
                  >
                    Submit
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
