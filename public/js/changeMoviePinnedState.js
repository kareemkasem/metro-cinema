const changeMoviePinnedState = async (btn, id, csrfToken) => {
  try {
    const btnHTML = btn.innerHTML;
    const btnTitle = btn.title;
    const pinnedBadgeDisplay = btn
      .closest(".main-card")
      .querySelector("#pinned-badge").style.display;

    btn.innerText = "....";

    await fetch("/admin/change-movie-pinned-state/" + id, {
      method: "POST",
      headers: {
        "csrf-token": csrfToken,
      },
    });

    btn.title = btnTitle === "Pin" ? "UnPin" : "Pin";
    btn.innerHTML =
      btnHTML === '<i class="far fa-thumbs-up"></i>'
        ? '<i class="far fa-thumbs-down"></i>'
        : '<i class="far fa-thumbs-up"></i>';
    btn.closest(".main-card").querySelector("#pinned-badge").style.display =
      pinnedBadgeDisplay === "none" ? "block" : "none";
  } catch (error) {
    console.log(error);
    document.getElementById("error-alert").innerText =
      "couldn't pin/unpin movie";
    document.getElementById("error-alert").style.display = "block";
  }
};
