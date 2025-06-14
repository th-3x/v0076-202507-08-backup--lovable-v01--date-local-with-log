
import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Calendar, Clock, Zap, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type ConversionResult = {
  id: string;
  input: string;
  timezone: string;
  utcTimestamp: string;
  localTime: string;
  parsedDate: string;
  convertedAt: string;
};

const HISTORY_STORAGE_KEY = "dateConverter_history";
const MAX_HISTORY = 10;

const DateConverter = () => {
  // Input state
  const [dateString, setDateString] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  
  // Result state, populated only on submit
  const [utcTimestamp, setUtcTimestamp] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [parsedDate, setParsedDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // History state
  const [history, setHistory] = useState<ConversionResult[]>([]);

  const timezones = [
    'UTC', 'CET', 'EST', 'PST', 'GMT', 'JST', 'AEST', 'IST', 'CST', 'MST'
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const parseNaturalDate = (input: string, tz: string = 'UTC') => {
    try {
      let processedInput = input.toLowerCase();
      const weekdays = {
        'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed', 
        'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
      };
      const months = {
        'january': 'Jan', 'february': 'Feb', 'march': 'Mar', 'april': 'Apr',
        'may': 'May', 'june': 'Jun', 'july': 'Jul', 'august': 'Aug',
        'september': 'Sep', 'october': 'Oct', 'november': 'Nov', 'december': 'Dec'
      };
      Object.entries(weekdays).forEach(([full, abbr]) => {
        processedInput = processedInput.replace(new RegExp(full, 'gi'), abbr);
      });
      Object.entries(months).forEach(([full, abbr]) => {
        processedInput = processedInput.replace(new RegExp(full, 'gi'), abbr);
      });
      processedInput = processedInput.replace(/(\d+)(st|nd|rd|th)/g, '$1');
      processedInput = processedInput.replace(/ at /g, ' ');
      processedInput = processedInput.replace(/ on /g, ' ');
      const tzMatch = processedInput.match(/(CET|EST|PST|GMT|JST|AEST|IST|CST|MST|UTC)/i);
      const detectedTz = tzMatch ? tzMatch[1].toUpperCase() : tz;
      if (tzMatch) {
        processedInput = processedInput.replace(tzMatch[0], '').trim();
      }
      const currentYear = new Date().getFullYear();
      if (!processedInput.includes(currentYear.toString())) {
        processedInput += ` ${currentYear}`;
      }
      const date = new Date(processedInput);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      const tzOffsets: { [key: string]: number } = {
        'UTC': 0, 'GMT': 0, 'CET': 1, 'EST': -5, 'PST': -8,
        'JST': 9, 'AEST': 10, 'IST': 5.5, 'CST': -6, 'MST': -7
      };
      const offset = tzOffsets[detectedTz] || 0;
      const utcDate = new Date(date.getTime() - (offset * 60 * 60 * 1000));
      return {
        utcDate,
        originalDate: date,
        timezone: detectedTz,
        success: true
      };
    } catch (error: any) {
      return { success: false, error: error.message || "Unknown error" };
    }
  };

  // Triggered on submit or keyboard Enter
  const handleConvert = useCallback(
    (e?: React.FormEvent | React.KeyboardEvent) => {
      if (e) e.preventDefault();
      setError("");
      setLoading(true);

      // Empty input case
      if (!dateString.trim()) {
        setError("Please enter a date string first");
        setUtcTimestamp('');
        setLocalTime('');
        setParsedDate('');
        setLoading(false);
        return;
      }

      const result = parseNaturalDate(dateString, timezone);
      if (result.success) {
        const utcTimestampVal = Math.floor(result.utcDate.getTime() / 1000).toString();
        const localDateTime = result.originalDate.toLocaleString();
        const parsedDateTime = result.utcDate.toISOString();
        setUtcTimestamp(utcTimestampVal);
        setLocalTime(localDateTime);
        setParsedDate(parsedDateTime);
        setError("");

        // Update history
        const conversion: ConversionResult = {
          id: `${Date.now()}`,
          input: dateString,
          timezone,
          utcTimestamp: utcTimestampVal,
          localTime: localDateTime,
          parsedDate: parsedDateTime,
          convertedAt: new Date().toLocaleString(),
        };
        setHistory((prev) => {
          const arr = [conversion, ...prev].slice(0, MAX_HISTORY);
          return arr;
        });

      } else {
        setUtcTimestamp('');
        setLocalTime('');
        setParsedDate('');
        setError("Unable to parse date. Please check your input.");
      }
      setLoading(false);
    },
    [dateString, timezone]
  );

  // Restore from history to form
  const handleRestore = (item: ConversionResult) => {
    setDateString(item.input);
    setTimezone(item.timezone);
    setUtcTimestamp(item.utcTimestamp);
    setLocalTime(item.localTime);
    setParsedDate(item.parsedDate);
    setError('');
    toast({
      title: "Restored previous conversion",
      description: "Input and results loaded from history.",
      className: "bg-catppuccin-surface0 border-catppuccin-teal text-catppuccin-text",
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    toast({
      title: "History cleared",
      className: "bg-catppuccin-surface0 border-catppuccin-maroon text-catppuccin-text",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard! 📋",
      description: `${label} copied successfully`,
      className: "bg-catppuccin-surface0 border-catppuccin-teal text-catppuccin-text",
    });
  };

  return (
    <div className="min-h-screen bg-catppuccin-base p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-catppuccin-teal animate-pixel-glow" />
            <h1 className="text-4xl font-bold text-catppuccin-text font-pixel">
              DATE<span className="text-catppuccin-pink">STAMP</span>
            </h1>
            <Clock className="w-8 h-8 text-catppuccin-mauve" />
          </div>
          <p className="text-catppuccin-subtext1 font-pixel text-sm">
            {'>'} Convert natural language dates to UTC timestamps
          </p>
        </div>

        {/* Main converter */}
        <form className="pixel-container rounded-lg p-6 mb-6" onSubmit={handleConvert}>
          <div className="space-y-6">
            {/* Input section */}
            <div className="space-y-3">
              <label className="block text-catppuccin-lavender font-pixel text-sm font-medium">
                <Calendar className="inline w-4 h-4 mr-2" />
                Enter date string:
              </label>
              <div className="relative">
                <Input
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                  placeholder="Monday June 16th at 9AM CET"
                  className="pixel-input font-pixel text-sm border-2 rounded-md px-4 py-3 w-full"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleConvert(e); }}
                />
                {dateString && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 terminal-cursor"></div>
                )}
              </div>
            </div>

            {/* Timezone selector */}
            <div className="space-y-3">
              <label className="block text-catppuccin-lavender font-pixel text-sm font-medium">
                Default timezone:
              </label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="pixel-input font-pixel text-sm border-2 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-catppuccin-surface0 border-catppuccin-surface1">
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz} className="font-pixel text-catppuccin-text">
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit button */}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className={`pixel-button font-pixel text-md px-6 py-2 rounded-md flex items-center gap-2 ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                disabled={loading}
              >
                <span>CONVERT</span>
                <Zap className="w-4 h-4" />
              </Button>
            </div>
            {/* Error display */}
            {error && (
              <div className="text-catppuccin-maroon bg-catppuccin-surface1 rounded py-2 px-3 font-pixel text-xs text-center">
                {error}
              </div>
            )}
          </div>
        </form>

        {/* Results */}
        {(utcTimestamp || localTime || parsedDate) && (
          <div className="space-y-4">
            {/* UTC Timestamp */}
            {utcTimestamp && (
              <div className="pixel-container rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-catppuccin-green font-pixel text-xs font-medium mb-1">
                      UTC TIMESTAMP:
                    </p>
                    <p className="font-pixel text-catppuccin-text text-lg font-mono">
                      {utcTimestamp}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(utcTimestamp, 'UTC Timestamp')}
                    className="pixel-button font-pixel text-xs px-3 py-2 rounded-md"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {/* Local Time */}
            {localTime && (
              <div className="pixel-container rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-catppuccin-yellow font-pixel text-xs font-medium mb-1">
                      LOCAL TIME:
                    </p>
                    <p className="font-pixel text-catppuccin-text text-sm">
                      {localTime}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(localTime, 'Local Time')}
                    className="pixel-button font-pixel text-xs px-3 py-2 rounded-md"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {/* ISO Date */}
            {parsedDate && (
              <div className="pixel-container rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-catppuccin-teal font-pixel text-xs font-medium mb-1">
                      ISO DATE (UTC):
                    </p>
                    <p className="font-pixel text-catppuccin-text text-sm font-mono break-all">
                      {parsedDate}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(parsedDate, 'ISO Date')}
                    className="pixel-button font-pixel text-xs px-3 py-2 rounded-md"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent log / history */}
        <div className="mt-8 pixel-container rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-catppuccin-pink" />
              <h3 className="text-catppuccin-pink font-pixel text-sm font-medium">
                RECENT CONVERSIONS
              </h3>
            </div>
            <Button
              onClick={handleClearHistory}
              size="sm"
              className="pixel-button font-pixel text-xs px-3 py-1 rounded-md"
              variant="outline"
              type="button"
            >
              Clear
            </Button>
          </div>
          {history.length === 0 ? (
            <div className="text-catppuccin-overlay0 font-pixel text-xs text-center">
              No recent conversions yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between pixel-container border border-catppuccin-surface2 p-3 mb-1 cursor-pointer transition hover:bg-catppuccin-base"
                  onClick={() => handleRestore(item)}
                  tabIndex={0}
                  role="button"
                  title="Click to restore"
                  style={{ outline: 'none' }}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap gap-x-2 items-center">
                      <span className="font-pixel text-xs text-catppuccin-lavender">{item.input}</span>
                      <span className="inline-block font-pixel text-[10px] text-catppuccin-teal px-2 py-0.5 border rounded border-catppuccin-teal bg-catppuccin-base/30">
                        {item.timezone}
                      </span>
                    </div>
                    <div className="font-pixel text-[10px] text-catppuccin-overlay1">
                      Converted: {item.convertedAt}
                    </div>
                  </div>
                  <div className="flex gap-1 md:gap-2 mt-2 md:mt-0">
                    <Button
                      type="button"
                      size="sm"
                      className="pixel-button font-pixel text-[10px] px-2 py-1 rounded-md"
                      onClick={e => { e.stopPropagation(); copyToClipboard(item.utcTimestamp, 'UTC Timestamp'); }}
                    >UTC <Copy className="w-3 h-3" /></Button>
                    <Button
                      type="button"
                      size="sm"
                      className="pixel-button font-pixel text-[10px] px-2 py-1 rounded-md"
                      onClick={e => { e.stopPropagation(); copyToClipboard(item.localTime, 'Local Time'); }}
                    >LOCAL <Copy className="w-3 h-3" /></Button>
                    <Button
                      type="button"
                      size="sm"
                      className="pixel-button font-pixel text-[10px] px-2 py-1 rounded-md"
                      onClick={e => { e.stopPropagation(); copyToClipboard(item.parsedDate, 'ISO Date'); }}
                    >ISO <Copy className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="mt-8 pixel-container rounded-lg p-4">
          <h3 className="text-catppuccin-pink font-pixel text-sm font-medium mb-3">
            EXAMPLE FORMATS:
          </h3>
          <div className="space-y-2 text-catppuccin-subtext0 font-pixel text-xs">
            <p>• Monday June 16th at 9AM CET</p>
            <p>• 8AM CET on Saturday June 14th</p>
            <p>• December 25th 2024 at 3:30PM EST</p>
            <p>• Friday at 6PM UTC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateConverter;
