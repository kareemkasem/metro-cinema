deleteMovie = async (btn, id, csrfToken) => {
  try {
    btn.innerText = "....";
    await fetch("/admin/delete-movie/" + id, {
      method: "DELETE",
      headers: {
        "csrf-token": csrfToken,
      },
    });
    btn.closest(".main-card").remove();
  } catch (err) {
    document.getElementById("error-alert").innerText = "couldn't delete movie";
    document.getElementById("error-alert").style.display = "block";
  }
};
