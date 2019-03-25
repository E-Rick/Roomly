let newPasswordValue, confirmationValue;
const form = document.querySelector('form'),
  newPassword = document.getElementById('new-password'),
  confirmation = document.getElementById('password-confirmation'),
  validationMessage = document.getElementById('validation-message');
function validatePasswords(message, add, remove) {
  validationMessage.textContent = message;
  validationMessage.classList.add(add);
  validationMessage.classList.remove(remove);
}
confirmation.addEventListener('input', e => {
  newPasswordValue = newPassword.value;
  confirmationValue = confirmation.value;
  if (newPasswordValue !== confirmationValue) {
    validatePasswords('Passwords must match!', 'error', 'success');
  } else {
    validatePasswords('Passwords must match!', 'success', 'error');
  }
});

form.addEventListener('submit', e => {
  if (newPasswordValue !== confirmationValue) {
    e.preventDefault();
    const error = document.getElementById('error');
    if (!error) {
      const flashErrorH1 = document.createElement('div');
      flashErrorH1.classList.add('error');
      flashErrorH1.setAttribute('id', 'error');
      flashErrorH1.setAttribute('class', 'alert alert-danger');
      flashErrorH1.textContent = 'Passwords must match!';
      const navbar = document.getElementById('show-error');
      navbar.parentNode.insertBefore(flashErrorH1, navbar.nextSibling);
    }
  }
});
