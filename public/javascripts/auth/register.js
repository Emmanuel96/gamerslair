function registerUser(event){
    event.preventDefault()

    var password = document.getElementById('inputPassword').value
    var confirmPassword = document.getElementById('inputConfirmPassword').value

    if(password !== confirmPassword){
        alert('Passwords must match')
        return
    }

    var email = document.getElementById('inputEmail').value
    var firstName = document.getElementById('inputFirstName').value 
    var lastName = document.getElementById('inputLastName').value
    var phoneNumber = document.getElementById('inputPhoneNumber').value 
    var xboxId = document.getElementById('inputXboxId').value 
    var playstationId = document.getElementById('inputPlaystationId').value

    authData = {email, firstName, lastName, phoneNumber, xboxId, playstationId, password}

    fetch('/register', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify(authData)
    }).then(response => response.json())
      .then(data =>{
            if(data.success != true){
                swal.fire({
                    text: data.message,
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-primary"
                    }
                });
            }else{
                swal.fire({
                    text: data.message,
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-primary"
                    }
                });
            }
      })
}

var registerForm = document.getElementById('registerForm')

registerForm.addEventListener('submit', registerUser)

