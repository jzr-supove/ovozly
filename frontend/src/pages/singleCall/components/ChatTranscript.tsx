/**
 * ChatTranscript Component
 *
 * Displays diarized transcript as a list of transcript boxes with
 * clickable segments that sync with the audio player.
 */

import React, { useEffect, useRef } from "react";
import { PlayCircleFilled } from "@ant-design/icons";
import { DiarizationSegment } from "@/pages/calls/types/callsTypes";
import { formatDuration } from "@/utils/helpers";

import "./chatTranscript.scss";

interface ChatTranscriptProps {
  /** Diarization segments with speaker, timestamps, and text */
  segments: DiarizationSegment[];
  /** Current playback time in seconds */
  currentTime?: number;
  /** Callback when user clicks on a segment to seek */
  onSegmentClick?: (startTime: number) => void;
}

/**
 * Get speaker type based on speaker ID.
 * In call centers, the customer typically calls in first (SPEAKER_00),
 * and the agent answers (SPEAKER_01).
 */
const getSpeakerType = (speaker: string): "agent" | "customer" => {
  // SPEAKER_01 is typically the agent who answers the call
  // SPEAKER_00 is typically the customer who initiates the call
  if (speaker === "SPEAKER_01" || speaker.toLowerCase().includes("agent")) {
    return "agent";
  }
  return "customer";
};

/**
 * Get speaker display label.
 */
const getSpeakerLabel = (speaker: string): string => {
  const type = getSpeakerType(speaker);
  return type === "agent" ? "Agent" : "Customer";
};

const ChatTranscript: React.FC<ChatTranscriptProps> = ({
  segments,
  currentTime = 0,
  onSegmentClick,
}) => {
  const activeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out segments with no text (failed transcriptions)
  const validSegments = segments.filter(
    (seg) => seg.text && seg.text.trim().length > 0
  );

  // Find the currently active segment based on playback time
  const activeSegmentIndex = validSegments.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  );

  // Auto-scroll to active segment during playback
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeElement = activeRef.current;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      // Check if active element is outside the visible area
      if (
        activeRect.top < containerRect.top ||
        activeRect.bottom > containerRect.bottom
      ) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeSegmentIndex]);

  /**
   * Handle segment click - seek to start time.
   */
  const handleSegmentClick = (segment: DiarizationSegment) => {
    if (typeof segment.start === "number" && onSegmentClick) {
      onSegmentClick(segment.start);
    }
  };

  if (!validSegments || validSegments.length === 0) {
    return (
      <div className="transcript-empty">
        <p>No transcript segments available</p>
      </div>
    );
  }

  return (
    <div className="transcript-container" ref={containerRef}>
      <div className="transcript-list">
        {validSegments.map((segment, index) => {
          const speakerType = getSpeakerType(segment.speaker);
          const isActive = index === activeSegmentIndex;
          const isPast = currentTime > segment.end;

          return (
            <div
              key={index}
              ref={isActive ? activeRef : null}
              className={`transcript-item ${speakerType} ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
              onClick={() => handleSegmentClick(segment)}
            >
              <div className="transcript-meta">
                <span className={`speaker-badge ${speakerType}`}>
                  {getSpeakerLabel(segment.speaker)}
                </span>
                <span className="timestamp">
                  <PlayCircleFilled className="play-icon" />
                  {formatDuration(segment.start)} - {formatDuration(segment.end)}
                </span>
              </div>
              <p className="transcript-text">{segment.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatTranscript;
