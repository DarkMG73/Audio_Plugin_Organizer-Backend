var resetPasswordClickEvt = document.getElementById("resetPasswordClickEvt");

resetPasswordClickEvt.addEventListener("click", resetPasswordClicked);

function resetPasswordClicked(event) {
  event.preventDefault();
  var token = document.location.href.split("token=")[1];
  var data =
    "newPassword=" +
    document.getElementById("newPassword").value +
    "&verifyPassword=" +
    document.getElementById("verifyPassword").value +
    "&token=" +
    token;
  ajaxCall(
    data,
    "http://localhost:8000/api/users/auth/reset_password",
    function (status, response) {
      if (status == 200) {
        alert("successfully sent");
      } else {
        alert("Error", status);
      }
    }
  );
}

function ajaxCall(data, url, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", url, true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      console.log("xhttp.response", xhttp.response);
      return callback(this.status, xhttp.response);
    }
  };
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(data);
}
