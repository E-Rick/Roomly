let newPasswordValue, confirmationValue;
const submitBtn = document.getElementById('submit'),
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
    submitBtn.setAttribute('disabled', true);
  } else {
    validatePasswords('Passwords match!', 'success', 'error');
    submitBtn.removeAttribute('disabled');
  }
});
