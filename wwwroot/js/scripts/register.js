//
//User registration
//

const REGISTER_FORM = document.getElementById("register-form"); //All the register form
const FIRST_NAME = document.getElementById("firstName");
const LAST_NAME = document.getElementById("lastName");
const EMAIL = document.getElementById("email");
const PASSWORD = document.getElementById("password");
const CONFIRM_PASSWORD = document.getElementById("confirmPassword");
const FORM_CHECK_LABEL = document.querySelector("form-check-label");
const FORM_ERROR = document.querySelector("form-registration-error");


REGISTER_FORM.addEventListener("submit", async (event) => {
  event.preventDefault();
  const userInformation = getRegisterFormData();

  try{
    const response = await fetch("http://localhost:5183/api/auth/register",  {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userInformation)
    })

    if(response.ok){
      alert("User correctly created")
      return;
    }
    else{
      alert("Error");
    }


  }catch(err){
    return err
  }
});

function getRegisterFormData(){

  const username = `${FIRST_NAME.value} ${LAST_NAME.value}`.trim();

  return {
    userName: username,
    email: EMAIL.value,
    passwordHash: PASSWORD.value
    }
}


