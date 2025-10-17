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

    // Try to parse JSON if server returned JSON, otherwise keep text message
    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // not JSON, ignore
    }

    return {
      success: true,
      message: parsed?.message || responseText,
      data: parsed || null,
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

// Fetch current user using cookie-based session
export async function me() {
  const response = await fetch("http://localhost:8080/api/users/me", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  // If not authorized, return null instead of throwing to allow frontend to handle gracefully
  if (response.status === 401 || response.status === 403) {
    console.debug('[authService.me] not authenticated, status=', response.status);
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Fetch /api/users/me failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  // API might return { user: { ... } } or the user object directly
  return data?.user || data;
}

export default { login, logoutApi, me };