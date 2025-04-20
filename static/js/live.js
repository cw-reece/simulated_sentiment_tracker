// static/js/live.js

document.addEventListener("DOMContentLoaded", () => {
  // data holders
  let tweets = [];
  let negativeReasons = [];

  // socket.io connection
  const socket = io();

  // on each incoming tweet:
  socket.on('new_tweet', tweet => {
    tweets.push(tweet);
    if (tweet.sentiment === 'negative') negativeReasons.push(tweet.reason);

    drawSentimentLive(tweets);
    drawReasonsLive(negativeReasons);
  });

  function drawSentimentLive(dataArray) {
    const counts = d3.rollups(dataArray, v => v.length, d => d.sentiment)
      .map(([sentiment, count]) => ({ sentiment, count }))
      .sort((a, b) => b.count - a.count);

    const container = d3.select("#chart-sentiment").html("");
    const margin = { top:20, right:20, bottom:40, left:60 },
          width  = 600 - margin.left - margin.right,
          height = 400 - margin.top  - margin.bottom;

    const svg = container.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(counts.map(d => d.sentiment))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(counts, d => d.count)]).nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(counts.map(d => d.sentiment));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(counts)
      .join("rect")
        .attr("class", "bar")
        .attr("x",      d => x(d.sentiment))
        .attr("y",      d => y(d.count))
        .attr("width",  x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill",   d => color(d.sentiment));
  }

  function drawReasonsLive(dataArray) {
    const counts = d3.rollups(dataArray, v => v.length, d => d)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const container = d3.select("#chart-reasons").html("");
    const margin = { top:20, right:20, bottom:100, left:60 },
          width  = 600 - margin.left - margin.right,
          height = 400 - margin.top  - margin.bottom;

    const svg = container.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(counts.map(d => d.reason))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(counts, d => d.count)]).nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(counts.map(d => d.reason));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(counts)
      .join("rect")
        .attr("class", "bar")
        .attr("x",      d => x(d.reason))
        .attr("y",      d => y(d.count))
        .attr("width",  x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill",   d => color(d.reason));
  }
});
