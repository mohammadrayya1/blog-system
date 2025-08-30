import { useEffect, useRef, useState } from "react";
import "../components/Auth/Auth.css";
import { useAuth } from "../components/AuthContext.jsx";
import Loading from "../components/Loading/loading";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errorLogin, setErrorLogin] = useState("");
  const [loading, Setloading] = useState(false);

  // Compute redirect once
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";

  function changehandle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorLogin("");
    Setloading(true);
    try {
      await login(form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 422 || error?.response?.status === 401) {
        setErrorLogin(error.response.data.message);
      } else {
        setErrorLogin("Something went wrong. Please try again.");
      }
    } finally {
      Setloading(false);
    }
  }

  const focus = useRef(null);
  useEffect(() => {
    focus.current?.focus();
  }, []);

  return (
      <>
        {loading && <Loading />}
        <div className="login-form-wrapper" style={{ maxWidth: "400px" }}>
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                  type="text"
                  id="email"
                  className="form-control"
                  name="email"
                  onChange={changehandle}
                  required
                  ref={focus}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                  type="password"
                  id="password"
                  className="form-control"
                  name="password"
                  onChange={changehandle}
                  required
                  minLength="8"
              />
              {errorLogin !== "" && (
                  <span className="errorregister">{errorLogin}</span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
              Login
            </button>

            {/* Register line */}
            <div className="auth-alt">
              Don’t have an account?{" "}
              <Link
                  to={`/register?redirect=${encodeURIComponent(redirect)}`}
                  className="link-primary"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </>
  );
}
