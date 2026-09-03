"use client";

import { useMemo, useRef, useCallback, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface WhiteboardEditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

export default function WhiteboardEditor({
  initialData,
  onChange,
}: WhiteboardEditorProps) {
  // Parse initial elements once synchronously with useMemo - no useEffect setState
  const initialElements = useMemo(() => {
    if (!initialData) return [];
    try {
      const parsed = JSON.parse(initialData);
      if (Array.isArray(parsed?.elements)) {
        return parsed.elements;
      }
    } catch {
      // Ignore non-JSON initial mock text
    }
    return [];
  }, [initialData]);

  const lastSerializedRef = useRef<string>(initialData || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (elements: readonly unknown[]) => {
      if (!onChange) return;
      try {
        const serialized = JSON.stringify({ elements });
        // Don't trigger if elements haven't changed
        if (serialized === lastSerializedRef.current) {
          return;
        }
        lastSerializedRef.current = serialized;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onChange(serialized);
        }, 300);
      } catch {
        // Ignore serialization errors
      }
    },
    [onChange]
  );

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-[#E5E0D5] bg-white shadow-xs">
      <Excalidraw
        initialData={{
          elements: initialElements,
          appState: {
            viewBackgroundColor: "#ffffff",
          },
        }}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: { saveFileToDisk: true },
            loadScene: true,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
      />
    </div>
  );
}
