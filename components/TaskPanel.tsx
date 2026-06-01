"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, CheckSquare, Square, FileText, ClipboardList } from "lucide-react";

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

const TASKS_KEY = "jarvis_tasks";
const NOTES_KEY = "jarvis_notes";

export default function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [activeSection, setActiveSection] = useState<"tasks" | "notes">("tasks");
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTasks = localStorage.getItem(TASKS_KEY);
      const savedNotes = localStorage.getItem(NOTES_KEY);
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedNotes) setNotes(savedNotes);
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = useCallback((updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch {}
  }, []);

  // Save notes to localStorage
  const saveNotes = useCallback((text: string) => {
    setNotes(text);
    try {
      localStorage.setItem(NOTES_KEY, text);
    } catch {}
  }, []);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    saveTasks([...tasks, newTask]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    saveTasks(tasks.filter((t) => !t.done));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTask();
  };

  const pendingCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full text-hud-muted text-sm">
        <span className="animate-pulse">LOADING MEMORY BANKS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Section toggle */}
      <div className="flex border-b border-hud-cyan/20">
        <button
          onClick={() => setActiveSection("tasks")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-mono tracking-wider transition-all ${
            activeSection === "tasks"
              ? "text-hud-cyan border-b-2 border-hud-cyan bg-cyan-900/10"
              : "text-hud-muted hover:text-hud-cyan/70"
          }`}
        >
          <ClipboardList size={14} />
          TASK LOG
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-hud-orange/20 text-hud-orange border border-hud-orange/30">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection("notes")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-mono tracking-wider transition-all ${
            activeSection === "notes"
              ? "text-hud-cyan border-b-2 border-hud-cyan bg-cyan-900/10"
              : "text-hud-muted hover:text-hud-cyan/70"
          }`}
        >
          <FileText size={14} />
          NOTES
        </button>
      </div>

      {activeSection === "tasks" ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Add task input */}
          <div className="p-4 border-b border-hud-cyan/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add new directive..."
                className="flex-1 hud-input rounded px-3 py-2 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_8px_rgba(0,212,255,0.2)]"
              />
              <button
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="hud-btn px-3 py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus size={16} />
                ADD
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-2 flex items-center gap-4 text-[10px] text-hud-muted font-mono border-b border-hud-cyan/10">
            <span>
              PENDING:{" "}
              <span className="text-hud-orange">{pendingCount}</span>
            </span>
            <span>
              COMPLETE:{" "}
              <span className="text-green-400">{doneCount}</span>
            </span>
            <span>
              TOTAL: <span className="text-hud-cyan">{tasks.length}</span>
            </span>
            {doneCount > 0 && (
              <button
                onClick={clearCompleted}
                className="ml-auto text-red-400/60 hover:text-red-400 transition-colors underline"
              >
                CLEAR DONE
              </button>
            )}
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-hud-muted/50 text-xs text-center gap-2">
                <ClipboardList size={32} className="opacity-30" />
                <span>NO ACTIVE DIRECTIVES</span>
                <span className="opacity-60">Add tasks above to begin tracking</span>
              </div>
            ) : (
              <>
                {/* Pending tasks */}
                {tasks.filter((t) => !t.done).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}

                {/* Completed tasks */}
                {doneCount > 0 && (
                  <>
                    <div className="text-[10px] text-hud-muted/50 font-mono pt-2 pb-1 border-t border-hud-cyan/10">
                      — COMPLETED —
                    </div>
                    {tasks.filter((t) => t.done).map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Notes header */}
          <div className="px-4 py-2 flex items-center justify-between text-[10px] text-hud-muted font-mono border-b border-hud-cyan/10">
            <span>CLASSIFIED NOTES — STARK INDUSTRIES</span>
            <span className="text-hud-cyan">AUTO-SAVE</span>
          </div>

          {/* Notes textarea */}
          <div className="flex-1 p-4 overflow-hidden">
            <textarea
              value={notes}
              onChange={(e) => saveNotes(e.target.value)}
              placeholder="Enter classified notes... auto-saved to local memory banks."
              className="w-full h-full hud-input rounded px-3 py-3 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_8px_rgba(0,212,255,0.2)] resize-none leading-relaxed"
            />
          </div>

          <div className="px-4 py-2 text-[10px] text-hud-muted/50 font-mono border-t border-hud-cyan/10">
            {notes.length} CHARS • {notes.split(/\s+/).filter(Boolean).length} WORDS
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const createdDate = new Date(task.createdAt);
  const timeStr = createdDate.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded border transition-all group animate-fade-in-up ${
        task.done
          ? "border-hud-cyan/10 bg-hud-dark/20 opacity-50"
          : "border-hud-cyan/20 bg-cyan-900/5 hover:border-hud-cyan/40 hover:bg-cyan-900/10"
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex-shrink-0 transition-colors ${
          task.done ? "text-green-400" : "text-hud-cyan/60 hover:text-hud-cyan"
        }`}
      >
        {task.done ? (
          <CheckSquare size={16} />
        ) : (
          <Square size={16} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-mono leading-snug ${
            task.done ? "line-through text-hud-muted" : "text-hud-text"
          }`}
        >
          {task.text}
        </p>
        <span className="text-[10px] text-hud-muted/50">{timeStr}</span>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 text-hud-muted/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
