// find room edit form
const roomEditForm = document.getElementById('roomEditForm');
// add submit listener to room edit form
roomEditForm.addEventListener('submit', event => {
  // find length of uploaded images
  const imageUploads = document.getElementById('imageUpload').files.length,
    // find total number of existing images
    existingImgs = document.querySelectorAll('.imageDeleteCheckbox').length,
    // find total number of potential deletions
    imgDeletions = document.querySelectorAll('.imageDeleteCheckbox:checked').length,
    // figure out if the form can be submitted or not
    newTotal = existingImgs - imgDeletions + imageUploads;
  if (newTotal > 4) {
    event.preventDefault();
    const removalAmt = newTotal - 4;
    alert(`You need to remove at least ${removalAmt} (more) image${removalAmt === 1 ? '' : 's'}`);
  }
});
