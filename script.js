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

const drawLabels = (chart, width, height) => {
  chart.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .classed('text', true)
    .text('Seconds behind fastest time');

  chart.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -25)
    .attr('x', -27)
    .classed('text', true)
    .text('Ranking');

  chart.append('text')
    .attr('x', width / 2)
    .attr('y', 10)
    .classed('text text--title', true)
    .text('35 Fastest bycicle times up Alpe d\'Huez');
};

const drawPerpendiculars = (chart, data, xScale, yScale) => {
  const axesPerpendicularLines = data.filter(({ Place }) => Place % 5 === 0 && Place !== 35);

  chart.selectAll('line')
    .data(axesPerpendicularLines)
    .enter()
    .append('line')
    .classed('perpendicular', true)
    .attr('y1', ({ Place }) => yScale(Place))
    .attr('x2', ({ Seconds }) => xScale(Seconds))
    .attr('y2', ({ Place }) => yScale(Place));
};

const drawLegendItem = (legendBox, legendType) => {
  const legendItemMargin = 15;
  const textHeight = 6;
  const lineHeight = 20;

  legendBox.append('circle')
    .classed('cyclist-dot', true)
    .attr('cx', legendItemMargin)
    .attr('cy', legendType === 'clean' ? legendItemMargin : legendItemMargin + lineHeight)
    .attr('fill', `url(#${legendType}Dot)`);

  legendBox.append('text')
    .attr('x', legendItemMargin * 2)
    .attr('y', legendType === 'clean'
      ? legendItemMargin + textHeight
      : legendItemMargin + lineHeight + textHeight)
    .classed('text text--start', true)
    .text(legendType === 'clean'
      ? 'No doping allegations'
      : 'Riders with doping allegations');
};

const drawLegend = (chart, height) => {
  const legendBoxHeight = 50;
  const legendBoxWidth = 260;
  const legendBoxMargin = 10;
  const legendBox = chart.append('g')
    .attr('transform', `translate(${legendBoxMargin}, ${height - legendBoxHeight - legendBoxMargin})`);

  legendBox.append('rect')
    .classed('info-box', true)
    .attr('height', legendBoxHeight)
    .attr('width', legendBoxWidth);

  drawLegendItem(legendBox, 'clean');
  drawLegendItem(legendBox, 'doping');
};

const drawTooltip = (chart, width) => {
  const tooltipHeight = 140;
  const tooltipWidth = 260;
  const tooltipTopMargin = 20;

  const tooltip = chart.append('g')
    .classed('tooltip', true)
    .attr('transform', `translate(${width - tooltipWidth}, ${tooltipTopMargin})`);

  tooltip.append('rect')
    .classed('info-box', true)
    .attr('height', tooltipHeight)
    .attr('width', tooltipWidth);

  tooltip.append('text')
    .classed('text initial-tip', true)
    .attr('x', tooltipWidth / 2)
    .attr('y', tooltipHeight / 2)
    .text('Hover over a dot to see rider\'s info');
};

const drawTooltipLables = (tooltip) => {
  const tooltipTextNodes = [
    { type: 'Nationality', x: 10, y: 50 },
    { type: 'Year', x: 10, y: 75 },
    { type: 'Time', x: 130, y: 75 },
  ];

  tooltip.select('.initial-tip').remove();

  tooltip.append('text')
    .classed('text Name', true)
    .attr('x', 130)
    .attr('y', 25);

  tooltip.append('text')
    .classed('text Doping1', true)
    .attr('x', 135)
    .attr('y', 100);

  tooltip.append('text')
    .classed('text Doping2', true)
    .attr('x', 135)
    .attr('y', 125);

  tooltipTextNodes.forEach((text) => {
    tooltip.append('text')
      .classed('text text--bold text--start', true)
      .attr('x', text.x)
      .attr('y', text.y)
      .text(text.type);

    tooltip.append('text')
      .classed(`text text--start ${text.type}`, true)
      .attr('x', text.x + (text.type.length === 4 ? 40 : 90))
      .attr('y', text.y);
  });
};

const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  const margin = {
    top: 20, left: 20, bottom: 20, right: 0,
  };
  const viewBox = { width: 1000, height: 600 };
  const width = viewBox.width - margin.left - margin.right;
  const height = viewBox.height - margin.top - margin.bottom;
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([0, height]);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);
  const chart = d3.select('.chart')
    .attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  createDot(chart, 'dopingDot', 'rgb(255, 129, 120)', 'rgb(255, 23, 23)');
  createDot(chart, 'cleanDot', 'rgb(129, 255, 120)', 'rgb(23, 255, 23)');
  drawLabels(chart, width, height);

  d3.json(fetchURL, (error, data) => {
    const [fastestTime, slowestTime] = d3.extent(data, ({ Seconds }) => Seconds);

    xAxis.tickFormat(seconds => seconds - fastestTime)
      .tickValues(d3.ticks(fastestTime, slowestTime, 15));
    yAxis.tickValues(data
      .filter(({ Place }) => Place % 5 === 0 || Place === 1)
      .map(({ Place }) => Place));
    xScale.domain([fastestTime - 3, slowestTime]);
    yScale.domain([1, d3.max(data, ({ Place }) => Place + 1)]);

    drawPerpendiculars(chart, data, xScale, yScale);
    drawLegend(chart, height);
    drawTooltip(chart, width);

    chart.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .classed('cyclist-dot', true)
      .attr('cx', ({ Seconds }) => xScale(Seconds))
      .attr('cy', ({ Place }) => yScale(Place))
      .attr('fill', ({ Doping }) => `url(#${Doping === '' ? 'clean' : 'doping'}Dot)`)
      .on('mouseover', function (entry) {
        const tooltip = d3.select('.tooltip');
        const tooltipInfoTypes = ['Name', 'Nationality', 'Year', 'Time'];

        if (!d3.select('.initial-tip').empty()) {
          drawTooltipLables(tooltip);
        }

        d3.select('.cyclist-dot--large').classed('cyclist-dot--large', false);

        tooltipInfoTypes.forEach((infoType) => {
          tooltip.select(`.${infoType}`)
            .text(entry[infoType]);
          
          if (entry.Doping === '') {
            tooltip.select('.Doping1').text('This rider has no doping allegations');
            tooltip.select('.Doping2').text('');
          } else {
            const maxStringLength = 34;
            const firstHalfIndex = entry.Doping.lastIndexOf(' ', maxStringLength);

            tooltip.select('.Doping1').text(entry.Doping.slice(0, firstHalfIndex));
            tooltip.select('.Doping2').text(entry.Doping.slice(firstHalfIndex));
          }
        });

        d3.select(this).classed('cyclist-dot--large', true);
      });

    chart.append('g').call(yAxis);
    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
  });
};

window.onload = startApp;
