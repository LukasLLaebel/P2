document.querySelectorAll('h2').forEach(tag => {
  tag.addEventListener('click', () => {
    const action = tag.dataset.action;

    if (action === "owner") {
      alert("Jeff clicked!");
    }

    if (action === "colab-users") {
      alert("Users clicked!");
    }
  });
});
