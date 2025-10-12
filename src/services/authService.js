export const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8080/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Network error:', response.status, errorText);
      throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
  }
};