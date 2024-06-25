const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      <p>Loading...</p>
    </div>
  )
}

export default Loading