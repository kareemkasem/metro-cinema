const deleteMovie = async (btn, id, csrfToken) => {
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
