// README: add <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"></script>
//		   and <script src="firebase/lineChart.js"></script> into the html file
//		   ctx=document.getElementById(canvasID).getContext('2d')
function renderChart(ctx, labels, data, titleText){
	var chart = new Chart(ctx, {
		type: 'scatter',
		// The data for our dataset
		data: {
			labels: labels,
			datasets: [{
			fill: false,
			backgroundColor: '#e89980',
			borderColor: '#e89980',
			data: data
			}]
		},
		// Configuration options go here
		options: {
            scales:{
                xAxes:[{
                    ticks:{
                        stepSize:1
                    }
                }]
            },
			tooltips: {
				displayColors:false,
				callbacks:{
					label: function(tooltipItem, data){
						return "第" + tooltipItem.xLabel + "週：" +  tooltipItem.yLabel;
					}
				}
			},
			animation:{duration: 0},
			legend: {display: false},
			title: {
                fontSize: 16,
				display: true,
				text: titleText
			},
			onClick: (click)=>{
				var link = document.createElement('a');
				link.href = click.originalTarget.toDataURL();
				link.download = 'lineChart.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	});
    return chart
}

Chart.plugins.register({
	beforeDraw: (chartInstance)=>{
		var chart = chartInstance.chart;
		chart.ctx.fillStyle = 'white';
		chart.ctx.fillRect(0, 0, chart.width, chart.height);
	}
});
