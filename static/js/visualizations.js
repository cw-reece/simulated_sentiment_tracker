


const grouping = {
  "Delta": ["Delta", "JetBlue", "Spirit"]
};


function filterData(data, airline) {
  if (!airline || airline === "All") return data;

  if (grouping[airline]) {
    return data.filter(d => grouping[airline].includes(d.airline));
  }

  return data.filter(d => d.airline === airline);
}


function drawSentiment(filterAirline) {
  d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv")
    .then(function(data) {

      const subset = filterData(data, filterAirline);


      const counts = Array.from(
        d3.rollup(subset, v => v.length, d => d.airline_sentiment)
      ).map(([sentiment, count]) => ({ sentiment, count }))
       .sort((a, b) => b.count - a.count);


      const container = d3.select("#chart-sentiment");
      container.selectAll("*").remove();


      const margin = { top: 20, right: 20, bottom: 60, left: 60 },
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
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("font-size", "14px");

      svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
          .attr("font-size", "14px");


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


function drawReasons(filterAirline) {
  d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv")
    .then(function(data) {

      let subset = filterData(data, filterAirline)
        .filter(d => d.airline_sentiment === "negative");


      const counts = Array.from(
        d3.rollup(
          subset,
          v => v.length,
          d => (d.negative_reason && d.negative_reason.trim()) || "Unknown"
        )
      ).map(([reason, count]) => ({ reason, count }))
       .sort((a, b) => b.count - a.count);


      const container = d3.select("#chart-reasons");
      container.selectAll("*").remove();


      const margin = { top: 20, right: 20, bottom: 80, left: 60 },
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


      const xAxisG = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      xAxisG.selectAll("text")
        .attr("font-size", "14px")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
          .attr("font-size", "14px");


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


drawSentiment("All");
drawReasons("All");
