import { useEffect, useRef, useState } from "react";
import "../components/Auth/Auth.css";
import { useAuth } from "../components/AuthContext.jsx";
import Loading from "../components/Loading/loading";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorLogin, setErrorLogin] = useState("");
  const [loading, Setloading] = useState(false);

  function changehandle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorLogin("");
    Setloading(true);
    try {
      await login(form.email, form.password);


      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect") || "/";

      navigate(redirect, { replace: true });
      Setloading(false);
    } catch (error) {
      console.log(error);
      Setloading(false);
      if (error.response?.status === 422 || error.response?.status === 401) {
        setErrorLogin(error.response.data.message);
      }
    }
  }

  const focus = useRef();
  useEffect(() => {
    focus.current.focus();
  }, []);

  return (
      <>
        {loading && <Loading />}
        <div className="login-form-wrapper" style={{ maxWidth: "400px" }}>
          <h2>Sign In User</h2>
          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn btn-primary mt-3">
              Login
            </button>
          </form>
        </div>
      </>
  );
}
