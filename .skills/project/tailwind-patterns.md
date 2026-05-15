# Skill: Tailwind CSS 4 Patterns

## Layout

```jsx
// Full page container
<div className="min-h-screen bg-gray-50">
  <div className="container mx-auto px-4 py-8">
    {/* content */}
  </div>
</div>

// Two-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// Three-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flex row centered
<div className="flex items-center justify-between gap-4">

// Flex column centered
<div className="flex flex-col items-center gap-4">
```

## Cards

```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Title</h2>
  {/* content */}
</div>
```

## Buttons

```jsx
// Primary
<button className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
  Action
</button>

// Secondary
<button className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
  Cancel
</button>

// Danger
<button className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors">
  Delete
</button>
```

## Form inputs

```jsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-gray-700">Label</label>
  <input
    type="text"
    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
  />
</div>
```

## Status badges

```jsx
// Estado badges
const estadoClasses = {
  pendiente:  "bg-yellow-100 text-yellow-800",
  confirmada: "bg-blue-100 text-blue-800",
  finalizada: "bg-green-100 text-green-800",
  cancelada:  "bg-red-100 text-red-800",
};

<span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoClasses[estado]}`}>
  {estado}
</span>
```
