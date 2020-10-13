const changeMovieHiddenState = async (btn, id, csrfToken) => {
  try {
    const btnInnerHTML = btn.innerHTML;
    const btnTitle = btn.title;
    const hiddenBadgeDisplay = btn
      .closest(".main-card")
      .querySelector("#hidden-badge").style.display;

    btn.innerHTML = "....";

    await fetch("/admin/change-movie-hidden-state/" + id, {
      method: "POST",
      headers: {
        "csrf-token": csrfToken,
      },
    });

    btn.title = btnTitle === "Hide" ? "UnHide" : "Hide";
    btn.innerHTML =
      btnInnerHTML === '<i class="far fa-eye-slash"></i>'
        ? '<i class="far fa-eye-">'
        : '<i class="far fa-eye-slash">';

    btn.closest(".main-card").querySelector("#hidden-badge").style.display =
      hiddenBadgeDisplay === "none" ? "block" : "none";
  } catch (error) {
    document.getElementById("error-alert").innerText =
      "couldn't hide/unhide movie";
    document.getElementById("error-alert").style.display = "block";
  }
};
