function initialApplication() {
  const timestamp = new Date().toISOString();
  document.getElementById("date").textContent = timestamp;

  const colors = [
    "#3B93A5",
    "#F7B844",
    "#EF6537",
    "#EC3C65",
    "#C0ADDB",
    "#C1F666",
  ];

  const chartOneData = {
    labels: ["X", "Y", "M", "N", "R", "Q"],
    datasets: [
      {
        data: [10, 20, 30, 40, 50, 60],
        backgroundColor: colors,
      },
    ],
  };

  const chartTwoData = {
    series: [
      {
        data: [
          { x: "X", y: 10 },
          { x: "Y", y: 20 },
          { x: "M", y: 30 },
          { x: "N", y: 40 },
          { x: "R", y: 50 },
          { x: "Q", y: 60 },
        ],
      },
    ],
    chart: { type: "treemap", height: 300, animations: { enabled: false } },
    plotOptions: {
      treemap: { distributed: true, enableShades: false },
    },
    colors,
  };

  new Chart(document.getElementById("chart-1").getContext("2d"), {
    type: "pie",
    data: chartOneData,
  });

  new ApexCharts(document.getElementById("chart-2"), chartTwoData).render();

  const family = {
    children: ["Alex", "Daniel", "Helen", "Jessica"],
    father: "John",
    mother: "Sarah",
  };

  [family.mother, family.father, ...family.children].forEach((name) => {
    const tag = document.createElement("li");
    tag.textContent = name;

    document.getElementById("names").append(tag);
  });
}

initialApplication();
