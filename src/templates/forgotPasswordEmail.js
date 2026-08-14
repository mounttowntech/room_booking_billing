module.exports = (user, otp, resetLink) => {
  return `
  <!DOCTYPE html>
  <html>

  <head>
      <meta charset="UTF-8" />
      <title>Password Reset</title>
  </head>

  <body style="
      margin:0;
      padding:0;
      background:#f4f6fb;
      font-family:Arial,sans-serif;
  ">

      <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
              <td align="center" style="padding:40px 0;">

                  <table width="600" cellpadding="0" cellspacing="0"
                      style="
                      background:#ffffff;
                      border-radius:12px;
                      overflow:hidden;
                      box-shadow:0 5px 20px rgba(0,0,0,.08);
                  ">

                      <!-- HEADER -->

                      <tr>
                          <td
                              style="
                              background:#3559F5;
                              padding:25px;
                              text-align:center;
                              color:#fff;
                              font-size:28px;
                              font-weight:bold;
                          ">
                              WonderBill
                          </td>
                      </tr>

                      <!-- BODY -->

                      <tr>
                          <td style="padding:40px;">

                              <h2 style="margin-top:0;">
                                  Hello ${user.name},
                              </h2>

                              <p style="
                                  font-size:16px;
                                  color:#444;
                                  line-height:1.8;
                              ">
                                  We received a request to reset your password.
                              </p>

                              <!-- ========================= -->
                              <!-- OTP SECTION -->
                              <!-- ========================= -->

                              <p style="
                                  font-size:16px;
                                  color:#444;
                                  line-height:1.8;
                              ">
                                  Your password reset OTP is:
                              </p>

                              <div style="
                                  text-align:center;
                                  margin:25px 0;
                              ">

                                  <div style="
                                      display:inline-block;
                                      background:#f1f4ff;
                                      border:2px solid #3559F5;
                                      border-radius:10px;
                                      padding:18px 35px;
                                      color:#3559F5;
                                      font-size:32px;
                                      font-weight:bold;
                                      letter-spacing:8px;
                                  ">
                                      ${otp}
                                  </div>

                              </div>

                              <p style="
                                  color:#666;
                                  font-size:14px;
                                  text-align:center;
                              ">
                                  This OTP will expire in
                                  <b>10 minutes</b>.
                              </p>

                              <!-- ========================= -->
                              <!-- DIVIDER -->
                              <!-- ========================= -->

                              <hr style="
                                  border:none;
                                  border-top:1px solid #eeeeee;
                                  margin:35px 0;
                              " />

                              <!-- ========================= -->
                              <!-- RESET LINK SECTION -->
                              <!-- ========================= -->

                              <p style="
                                  font-size:16px;
                                  color:#444;
                                  line-height:1.8;
                              ">
                                  You can also reset your password
                                  by clicking the button below.
                              </p>

                              <div style="
                                  text-align:center;
                                  margin:40px 0;
                              ">

                                  <a
                                      href="${resetLink}"
                                      style="
                                          background:#3559F5;
                                          color:#fff;
                                          text-decoration:none;
                                          padding:15px 35px;
                                          border-radius:8px;
                                          font-size:16px;
                                          display:inline-block;
                                      ">
                                      Reset Password
                                  </a>

                              </div>

                              <p style="
                                  color:#666;
                                  font-size:14px;
                              ">
                                  This reset link will expire in
                                  <b>15 minutes</b>.
                              </p>

                              <!-- ========================= -->
                              <!-- SECURITY MESSAGE -->
                              <!-- ========================= -->

                              <p style="
                                  color:#666;
                                  font-size:14px;
                                  line-height:1.7;
                              ">
                                  If you didn't request a password reset,
                                  simply ignore this email.
                              </p>

                          </td>
                      </tr>

                      <!-- FOOTER -->

                      <tr>
                          <td
                              style="
                              background:#f5f5f5;
                              text-align:center;
                              padding:18px;
                              color:#888;
                              font-size:13px;
                          ">
                              © ${new Date().getFullYear()} WonderBill.
                              All rights reserved.
                          </td>
                      </tr>

                  </table>

              </td>
          </tr>
      </table>

  </body>

  </html>
  `;
};