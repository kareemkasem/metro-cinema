const deleteMovie = async (btn, id, csrfToken) => {
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

const changeMoviePinnedState = async (btn, id, csrfToken) => {
  try {
    const btnText = btn.innerText;
    const pinnedBadgeDisplay = btn
      .closest(".main-card")
      .querySelector(".pinned").style.display;

    btn.innerText = "....";

    await fetch("/admin/change-movie-pinned-state/" + id, {
      method: "POST",
      headers: {
        "csrf-token": csrfToken,
      },
    });

    btn.innerText = btnText === "Pin" ? "unPin" : "Pin";
    btn.closest(".main-card").querySelector(".pinned").style.display =
      pinnedBadgeDisplay === "none" ? "block" : "none";
  } catch (error) {
    console.log(error);
    document.getElementById("error-alert").innerText =
      "couldn't pin/unpin movie";
    document.getElementById("error-alert").style.display = "block";
  }
};
