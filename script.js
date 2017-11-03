const createDot = (chart, id, fromColor, toColor) => {
  const cyclistDot = chart.append('defs')
    .append('radialGradient')
    .attr('id', id)
    .attr('fy', '40%')
    .attr('fx', '40%');

  cyclistDot.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', fromColor);
  cyclistDot.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', toColor);
};

const setAxisLabels = (chart, width, height) => {
  chart.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .classed('axis-text', true)
    .text('Seconds behind fastest time');

  chart.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 20)
    .attr('x', -height / 2)
    .classed('axis-text', true)
    .text('Ranking');
};

const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  const margin = {
    top: 10, left: 10, bottom: 20, right: 10,
  };
  const viewBox = { width: 1000, height: 600 };
  const width = viewBox.width - margin.left - margin.right;
  const height = viewBox.height - margin.top - margin.bottom;
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([0, height]);
  const xAxis = d3.axisBottom().scale(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft().scale(yScale).tickSizeOuter(0);
  const chart = d3.select('.chart')
    .attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  createDot(chart, 'dopingDot', 'rgb(255, 129, 120)', 'rgb(255, 23, 23)');
  createDot(chart, 'cleanDot', 'rgb(129, 255, 120)', 'rgb(23, 255, 23)');
  setAxisLabels(chart, width, height);

  d3.json(fetchURL, (error, data) => {
    const fastestTime = d3.min(data, ({ Seconds }) => Seconds);
    const slowestTime = d3.max(data, ({ Seconds }) => Seconds);

    xAxis.tickFormat(seconds => seconds - fastestTime)
      .tickValues(d3.ticks(fastestTime, slowestTime, 15));
    yAxis.tickValues(data
      .filter(({ Place }) => Place % 5 === 0 || Place === 1)
      .map(({ Place }) => Place));
    xScale.domain([fastestTime - 3, slowestTime]);
    yScale.domain([1, d3.max(data, ({ Place }) => Place + 1)]);

    chart.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .classed('cyclist-dot', true)
      .attr('cx', ({ Seconds }) => xScale(Seconds))
      .attr('cy', ({ Place }) => yScale(Place))
      .attr('fill', ({ Doping }) => `url(#${Doping === '' ? 'clean' : 'doping'}Dot)`);

    chart.append('g').call(yAxis);
    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
  });
};

window.onload = startApp;
