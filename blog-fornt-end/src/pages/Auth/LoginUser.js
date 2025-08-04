import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LOGINUSER, baseUrl } from "../../pages/Auth/ِApi.js";
import Loading from "../../components/loading/Loading.js";
import "../../components/loading/loading.css";
import "../../pages/Auth/Auth.css";
import Cookie from "cookie-universal";

export default function LoginUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  // initial state as object, not array or string
  const [errorLogin, setErrorLogin] = useState({});
  const [loading, setLoading] = useState(false);

  function changehandle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post(`${baseUrl}/${LOGINUSER}`, form);

      if (result.status === 200) {
        const cookies = Cookie();
        cookies.set("user-token", result.data.token, { maxAge: 7200 });
        cookies.set("user_id", result.data.user.id, { maxAge: 7200 });
        setLoading(false);
        navigate("/home"); // أو المسار المرغوب بعد تسجيل الدخول
        return;
      }
    } catch (error) {
      setLoading(false);
      const resp = error.response;
      if (!resp) return;
      // resp.data.error could be string or object; normalize to object
      if (resp.status === 422 || resp.status === 401) {
        const err = resp.data.error;
        setErrorLogin(typeof err === "string" ? { general: err } : err);
      } else if (resp.status === 400) {
        setErrorLogin(resp.data.errors || {});
      }
    }
  }

  return (
    <>
      {loading && <Loading />}
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <div className="row w-100">
          <div className="col-12 col-md-6 col-lg-4 mx-auto">
            <div className="login-box">
              <div className="card card-outline card-primary">
                <div className="card-header text-center">
                  <Link to="/" className="h1">
                    <b>Masters</b>Blog
                  </Link>
                </div>
                <div className="card-body">
                  <p className="login-box-msg">Sign in to start your session</p>

                  <form onSubmit={handleSubmit}>
                    {/* General error */}
                    {errorLogin.general && (
                      <div className="error-container">
                        <span className="errorregister">
                          {errorLogin.general}
                        </span>
                      </div>
                    )}

                    <div className="input-group mb-3">
                      <input
                        type="text"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        value={form.email}
                        onChange={changehandle}
                        required
                      />
                      {errorLogin.email && (
                        <div className="error-container">
                          <span className="errorregister">
                            {errorLogin.email}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="input-group mb-3">
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Password"
                        value={form.password}
                        onChange={changehandle}
                        required
                      />
                    </div>
                    {errorLogin.password && (
                      <div className="error-container">
                        <span className="errorregister">
                          {errorLogin.password}
                        </span>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-8">
                        <div className="icheck-primary">
                          <input type="checkbox" id="remember" />
                          <label htmlFor="remember">Remember Me</label>
                        </div>
                      </div>
                      <div className="col-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  </form>

                  <p className="mb-1">
                    <Link to="/forgot-password">I forgot my password</Link>
                  </p>
                  <p className="mb-0">
                    <Link to="/register" className="text-center">
                      Register a new membership
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
