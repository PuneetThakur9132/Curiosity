window.onload = function () {
  let followers = document.getElementById("followers").textContent;
  followers = Number(followers);

  let followings = document.getElementById("followings").textContent;
  followings = Number(followings);

  let answered = document.getElementById("answered").textContent;
  answered = Number(answered);

  let asked = document.getElementById("asked").textContent;
  asked = Number(asked);

  const ctx = document.getElementById("myChart").getContext("2d");

  const myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["followers", "followings", "answered", "asked"],
      datasets: [
        {
          label: "# of Actions",
          data: [followers, followings, answered, asked],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  document
    .querySelector("input[type='file']")
    .addEventListener("change", function () {
      this.form.submit();
    });
};
