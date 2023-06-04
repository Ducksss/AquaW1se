export const chartLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const chartData = {
  labels: chartLabels,
  datasets: [
    {
      borderColor: "#004EEB",
      fill: "origin",
      lineTension: 0.3,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 180);
        gradient.addColorStop(0, "#84ADFF");
        gradient.addColorStop(1, "rgba(132, 173, 255, 0)");
        return gradient;
      }
    }
  ]
};

export const chartOptions = {
  responsive: true,
  animations: {
    tension: {
      duration: 500,
      easing: "linear",
      from: 0,
      to: 0.3
    }
  },
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      ticks: {
        display: false
      },
      grid: {
        display: false
      },
      border: {
        display: false
      }
    }
  }
};
