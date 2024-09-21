import React, { useState } from "react";
import { motion } from "framer-motion";
import "../Styles/LoginSignup.css";

const LoginSignup = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleForm = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="form-box"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="form-title"
        >
          {isSignup ? "Sign Up" : "Login"}
        </motion.h2>

        <form className="form">
          {isSignup && (
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              type="text"
              placeholder="Full Name"
              className="input"
            />
          )}

          <motion.input
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            type="email"
            placeholder="Email"
            className="input"
          />
          <motion.input
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            type="password"
            placeholder="Password"
            className="input"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="submit-btn"
          >
            {isSignup ? "Sign Up" : "Login"}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="switch-form"
        >
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={toggleForm} className="toggle-link">
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginSignup;