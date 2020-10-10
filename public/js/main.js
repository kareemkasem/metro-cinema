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
    console.log(error);
    document.getElementById("error-alert").innerText =
      "couldn't hide/unhide movie";
    document.getElementById("error-alert").style.display = "block";
  }
};
