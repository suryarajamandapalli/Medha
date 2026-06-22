export class RadarChart {
    constructor() {
        this.ctx = document.getElementById('skillRadar').getContext('2d');
        this.chart = null;
        this.init();
    }

    init() {
        this.chart = new Chart(this.ctx, {
            type: 'radar',
            data: {
                labels: ['Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks'],
                datasets: [{
                    label: 'Mastery',
                    data: [10, 10, 10, 10], // Initial values
                    backgroundColor: 'rgba(0, 242, 255, 0.2)',
                    borderColor: '#00f2ff',
                    pointBackgroundColor: '#00f2ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00f2ff'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } },
                        ticks: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    update(masteryArray) {
        this.chart.data.datasets[0].data = masteryArray;
        this.chart.update();
    }
}
