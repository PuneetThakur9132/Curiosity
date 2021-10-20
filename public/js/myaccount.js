window.onload = function () {
  document
    .querySelector("input[type='file']")
    .addEventListener("change", function () {
      this.form.submit();
    });
};
