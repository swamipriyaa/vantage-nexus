import { useState } from "react";
/**
 * 1. Pricing Comparison Chart
 * Rendered as clean, sleek horizontal glowing bars with relative scales
 */
export function PricingChart({ competitors, ourProductPrice, ourProductName }) {
  const allPrices = [
    { name: ourProductName, price: ourProductPrice, isUs: true },
    ...competitors.map(c => ({
      name: c.name,
      price: c.pricing?.pro !== undefined ? c.pricing.pro : (c.pricing?.basic || 0),
      isUs: false
    }))
  ];

  const maxPrice = Math.max(...allPrices.map(p => p.price), 10);

  return (
    <div className="chart-container pricing-chart">
      <div className="chart-header">
        <h4 className="chart-title">Monthly Pro/Basic Pricing Tier ($)</h4>
        <p className="chart-subtitle">Direct cost comparison of our product vs competitors</p>
      </div>

      <div className="pricing-bar-list">
        {allPrices.map((item, idx) => {
          const percentage = (item.price / maxPrice) * 100;
          return (
            <div key={idx} className={`pricing-bar-item ${item.isUs ? "is-us" : ""}`}>
              <div className="pricing-bar-meta">
                <span className="pricing-bar-name">{item.name}</span>
                <span className="pricing-bar-value">
                  {item.price === 0 ? "Included" : `$${item.price}/mo`}
                </span>
              </div>
              <div className="pricing-bar-track">
                <div 
                  className="pricing-bar-fill" 
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                >
                  <div className="pricing-bar-glow" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 2. Competitor Positioning Scatter Graph
 * Plots competitors on a 2D quadrant scale (X = Affordability, Y = Innovation)
 */
export function PositioningGraph({ competitors, ourProductName }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Normalise 1-10 to percentage positions on the SVG graph (padding left 10%, right 90%)
  const getCoordinates = (val) => {
    return 10 + (val - 1) * (80 / 9);
  };

  const nodes = [
    {
      name: ourProductName,
      x: 9, // Highly affordable
      y: 9.5, // Highly innovative
      isUs: true,
      valueProp: "Our custom strategic differentiator with full feature-coverage."
    },
    ...competitors.map(c => ({
      name: c.name,
      x: c.positioning?.affordability || 5,
      y: c.positioning?.innovation || 5,
      isUs: false,
      valueProp: c.valueProp || "Leading competitor offering standard market services."
    }))
  ];

  return (
    <div className="chart-container positioning-chart">
      <div className="chart-header">
        <h4 className="chart-title">Market Positioning Matrix</h4>
        <p className="chart-subtitle">Quadrant visualization mapping innovation vs cost efficiency</p>
      </div>

      <div className="positioning-grid-wrapper">
        <svg viewBox="0 0 100 100" className="positioning-svg">
          {/* Quadrant Shading Backgrounds */}
          <rect x="5" y="5" width="45" height="45" className="positioning-quadrant-bg-premium" />
          <rect x="50" y="5" width="45" height="45" className="positioning-quadrant-bg-leaders" />
          <rect x="5" y="50" width="45" height="45" className="positioning-quadrant-bg-laggards" />
          <rect x="50" y="50" width="45" height="45" className="positioning-quadrant-bg-commodity" />

          {/* Grid lines and Quadrants */}
          <line x1="50" y1="5" x2="50" y2="95" className="grid-axis" strokeDasharray="2,2" />
          <line x1="5" y1="50" x2="95" y2="50" className="grid-axis" strokeDasharray="2,2" />

          {/* Quadrant Labels */}
          <text x="25" y="10" className="quadrant-label">High Innovation / Premium Price</text>
          <text x="75" y="10" className="quadrant-label highlight">Leaders (High Tech / High Value)</text>
          <text x="25" y="90" className="quadrant-label">Laggards (Legacy / Basic)</text>
          <text x="75" y="90" className="quadrant-label">Commodity (Simple / Budget)</text>

          {/* Axis Titles */}
          <text x="50" y="98" className="axis-title-text" textAnchor="middle">Affordability (1 = Expensive → 10 = Free)</text>
          
          <text 
            x="3" 
            y="50" 
            className="axis-title-text axis-y-title" 
            textAnchor="middle" 
            transform="rotate(-90, 3, 50)"
          >
            Product Innovation (1 = Legacy → 10 = Disrupter)
          </text>

          {/* Render Nodes */}
          {nodes.map((node, idx) => {
            const cx = getCoordinates(node.x);
            const cy = 100 - getCoordinates(node.y); // invert Y for standard math rendering

            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`positioning-node-group ${node.isUs ? "is-us" : ""}`}
              >
                {/* Glow ring */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={node.isUs ? 5 : 3.5} 
                  className={`node-glow-ring ${node.isUs ? "pulse-anim" : ""}`} 
                />
                {/* Actual node */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={node.isUs ? 3 : 2.2} 
                  className="node-dot" 
                />
                {/* Visual anchor tag */}
                <text 
                  x={cx} 
                  y={cy - 4} 
                  textAnchor="middle" 
                  className={`node-label ${node.isUs ? "is-us" : ""}`}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredNode && (
          <div className="positioning-tooltip">
            <div className="tooltip-header">
              <span className={`tooltip-tag ${hoveredNode.isUs ? "is-us" : ""}`}>
                {hoveredNode.isUs ? "Our Product" : "Competitor"}
              </span>
              <h5 className="tooltip-name">{hoveredNode.name}</h5>
            </div>
            <p className="tooltip-desc">{hoveredNode.valueProp}</p>
            <div className="tooltip-metrics">
              <div>
                <span>Innovation:</span>
                <strong>{hoveredNode.y}/10</strong>
              </div>
              <div>
                <span>Affordability:</span>
                <strong>{hoveredNode.x}/10</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 3. Feature Gap Analysis Chart
 * Compares feature density. Lists each feature and details what % of competitors offer it.
 */
export function FeatureGapAnalysis({ competitors, featuresList, ourProductFeatures }) {
  const totalCompetitors = competitors.length;

  const gapStats = featuresList.map(feature => {
    const offeringCompetitors = competitors.filter(c => c.features && c.features[feature] === true);
    const count = offeringCompetitors.length;
    const percentage = Math.round((count / totalCompetitors) * 100);
    const competitorsWithIt = offeringCompetitors.map(c => c.name);

    return {
      feature,
      competitorCount: count,
      percentage,
      competitorsWithIt,
      ourProductHas: ourProductFeatures[feature] === true
    };
  });

  return (
    <div className="chart-container feature-gap-chart">
      <div className="chart-header">
        <h4 className="chart-title">Competitive Feature Gap Analysis</h4>
        <p className="chart-subtitle">Market adoption rate of key features (Low adoption = High market gap opportunity)</p>
      </div>

      <div className="gap-bar-list">
        {gapStats.map((stat, idx) => {
          return (
            <div key={idx} className="gap-item">
              <div className="gap-meta">
                <div className="gap-feature-name-box">
                  <span className="gap-feature-name">{stat.feature}</span>
                  {stat.percentage <= 40 ? (
                    <span className="gap-tag premium-gap">High Gap Advantage</span>
                  ) : stat.percentage >= 80 ? (
                    <span className="gap-tag commoditized">Commoditized</span>
                  ) : (
                    <span className="gap-tag moderate">Standard Feature</span>
                  )}
                </div>
                <div className="gap-numeric">
                  <span>Competitor Adoption: <strong>{stat.percentage}%</strong></span>
                  <span className="gap-fraction">({stat.competitorCount}/{totalCompetitors})</span>
                </div>
              </div>
              <div className="gap-progress-track">
                {/* Our Product indicator */}
                <div className="our-indicator-anchor" style={{ left: "100%" }}>
                  <div className="our-badge">Vantage Core</div>
                </div>

                <div 
                  className={`gap-progress-fill ${stat.percentage >= 80 ? "high" : stat.percentage <= 30 ? "low" : "medium"}`} 
                  style={{ width: `${stat.percentage}%` }}
                >
                  <div className="fill-glow" />
                </div>
              </div>
              
              <div className="gap-competitor-list-detail">
                {stat.competitorCount === 0 ? (
                  <span className="no-competitors-text">No market coverage. Uncontested monopoly potential.</span>
                ) : (
                  <span>
                    Supported by: {stat.competitorsWithIt.join(", ")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 4. Market Landscape Overview Map
 * A beautifully styled segment grid displaying estimated numbers, segments, and growth indicators.
 */
export function MarketLandscapeMap({ marketLandscape, industry }) {
  if (!marketLandscape) return null;

  return (
    <div className="market-landscape-widget">
      <div className="market-intro">
        <span className="market-pill">{industry}</span>
        <h3 className="market-main-title">Global TAM & Segment Map</h3>
      </div>

      <div className="market-metrics-grid">
        <div className="market-metric-card primary-glow">
          <div className="metric-icon-bg">
            <span className="metric-label" style={{ color: "var(--primary-indigo)", fontSize: "16px", fontWeight: "bold" }}>TAM</span>
          </div>
          <div className="metric-text">
            <span className="metric-label">Total Addressable Market (TAM)</span>
            <h4 className="metric-value">{marketLandscape.size}</h4>
          </div>
        </div>

        <div className="market-metric-card secondary-glow">
          <div className="metric-icon-bg">
            <span className="metric-label" style={{ color: "var(--secondary-emerald)", fontSize: "16px", fontWeight: "bold" }}>CAGR</span>
          </div>
          <div className="metric-text">
            <span className="metric-label">Market Growth Vector</span>
            <h4 className="metric-value">{marketLandscape.growthRate}</h4>
          </div>
        </div>
      </div>

      <h5 className="segments-title">Identified High-Value Customer Segments</h5>
      <div className="segments-grid">
        {marketLandscape.segments?.map((segment, idx) => (
          <div key={idx} className="segment-card">
            <div className="segment-indicator">
              <span className="segment-number">0{idx + 1}</span>
              <div className="segment-ping" />
            </div>
            <p className="segment-name">{segment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
