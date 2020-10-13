deleteMovie = async (btn, id, csrfToken) => {
  try {
    const btnInnerHtml = btn.innerHTML;
    btn.innerHTML = "....";
    const response = await fetch("/admin/delete-movie/" + id, {
      method: "DELETE",
      headers: {
        "csrf-token": csrfToken,
      },
    });
    if (response.status === 200) {
      btn.closest(".main-card").remove();
    } else {
      btn.innerHTML = btnInnerHtml;
    }
  } catch (err) {
    document.getElementById("error-alert").innerText = "couldn't delete movie";
    document.getElementById("error-alert").style.display = "block";
  }
};
