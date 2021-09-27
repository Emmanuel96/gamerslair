const resetPassword = (event)=>{
    event.preventDefault()
    var password = $('#password').val()
    var confirmPassword = $('#confirmPassword').val()

    if(password != confirmPassword){
        fireSwal(false, "Passwords must match!")
        return; 
    }
    var token = $('#token').val()
    data = {password, token}

    fetch('/reset-password', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then((data)=>{
        if(data.success != true){
            fireSwal(data.success, data.message)
        }else{
            fireSwal(data.success, data.message, '/login')
        }
      })
}

function fireSwal(successValue, text, redirect = null){
    icon = "success"
    if(successValue !== true){
        icon = "error"
    }
    swal.fire({
        text: text, 
        icon: icon, 
        buttonsStyling: false, 
        confirmButtonText: "Ok, got it!", 
        customClass: {
            confirmButton: "btn font-weight-bold btn-primary"
        }
    }).then(()=>{
        if(redirect){
            window.location.href = `${redirect}`
        }
    })
}

$('#resetPasswordForm').submit(resetPassword)