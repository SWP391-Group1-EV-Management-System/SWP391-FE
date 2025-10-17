export const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:8080/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Important for receiving the cookie
    });

    const responseText = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sai tài khoản hoặc mật khẩu");
      }
      throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
    }

    // Since the backend sends plain text success message
    return {
      success: true,
      message: responseText,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
  }
};

export async function logoutApi() {
  const response = await fetch("http://localhost:8080/users/logout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Logout failed: ${response.status} ${text}`);
  }
  return response;
}

export default { logoutApi };