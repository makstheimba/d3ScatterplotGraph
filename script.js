const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  const margin = {
    top: 10, left: 30, bottom: 20, right: 10,
  };
  const viewBox = { width: 1000, height: 600 };
  const width = viewBox.width - margin.left - margin.right;
  const height = viewBox.height - margin.top - margin.bottom;
  const yScale = d3.scaleLinear().range([0, height]);
  const xScale = d3.scaleLinear().range([0, width]);
  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);
  const chart = d3.select('.chart')
    .attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  d3.json(fetchURL, (error, data) => {
    const fastestTime = d3.min(data, entry => entry.Seconds);
    const cyclistDot = chart.append('defs')
      .append('radialGradient')
      .attr('id', 'dot')
      .attr('fy', '40%')
      .attr('fx', '40%');

    cyclistDot.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgb(255, 129, 120)');
    cyclistDot.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgb(255, 23, 23)');

    xAxis.tickFormat(seconds => seconds - fastestTime);
    xScale.domain(d3.extent(data, entry => entry.Seconds));
    yScale.domain(d3.extent(data, entry => entry.Place));

    chart.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .classed('cyclist-dot', true)
      .attr('cx', entry => xScale(entry.Seconds))
      .attr('cy', entry => yScale(entry.Place))
      .attr('fill', 'url(#dot');

    chart.append('g').call(yAxis);
    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
  });
};

window.onload = startApp;
