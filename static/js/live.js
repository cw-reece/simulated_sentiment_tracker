
const tweets = [];
const negativeReasons = [];

const socket = io();


socket.on('new_tweet', tweet => {
  tweets.push(tweet);
  if (tweet.sentiment === 'negative') {
    negativeReasons.push(tweet.reason || 'Unknown');
  }
  drawSentimentLive();
  drawReasonsLive();
});

// Draw/up‐date sentiment distribution
function drawSentimentLive() {
  const counts = Array.from(
    d3.rollup(tweets, v => v.length, d => d.sentiment)
  ).map(([sentiment, count]) => ({ sentiment, count }));

  const container = d3.select('#chart-sentiment-live');
  container.selectAll('*').remove();

  const margin = { top:20, right:20, bottom:60, left:60 },
        width  = 500 - margin.left - margin.right,
        height = 350 - margin.top  - margin.bottom;

  const svg = container.append('svg')
    .attr('width',  width + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(counts.map(d => d.sentiment))
    .range([0, width]).padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(counts, d => d.count) || 1]).nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(counts.map(d => d.sentiment));

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
      .attr('font-size','12px');

  svg.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
      .attr('font-size','12px');

  svg.selectAll('.bar')
    .data(counts)
    .join('rect')
      .attr('class','bar')
      .attr('x',      d => x(d.sentiment))
      .attr('y',      d => y(d.count))
      .attr('width',  x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill',   d => color(d.sentiment));
}

// Draw/up‐date negative reasons breakdown
function drawReasonsLive() {
  const counts = Array.from(
    d3.rollup(negativeReasons, v => v.length, d => d)
  ).map(([reason, count]) => ({ reason, count }));

  const container = d3.select('#chart-reasons-live');
  container.selectAll('*').remove();

  const margin = { top:20, right:20, bottom:100, left:60 },
        width  = 500 - margin.left - margin.right,
        height = 350 - margin.top  - margin.bottom;

  const svg = container.append('svg')
    .attr('width',  width + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(counts.map(d => d.reason))
    .range([0, width]).padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(counts, d => d.count) || 1]).nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(counts.map(d => d.reason));

  const xAxisG = svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  xAxisG.selectAll('text')
    .attr('font-size','12px')
    .attr('transform','rotate(-45)')
    .style('text-anchor','end');

  svg.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
      .attr('font-size','12px');

  svg.selectAll('.bar')
    .data(counts)
    .join('rect')
      .attr('class','bar')
      .attr('x',      d => x(d.reason))
      .attr('y',      d => y(d.count))
      .attr('width',  x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill',   d => color(d.reason));
}
