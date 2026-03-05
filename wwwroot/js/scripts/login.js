const LOGIN_FORM = document.getElementById("login-form");
const EMAIL = document.getElementById("email");
const PASSWORD = document.getElementById("password");


if(localStorage.getItem("jwt_token")){
  document.getElementById("content").removeAttribute("hidden")
  document.getElementById("login-section").setAttribute("hidden", true)
}


function getDataFromLoginForm(){
  return {
    email: EMAIL.value,
    passwordHash: PASSWORD.value
  }
}

LOGIN_FORM.addEventListener("submit", async (event) => {
  event.preventDefault();

  const UserData = getDataFromLoginForm();
  try{

    const response = await fetch("http://localhost:5183/api/auth/login", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(UserData)
    })
    if(response.ok){
      const data = await response.json();
      localStorage.setItem("jwt_token", data.token)
      document.getElementById("content").removeAttribute("hidden")

      return
    }
  }catch(err){
    return "Error found" + err
  }
})
