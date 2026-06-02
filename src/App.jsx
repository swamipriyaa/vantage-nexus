import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Settings, 
  Play, 
  Download, 
  Printer, 
  Search, 
  ExternalLink, 
  Mail, 
  Linkedin, 
  Layers, 
  TrendingUp, 
  Target, 
  ChevronDown, 
  Check, 
  X,
  AlertCircle,
  Shield,
  Briefcase,
  MapPin,
  Users,
  Compass,
  Cpu
} from "lucide-react";

import { PRESET_TEMPLATES } from "./mockData";
import { analyzeStartupWithGemini } from "./geminiService";
import { 
  PricingChart, 
  PositioningGraph, 
  FeatureGapAnalysis, 
  MarketLandscapeMap 
} from "./components/InteractiveCharts";

// Rotating loading messages - completely data-oriented, no AI fluff
const loadingMessages = [
  "Connecting to Vantage secure index feeds...",
  "Aggregating competitive indexing domains...",
  "Extracting feature schemas and parsing public pricing matrices...",
  "Calculating relative coordinate coordinates for positioning scatter grid...",
  "Compiling qualified B2B target companies matching segment demographics...",
  "Verifying executive decision makers and communication endpoints...",
  "Formulating strategic feature gap recommendations..."
];

export default function App() {
  // Key state management
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("VANTAGE_DATA_FEED_KEY") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("productivity-saas");
  const [activeTab, setActiveTab] = useState("competitors"); // 'competitors' | 'strategy' | 'leads'
  
  // Custom inputs
  const [customName, setCustomName] = useState("");
  const [customConcept, setCustomConcept] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  
  // Status states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(() => PRESET_TEMPLATES.find(t => t.id === "productivity-saas"));
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [expandedCompetitor, setExpandedCompetitor] = useState(0); // Index of expanded accordion competitor

  // Leads Filter states
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsIndustryFilter, setLeadsIndustryFilter] = useState("all");
  const [leadsMinConfidence, setLeadsMinConfidence] = useState(0);

  // Rotate loading texts while analyzing
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Save API key to localStorage
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem("VANTAGE_DATA_FEED_KEY", apiKey);
    setShowSettings(false);
  };

  // Perform Analysis
  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setExpandedCompetitor(0);
    setLoadingMessageIdx(0);

    // If using custom inputs but no API Key, block and notify
    if (customConcept.trim() && !apiKey) {
      setErrorMsg("An active Data Feed License Key is required to run live queries on custom concepts. Please open 'Data Feed Settings' in the top-right to enter a license key, or explore our pre-seeded blueprints!");
      setShowSettings(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      if (customConcept.trim()) {
        // Run live data generation using the license key
        const result = await analyzeStartupWithGemini({
          concept: customConcept,
          name: customName,
          websiteUrl: customUrl,
          industry: customIndustry,
          apiKey
        });
        setAnalysisData(result);
        setActiveTab("competitors");
      } else {
        // Reload preset data with a minor loading pause for UX polish
        await new Promise(resolve => setTimeout(resolve, 1500));
        const preset = PRESET_TEMPLATES.find(t => t.id === selectedTemplateId);
        setAnalysisData(preset);
        setActiveTab("competitors");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Unable to connect to the Vantage database feed. Please check your data feed license key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear custom fields and revert back to presets
  const handleResetInputs = (templateId = selectedTemplateId) => {
    setCustomName("");
    setCustomConcept("");
    setCustomUrl("");
    setCustomIndustry("");
    setErrorMsg("");
    const template = PRESET_TEMPLATES.find(t => t.id === templateId);
    setAnalysisData(template);
  };

  // Trigger print PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Export Competitors list to CSV
  const handleExportCompetitorsCSV = () => {
    if (!analysisData || !analysisData.competitors) return;
    
    const headers = ["Competitor Name", "Website", "Value Proposition", "Target Demographic", "Innovation Score", "Affordability Score", "Strengths", "Weaknesses"];
    const rows = analysisData.competitors.map(c => [
      c.name,
      c.url,
      `"${(c.valueProp || "").replace(/"/g, '""')}"`,
      `"${(c.audience || "").replace(/"/g, '""')}"`,
      c.positioning?.innovation || 5,
      c.positioning?.affordability || 5,
      `"${c.strengths?.join(" | ").replace(/"/g, '""')}"`,
      `"${c.weaknesses?.join(" | ").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${analysisData.name.toLowerCase().replace(/\s+/g, "_")}_competitors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Leads to CSV
  const handleExportLeadsCSV = () => {
    if (!analysisData || !analysisData.leads) return;

    const headers = ["Company", "Website", "Industry", "Employee Size", "Location", "Contact Person", "Job Title", "Email", "LinkedIn Profile", "Confidence Score", "Pitch Relevance"];
    const rows = filteredLeads.map(l => [
      l.company,
      l.website,
      l.industry,
      l.size,
      l.location,
      l.contact,
      l.title,
      l.email || "N/A",
      l.linkedin || "N/A",
      l.confidence,
      `"${l.relevance.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${analysisData.name.toLowerCase().replace(/\s+/g, "_")}_leads_pipeline.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter leads list
  const filteredLeads = (!analysisData || !analysisData.leads) ? [] : analysisData.leads.filter(lead => {
    // Text search match
    const text = `${lead.company} ${lead.contact} ${lead.title} ${lead.location} ${lead.relevance}`.toLowerCase();
    const matchesSearch = text.includes(leadsSearch.toLowerCase());

    // Industry filter match
    const matchesIndustry = leadsIndustryFilter === "all" || 
      lead.industry.toLowerCase().includes(leadsIndustryFilter.toLowerCase()) ||
      leadsIndustryFilter.toLowerCase().includes(lead.industry.toLowerCase());

    // Confidence filter match
    const matchesConfidence = lead.confidence >= leadsMinConfidence;

    return matchesSearch && matchesIndustry && matchesConfidence;
  });

  // Unique industries inside current leads
  const uniqueLeadsIndustries = (!analysisData || !analysisData.leads) ? [] : Array.from(new Set(analysisData.leads.map(l => l.industry)));

  return (
    <div className="app-container">
      {/* 1. Header & Navigation Drawer */}
      <header className="app-header">
        <div className="header-inner">
          <a href="#" className="brand">
            <div className="brand-icon">
              <Compass size={20} />
            </div>
            <h1 className="brand-name">Vantage</h1>
          </a>
          
          <div className="header-actions">
            <span className="badge-tag">
              <span className="segment-ping" />
              Secure Data Index Connected
            </span>
            <button 
              className="settings-toggle-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={18} />
              Data Feed Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace container */}
      <main className="main-content">
        
        {/* API Settings Drawer Panel */}
        {showSettings && (
          <div className="settings-panel-drawer fade-in">
            <div className="settings-drawer-header">
              <h4 className="settings-drawer-title">
                <Settings size={16} className="icon-purple icon-inline" />
                Enterprise Market Index Connection
              </h4>
              <button 
                onClick={() => setShowSettings(false)}
                className="settings-close-btn"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveApiKey}>
              <div className="form-group">
                <label htmlFor="apiKeyInput">Data Feed License Key</label>
                <div className="settings-input-row">
                  <input 
                    type="password"
                    id="apiKeyInput"
                    placeholder="Enter your Vantage / Gemini API License Key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">Connect License</button>
                </div>
                <p className="input-helper-text">
                  Your enterprise license key is stored client-side in the browser. It aggregates live competitive and contact data directly from global business registries.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* 2. Main Input Forms & Pre-seeded Options */}
        <section className="workspace-form-card">
          <div className="card-title-box">
            <h2>Market Intelligence Dashboard</h2>
            <p>Select a detailed preset corporate blueprint to immediately explore the system metrics, or query a custom startup concept to fetch real-time registry profiles.</p>
          </div>

          {/* Seed Template selector */}
          <div className="template-grid-box">
            <span className="template-grid-title">Select Database Preset Blueprint:</span>
            <div className="template-grid">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  className={`template-btn ${selectedTemplateId === tmpl.id && !customConcept ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    handleResetInputs(tmpl.id);
                  }}
                >
                  <span className="template-btn-name">{tmpl.name}</span>
                  <span className="template-btn-desc">{tmpl.industry}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom concept fields */}
          <form onSubmit={handleRunAnalysis}>
            <div className="template-grid-title mt-6 mb-2">
              Run custom Registry Query:
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Company / Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. EcoSphere CRM"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Industry Sector</label>
                <input 
                  type="text" 
                  placeholder="e.g. CleanTech, Real Estate, Cybersecurity"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                />
              </div>

              <div className="form-group full-span">
                <label>Startup Concept or Business Model Description</label>
                <textarea 
                  rows="3"
                  placeholder="Describe the product, startup idea, business model, or link. Provide a detailed summary to yield high-fidelity competitive analysis..."
                  value={customConcept}
                  onChange={(e) => setCustomConcept(e.target.value)}
                />
              </div>

              <div className="form-group full-span">
                <label>Primary Reference Website URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. https://myproductsite.com or competitor.com"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Error handling box */}
            {errorMsg && (
              <div className="alert-error-box">
                <AlertCircle size={18} className="alert-error-icon" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form actions */}
            <div className="action-row">
              {customConcept.trim() && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleResetInputs}
                >
                  Reset Query
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isAnalyzing}
              >
                <Play size={16} fill="white" />
                {customConcept.trim() ? "Execute Database Query" : "Load Dashboard"}
              </button>
            </div>
          </form>
        </section>

        {/* 3. Loading state */}
        {isAnalyzing && (
          <section className="workspace-form-card fade-in">
            <div className="loading-box">
              <div className="loading-spinner" />
              <h3>Indexing Corporate Registry</h3>
              <p className="fade-in" key={loadingMessageIdx} style={{ minHeight: "40px" }}>
                {loadingMessages[loadingMessageIdx]}
              </p>
            </div>
          </section>
        )}

        {/* 4. Complete Dashboard Presentation */}
        {!isAnalyzing && analysisData && (
          <div className="fade-in">
            
            {/* Dashboard Header branding */}
            <div className="dashboard-header-container">
              <div className="dashboard-title-section">
                <span className="badge-tag badge-glow">
                  <Sparkles size={12} className="icon-purple icon-inline" />
                  {analysisData.id === "custom-analysis" ? "Live Query Dossier" : "Structured Corporate Blueprint"}
                </span>
                <h2 className="dashboard-main-title">
                  {analysisData.name}
                </h2>
                <p className="dashboard-subtitle-text">
                  {analysisData.concept}
                </p>
              </div>

              {/* Main PDF Export Trigger */}
              <button 
                className="btn btn-secondary"
                onClick={handleExportPDF}
              >
                <Printer size={16} />
                Export Briefing PDF
              </button>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="tab-nav-bar">
              <button
                className={`tab-nav-btn ${activeTab === "competitors" ? "active" : ""}`}
                onClick={() => setActiveTab("competitors")}
              >
                <Layers size={18} />
                Competitive Intelligence
              </button>

              <button
                className={`tab-nav-btn ${activeTab === "strategy" ? "active" : ""}`}
                onClick={() => setActiveTab("strategy")}
              >
                <TrendingUp size={18} />
                Market Entry Strategy & TAM
              </button>

              <button
                className={`tab-nav-btn ${activeTab === "leads" ? "active" : ""}`}
                onClick={() => setActiveTab("leads")}
              >
                <Target size={18} />
                Lead Discovery Pipeline
              </button>
            </div>

            {/* Tab Panel 1: Competitors */}
            {activeTab === "competitors" && (
              <div className="dashboard-grid">
                
                {/* 2D Positioning quadrant scatter */}
                <div className="col-6">
                  <div className="dashboard-card h-full">
                    <PositioningGraph 
                      competitors={analysisData.competitors} 
                      ourProductName={analysisData.name}
                    />
                  </div>
                </div>

                {/* Feature Gap Bar metrics */}
                <div className="col-6">
                  <div className="dashboard-card h-full">
                    <FeatureGapAnalysis
                      competitors={analysisData.competitors}
                      featuresList={analysisData.featuresList}
                      ourProductFeatures={analysisData.ourProductFeatures}
                    />
                  </div>
                </div>

                {/* Horizontal Pricing bars */}
                <div className="col-4">
                  <div className="dashboard-card h-full">
                    <PricingChart 
                      competitors={analysisData.competitors}
                      ourProductPrice={analysisData.ourProductPricing?.pro || 0}
                      ourProductName={analysisData.name}
                    />
                  </div>
                </div>

                {/* Competitor detailed dossiers (Accordions) */}
                <div className="col-8">
                  <div className="dashboard-card h-full">
                    <div className="card-header-bar">
                      <h4 className="card-header-title">
                        <Layers size={18} />
                        Competitor Profile Dossiers
                      </h4>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={handleExportCompetitorsCSV}
                      >
                        <Download size={12} />
                        Export CSV
                      </button>
                    </div>

                    <div className="competitors-accordion">
                      {analysisData.competitors?.map((comp, idx) => (
                        <div 
                          key={idx} 
                          className={`accordion-item ${expandedCompetitor === idx ? "active" : ""}`}
                        >
                          <div 
                            className="accordion-header"
                            onClick={() => setExpandedCompetitor(expandedCompetitor === idx ? -1 : idx)}
                          >
                            <div className="accordion-header-left">
                              <span className="accordion-title">{comp.name}</span>
                              <a 
                                href={comp.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="accordion-url"
                                onClick={(e) => e.stopPropagation()} // Stop accordion toggling
                              >
                                {comp.url.replace("https://", "")}
                                <ExternalLink size={10} className="icon-inline icon-ml-1" />
                              </a>
                            </div>
                            <ChevronDown size={18} className="accordion-chevron" />
                          </div>

                          {expandedCompetitor === idx && (
                            <div className="accordion-body">
                              {/* Metadata Grid */}
                              <div className="competitor-meta-grid">
                                <div className="comp-meta-box">
                                  <span>Pro Pricing</span>
                                  <strong>{comp.pricing?.pro !== undefined ? `$${comp.pricing.pro}/mo` : "Custom"}</strong>
                                </div>
                                <div className="comp-meta-box">
                                  <span>Core Target Audience</span>
                                  <strong>{comp.audience || "General Market"}</strong>
                                </div>
                                <div className="comp-meta-box">
                                  <span>Primary Value Pitch</span>
                                  <strong>{comp.valueProp || "Market Service"}</strong>
                                </div>
                              </div>

                              {/* Strengths & Weaknesses */}
                              <div className="competitor-pro-con-grid">
                                <div className="pro-con-card pros">
                                  <h6>Strategic Strengths</h6>
                                  <ul className="pro-con-list">
                                    {comp.strengths?.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="pro-con-card cons">
                                  <h6>Market Vulnerabilities</h6>
                                  <ul className="pro-con-list">
                                    {comp.weaknesses?.map((w, i) => (
                                      <li key={i}>{w}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Feature Matrix */}
                <div className="col-12">
                  <div className="dashboard-card">
                    <div className="card-header-bar">
                      <h4 className="card-header-title">
                        <Layers size={18} />
                        Side-by-Side Comparison Matrix
                      </h4>
                      <p className="input-helper-text">Detailed checkmark comparison matrix across our core specifications.</p>
                    </div>

                    <div className="comparison-table-wrapper">
                      <table className="comparison-table">
                        <thead>
                          <tr>
                            <th className="col-feature">Product Specification</th>
                            <th className="col-us">{analysisData.name} (Us)</th>
                            {analysisData.competitors?.map((c, i) => (
                              <th key={i}>{c.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysisData.featuresList?.map((feature, idx) => (
                            <tr key={idx}>
                              <td>{feature}</td>
                              <td className="col-us-cell">
                                <span className="cell-icon yes"><Check size={16} strokeWidth={3} /></span>
                              </td>
                              {analysisData.competitors?.map((comp, cIdx) => {
                                const hasFeature = comp.features && comp.features[feature] === true;
                                return (
                                  <td key={cIdx}>
                                    {hasFeature ? (
                                      <span className="cell-icon yes"><Check size={16} strokeWidth={2} /></span>
                                    ) : (
                                      <span className="cell-icon no"><X size={16} strokeWidth={2} /></span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab Panel 2: Strategy */}
            {activeTab === "strategy" && (
              <div className="dashboard-grid">
                
                {/* Total Addressable Market Map */}
                <div className="col-6">
                  <div className="dashboard-card h-full">
                    <div className="card-header-bar">
                      <h4 className="card-header-title">
                        <TrendingUp size={18} />
                        Market TAM Analysis
                      </h4>
                    </div>
                    <MarketLandscapeMap 
                      marketLandscape={analysisData.marketLandscape} 
                      industry={analysisData.industry}
                    />
                  </div>
                </div>

                {/* Venture Strategic Recommendations */}
                <div className="col-6">
                  <div className="dashboard-card h-full">
                    <div className="card-header-bar">
                      <h4 className="card-header-title">
                        <Shield size={18} />
                        Strategic Market Action Plans
                      </h4>
                    </div>

                    <div className="recommendations-box">
                      {analysisData.recommendations?.map((rec, idx) => (
                        <div key={idx} className={`recs-card ${rec.type}`}>
                          <div className="recs-badge-icon">
                            {rec.type === "priority" ? <Compass size={22} /> : rec.type === "improvement" ? <Cpu size={22} /> : <Target size={22} />}
                          </div>
                          <div className="recs-text-box">
                            <span className="recs-type-tag">
                              {rec.type === "priority" ? "Priority Focus" : rec.type === "improvement" ? "Product Optimization" : "Market Gap Opportunity"}
                            </span>
                            <span className="recs-title">{rec.title}</span>
                            <p className="recs-desc">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab Panel 3: Leads */}
            {activeTab === "leads" && (
              <div className="dashboard-grid">
                
                <div className="col-12">
                  <div className="dashboard-card">
                    <div className="card-header-bar">
                      <h4 className="card-header-title">
                        <Target size={18} />
                        Qualified Target Accounts Pipeline
                      </h4>
                      <button 
                        className="btn btn-secondary" 
                        onClick={handleExportLeadsCSV}
                        disabled={filteredLeads.length === 0}
                      >
                        <Download size={14} />
                        Export Pipeline CSV
                      </button>
                    </div>

                    {/* Filters & Searches */}
                    <div className="lead-filter-bar">
                      <div className="filter-left-tools">
                        
                        {/* Keyword Search */}
                        <div className="search-input-box">
                          <Search size={16} className="search-icon-svg" />
                          <input 
                            type="text" 
                            placeholder="Filter accounts, contacts..."
                            value={leadsSearch}
                            onChange={(e) => setLeadsSearch(e.target.value)}
                          />
                        </div>

                        {/* Industry Sector Dropdown filter */}
                        <select 
                          className="filter-dropdown"
                          value={leadsIndustryFilter}
                          onChange={(e) => setLeadsIndustryFilter(e.target.value)}
                        >
                          <option value="all">All Sectors</option>
                          {uniqueLeadsIndustries.map((ind, i) => (
                            <option key={i} value={ind}>{ind}</option>
                          ))}
                        </select>

                        {/* Minimum Confidence Level */}
                        <select 
                          className="filter-dropdown"
                          value={leadsMinConfidence}
                          onChange={(e) => setLeadsMinConfidence(Number(e.target.value))}
                        >
                          <option value={0}>Any Lead Score</option>
                          <option value={80}>High Probability (80%+)</option>
                          <option value={90}>Highly Qualified (90%+)</option>
                          <option value={95}>Ultimate Account Targets (95%+)</option>
                        </select>

                      </div>

                      <span className="leads-count-stat">
                        Qualified Targets: <strong>{filteredLeads.length}</strong> / {analysisData.leads?.length || 0}
                      </span>
                    </div>

                    {/* Leads Cards Grid */}
                    <div className="leads-cards-grid">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead, idx) => (
                          <div key={idx} className="lead-profile-card">
                            <div className="lead-header-row">
                              <div>
                                <span className="lead-co-name">{lead.company}</span>
                                <a 
                                  href={lead.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="lead-co-website"
                                >
                                  {lead.website.replace("https://", "")}
                                  <ExternalLink size={10} className="icon-inline icon-ml-1" />
                                </a>
                              </div>

                              <div className="lead-confidence-meter">
                                <span className="confidence-badge">{lead.confidence}%</span>
                                <span className="confidence-label">Match Score</span>
                              </div>
                            </div>

                            {/* Industry Location employee count chips */}
                            <div className="lead-metadata-chips">
                              <span className="metadata-chip">
                                <MapPin size={11} className="icon-inline icon-mr-1" />
                                {lead.location}
                              </span>
                              <span className="metadata-chip">
                                <Briefcase size={11} className="icon-inline icon-mr-1" />
                                {lead.industry}
                              </span>
                              <span className="metadata-chip">
                                <Users size={11} className="icon-inline icon-mr-1" />
                                {lead.size} employees
                              </span>
                            </div>

                            {/* Contact Person Direct Info */}
                            <div className="lead-contact-block">
                              <span className="contact-meta-title">Key Decision Maker</span>
                              <div className="contact-personal-row">
                                <div className="contact-name-title">
                                  <span className="contact-full-name">{lead.contact}</span>
                                  <span className="contact-role">{lead.title}</span>
                                </div>

                                <div className="contact-links">
                                  {lead.email && (
                                    <a 
                                      href={`mailto:${lead.email}?subject=Partnership Proposal for ${lead.company}`}
                                      className="contact-action-link"
                                      title={`Email ${lead.contact}`}
                                    >
                                      <Mail size={14} />
                                    </a>
                                  )}
                                  {lead.linkedin && (
                                    <a 
                                      href={lead.linkedin} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="contact-action-link"
                                      title="View LinkedIn Profile"
                                    >
                                      <Linkedin size={14} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Dynamic pitch value proposition text */}
                            <div className="lead-relevance-box">
                              <span className="relevance-box-title">Strategic Pitch Alignment</span>
                              <p className="relevance-box-desc">
                                {lead.relevance}
                              </p>
                            </div>

                          </div>
                        ))
                      ) : (
                        <div className="leads-empty-state">
                          <h5>No Accounts Match Filters</h5>
                          <p>Try resetting the text filter or lowering the match score selection threshold.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
