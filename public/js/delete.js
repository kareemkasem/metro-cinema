const deleteMovie = async (btn) => {
  const id = btn.parentNode.querySelector("#id").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  console.log(id);

  try {
    btn.innerText = "deleting ....";
    await fetch("/admin/delete-movie/" + id, {
      method: "DELETE",
      headers: {
        "csrf-token": csrfToken,
      },
    });
    btn.closest(".main-card").remove();
  } catch (err) {
    document.getElementById("delete-movie-alert").style.display = "block";
  }
};
