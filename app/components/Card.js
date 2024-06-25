const Card = ({ children }) => (
<div class="max-w-xl rounded overflow-hidden shadow-lg bg-slate-100">
  <div class="px-6 py-4">
    <p class="text-gray-700 text-base">
      {children}
    </p>
  </div>
</div>
)

export default Card