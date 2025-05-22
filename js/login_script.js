document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
      const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid:username, pswd:password, op:"op" }),
      });

      const data = await response.json();
      
      if (response.ok) {
          alert('Login successful!');
          window.location.href = "D:\\Database\\html\\manage.html";
      } else {
          alert(data.message || 'Login failed. Please try again.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
  }
});