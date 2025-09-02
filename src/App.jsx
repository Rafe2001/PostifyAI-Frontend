import React, { useState, useEffect } from 'react';
import { Send, Loader2, Clock, DollarSign, Hash, Target, Sparkles, Copy, Check, Moon, Sun, ExternalLink, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE_URL = 'https://postifyai-2.onrender.com'; 
export default function LinkedInPostGenerator() {
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'professional',
    audience: 'general',
    length: 'medium',
    include_hashtags: true,
    include_cta: true,
    post_count: 3,
    language: 'english'
  });
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [citations, setCitations] = useState([]); // Added citations state
  const [showCitations, setShowCitations] = useState(false); // Toggle citations view
  const [tones, setTones] = useState([
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'thought-provoking', label: 'Thought-provoking' }
  ]);
  const [audiences, setAudiences] = useState([
    { value: 'general', label: 'General Professional' },
    { value: 'entrepreneurs', label: 'Entrepreneurs' },
    { value: 'tech', label: 'Tech Professionals' },
    { value: 'marketing', label: 'Marketing Professionals' },
    { value: 'sales', label: 'Sales Professionals' },
    { value: 'leadership', label: 'Leadership & Management' },
    { value: 'startups', label: 'Startup Community' },
    { value: 'finance', label: 'Finance Professionals' }
  ]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load tone and audience options (fallback to defaults if API fails)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [tonesRes, audiencesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tones`),
          fetch(`${API_BASE_URL}/audiences`)
        ]);
        
        if (tonesRes.ok) {
          const tonesData = await tonesRes.json();
          if (tonesData.tones && tonesData.tones.length > 0) {
            setTones(tonesData.tones);
          }
        }
        
        if (audiencesRes.ok) {
          const audiencesData = await audiencesRes.json();
          if (audiencesData.audiences && audiencesData.audiences.length > 0) {
            setAudiences(audiencesData.audiences);
          }
        }
      } catch (error) {
        console.error('Failed to load options, using defaults:', error);
        // Keep the default values already set in useState
      }
    };
    
    loadOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generatePosts = async () => {
    if (!formData.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    setPosts([]);
    setMetrics(null);
    setCitations([]); // Reset citations
    setShowCitations(false); // Reset citations view

    try {
      const response = await fetch(`${API_BASE_URL}/generate-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data.posts);
      setCitations(data.citations || []); // Set citations from response
      setMetrics({
        generation_time: data.generation_time,
        tokens_used: data.tokens_used,
        cost_estimate: data.cost_estimate,
        search_results_used: data.search_results_used
      });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatContent = (post) => {
    let fullContent = post.content;
    if (post.hashtags && post.hashtags.length > 0) {
      fullContent += '\n\n' + post.hashtags.join(' ');
    }
    if (post.cta) {
      fullContent += '\n\n' + post.cta;
    }
    return fullContent;
  };

  // Citations Modal Component
  const CitationsModal = ({ citations, show, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-4xl w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`sticky top-0 p-6 border-b ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Sources & Citations
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-opacity-10 transition-colors ${
                  isDarkMode ? 'hover:bg-white' : 'hover:bg-gray-900'
                }`}
              >
                <span className={`text-2xl ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>×</span>
              </button>
            </div>
            <p className={`mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Information sources used to generate your LinkedIn posts
            </p>
          </div>
          
          <div className="p-6">
            {citations.length > 0 ? (
              <div className="space-y-4">
                {citations.map((citation, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {citation.title}
                      </h3>
                      <span className={`text-sm px-2 py-1 rounded ${
                        isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        Source {index + 1}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {citation.snippet}
                    </p>
                    <a
                      href={citation.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit Source
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className={`w-16 h-16 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <p className={`text-lg ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No citations available for this generation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full mr-3 ${
              isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
            }`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              PostifyAI: Your AI LinkedIn Post Generator
            </h1>
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`ml-4 p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <p className={`text-xl max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Transform your ideas into engaging LinkedIn posts with our intelligent AI agent
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-2xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Create Your Posts</h2>
              
              <div className="space-y-4">
                {/* Topic Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Topic *
                  </label>
                  <textarea
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Cold-start strategies for marketplaces"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    rows="3"
                  />
                </div>

                {/* Tone Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tone
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {tones.map(tone => (
                      <option key={tone.value} value={tone.value}>{tone.label}</option>
                    ))}
                  </select>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Target Audience
                  </label>
                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {audiences.map(audience => (
                      <option key={audience.value} value={audience.value}>{audience.label}</option>
                    ))}
                  </select>
                </div>

                {/* Length Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Post Length
                  </label>
                  <select
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="short">Short (100-150 words)</option>
                    <option value="medium">Medium (150-250 words)</option>
                    <option value="long">Long (250-400 words)</option>
                  </select>
                </div>

                {/* Post Count */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Number of Posts
                  </label>
                  <select
                    name="post_count"
                    value={formData.post_count}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={3}>3 Posts</option>
                    <option value={4}>4 Posts</option>
                    <option value={5}>5 Posts</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="include_hashtags"
                      checked={formData.include_hashtags}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Include hashtags</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="include_cta"
                      checked={formData.include_cta}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Include call-to-action</span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generatePosts}
                  disabled={loading || !formData.topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Generate Posts
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics Card */}
            {metrics && (
              <div className={`rounded-2xl shadow-xl p-6 border mt-6 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Generation Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Time</div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{metrics.generation_time}s</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 text-green-500 mr-2" />
                    <div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Tokens</div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{metrics.tokens_used}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
                    <div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Cost</div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>${metrics.cost_estimate}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-purple-500 mr-2" />
                    <div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Research</div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{metrics.search_results_used ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>

                {/* Citations Button */}
                {citations.length > 0 && (
                  <button
                    onClick={() => setShowCitations(true)}
                    className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Sources & Citations ({citations.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Generated Posts */}
          <div className="lg:col-span-2">
            {loading && (
              <div className={`rounded-2xl shadow-xl p-12 border text-center transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>AI Agent Working...</h3>
                <p className={`${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Researching → Strategizing → Generating your LinkedIn posts
                </p>
              </div>
            )}

            {posts.length > 0 && !loading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-3xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Your LinkedIn Posts
                    </h2>
                    <p className={`${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Ready to copy and share on LinkedIn
                    </p>
                  </div>
                  
                  {/* Mobile Citations Button */}
                  {citations.length > 0 && (
                    <button
                      onClick={() => setShowCitations(true)}
                      className="lg:hidden flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Sources ({citations.length})
                    </button>
                  )}
                </div>

                {posts.map((post, index) => (
                  <div key={index} className={`rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}>
                    {/* Post Header */}
                    <div className={`p-4 border-b transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-750 border-gray-700' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <div className={`font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>Post Option {index + 1}</div>
                            <div className={`text-sm capitalize ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {post.tone_used} • {post.estimated_engagement} engagement
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(formatContent(post), index)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      <div className="prose max-w-none">
                        <div className={`whitespace-pre-wrap leading-relaxed mb-4 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {post.content}
                        </div>
                        
                        {/* Hashtags */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((hashtag, hashIndex) => (
                                <span
                                  key={hashIndex}
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    isDarkMode 
                                      ? 'bg-blue-900 text-blue-200' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {hashtag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Call to Action */}
                        {post.cta && (
                          <div className={`rounded-lg p-4 border-l-4 border-blue-500 ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <div className={`text-sm mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Call to Action:</div>
                            <div className={`font-medium ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>{post.cta}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {posts.length === 0 && !loading && (
              <div className={`rounded-2xl shadow-xl p-12 border text-center transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <Sparkles className={`w-16 h-16 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Ready to Generate Amazing Posts
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Enter a topic and let our AI agent create engaging LinkedIn content for you
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-12 pt-8 border-t transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Powered by AI • Built with modern Tech Stack
          </p>
        </div>
      </div>

      {/* Citations Modal */}
      <CitationsModal 
        citations={citations}
        show={showCitations}
        onClose={() => setShowCitations(false)}
      />
    </div>
  );
}