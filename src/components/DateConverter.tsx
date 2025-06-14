
import React, { useState, useEffect } from 'react';
import { Copy, Calendar, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const DateConverter = () => {
  const [dateString, setDateString] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [utcTimestamp, setUtcTimestamp] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [parsedDate, setParsedDate] = useState('');

  const timezones = [
    'UTC', 'CET', 'EST', 'PST', 'GMT', 'JST', 'AEST', 'IST', 'CST', 'MST'
  ];

  const parseNaturalDate = (input: string, tz: string = 'UTC') => {
    try {
      // Handle various date formats
      let processedInput = input.toLowerCase();
      
      // Map weekdays
      const weekdays = {
        'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed', 
        'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
      };
      
      // Map months
      const months = {
        'january': 'Jan', 'february': 'Feb', 'march': 'Mar', 'april': 'Apr',
        'may': 'May', 'june': 'Jun', 'july': 'Jul', 'august': 'Aug',
        'september': 'Sep', 'october': 'Oct', 'november': 'Nov', 'december': 'Dec'
      };

      // Replace full names with abbreviations
      Object.entries(weekdays).forEach(([full, abbr]) => {
        processedInput = processedInput.replace(new RegExp(full, 'gi'), abbr);
      });
      
      Object.entries(months).forEach(([full, abbr]) => {
        processedInput = processedInput.replace(new RegExp(full, 'gi'), abbr);
      });

      // Remove ordinal suffixes (st, nd, rd, th)
      processedInput = processedInput.replace(/(\d+)(st|nd|rd|th)/g, '$1');
      
      // Handle "at" keyword
      processedInput = processedInput.replace(/ at /g, ' ');
      
      // Handle "on" keyword
      processedInput = processedInput.replace(/ on /g, ' ');

      // Extract timezone
      const tzMatch = processedInput.match(/(CET|EST|PST|GMT|JST|AEST|IST|CST|MST|UTC)/i);
      const detectedTz = tzMatch ? tzMatch[1].toUpperCase() : tz;
      
      // Remove timezone from string for parsing
      if (tzMatch) {
        processedInput = processedInput.replace(tzMatch[0], '').trim();
      }

      // Try to parse the date
      const currentYear = new Date().getFullYear();
      
      // Add current year if not present
      if (!processedInput.includes(currentYear.toString())) {
        processedInput += ` ${currentYear}`;
      }

      // Parse the date
      const date = new Date(processedInput);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }

      // Apply timezone offset
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
    } catch (error) {
      console.error('Date parsing error:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (dateString.trim()) {
      const result = parseNaturalDate(dateString, timezone);
      
      if (result.success) {
        const utcTimestamp = Math.floor(result.utcDate.getTime() / 1000);
        const localDateTime = result.originalDate.toLocaleString();
        const parsedDateTime = result.utcDate.toISOString();
        
        setUtcTimestamp(utcTimestamp.toString());
        setLocalTime(localDateTime);
        setParsedDate(parsedDateTime);
      } else {
        setUtcTimestamp('');
        setLocalTime('');
        setParsedDate('');
      }
    } else {
      setUtcTimestamp('');
      setLocalTime('');
      setParsedDate('');
    }
  }, [dateString, timezone]);

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
            > Convert natural language dates to UTC timestamps
          </p>
        </div>

        {/* Main converter */}
        <div className="pixel-container rounded-lg p-6 mb-6">
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
          </div>
        </div>

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
