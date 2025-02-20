const loginButton = document.getElementById("loginButton");
const loginContainer = document.getElementById("loginContainer");

loginButton?.addEventListener("click", () => {

// Create window
	const loginWindow = document.createElement("div");
	loginWindow.classList.add("login-window", "flex", "flex-col", "items-center", "space-y-4");

// Create username label
	const usernameLabel = document.createElement('label');
	usernameLabel.textContent = 'Username ';

// Create username input
	const usernameInput = document.createElement('input');
	usernameInput.type = 'text';
	usernameInput.id = 'username';
	usernameInput.required = true;

// Create password label
	const passwordLabel = document.createElement('label');
	passwordLabel.textContent = 'Password ';

// Create password input
	const passwordInput = document.createElement('input');
	passwordInput.type = 'password';
	passwordInput.id = 'password';
	passwordInput.required = true;

// Create submit button
	const submitButton = document.createElement("button");
	submitButton.type = "button";
	submitButton.classList.add("bg-blue-500", "text-white", "py-2", "px-4", "rounded-lg", "hover:bg-blue-600");
	submitButton.textContent = "Log in";

// Submit function
	submitButton.addEventListener("click", async (event) => {
		event.preventDefault();
	  
		const username = (document.getElementById("username") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;
	  
		const formData = {
		  username: username,
		  password: password,
		};

		try {
			const response = await fetch("https://localhost:8443/back/api/data", {
			  method: "POST",
			  headers: {
				"Content-Type": "application/json",
			  },
			  body: JSON.stringify(formData),
			});
			if (response.ok) {
			  const data = await response.json();
			  console.log("Login successful:", data);
			} else {
			  console.log("Login failed:", response.statusText);
			}
		  }
		  catch (error) {
			console.error("Error submitting form:", error);
		  }
	});
	  

// Create Google login button
	const googleLoginButton = document.createElement("button");
	loginWindow.classList.add("google-login-button");
	googleLoginButton.textContent = "Log in with Google";

	googleLoginButton.addEventListener("click", () => {
		window.location.href = "https://localhost:8443/back/auth/google/login";
	  });	  

	loginWindow.appendChild(usernameLabel);
	loginWindow.appendChild(usernameInput);
	loginWindow.appendChild(passwordLabel);
	loginWindow.appendChild(passwordInput);
	loginWindow.appendChild(submitButton);
	loginWindow.appendChild(googleLoginButton);
	loginContainer?.appendChild(loginWindow);
});
