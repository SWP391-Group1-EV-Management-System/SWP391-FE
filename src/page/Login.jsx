import React, { useEffect, useState } from "react";
import "../assets/styles/Login.css";
import { CgMail } from "react-icons/cg";
import { TbLockPassword } from "react-icons/tb";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlineCopyright } from "react-icons/md";

function Login() {
  return (
    <>
      <div>
        <div className="login-container">
          <div className="login-inner">
            <h2>Đăng nhập</h2>
            <form>
              <div>
                <label htmlFor="username">
                  <CgMail size={28} />
                  Gmail
                </label>
                <input type="text" id="username" name="username" required />
              </div>
              <div>
                <label htmlFor="password">
                  <TbLockPassword size={24} />
                  Mật khẩu
                </label>
                <input type="password" id="password" name="password" required />
              </div>
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" id="remember-password" />
                  <span>Nhớ mật khẩu</span>
                </label>
                <a href="#" className="forgot-password-link">
                  Quên mật khẩu?
                </a>
              </div>
              <button
                type="submit"
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Đăng nhập <IoIosArrowForward size={24} />
              </button>
              <div className="register-prompt">
                <div>Không có tài khoản?</div>
                <a
                  href="#"
                  style={{
                    color: "#0b9459",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  Đăng ký
                </a>
              </div>
            </form>
            <div className="copyright">
              {/* <MdOutlineCopyright size={10} /> */}
              <span> © 2025 Group1SE1818. All rights reserved.</span>
            </div>
            <div className="footer"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
