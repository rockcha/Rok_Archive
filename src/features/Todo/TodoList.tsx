// src/features/todos/TodoList.tsx
"use client";

import TodoItem from "./TodoItem";
import type { TodoRow } from "./types";

type Props = {
  title: string;
  items: TodoRow[];
  onUpdate: (
    id: string,
    patch: Partial<Pick<TodoRow, "content" | "isDaily">>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  className?: string;
};

export default function TodoList({
  title,
  items,
  onUpdate,
  onDelete,
  className,
}: Props) {
  return (
    <div className={className ?? ""}>
      <h3 className="mb-2 text-base font-semibold text-neutral-700">{title}</h3>
      <div className="max-h-96 overflow-y-auto rounded-md border border-neutral-200 p-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">
            비어 있어요.
          </p>
        ) : (
          <div className="flex flex-col gap-2 ">
            {items.map((t) => (
              <TodoItem
                key={t.id}
                item={t}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
