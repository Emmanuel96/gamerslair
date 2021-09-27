const forgotPassword = (event)=>{
    event.preventDefault()
    var email = $('#email').val()
    data = {email}


    fetch('/forgot-password', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then((data)=>{
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
$("#forgotPasswordBtn").on('click', forgotPassword)