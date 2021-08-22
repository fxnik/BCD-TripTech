import React, { FC, useState } from "react";
import { useActions } from "../../hooks/useActions";
import { useHttp } from "../../hooks/useHttp";
import { useHistory } from "react-router-dom";

import "./authFormStyle.css";

//----------------------

import dotenv from "dotenv";
dotenv.config();

let APP_API_URL: string | undefined;

if (process.env.NODE_ENV === "production") {
  APP_API_URL = process.env.REACT_APP_PROD_APP_API_URL;
}

if (process.env.NODE_ENV === "development") {
  APP_API_URL = process.env.REACT_APP_DEV_APP_API_URL;
}

//---------------------

const AuthForm: FC = () => {
  const { setUserIsAuthorizedAction } = useActions();

  //-------------------

  let history = useHistory();
  const { request } = useHttp();
  const [isSignIn, setSignIn] = useState(true);
  const [inProgress, setInProgress] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [emailIsValid, setEmailValidation] = useState(true);
  const [passwordIsValid, setPasswordValidation] = useState(true);

  //-------------------

  const toggleSignInHandler = () => {
    setSignIn((state) => !state);
  };

  //-------------------

  const registerHandler = async () => {
    if (!form.email) {
      alert("Email field is empty. Type your email.");
      return;
    } else if (!form.password) {
      alert("Password field is empty. Type your password");
      return;
    } else if (!emailIsValid || !passwordIsValid) {
      alert("Format of your credentials are not valid");
      return;
    }

    try {
      setInProgress((state) => true);

      const data = await request(APP_API_URL + "/register", "post", {
        ...form,
      });

      console.log("data= ", data);

      if (data.isError) {
        setInProgress((state) => false);
        alert("Error: " + data.message);
      } else if (data.message === "user_created") {
        setInProgress((state) => false);
        alert("User has been created. You may sign in");
      } else if (data.message === "user_exists") {
        setInProgress((state) => false);
        alert("Type other email");
      }
    } catch (e) {
      setInProgress((state) => false);
      alert("Error: " + e.message);
      throw e;
    }
  };

  //----------------------

  const loginHandler = async () => {
    if (!form.email) {
      alert("Email field is empty. Type your email.");
      return;
    } else if (!form.password) {
      alert("Password field is empty. Type your password");
      return;
    } else if (!emailIsValid || !passwordIsValid) {
      alert("Format of your credentials are not valid");
      return;
    }

    try {
      setInProgress((state) => true);

      const data = await request(APP_API_URL + "/login", "post", { ...form });

      console.log("data", data);

      if (data.isError) {
        setInProgress((state) => false);
        alert("Error: " + data.message);
      } else if (data.message === "authorized") {
        setInProgress((state) => false);
        localStorage.setItem(
          "userData",
          JSON.stringify({ userId: data.userId, token: data.token })
        );

        setUserIsAuthorizedAction(true);
      } else if (data.message === "unauthorized") {
        setInProgress((state) => false);
        alert("You are not authorized");
      }
    } catch (e) {
      setInProgress((state) => false);
      alert("Error: " + e.message);
      throw e;
    }
  };

  //-----------------------

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });

    if (event.target.name === "email") {
      if (event.target.value.length > 0) {
        if (
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            event.target.value
          )
        ) {
          setEmailValidation((state) => true);
        } else {
          setEmailValidation((state) => false);
        }
      } else setEmailValidation((state) => true);
    }

    //------------------------

    if (event.target.name === "password") {
      if (event.target.value.length > 0) {
        if (event.target.value.length < 8 || event.target.value.length > 30) {
          setPasswordValidation((state) => false);
        } else setPasswordValidation((state) => true);
      } else setPasswordValidation((state) => true);
    }
  };

  //--------------------------

  return (
    <div className="a__auth-form-container">
      <div className="a__auth-form">
        {isSignIn ? <span>Sign in</span> : <span>Sign up</span>}

        <div className="a__email">
          <span>Email</span>
          <input
            type="text"
            placeholder="type your email"
            name="email"
            value={form.email}
            onChange={changeHandler}
            className={emailIsValid ? "" : "a__invalid"}
          />
        </div>

        <div className="a__password">
          <span>Password</span>
          <input
            type="password"
            placeholder="type your password as 8-30 symbols"
            name="password"
            value={form.password}
            onChange={changeHandler}
            className={passwordIsValid ? "" : "a__invalid"}
          />
        </div>

        <div className="a__buttons">
          <span className="a__sign-btn" onClick={toggleSignInHandler}>
            {isSignIn ? "Sign up" : "Sign in"}
          </span>
          <span
            className="a__sign-submit-btn"
            onClick={isSignIn ? loginHandler : registerHandler}
          >
            Submit
          </span>
        </div>

        <div className={inProgress ? "a__spinner" : "a__spinner a__disabled"}>
          <div>Wait</div>
          <div className="a__lds-dual-ring-auth"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
