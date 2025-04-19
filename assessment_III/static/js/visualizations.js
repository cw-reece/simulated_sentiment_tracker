// visualizations.js - D3 v7 multiple charts with per‑bar colors

// Draw sentiment distribution bar chart
function drawSentiment(filterAirline) {
  d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv").then(function(data) {
    // 1) Filter if airline selected
    let filtered = data;
    if (filterAirline && filterAirline !== "All") {
      filtered = filtered.filter(d => d.airline === filterAirline);
    }

    // 2) Count by sentiment
    const counts = d3.rollups(filtered, v => v.length, d => d.airline_sentiment)
      .map(([sentiment, count]) => ({ sentiment, count }))
      .sort((a, b) => b.count - a.count);

    // 3) Clear old
    const container = d3.select("#chart-sentiment");
    container.selectAll("*").remove();

    // 4) Set dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width  = 600 - margin.left - margin.right;
    const height = 400 - margin.top  - margin.bottom;

    const svg = container.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 5) Scales
    const x = d3.scaleBand()
      .domain(counts.map(d => d.sentiment))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(counts, d => d.count)]).nice()
      .range([height, 0]);

    // 6) Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(counts.map(d => d.sentiment));

    // 7) Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // 8) Bars
    svg.selectAll(".bar")
      .data(counts)
      .join("rect")
        .attr("class", "bar")
        .attr("x",      d => x(d.sentiment))
        .attr("y",      d => y(d.count))
        .attr("width",  x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill",   d => color(d.sentiment));
  });
}

// Draw negative reason breakdown for negative tweets
function drawReasons(filterAirline) {
  d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv").then(function(data) {
    // 1) Filter negative, then by airline
    let filtered = data.filter(d => d.airline_sentiment === "negative");
    if (filterAirline && filterAirline !== "All") {
      filtered = filtered.filter(d => d.airline === filterAirline);
    }

    // 2) Count reasons, map blanks → "Unknown"
    const counts = d3.rollups(
      filtered,
      v => v.length,
      d => (d.negative_reason && d.negative_reason.trim()) || "Unknown"
    )
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

    // 3) Clear old
    const container = d3.select("#chart-reasons");
    container.selectAll("*").remove();

    // 4) Set dimensions
    const margin = { top: 20, right: 20, bottom: 100, left: 60 };
    const width  = 600 - margin.left - margin.right;
    const height = 400 - margin.top  - margin.bottom;

    const svg = container.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 5) Scales
    const x = d3.scaleBand()
      .domain(counts.map(d => d.reason))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(counts, d => d.count)]).nice()
      .range([height, 0]);

    // 6) Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(counts.map(d => d.reason));

    // 7) Draw axes
    const xAxisG = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // rotate tick labels
    xAxisG.selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    // 8) Bars
    svg.selectAll(".bar")
      .data(counts)
      .join("rect")
        .attr("class", "bar")
        .attr("x",      d => x(d.reason))
        .attr("y",      d => y(d.count))
        .attr("width",  x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill",   d => color(d.reason));
  });
}

// initial draw
drawSentiment("All");
drawReasons("All");
